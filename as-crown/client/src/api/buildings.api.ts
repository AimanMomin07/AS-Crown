import api from "./axios";

export async function getBuildings(
  params?: Record<string, unknown>
) {
  const response =
    await api.get(
      "/buildings",
      { params }
    );

  return response.data;
}

export async function getBuildingById(
  id: number
) {
  const response =
    await api.get(
      `/buildings/${id}`
    );

  return response.data;
}

export async function createBuilding(
  data: {
    name: string;
    buildingCode: string;
    totalFloors: number;
    totalFlats?: number;
    address?: string;
    status?: "active" | "inactive";
  }
) {
  const response =
    await api.post(
      "/buildings",
      data
    );

  return response.data;
}

export async function updateBuilding(
  id: number,
  data: Record<string, unknown>
) {
  const response =
    await api.put(
      `/buildings/${id}`,
      data
    );

  return response.data;
}

export async function deleteBuilding(
  id: number
) {
  const response =
    await api.delete(
      `/buildings/${id}`
    );

  return response.data;
}