import api from "./axios";


export type ReportType =
  | "overview"
  | "financial"
  | "occupancy"
  | "complaints"
  | "visitors"
  | "attendance";


export async function getReport(
  type:
    ReportType,
  from?:
    string,
  to?:
    string
) {

  const response =
    await api.get(
      "/reports",
      {
        params: {
          type,
          from:
            from ||
            undefined,
          to:
            to ||
            undefined
        }
      }
    );


  return response.data;

}