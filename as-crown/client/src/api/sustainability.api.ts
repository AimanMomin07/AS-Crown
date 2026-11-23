import api from "./axios";

export async function getSustainabilityDashboard() {
  const response = await api.get("/sustainability");
  return response.data;
}

export async function getMetricHistory(metricType: string) {
  const response = await api.get(`/sustainability/${metricType}/history`);
  return response.data;
}

export async function recordMetric(data: {
  metricType: string;
  buildingId?: number;
  value: number;
  unit: string;
  recordedAt?: string;
  notes?: string;
}) {
  const response = await api.post("/sustainability", data);
  return response.data;
}
