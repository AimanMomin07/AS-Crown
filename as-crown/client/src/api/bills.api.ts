import api from "./axios";


export async function getBills(
  params?: Record<string, unknown>
) {
  const response =
    await api.get(
      "/bills",
      {
        params
      }
    );

  return response.data;
}


export async function getBillById(
  id: number
) {
  const response =
    await api.get(
      `/bills/${id}`
    );

  return response.data;
}


export async function createBill(
  data: Record<string, unknown>
) {
  const response =
    await api.post(
      "/bills",
      data
    );

  return response.data;
}


export async function generateBills(
  data: {
    buildingId: number;
    billingMonth: string;
    maintenanceAmount: number;
    electricityAmount: number;
    waterAmount: number;
    parkingAmount: number;
    penaltyAmount: number;
    otherAmount: number;
    dueDate: string;
  }
) {
  const response =
    await api.post(
      "/bills/generate",
      data
    );

  return response.data;
}