import { Response } from "express";
import crypto from "crypto";
import QRCode from "qrcode";

import pool from "../config/database.js";
import { createUserNotification } from "../utils/notification.js";
import { emitRealtime } from "../realtime/socket.js";

/* =========================================================
   HELPERS
========================================================= */

async function getResidentFlat(userId: number) {
  const [rows] = await pool.execute(
    `SELECT f.id FROM flats f WHERE (f.owner_id = ? OR f.tenant_id = ?) AND f.status = 'active' LIMIT 1`,
    [userId, userId]
  );
  const flats = rows as any[];
  return flats.length ? flats[0].id : null;
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/* =========================================================
   CREATE PRE-APPROVAL  (resident)
========================================================= */

export async function createPreapproval(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);
    const { visitorName, visitorPhone, purpose, validFrom, validUntil } = req.body || {};

    if (!visitorName || String(visitorName).trim().length < 2) {
      return res.status(400).json({ success: false, message: "Visitor name is required" });
    }

    const flatId = await getResidentFlat(userId);
    if (!flatId) {
      return res.status(400).json({ success: false, message: "No flat linked to your account" });
    }

    const from = validFrom ? new Date(validFrom) : new Date();
    const until = validUntil
      ? new Date(validUntil)
      : new Date(from.getTime() + 12 * 60 * 60 * 1000);

    if (isNaN(from.getTime()) || isNaN(until.getTime()) || until <= from) {
      return res.status(400).json({ success: false, message: "Invalid validity window" });
    }

    const token = crypto.randomBytes(16).toString("hex");
    const otp = generateOtp();

    const [result] = await pool.execute(
      `INSERT INTO visitor_preapprovals
       (resident_id, flat_id, visitor_name, visitor_phone, purpose, qr_token, otp_code, valid_from, valid_until, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        flatId,
        String(visitorName).trim(),
        visitorPhone || null,
        purpose || null,
        token,
        otp,
        from,
        until
      ]
    );

    const id = (result as any).insertId;
    const qrPayload = JSON.stringify({ type: "as-crown-visitor", token });
    const qrImage = await QRCode.toDataURL(qrPayload, { margin: 1, width: 320 });

    return res.status(201).json({
      success: true,
      data: {
        id,
        qrToken: token,
        otp,
        qrImage,
        validFrom: from,
        validUntil: until
      }
    });
  } catch (error) {
    console.error("Create pre-approval error:", error);
    return res.status(500).json({ success: false, message: "Unable to create pre-approval" });
  }
}

/* =========================================================
   MY PRE-APPROVALS  (resident)
========================================================= */

export async function getMyPreapprovals(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);

    await pool.execute(
      `UPDATE visitor_preapprovals SET status = 'expired'
       WHERE status = 'pending' AND valid_until < NOW()`
    );

    const [rows] = await pool.execute(
      `
      SELECT
        id,
        visitor_name,
        visitor_phone,
        purpose,
        qr_token,
        otp_code,
        status,
        valid_from,
        valid_until,
        used_at,
        created_at
      FROM visitor_preapprovals
      WHERE resident_id = ?
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [userId]
    );

    const approvals =
      await Promise.all(
        (rows as any[]).map(
          async row => {

            let qrImage:
              string | null =
              null;

            if (
              row.status === "pending" &&
              row.qr_token
            ) {

              const qrPayload =
                JSON.stringify({
                  type:
                    "as-crown-visitor",

                  token:
                    row.qr_token
                });

              qrImage =
                await QRCode.toDataURL(
                  qrPayload,
                  {
                    margin: 1,
                    width: 320
                  }
                );

            }

            return {
              ...row,
              qrImage
            };

          }
        )
      );

    return res.json({
      success: true,
      data: approvals
    });
  } catch (error) {
    console.error("Get pre-approvals error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch pre-approvals" });
  }
}

/* =========================================================
   CANCEL PRE-APPROVAL  (resident)
========================================================= */

export async function cancelPreapproval(req: any, res: Response) {
  try {
    const userId = Number(req.user?.id);
    const id = Number(req.params.id);

    const [result] = await pool.execute(
      `UPDATE visitor_preapprovals SET status = 'cancelled'
       WHERE id = ? AND resident_id = ? AND status = 'pending'`,
      [id, userId]
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Pre-approval not found or already used" });
    }

    return res.json({ success: true, message: "Pre-approval cancelled" });
  } catch (error) {
    console.error("Cancel pre-approval error:", error);
    return res.status(500).json({ success: false, message: "Unable to cancel pre-approval" });
  }
}

/* =========================================================
   VERIFY AT GATE  (security / admin)
   Accepts either { token } from a QR scan, or { code, otp }
   where `code` is the pre-approval id shown to the guard.
========================================================= */

export async function verifyPreapproval(req: any, res: Response) {
  try {
    const guardId = Number(req.user?.id);
    let token =
      req.body?.token
        ? String(
            req.body.token
          ).trim()
        : null;
    const otp = req.body?.otp ? String(req.body.otp).trim() : null;
    const idInput = req.body?.id ? Number(req.body.id) : null;

    /*
     * The QR image contains JSON:
     * {"type":"as-crown-visitor","token":"..."}
     *
     * Accept both the raw token and the complete QR payload.
     */
    if (
      token &&
      token.startsWith("{")
    ) {

      try {

        const parsed =
          JSON.parse(
            token
          );

        if (
          parsed &&
          typeof parsed.token ===
            "string"
        ) {

          token =
            parsed.token.trim();

        }

      } catch {
        // Keep the original token; the DB lookup below will reject it.
      }

    }

    let query = "";
    let params: any[] = [];

    if (token) {
      query = "SELECT * FROM visitor_preapprovals WHERE qr_token = ? LIMIT 1";
      params = [token];
    } else if (otp && idInput) {
      query = "SELECT * FROM visitor_preapprovals WHERE id = ? AND otp_code = ? LIMIT 1";
      params = [idInput, otp];
    } else {
      return res.status(400).json({ success: false, message: "Provide a QR token or an ID + OTP" });
    }

    const [rows] = await pool.execute(query, params);
    const preapproval = (rows as any[])[0];

    if (!preapproval) {
      return res.status(404).json({ success: false, message: "Invalid or unrecognized code" });
    }

    if (preapproval.status !== "pending") {
      return res.status(409).json({ success: false, message: `This pass is already ${preapproval.status}` });
    }

    const now = new Date();
    if (new Date(preapproval.valid_until) < now) {
      await pool.execute(`UPDATE visitor_preapprovals SET status = 'expired' WHERE id = ?`, [preapproval.id]);
      return res.status(410).json({ success: false, message: "This pass has expired" });
    }

    const [visitorResult] = await pool.execute(
      `INSERT INTO visitors
       (visitor_name, phone, flat_id, resident_id, purpose, visitor_type, check_in, status, notes)
       VALUES (?, ?, ?, ?, ?, 'guest', NOW(), 'inside', 'Entered via pre-approved QR/OTP pass')`,
      [
        preapproval.visitor_name,
        preapproval.visitor_phone,
        preapproval.flat_id,
        preapproval.resident_id,
        preapproval.purpose
      ]
    );

    const visitorLogId = (visitorResult as any).insertId;

    await pool.execute(
      `UPDATE visitor_preapprovals SET status = 'used', used_at = NOW(), verified_by = ?, visitor_log_id = ?
       WHERE id = ?`,
      [guardId, visitorLogId, preapproval.id]
    );

    await createUserNotification(
      preapproval.resident_id,
      "Visitor checked in",
      `${preapproval.visitor_name} has been verified and let in by security.`,
      "visitor"
    );

    emitRealtime("visitor:checked-in", {
      flatId: preapproval.flat_id,
      visitorName: preapproval.visitor_name
    });

    return res.json({
      success: true,
      message: `${preapproval.visitor_name} checked in successfully`,
      data: {
        visitorLogId,
        preapprovalId: preapproval.id,
        flatId: preapproval.flat_id,
        visitorName:
          preapproval.visitor_name,
        status:
          "inside"
      }
    });
  } catch (error) {
    console.error("Verify pre-approval error:", error);
    return res.status(500).json({ success: false, message: "Unable to verify pass" });
  }
}
