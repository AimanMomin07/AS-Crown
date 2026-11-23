import api from "./axios";

export async function getDuesIntelligence() {
  const response = await api.get("/admin/dues-intelligence");
  return response.data;
}
