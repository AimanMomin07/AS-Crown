import api from "./axios";

export async function triggerSos(data: {
  alertType: "medical" | "fire" | "security" | "other";
  message?: string;
  latitude?: number;
  longitude?: number;
}) {
  const response = await api.post("/sos", data);
  return response.data;
}

export async function getSosAlerts(status?: string) {
  const response = await api.get("/sos", { params: status ? { status } : undefined });
  return response.data;
}

export async function acknowledgeSos(id: number) {
  const response = await api.patch(`/sos/${id}/acknowledge`);
  return response.data;
}

export async function resolveSos(id: number, data?: { notes?: string; falseAlarm?: boolean }) {
  const response = await api.patch(`/sos/${id}/resolve`, data || {});
  return response.data;
}
