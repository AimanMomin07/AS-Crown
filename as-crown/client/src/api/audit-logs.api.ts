import api from "./axios";

export interface AuditLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number | null;
  details: string | null;
  ip_address: string | null;
  created_at: string;
  user_name: string | null;
  email: string | null;
}

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  action?: string;
  entityType?: string;
  search?: string;
}) {
  return (
    await api.get("/audit-logs", { params })
  ).data;
}

export async function getAuditLogStats() {
  return (
    await api.get("/audit-logs/stats")
  ).data;
}
