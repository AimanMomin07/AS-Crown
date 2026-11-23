import api from "./axios";

export async function getAnnouncements(
  params?: Record<string, unknown>
) {
  const response =
    await api.get(
      "/announcements",
      { params }
    );

  return response.data;
}

export async function createAnnouncement(
  data: Record<string, unknown>
) {
  const response =
    await api.post(
      "/announcements",
      data
    );

  return response.data;
}

export async function updateAnnouncement(
  id: number,
  data: Record<string, unknown>
) {
  const response =
    await api.put(
      `/announcements/${id}`,
      data
    );

  return response.data;
}