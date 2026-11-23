import api from "./axios";

export async function getAmenities(all?: boolean) {
  const response = await api.get("/amenities", { params: all ? { all: "true" } : undefined });
  return response.data;
}

export async function createAmenity(data: Record<string, unknown>) {
  const response = await api.post("/amenities", data);
  return response.data;
}

export async function updateAmenity(id: number, data: Record<string, unknown>) {
  const response = await api.patch(`/amenities/${id}`, data);
  return response.data;
}

export async function deleteAmenity(id: number) {
  const response = await api.delete(`/amenities/${id}`);
  return response.data;
}

export async function getAvailableSlots(amenityId: number, date: string) {
  const response = await api.get(`/amenities/${amenityId}/slots`, { params: { date } });
  return response.data;
}

export async function createBooking(data: {
  amenityId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  guests?: number;
  notes?: string;
}) {
  const response = await api.post("/amenities/bookings", data);
  return response.data;
}

export async function getMyBookings() {
  const response = await api.get("/amenities/bookings/mine");
  return response.data;
}

export async function getAllBookings(params?: Record<string, unknown>) {
  const response = await api.get("/amenities/bookings/all", { params });
  return response.data;
}

export async function cancelBooking(id: number) {
  const response = await api.patch(`/amenities/bookings/${id}/cancel`);
  return response.data;
}
