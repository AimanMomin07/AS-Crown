import { Request, Response } from "express";
import pool from "../config/database.js";

import {
  createManyUserNotifications
} from "../utils/notification.js";

const categories = [
  "general",
  "maintenance",
  "emergency",
  "event",
  "security",
  "other"
];

const priorities = [
  "low",
  "normal",
  "high",
  "urgent"
];

const statuses = [
  "draft",
  "published",
  "archived"
];

export async function getAnnouncements(req: Request, res: Response) {
  try {
    const status = String(req.query.status || "").trim();
    const conditions = ["1=1"];
    const params: unknown[] = [];

    if (status) {
      conditions.push("a.status = ?");
      params.push(status);
    }

    const [rows] = await pool.query(
      `
      SELECT
        a.*,
        u.first_name AS creator_first_name,
        u.last_name AS creator_last_name
      FROM announcements a
      LEFT JOIN users u
        ON u.id = a.created_by
      WHERE ${conditions.join(" AND ")}
      ORDER BY
        a.publish_at DESC,
        a.created_at DESC
      `,
      params
    );

    return res.json({
      success: true,
      data: { announcements: rows }
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve announcements"
    });
  }
}

export async function createAnnouncement(req: Request, res: Response) {
  try {
    const body = req.body ?? {};
    const category = body.category || "general";
    const priority = body.priority || "normal";

    if (!body.title || !body.content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }

    if (!categories.includes(category) || !priorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement category or priority"
      });
    }

    const [result] = await pool.execute(
      `INSERT INTO announcements
       (title, content, category, priority, created_by, publish_at, expires_at, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        body.title.trim(),
        body.content,
        category,
        priority,
        body.createdBy || null,
        body.publishAt || null,
        body.expiresAt || null,
        statuses.includes(body.status)
          ? body.status
          : "draft"
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Announcement created successfully",
      data: {
        id: (result as any).insertId
      }
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create announcement"
    });
  }
}

export async function updateAnnouncementStatus(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const status = String(req.body?.status || "");

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement ID"
      });
    }

    if (!statuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid announcement status"
      });
    }

    const [announcementRows] = await pool.execute(
      `
      SELECT
        id,
        title,
        content,
        status
      FROM announcements
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    const announcement =
      (announcementRows as any[])[0];

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }

    const [result] = await pool.execute(
      `
      UPDATE announcements
      SET
        status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      [status, id]
    );

    if (!(result as any).affectedRows) {
      return res.status(404).json({
        success: false,
        message: "Announcement not found"
      });
    }

    if (status === "published" && announcement.status !== "published") {
      const [residentRows] = await pool.execute(
        `
        SELECT
          u.id
        FROM users u
        INNER JOIN roles r
          ON r.id = u.role_id
        WHERE
          r.name = 'resident'
          AND u.status = 'active'
        `
      );

      const residentIds =
        (residentRows as any[]).map(
          row => Number(row.id)
        );

      await createManyUserNotifications(
  residentIds,
  announcement.title,
  String(announcement.content),
  "announcement"
);
    }

    return res.json({
      success: true,
      message: "Announcement status updated successfully"
    });
  } catch (error) {
    console.error("Update announcement error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update announcement"
    });
  }
}