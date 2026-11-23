import api from "./axios";

export async function getVehicles(
  params?: Record<string, unknown>
) {
  const response =
    await api.get(
      "/vehicles",
      { params }
    );

  return response.data;
}

export async function createVehicle(
  data: Record<string, unknown>
) {
  const response =
    await api.post(
      "/vehicles",
      data
    );

  return response.data;
}

export async function updateVehicle(
  id: number,
  data: Record<string, unknown>
) {
  const response =
    await api.put(
      `/vehicles/${id}`,
      data
    );

  return response.data;
}

export async function deleteVehicle(
  id: number
) {
  const response =
    await api.delete(
      `/vehicles/${id}`
    );

  return response.data;
}