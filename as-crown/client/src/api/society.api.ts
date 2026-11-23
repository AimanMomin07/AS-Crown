import api from "./axios";

export async function getResidents(params?: Record<string, string | number | undefined>) {
  const response = await api.get("/residents", { params });
  return response.data;
}

export async function getResident(id: number) {
  const response = await api.get(`/residents/${id}`);
  return response.data;
}

export async function getFamilyMembers(userId: number) {
  const response = await api.get(`/family/user/${userId}`);
  return response.data;
}

export async function createFamilyMember(userId: number, data: Record<string, unknown>) {
  const response = await api.post(`/family/user/${userId}`, data);
  return response.data;
}

export async function deleteFamilyMember(id: number) {
  const response = await api.delete(`/family/${id}`);
  return response.data;
}

export async function getBills(params?: Record<string, string | number | undefined>) {
  const response = await api.get("/bills", { params });
  return response.data;
}

export async function getBill(id: number) {
  const response = await api.get(`/bills/${id}`);
  return response.data;
}

export async function createBill(data: Record<string, unknown>) {
  const response = await api.post("/bills", data);
  return response.data;
}

export async function getPayments(params?: Record<string, string | number | undefined>) {
  const response = await api.get("/payments", { params });
  return response.data;
}

export async function recordPayment(data: Record<string, unknown>) {
  const response = await api.post("/payments", data);
  return response.data;
}

export async function updatePaymentStatus(id: number, status: string) {
  const response = await api.patch(`/payments/${id}/status`, { status });
  return response.data;
}

export async function getVisitors(params?: Record<string, string | number | undefined>) {
  const response = await api.get("/visitors", { params });
  return response.data;
}

export async function createVisitor(data: Record<string, unknown>) {
  const response = await api.post("/visitors", data);
  return response.data;
}

export async function updateVisitorStatus(id: number, status: string) {
  const response = await api.patch(`/visitors/${id}/status`, { status });
  return response.data;
}

export async function getVehicles(params?: Record<string, string | number | undefined>) {
  const response = await api.get("/vehicles", { params });
  return response.data;
}

export async function createVehicle(data: Record<string, unknown>) {
  const response = await api.post("/vehicles", data);
  return response.data;
}

export async function updateVehicle(id: number, data: Record<string, unknown>) {
  const response = await api.put(`/vehicles/${id}`, data);
  return response.data;
}

export async function getStaff(params?: Record<string, string | number | undefined>) {
  const response = await api.get("/staff", { params });
  return response.data;
}

export async function createStaff(data: Record<string, unknown>) {
  const response = await api.post("/staff", data);
  return response.data;
}

export async function removeStaff(
  id: number
) {

  const response =
    await api.delete(
      `/staff/${id}`
    );

  return response.data;

}

export async function getAttendance(params?: Record<string, string | number | undefined>) {
  const response = await api.get("/attendance", { params });
  return response.data;
}

export async function saveAttendance(data: Record<string, unknown>) {
  const response = await api.post("/attendance", data);
  return response.data;
}

export async function getAnnouncements(params?: Record<string, string | number | undefined>) {
  const response = await api.get("/announcements", { params });
  return response.data;
}

export async function createAnnouncement(data: Record<string, unknown>) {
  const response = await api.post("/announcements", data);
  return response.data;
}

export async function updateAnnouncementStatus(id: number, status: string) {
  const response = await api.patch(`/announcements/${id}/status`, { status });
  return response.data;
}

export async function getNotifications(userId: number) {
  const response = await api.get("/notifications", { params: { userId } });
  return response.data;
}

export async function createNotification(data: Record<string, unknown>) {
  const response = await api.post("/notifications", data);
  return response.data;
}

export async function markNotificationRead(id: number) {
  const response = await api.patch(`/notifications/${id}/read`);
  return response.data;
}
