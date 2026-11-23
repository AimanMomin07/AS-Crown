import { Request, Response } from "express";
import pool from "../config/database.js";
import { createUserNotification, createManyUserNotifications } from "../utils/notification.js";
import { emitToCommunity } from "../realtime/socket.js";
import {
  ensureRoleCommunityMembership,
  isRoleAllowedInGroup
} from "../utils/community-groups.js";

function uid(req: any): number {
  return Number(req.user?.id) || 0;
}

function role(req: any): string {
  return String(req.user?.role || req.user?.role_name || "");
}

function isModerator(req: any): boolean {
  return ["admin", "committee"].includes(role(req));
}

async function hasGroupAccess(userId: number, groupId: number): Promise<boolean> {
  const [rows] = await pool.execute(
    `SELECT id FROM community_members WHERE group_id = ? AND user_id = ? AND status = 'active' LIMIT 1`,
    [groupId, userId]
  );
  return (rows as any[]).length > 0;
}

async function requireAccess(req: any, groupId: number): Promise<boolean> {
  if (isModerator(req)) return true;
  return hasGroupAccess(uid(req), groupId);
}

export async function listGroups(req: Request, res: Response) {
  try {
    const userId = uid(req);
    const currentRole = role(req);
    await ensureRoleCommunityMembership(userId, currentRole);
    const groupFilter =
      currentRole === "admin"
        ? null
        : getRoleGroupNameForQuery(currentRole);
    const [rows] = await pool.execute(
      `SELECT g.*, COALESCE(cm.status, 'not_joined') AS membership_status,
              (SELECT COUNT(*) FROM community_members x WHERE x.group_id = g.id AND x.status = 'active') AS member_count
       FROM community_groups g
       LEFT JOIN community_members cm ON cm.group_id = g.id AND cm.user_id = ?
       WHERE g.status = 'active'
         AND (? IS NULL OR g.name = ?)
       ORDER BY CASE WHEN g.name = 'AS CROWN Committee' THEN 0 ELSE 1 END, g.created_at DESC`,
      [userId, groupFilter, groupFilter]
    );
    return res.json({ success: true, data: { groups: rows } });
  } catch (error) {
    console.error("Community groups error:", error);
    return res.status(500).json({ success: false, message: "Unable to load community groups" });
  }
}

function getRoleGroupNameForQuery(currentRole: string) {
  const names: Record<string, string> = {
    resident: "AS CROWN Residents",
    staff: "AS CROWN Staff",
    security: "AS CROWN Security",
    committee: "AS CROWN Committee"
  };
  return names[currentRole] || "";
}

export async function createGroup(req: Request, res: Response) {
  try {
    const name = String(req.body?.name || "").trim();
    const description = String(req.body?.description || "").trim() || null;
    const creatorId = uid(req);
    if (!name) return res.status(400).json({ success: false, message: "Group name is required" });
    const [result] = await pool.execute(
      `INSERT INTO community_groups (name, description, status, created_by) VALUES (?, ?, 'active', ?)`,
      [name, description, creatorId]
    );
    const groupId = Number((result as any).insertId);
    await pool.execute(
      `INSERT INTO community_members (group_id, user_id, status) VALUES (?, ?, 'active') ON DUPLICATE KEY UPDATE status = 'active'`,
      [groupId, creatorId]
    );
    return res.status(201).json({ success: true, message: "Community group created", data: { id: groupId } });
  } catch (error) {
    console.error("Create community group error:", error);
    return res.status(500).json({ success: false, message: "Unable to create community group" });
  }
}

export async function listMembers(req: Request, res: Response) {
  try {
    const groupId = Number(req.params.groupId);
    if (!Number.isInteger(groupId) || groupId <= 0) return res.status(400).json({ success: false, message: "Invalid group ID" });
    if (!(await requireAccess(req, groupId))) return res.status(403).json({ success: false, message: "You do not have access to this group" });
    const [rows] = await pool.execute(
      `SELECT cm.id, cm.user_id, cm.status, cm.joined_at, u.first_name, u.last_name, u.email FROM community_members cm INNER JOIN users u ON u.id = cm.user_id WHERE cm.group_id = ? ORDER BY cm.joined_at ASC`,
      [groupId]
    );
    return res.json({ success: true, data: { members: rows } });
  } catch (error) {
    console.error("Community members error:", error);
    return res.status(500).json({ success: false, message: "Unable to load community members" });
  }
}

export async function joinGroup(req: any, res: Response) {
  try {
    const groupId = Number(req.params.groupId);
    const userId = uid(req);
    if (!Number.isInteger(groupId) || groupId <= 0 || !userId) return res.status(400).json({ success:false, message:"Invalid group" });
    const [groupRows] = await pool.execute(`SELECT id, name, status FROM community_groups WHERE id = ? LIMIT 1`, [groupId]);
    if (!(groupRows as any[]).length) return res.status(404).json({ success:false, message:"Community group not found" });
    const group = (groupRows as { id: number; name: string; status: string }[])[0];
    if (group.status !== 'active') return res.status(400).json({ success:false, message:"Community group is not active" });
    if (!isRoleAllowedInGroup(role(req), group.name)) return res.status(403).json({ success:false, message:"This private group is not available for your role" });
    await pool.execute(`INSERT INTO community_members (group_id, user_id, status) VALUES (?, ?, 'active') ON DUPLICATE KEY UPDATE status = 'active'`, [groupId, userId]);
    return res.json({ success:true, message:"Joined community group", data:{ groupId } });
  } catch (error) {
    console.error("Join community error:", error);
    return res.status(500).json({ success:false, message:"Unable to join community group" });
  }
}

export async function addMember(req: Request, res: Response) {
  try {
    const groupId = Number(req.params.groupId);
    const userId = Number(req.body?.userId);
    if (!Number.isInteger(groupId) || groupId <= 0 || !Number.isInteger(userId) || userId <= 0) return res.status(400).json({ success: false, message: "Valid group and user IDs are required" });
    await pool.execute(
      `INSERT INTO community_members (group_id, user_id, status) VALUES (?, ?, 'active') ON DUPLICATE KEY UPDATE status = 'active'`,
      [groupId, userId]
    );
    await createUserNotification(userId, "Community access granted", "You now have access to a society community group.", "system");
    return res.json({ success: true, message: "Member added" });
  } catch (error) {
    console.error("Add community member error:", error);
    return res.status(500).json({ success: false, message: "Unable to add community member" });
  }
}

export async function removeMember(req: Request, res: Response) {
  try {
    const groupId = Number(req.params.groupId);
    const userId = Number(req.params.userId);
    await pool.execute(`UPDATE community_members SET status = 'removed' WHERE group_id = ? AND user_id = ?`, [groupId, userId]);
    return res.json({ success: true, message: "Member removed" });
  } catch (error) {
    console.error("Remove community member error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove community member" });
  }
}

export async function listMessages(req: Request, res: Response) {
  try {
    const groupId = Number(req.params.groupId);
    if (!Number.isInteger(groupId) || groupId <= 0) return res.status(400).json({ success: false, message: "Invalid group ID" });
    if (!(await requireAccess(req, groupId))) return res.status(403).json({ success: false, message: "You do not have access to this group" });

    const [rows] = await pool.execute(
      `
      SELECT
        m.*,
        CONCAT_WS(' ', u.first_name, u.last_name) AS user_name,
        COALESCE((SELECT COUNT(*) FROM community_message_reactions r WHERE r.message_id = m.id), 0) AS reaction_count,
        COALESCE((SELECT COUNT(*) FROM community_messages child WHERE child.parent_message_id = m.id), 0) AS reply_count
      FROM community_messages m
      INNER JOIN users u ON u.id = m.user_id
      WHERE m.group_id = ?
      ORDER BY m.created_at ASC
      LIMIT 300
      `,
      [groupId]
    );

    const messages = rows as any[];
    if (messages.length === 0) return res.json({ success: true, data: { messages: [] } });

    const ids = messages.map((m) => Number(m.id));
    const placeholders = ids.map(() => "?").join(",");
    const [reactions] = await pool.execute(
      `SELECT message_id, reaction, COUNT(*) AS count FROM community_message_reactions WHERE message_id IN (${placeholders}) GROUP BY message_id, reaction`,
      ids
    );

    const [myReactions] = await pool.execute(
      `SELECT message_id, reaction FROM community_message_reactions WHERE user_id = ? AND message_id IN (${placeholders})`,
      [uid(req), ...ids]
    );

    const reactionMap = new Map<number, { reaction: string; count: number }[]>();
    for (const row of reactions as any[]) {
      const key = Number(row.message_id);
      const list = reactionMap.get(key) || [];
      list.push({ reaction: row.reaction, count: Number(row.count) });
      reactionMap.set(key, list);
    }

    const myMap = new Map<number, string[]>();
    for (const row of myReactions as any[]) {
      const key = Number(row.message_id);
      const list = myMap.get(key) || [];
      list.push(String(row.reaction));
      myMap.set(key, list);
    }

    return res.json({
      success: true,
      data: {
        messages: messages.map((m) => ({
          ...m,
          reactions: reactionMap.get(Number(m.id)) || [],
          myReactions: myMap.get(Number(m.id)) || []
        }))
      }
    });
  } catch (error) {
    console.error("Community messages error:", error);
    return res.status(500).json({ success: false, message: "Unable to load community messages" });
  }
}

export async function postMessage(req: any, res: Response) {
  try {
    const groupId = Number(req.params.groupId);
    const userId = uid(req);
    if (!Number.isInteger(groupId) || groupId <= 0) return res.status(400).json({ success: false, message: "Invalid group ID" });
    if (!(await requireAccess(req, groupId))) return res.status(403).json({ success: false, message: "You do not have access to this group" });

    const text = String(req.body?.message || "").trim();
    const file = req.file;
    if (!text && !file) return res.status(400).json({ success: false, message: "Message or attachment is required" });

    const parentMessageId = req.body?.parentMessageId ? Number(req.body.parentMessageId) : null;
    if (parentMessageId) {
      const [parent] = await pool.execute(`SELECT id FROM community_messages WHERE id = ? AND group_id = ? LIMIT 1`, [parentMessageId, groupId]);
      if (!(parent as any[]).length) return res.status(400).json({ success: false, message: "Reply target was not found" });
    }

    const messageType = file ? (file.mimetype.startsWith("image/") ? "image" : file.mimetype.startsWith("audio/") ? "voice" : "file") : "text";
    const attachmentUrl = file ? `/uploads/community/${file.filename}` : null;
    const attachmentName = file ? file.originalname : null;

    const [result] = await pool.execute(
      `INSERT INTO community_messages (group_id, parent_message_id, user_id, message_type, message_text, attachment_url, attachment_name) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [groupId, parentMessageId, userId, messageType, text || null, attachmentUrl, attachmentName]
    );

    const messageId = Number((result as any).insertId);
    const [senderRows] = await pool.execute(`SELECT first_name, last_name FROM users WHERE id = ? LIMIT 1`, [userId]);
    const sender = (senderRows as any[])[0] || {};
    emitToCommunity(groupId, "community:message", {
      id: messageId, group_id: groupId, user_id: userId, user_name: `${sender.first_name || ""} ${sender.last_name || ""}`.trim() || "Member",
      parent_message_id: parentMessageId, is_pinned: 0, pinned_at: null, pinned_by: null, message_type: messageType,
      message_text: text || null, attachment_url: attachmentUrl, attachment_name: attachmentName, created_at: new Date().toISOString(),
      reactions: [], myReactions: []
    });

    return res.status(201).json({ success: true, message: "Message sent", data: { id: messageId, messageType, attachmentUrl, attachmentName } });
  } catch (error) {
    console.error("Post community message error:", error);
    return res.status(500).json({ success: false, message: "Unable to send community message" });
  }
}

export async function toggleReaction(req: any, res: Response) {
  try {
    const messageId = Number(req.params.messageId);
    const reaction = String(req.body?.reaction || "").trim();
    const userId = uid(req);
    const allowed = ["👍", "❤️", "😂", "⚠️", "👏", "✅"];
    if (!Number.isInteger(messageId) || messageId <= 0 || !allowed.includes(reaction)) return res.status(400).json({ success: false, message: "Invalid reaction" });

    const [rows] = await pool.execute(`SELECT group_id FROM community_messages WHERE id = ? LIMIT 1`, [messageId]);
    const message = (rows as any[])[0];
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (!(await requireAccess(req, Number(message.group_id)))) return res.status(403).json({ success: false, message: "You do not have access to this group" });

    const [existing] = await pool.execute(`SELECT id FROM community_message_reactions WHERE message_id = ? AND user_id = ? AND reaction = ? LIMIT 1`, [messageId, userId, reaction]);
    if ((existing as any[]).length) {
      await pool.execute(`DELETE FROM community_message_reactions WHERE id = ?`, [(existing as any[])[0].id]);
      emitToCommunity(Number(message.group_id), "community:reaction", { messageId, userId, reaction, active: false });
      return res.json({ success: true, active: false, message: "Reaction removed" });
    }
    await pool.execute(`INSERT INTO community_message_reactions (message_id, user_id, reaction) VALUES (?, ?, ?)`, [messageId, userId, reaction]);
    emitToCommunity(Number(message.group_id), "community:reaction", { messageId, userId, reaction, active: true });
    return res.json({ success: true, active: true, message: "Reaction added" });
  } catch (error) {
    console.error("Community reaction error:", error);
    return res.status(500).json({ success: false, message: "Unable to update reaction" });
  }
}

export async function pinMessage(req: any, res: Response) {
  try {
    const messageId = Number(req.params.messageId);
    if (!Number.isInteger(messageId) || messageId <= 0) return res.status(400).json({ success: false, message: "Invalid message ID" });
    const [rows] = await pool.execute(`SELECT group_id, is_pinned FROM community_messages WHERE id = ? LIMIT 1`, [messageId]);
    const message = (rows as any[])[0];
    if (!message) return res.status(404).json({ success: false, message: "Message not found" });
    if (!(await requireAccess(req, Number(message.group_id)))) return res.status(403).json({ success: false, message: "You do not have access to this group" });
    if (!isModerator(req)) return res.status(403).json({ success: false, message: "Only admins or committee members can pin messages" });

    if (Number(message.is_pinned) === 1) {
      await pool.execute(`UPDATE community_messages SET is_pinned = 0, pinned_at = NULL, pinned_by = NULL WHERE id = ?`, [messageId]);
      emitToCommunity(Number(message.group_id), "community:pin", { messageId, pinned: false, userId: uid(req) });
      return res.json({ success: true, pinned: false, message: "Message unpinned" });
    }

    await pool.execute(`UPDATE community_messages SET is_pinned = 0, pinned_at = NULL, pinned_by = NULL WHERE group_id = ?`, [message.group_id]);
    await pool.execute(`UPDATE community_messages SET is_pinned = 1, pinned_at = CURRENT_TIMESTAMP, pinned_by = ? WHERE id = ?`, [uid(req), messageId]);
    emitToCommunity(Number(message.group_id), "community:pin", { messageId, pinned: true, userId: uid(req) });
    return res.json({ success: true, pinned: true, message: "Message pinned" });
  } catch (error) {
    console.error("Community pin error:", error);
    return res.status(500).json({ success: false, message: "Unable to update pinned message" });
  }
}

export async function listMeetings(req: Request, res: Response) {
  try {
    const groupId = Number(req.params.groupId);
    if (!Number.isInteger(groupId) || groupId <= 0) return res.status(400).json({ success: false, message: "Invalid group ID" });
    if (!(await requireAccess(req, groupId))) return res.status(403).json({ success: false, message: "You do not have access to this group" });
    const [rows] = await pool.execute(
      `SELECT m.*, CONCAT_WS(' ', u.first_name, u.last_name) AS creator_name, (SELECT COUNT(*) FROM community_meeting_rsvps r WHERE r.meeting_id = m.id AND r.response = 'attending') AS attending_count FROM community_meetings m LEFT JOIN users u ON u.id = m.created_by WHERE m.group_id = ? ORDER BY m.meeting_date ASC, m.meeting_time ASC`,
      [groupId]
    );
    return res.json({ success: true, data: { meetings: rows } });
  } catch (error) {
    console.error("Community meetings error:", error);
    return res.status(500).json({ success: false, message: "Unable to load meetings" });
  }
}

export async function createMeeting(req: any, res: Response) {
  try {
    const groupId = Number(req.params.groupId);
    const userId = uid(req);
    const title = String(req.body?.title || "").trim();
    const description = String(req.body?.description || "").trim() || null;
    const agenda = String(req.body?.agenda || "").trim() || null;
    const meetingDate = String(req.body?.meetingDate || "").trim();
    const meetingTime = String(req.body?.meetingTime || "").trim();
    const location = String(req.body?.location || "").trim() || null;
    if (!Number.isInteger(groupId) || groupId <= 0 || !title || !meetingDate || !meetingTime) return res.status(400).json({ success: false, message: "Group, title, meeting date and meeting time are required" });
    if (!isModerator(req)) return res.status(403).json({ success: false, message: "Only admins or committee members can create meetings" });
    if (!(await requireAccess(req, groupId))) return res.status(403).json({ success: false, message: "You do not have access to this group" });

    const [result] = await pool.execute(
      `INSERT INTO community_meetings (group_id, title, description, agenda, meeting_date, meeting_time, location, status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)`,
      [groupId, title, description, agenda, meetingDate, meetingTime, location, userId]
    );

    const [memberRows] = await pool.execute(`SELECT user_id FROM community_members WHERE group_id = ? AND status = 'active' AND user_id <> ?`, [groupId, userId]);
    const userIds = (memberRows as any[]).map((r) => Number(r.user_id));
    if (userIds.length) await createManyUserNotifications(userIds, "New society meeting", `${title} is scheduled for ${meetingDate} at ${meetingTime}${location ? ` at ${location}` : ""}.`, "announcement");
    emitToCommunity(groupId, "community:meeting", { id: Number((result as any).insertId), groupId, title, meetingDate, meetingTime, location });

    return res.status(201).json({ success: true, message: "Meeting created", data: { id: Number((result as any).insertId) } });
  } catch (error) {
    console.error("Create community meeting error:", error);
    return res.status(500).json({ success: false, message: "Unable to create meeting" });
  }
}

export async function rsvpMeeting(req: any, res: Response) {
  try {
    const meetingId = Number(req.params.meetingId);
    const userId = uid(req);
    const response = String(req.body?.response || "");
    if (!Number.isInteger(meetingId) || meetingId <= 0 || !["attending", "not_attending", "maybe"].includes(response)) return res.status(400).json({ success: false, message: "Invalid RSVP" });

    const [meetingRows] = await pool.execute(`SELECT group_id FROM community_meetings WHERE id = ? LIMIT 1`, [meetingId]);
    const meeting = (meetingRows as any[])[0];
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    if (!(await requireAccess(req, Number(meeting.group_id)))) return res.status(403).json({ success: false, message: "You do not have access to this group" });

    await pool.execute(
      `INSERT INTO community_meeting_rsvps (meeting_id, user_id, response) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE response = VALUES(response), updated_at = CURRENT_TIMESTAMP`,
      [meetingId, userId, response]
    );
    return res.json({ success: true, message: "RSVP updated" });
  } catch (error) {
    console.error("Community RSVP error:", error);
    return res.status(500).json({ success: false, message: "Unable to update RSVP" });
  }
}

export async function listMeetingRsvps(req: any, res: Response) {
  try {
    const meetingId = Number(req.params.meetingId);
    const userId = uid(req);
    const [rows] = await pool.execute(`SELECT group_id FROM community_meetings WHERE id = ? LIMIT 1`, [meetingId]);
    const meeting = (rows as any[])[0];
    if (!meeting) return res.status(404).json({ success: false, message: "Meeting not found" });
    if (!(await requireAccess(req, Number(meeting.group_id)))) return res.status(403).json({ success: false, message: "You do not have access to this group" });
    const [rsvps] = await pool.execute(`SELECT r.user_id, r.response, r.updated_at, CONCAT_WS(' ', u.first_name, u.last_name) AS user_name FROM community_meeting_rsvps r INNER JOIN users u ON u.id = r.user_id WHERE r.meeting_id = ? ORDER BY r.updated_at DESC`, [meetingId]);
    const mine = (rsvps as any[]).find((r) => Number(r.user_id) === userId)?.response || null;
    return res.json({ success: true, data: { rsvps, myResponse: mine } });
  } catch (error) {
    console.error("Community RSVP list error:", error);
    return res.status(500).json({ success: false, message: "Unable to load RSVPs" });
  }
}
