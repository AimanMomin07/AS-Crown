import api from "./axios";


export interface MaintenanceRate {

  id:
    number;

  flat_type:
    string;

  maintenance_amount:
    number;

  electricity_amount:
    number;

  water_amount:
    number;

  parking_amount:
    number;

  penalty_amount:
    number;

  other_amount:
    number;

  late_fee_per_day:
    number;

  grace_days:
    number;

  status:
    "active" |
    "inactive";

}


export interface MaintenanceOverride {

  id:
    number;

  flat_id:
    number;

  flat_number:
    string;

  flat_type:
    string;

  building_name:
    string;

  maintenance_amount:
    number | null;

  electricity_amount:
    number | null;

  water_amount:
    number | null;

  parking_amount:
    number | null;

  penalty_amount:
    number | null;

  other_amount:
    number | null;

  late_fee_per_day:
    number | null;

  grace_days:
    number | null;

  reason:
    string | null;

  status:
    "active" |
    "inactive";

}


export async function getMaintenanceRates() {

  const response =
    await api.get(
      "/maintenance-rates"
    );

  return response.data;

}


export async function saveMaintenanceRate(
  data: {
    flatType:
      string;

    maintenanceAmount:
      number;

    electricityAmount:
      number;

    waterAmount:
      number;

    parkingAmount:
      number;

    penaltyAmount:
      number;

    otherAmount:
      number;

    lateFeePerDay:
      number;

    graceDays:
      number;

    status:
      "active" |
      "inactive";
  }
) {

  const response =
    await api.put(
      "/maintenance-rates",
      data
    );

  return response.data;

}


export async function getMaintenanceOverrides() {

  const response =
    await api.get(
      "/maintenance-rates/overrides"
    );

  return response.data;

}


export async function saveMaintenanceOverride(
  flatId:
    number,

  data: {
    maintenanceAmount:
      number;

    electricityAmount:
      number;

    waterAmount:
      number;

    parkingAmount:
      number;

    penaltyAmount:
      number;

    otherAmount:
      number;

    lateFeePerDay:
      number;

    graceDays:
      number;

    reason?:
      string;

    status:
      "active" |
      "inactive";
  }
) {

  const response =
    await api.put(
      `/maintenance-rates/overrides/${flatId}`,
      data
    );

  return response.data;

}


export async function deleteMaintenanceOverride(
  flatId:
    number
) {

  const response =
    await api.delete(
      `/maintenance-rates/overrides/${flatId}`
    );

  return response.data;

}