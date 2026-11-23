import api from "./axios";


export async function getPayments(
  params?: Record<string, unknown>
) {
  const response =
    await api.get(
      "/payments",
      {
        params
      }
    );

  return response.data;
}


export async function getPaymentById(
  id: number
) {
  const response =
    await api.get(
      `/payments/${id}`
    );

  return response.data;
}


export async function recordPayment(
  data: {
    billId: number;
    userId: number;
    amount: number;
    paymentMethod:
      | "cash"
      | "upi"
      | "card"
      | "net_banking"
      | "bank_transfer"
      | "other";
    transactionId?: string;
    notes?: string;
  }
) {
  const response =
    await api.post(
      "/payments",
      data
    );

  return response.data;
}


export async function createPayment(
  data: {
    billId: number;
    userId: number;
    amount: number;
    paymentMethod:
      | "cash"
      | "upi"
      | "card"
      | "net_banking"
      | "bank_transfer"
      | "other";
    transactionId?: string;
    notes?: string;
  }
) {
  return recordPayment(
    data
  );
}