import { Request, Response } from "express";
import pool from "../config/database.js";

export async function getFamilyMembers(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const [rows] = await pool.execute(
      `SELECT id, user_id, name, relationship, date_of_birth, gender,
              phone, emergency_contact, created_at, updated_at
       FROM family_members
       WHERE user_id = ?
       ORDER BY name ASC`,
      [userId]
    );

    return res.json({ success: true, data: { familyMembers: rows } });
  } catch (error) {
    console.error("Get family members error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve family members" });
  }
}

export async function createFamilyMember(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const { name, relationship, dateOfBirth, gender, phone, emergencyContact } = req.body ?? {};

    if (!Number.isInteger(userId) || userId <= 0 || !name || !relationship) {
      return res.status(400).json({ success: false, message: "User, name and relationship are required" });
    }

    const [result] = await pool.execute(
      `INSERT INTO family_members
       (user_id, name, relationship, date_of_birth, gender, phone, emergency_contact)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, name.trim(), relationship.trim(), dateOfBirth || null, gender || null, phone || null, emergencyContact ? 1 : 0]
    );

    return res.status(201).json({ success: true, message: "Family member added successfully", data: { id: (result as any).insertId } });
  } catch (error) {
    console.error("Create family member error:", error);
    return res.status(500).json({ success: false, message: "Unable to add family member" });
  }
}

export async function deleteFamilyMember(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const [result] = await pool.execute("DELETE FROM family_members WHERE id = ?", [id]);
    if (!(result as any).affectedRows) {
      return res.status(404).json({ success: false, message: "Family member not found" });
    }
    return res.json({ success: true, message: "Family member removed successfully" });
  } catch (error) {
    console.error("Delete family member error:", error);
    return res.status(500).json({ success: false, message: "Unable to remove family member" });
  }
}
