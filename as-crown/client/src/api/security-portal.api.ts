import api from "./axios";

export async function getSecurityPortal() {
  return (await api.get("/security-portal")).data;
}

export async function markSecurityAttendance(action: "check_in" | "check_out") {
  return (await api.post("/security-portal/attendance", { action })).data;
}

export async function updateSecurityVisitorStatus(
  id: number,
  status: "inside" | "completed" | "rejected"
) {
  return (await api.patch(`/security-portal/visitors/${id}/status`, { status })).data;
}
