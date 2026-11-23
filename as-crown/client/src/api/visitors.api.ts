import api from "./axios";


export async function getVisitors(
  params?: Record<string, unknown>
) {

  const response =
    await api.get(
      "/visitors",
      {
        params
      }
    );

  return response.data;
}


export async function createVisitor(
  data: {
    visitorName: string;
    phone?: string | null;
    flatId?: number | null;
    residentId?: number | null;
    purpose?: string | null;
    vehicleNumber?: string | null;
    visitorType: string;
    parkingAccess?: number;
    parkingSlot?: string | null;
    notes?: string | null;
  }
) {

  const response =
    await api.post(
      "/visitors",
      data
    );

  return response.data;
}


export async function updateVisitorStatus(
  id: number,
  status:
    | "expected"
    | "inside"
    | "completed"
    | "rejected"
) {

  const response =
    await api.patch(
      `/visitors/${id}/status`,
      {
        status
      }
    );

  return response.data;
}