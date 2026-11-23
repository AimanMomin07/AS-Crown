import api from "./axios";


/* =========================================================
   TYPES
========================================================= */

export type ComplaintStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed"
  | "rejected";


export type ComplaintPriority =
  | "low"
  | "medium"
  | "high"
  | "urgent";


export interface ComplaintUpdate {

  category?:
    string;

  priority?:
    ComplaintPriority;

  status?:
    ComplaintStatus;

  assignedTo?:
    number |
    null;

  slaDueAt?:
    string |
    null;

  resolutionNotes?:
    string |
    null;

  aiCategory?:
    string |
    null;

  aiPriority?:
    string |
    null;

  historyNote?:
    string |
    null;

}


/* =========================================================
   GET ALL
========================================================= */

export async function getComplaints(
  params?: Record<string, unknown>
) {

  const response =
    await api.get(
      "/complaints",
      {
        params
      }
    );


  return response.data;

}


/* =========================================================
   GET ONE
========================================================= */

export async function getComplaintById(
  id:
    number
) {

  const response =
    await api.get(
      `/complaints/${id}`
    );


  return response.data;

}


/* =========================================================
   CREATE
========================================================= */

export async function createComplaint(
  data:
    Record<string, unknown>
) {

  const response =
    await api.post(
      "/complaints",
      data
    );


  return response.data;

}


/* =========================================================
   UPDATE
========================================================= */

export async function updateComplaint(
  id:
    number,

  data:
    ComplaintUpdate
) {

  const response =
    await api.put(
      `/complaints/${id}`,
      data
    );


  return response.data;

}


/* =========================================================
   STATS
========================================================= */

export async function getComplaintStats() {

  const response =
    await api.get(
      "/complaints/stats"
    );


  return response.data;

}


/* =========================================================
   RESIDENT ACKNOWLEDGEMENT
========================================================= */

export async function acknowledgeComplaint(
  id:
    number
) {

  const response =
    await api.patch(
      `/complaints/${id}/acknowledge`
    );


  return response.data;

}