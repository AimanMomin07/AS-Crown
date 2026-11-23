import api from "./axios";


export interface GenerateBillsRequest {

  billingMonth:
    string;

  dueDate:
    string;

  buildingId?:
    number |
    null;

}


export interface GeneratedBill {

  id:
    number;

  billNumber:
    string;

  flatId:
    number;

  flatNumber:
    string;

  buildingName:
    string;

  flatType:
    string;

  maintenance:
    number;

  electricity:
    number;

  water:
    number;

  parking:
    number;

  penalty:
    number;

  other:
    number;

  total:
    number;

  dueDate:
    string;

  residentId:
    number |
    null;

}


export async function generateMaintenanceBills(
  data:
    GenerateBillsRequest
) {

  const response =
    await api.post(
      "/maintenance-billing/generate",
      data
    );


  return response.data;

}