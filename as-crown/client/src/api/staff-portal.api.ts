import api from "./axios";

export async function getStaffPortal() {
  return (await api.get("/staff-portal")).data;
}

export async function markStaffAttendance(action: "check_in" | "check_out") {
  return (await api.post("/staff-portal/attendance", { action })).data;
}

export async function updateStaffWorkStatus(id: number, status: "in_progress" | "resolved") {
  return (await api.patch(`/staff-portal/complaints/${id}/status`, { status })).data;
}
