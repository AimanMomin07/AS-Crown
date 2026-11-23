import api from "./axios";


export interface ResidentVisitor {

  id:
    number;

  visitor_name:
    string;

  phone:
    string | null;

  flat_id:
    number | null;

  resident_id:
    number;

  purpose:
    string | null;

  vehicle_number:
    string | null;

  parking_access:
    number;

  parking_slot:
    string | null;

  visitor_type:
    string;

  expected_at:
    string | null;

  status:
    "expected" |
    "inside" |
    "completed" |
    "rejected";

  notes:
    string | null;

  check_in:
    string | null;

  check_out:
    string | null;

  created_at:
    string;

}


export async function getResidentVisitors() {

  const response =
    await api.get(
      "/resident/visitors"
    );

  return response.data;

}


export async function createResidentVisitor(
  data: {
    visitorName:
      string;

    phone?:
      string;

    purpose?:
      string;

    vehicleNumber?:
      string;

    visitorType:
      string;

    parkingAccess:
      boolean;

    parkingSlot?:
      string;

    expectedAt?:
      string;

    notes?:
      string;
  }
) {

  const response =
    await api.post(
      "/resident/visitors",
      data
    );

  return response.data;

}


export async function updateResidentVisitorStatus(
  id:
    number,

  status:
    "expected" |
    "inside" |
    "completed" |
    "rejected"
) {

  const response =
    await api.patch(
      `/resident/visitors/${id}/status`,
      {
        status
      }
    );

  return response.data;

}