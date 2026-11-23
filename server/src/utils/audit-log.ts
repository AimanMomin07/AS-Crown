import { Request } from "express";
import pool from "../config/database.js";

export interface AuditLogInput {
  userId?: number | null;
  action: string;
  entityType: string;
  entityId?: number | null;
  details?: unknown;
  ipAddress?: string | null;
}

export function getRequestIp(req: Request): string | null {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || null;
}

export async function writeAuditLog(
  userId: number | undefined,
  action: string,
  entityType: string,
  entityId: number | null,
  details?: unknown,
  ipAddress?: string
): Promise<void> {
  try {
    await pool.execute(
      `
      INSERT INTO audit_logs
      (
        user_id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        userId || null,
        action.trim(),
        entityType.trim(),
        entityId || null,
        details === undefined ? null : JSON.stringify(details),
        ipAddress || null
      ]
    );
  } catch (error) {
    console.error("Audit log error:", error);
  }
}

export async function recordAudit(
  req: Request & { user?: { id?: number } },
  input: Omit<AuditLogInput, "userId" | "ipAddress">
): Promise<void> {
  await writeAuditLog(
    Number(req.user?.id) || undefined,
    input.action,
    input.entityType,
    input.entityId ?? null,
    input.details,
    getRequestIp(req) || undefined
  );
}
