export interface VisitorPreapproval {
  id: number;
  visitor_name: string;
  visitor_phone?: string | null;
  purpose?: string | null;
  qr_token?: string | null;
  qrImage?: string | null;
  otp_code: string;
  status:
    | "pending"
    | "used"
    | "expired"
    | "cancelled";
  valid_from: string;
  valid_until: string;
  used_at?: string | null;
  created_at: string;
}

import api from "./axios";

export async function createPreapproval(data: {
  visitorName: string;
  visitorPhone?: string;
  purpose?: string;
  validFrom?: string;
  validUntil?: string;
}) {
  const response = await api.post("/visitor-preapproval", data);
  return response.data;
}

export async function getMyPreapprovals() {
  const response = await api.get("/visitor-preapproval/mine");
  return response.data;
}

export async function cancelPreapproval(id: number) {
  const response = await api.delete(`/visitor-preapproval/${id}`);
  return response.data;
}

export async function verifyPreapproval(data: { token?: string; id?: number; otp?: string }) {
  const response = await api.post("/visitor-preapproval/verify", data);
  return response.data;
}
