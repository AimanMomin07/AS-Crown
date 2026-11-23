import api from "./axios";


export type EmergencyContactCategory =
  | "Police"
  | "Fire"
  | "Ambulance"
  | "Security"
  | "Society Office"
  | "Other";


export interface EmergencyContact {
  id: number;
  name: string;
  phone: string;
  category: string;
  priority: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}


export async function getEmergencyContacts() {

  const response =
    await api.get(
      "/emergency-contacts"
    );

  return response.data;

}


export async function getAllEmergencyContacts() {

  const response =
    await api.get(
      "/emergency-contacts/admin/all"
    );

  return response.data;

}


export async function createEmergencyContact(
  data: {
    name: string;
    phone: string;
    category: EmergencyContactCategory;
    priority?: number;
  }
) {

  const response =
    await api.post(
      "/emergency-contacts",
      data
    );

  return response.data;

}


export async function updateEmergencyContact(
  id: number,
  data: {
    name: string;
    phone: string;
    category: EmergencyContactCategory;
    priority?: number;
    isActive?: boolean;
  }
) {

  const response =
    await api.put(
      `/emergency-contacts/${id}`,
      data
    );

  return response.data;

}


export async function deleteEmergencyContact(
  id: number
) {

  const response =
    await api.delete(
      `/emergency-contacts/${id}`
    );

  return response.data;

}
