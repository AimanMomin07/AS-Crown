import api from "./axios";

export async function getVendors(params?: { category?: string; search?: string; all?: boolean }) {
  const response = await api.get("/vendors", { params });
  return response.data;
}

export async function createVendor(data: Record<string, unknown>) {
  const response = await api.post("/vendors", data);
  return response.data;
}

export async function updateVendor(id: number, data: Record<string, unknown>) {
  const response = await api.patch(`/vendors/${id}`, data);
  return response.data;
}

export async function deleteVendor(id: number) {
  const response = await api.delete(`/vendors/${id}`);
  return response.data;
}

export async function requestService(data: { vendorId: number; description: string; preferredDate?: string }) {
  const response = await api.post("/vendors/requests", data);
  return response.data;
}

export async function getMyServiceRequests() {
  const response = await api.get("/vendors/requests/mine");
  return response.data;
}

export async function getAllServiceRequests(status?: string) {
  const response = await api.get("/vendors/requests/all", { params: status ? { status } : undefined });
  return response.data;
}

export async function updateServiceRequestStatus(id: number, status: string) {
  const response = await api.patch(`/vendors/requests/${id}/status`, { status });
  return response.data;
}
