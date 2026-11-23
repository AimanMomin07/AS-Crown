import api from "./axios";

export async function assignOwner(flatId: number, userId: number) {
  const response = await api.put(`/flats/${flatId}/owner`, { userId });
  return response.data;
}
export async function assignTenant(flatId: number, userId: number) {
  const response = await api.put(`/flats/${flatId}/tenant`, { userId });
  return response.data;
}
export async function removeOwner(flatId: number) {
  const response = await api.delete(`/flats/${flatId}/owner`);
  return response.data;
}
export async function removeTenant(flatId: number) {
  const response = await api.delete(`/flats/${flatId}/tenant`);
  return response.data;
}
