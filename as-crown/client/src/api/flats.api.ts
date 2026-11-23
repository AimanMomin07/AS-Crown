import api from "./axios";


export interface Flat {

  id: number;

  building_id: number;

  flat_number: string;

  floor_number: number;

  flat_type:
    | "1BHK"
    | "2BHK"
    | "3BHK"
    | "4BHK"
    | "Penthouse"
    | "Other";

  area_sqft:
    | number
    | null;

  owner_id:
    | number
    | null;

  tenant_id:
    | number
    | null;

  occupancy_status:
    | "occupied"
    | "vacant"
    | "rented"
    | "maintenance";

  status:
    | "active"
    | "inactive";

  building_name?:
    string;

  building_code?:
    string;

  owner_first_name?:
    string;

  owner_last_name?:
    string;

  tenant_first_name?:
    string;

  tenant_last_name?:
    string;

}


export async function getFlats(
  params?: Record<string, unknown>
) {

  const response =
    await api.get(
      "/flats",
      {
        params
      }
    );

  return response.data;

}


export async function getFlatById(
  id: number
) {

  const response =
    await api.get(
      `/flats/${id}`
    );

  return response.data;

}


export async function createFlat(
  data: {
    buildingId: number;
    flatNumber: string;
    floorNumber: number;
    flatType?: string;
    areaSqft?: number;
  }
) {

  const response =
    await api.post(
      "/flats",
      data
    );

  return response.data;

}


export async function updateFlat(
  id: number,
  data: Record<string, unknown>
) {

  const response =
    await api.put(
      `/flats/${id}`,
      data
    );

  return response.data;

}


export async function deleteFlat(
  id: number
) {

  const response =
    await api.delete(
      `/flats/${id}`
    );

  return response.data;

}


export async function getFlatStats() {

  const response =
    await api.get(
      "/flats/stats"
    );

  return response.data;

}


export async function generateFlats(
  data: {
    buildingId: number;
    flatsPerFloor: number;
  }
) {

  const response =
    await api.post(
      "/flats/generate",
      data
    );

  return response.data;

}