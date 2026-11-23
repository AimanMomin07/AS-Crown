import api from "./axios";

export interface CommunityReaction {
  reaction: string;
  count: number;
}

export interface CommunityMessage {
  id: number;
  group_id: number;
  parent_message_id: number | null;
  is_pinned: number;
  pinned_at: string | null;
  pinned_by: number | null;
  user_id: number;
  user_name: string;
  message_type: "text" | "image" | "file" | "voice";
  message_text: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
  reaction_count: number;
  reply_count: number;
  reactions: CommunityReaction[];
  myReactions: string[];
}

export interface CommunityMeeting {
  id: number;
  group_id: number;
  title: string;
  description: string | null;
  agenda: string | null;
  meeting_date: string;
  meeting_time: string;
  location: string | null;
  status: "scheduled" | "cancelled" | "completed";
  created_by: number;
  created_at: string;
  updated_at: string;
  creator_name?: string;
  attending_count?: number;
}

export async function getCommunityGroups() { return (await api.get("/community/groups")).data; }
export async function joinCommunityGroup(groupId: number) { return (await api.post(`/community/groups/${groupId}/join`)).data; }
export async function createCommunityGroup(data: { name: string; description?: string }) { return (await api.post("/community/groups", data)).data; }
export async function getCommunityMembers(groupId: number) { return (await api.get(`/community/groups/${groupId}/members`)).data; }
export async function addCommunityMember(groupId: number, userId: number) { return (await api.post(`/community/groups/${groupId}/members`, { userId })).data; }
export async function removeCommunityMember(groupId: number, userId: number) { return (await api.delete(`/community/groups/${groupId}/members/${userId}`)).data; }
export async function getCommunityMessages(groupId: number) { return (await api.get(`/community/groups/${groupId}/messages`)).data; }

export async function sendCommunityMessage(groupId: number, message: string, attachment?: File | Blob, attachmentName?: string, parentMessageId?: number | null) {
  const formData = new FormData();
  if (message.trim()) formData.append("message", message.trim());
  if (attachment) formData.append("attachment", attachment, attachmentName || "attachment");
  if (parentMessageId) formData.append("parentMessageId", String(parentMessageId));
  return (await api.post(`/community/groups/${groupId}/messages`, formData, { headers: { "Content-Type": "multipart/form-data" } })).data;
}

export async function toggleCommunityReaction(messageId: number, reaction: string) {
  return (await api.post(`/community/messages/${messageId}/reaction`, { reaction })).data;
}

export async function toggleCommunityPin(messageId: number) {
  return (await api.patch(`/community/messages/${messageId}/pin`)).data;
}

export async function getCommunityMeetings(groupId: number) { return (await api.get(`/community/groups/${groupId}/meetings`)).data; }
export async function createCommunityMeeting(groupId: number, data: { title: string; description?: string; agenda?: string; meetingDate: string; meetingTime: string; location?: string }) { return (await api.post(`/community/groups/${groupId}/meetings`, data)).data; }
export async function rsvpCommunityMeeting(meetingId: number, response: "attending" | "not_attending" | "maybe") { return (await api.post(`/community/meetings/${meetingId}/rsvp`, { response })).data; }
export async function getCommunityMeetingRsvps(meetingId: number) { return (await api.get(`/community/meetings/${meetingId}/rsvps`)).data; }
