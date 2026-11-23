import {
  useCallback,
  useEffect,
  useState
} from "react";

import type {
  CSSProperties
} from "react";

import {
  Download,
  FileBarChart,
  RefreshCw
} from "lucide-react";

import {
  getReport
} from "../../api/reports.api";

import type {
  ReportType
} from "../../api/reports.api";

import {
  exportToCsv
} from "../../utils/exportCsv";


interface ReportRow {
  [key: string]:
    unknown;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = error.response;
    if (typeof response === "object" && response !== null && "data" in response) {
      const data = response.data;
      if (typeof data === "object" && data !== null && "message" in data && typeof data.message === "string") {
        return data.message;
      }
    }
  }
  return fallback;
}


const REPORTS: {
  value:
    ReportType;

  label:
    string;
}[] = [

  {
    value:
      "financial",

    label:
      "Financial"
  },

  {
    value:
      "occupancy",

    label:
      "Occupancy"
  },

  {
    value:
      "complaints",

    label:
      "Complaints"
  },

  {
    value:
      "visitors",

    label:
      "Visitors"
  },

  {
    value:
      "attendance",

    label:
      "Staff Attendance"
  }

];


export default function AdminReports() {

  const [
    reportType,
    setReportType
  ] =
    useState<ReportType>(
      "financial"
    );


  const [
    from,
    setFrom
  ] =
    useState("");


  const [
    to,
    setTo
  ] =
    useState("");


  const [
    rows,
    setRows
  ] =
    useState<ReportRow[]>(
      []
    );


  const [
    loading,
    setLoading
  ] =
    useState(
      true
    );


  const [
    error,
    setError
  ] =
    useState("");


  const loadReport = useCallback(async function loadReport() {

    try {

      setLoading(
        true
      );

      setError("");


      const response =
        await getReport(
          reportType,
          from,
          to
        );


      setRows(
        response
          ?.data
          ?.rows ||
        []
      );

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(
        getErrorMessage(
          requestError,
          "Unable to load report."
        )
      );

    } finally {

      setLoading(
        false
      );

    }

  }, [from, reportType, to]);


  useEffect(() => {

    void loadReport();

  }, [
    loadReport
  ]);


  function download() {

    exportToCsv(
      `as-crown-${reportType}-${new Date()
        .toISOString()
        .slice(
          0,
          10
        )}.csv`,
      rows
    );

  }


  return (

    <div
      style={
        page
      }
    >

      <div
        style={
          container
        }
      >

        <header
          style={
            header
          }
        >

          <div>

            <div
              style={
                eyebrow
              }
            >
              MANAGEMENT
            </div>

            <h1
              style={
                title
              }
            >
              Reports
            </h1>

            <p
              style={
                subtitle
              }
            >
              Analyze AS CROWN data and export operational reports.
            </p>

          </div>


          <button
            type="button"
            onClick={
              download
            }

            disabled={
              rows.length ===
              0
            }

            style={{
              ...downloadButton,

              opacity:
                rows.length ===
                0
                  ? 0.5
                  : 1
            }}
          >

            <Download
              size={
                16
              }
            />

            Export CSV

          </button>

        </header>


        {error && (

          <div
            style={
              errorBox
            }
          >
            {error}
          </div>

        )}


        <section
          style={
            filters
          }
        >

          <label
            style={
              field
            }
          >

            Report

            <select
              value={
                reportType
              }

              onChange={
                event =>
                  setReportType(
                    event.target.value as
                      ReportType
                  )
              }

              style={
                input
              }
            >

              {
                REPORTS.map(
                  report => (

                    <option
                      key={
                        report.value
                      }

                      value={
                        report.value
                      }
                    >

                      {
                        report.label
                      }

                    </option>

                  )
                )
              }

            </select>

          </label>


          <label
            style={
              field
            }
          >

            From

            <input
              type="date"
              value={
                from
              }

              onChange={
                event =>
                  setFrom(
                    event.target.value
                  )
              }

              style={
                input
              }
            />

          </label>


          <label
            style={
              field
            }
          >

            To

            <input
              type="date"
              value={
                to
              }

              onChange={
                event =>
                  setTo(
                    event.target.value
                  )
              }

              style={
                input
              }
            />

          </label>


          <button
            type="button"

            onClick={() =>
              void loadReport()
            }

            style={
              refreshButton
            }
          >

            <RefreshCw
              size={
                16
              }
            />

            Generate

          </button>

        </section>


        <section
          style={
            tableCard
          }
        >

          <div
            style={
              tableHeader
            }
          >

            <div>

              <FileBarChart
                size={
                  19
                }
              />

              <strong>
                {
                  rows.length
                } records
              </strong>

            </div>

          </div>


          {loading ? (

            <div
              style={
                empty
              }
            >
              Loading report...
            </div>

          ) : rows.length ===
            0 ? (

            <div
              style={
                empty
              }
            >
              No data found for this report.
            </div>

          ) : (

            <div
              style={
                tableWrap
              }
            >

              <table
                style={
                  table
                }
              >

                <thead>

                  <tr>

                    {
                      Object.keys(
                        rows[0]
                      ).map(
                        column => (

                          <th
                            key={
                              column
                            }

                            style={
                              th
                            }
                          >

                            {
                              column
                                .replace(
                                  /_/g,
                                  " "
                                )
                                .replace(
                                  /\b\w/g,
                                  char =>
                                    char.toUpperCase()
                                )
                            }

                          </th>

                        )
                      )
                    }

                  </tr>

                </thead>


                <tbody>

                  {
                    rows.map(
                      (
                        row,
                        index
                      ) => (

                        <tr
                          key={
                            index
                          }
                        >

                          {
                            Object.keys(
                              rows[0]
                            ).map(
                              column => (

                                <td
                                  key={
                                    column
                                  }

                                  style={
                                    td
                                  }
                                >

                                  {
                                    formatCell(
                                      row[
                                        column
                                      ]
                                    )
                                  }

                                </td>

                              )
                            )
                          }

                        </tr>

                      )
                    )
                  }

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

    </div>

  );

}


function formatCell(
  value:
    unknown
) {

  if (
    value ===
    null ||
    value ===
    undefined
  ) {

    return "—";

  }


  if (
    typeof value ===
    "number"
  ) {

    return value.toLocaleString(
      "en-IN"
    );

  }


  return String(
    value
  );

}


const page:
  CSSProperties = {
    minHeight:
      "100vh",
    background:
      "#f8fafc",
    padding:
      28
  };


const container:
  CSSProperties = {
    maxWidth:
      1400,
    margin:
      "0 auto"
  };


const header:
  CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap:
      15,
    flexWrap:
      "wrap",
    marginBottom:
      20
  };


const eyebrow:
  CSSProperties = {
    fontSize:
      10,
    fontWeight:
      800,
    letterSpacing:
      1.4,
    color:
      "#2563eb"
  };


const title:
  CSSProperties = {
    margin:
      "5px 0",
    fontSize:
      30
  };


const subtitle:
  CSSProperties = {
    margin:
      0,
    color:
      "#64748b"
  };


const filters:
  CSSProperties = {
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      14,
    padding:
      15,
    display:
      "flex",
    alignItems:
      "flex-end",
    gap:
      12,
    flexWrap:
      "wrap",
    marginBottom:
      14
  };


const field:
  CSSProperties = {
    display:
      "grid",
    gap:
      5,
    fontSize:
      11,
    fontWeight:
      700,
    color:
      "#64748b",
    minWidth:
      170
  };


const input:
  CSSProperties = {
    height:
      40,
    boxSizing:
      "border-box",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      8,
    background:
      "white",
    padding:
      "0 9px"
  };


const refreshButton:
  CSSProperties = {
    height:
      40,
    padding:
      "0 12px",
    border:
      0,
    borderRadius:
      8,
    background:
      "#2563eb",
    color:
      "white",
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      7,
    cursor:
      "pointer",
    fontWeight:
      700
  };


const downloadButton:
  CSSProperties = {
    height:
      40,
    padding:
      "0 12px",
    border:
      0,
    borderRadius:
      8,
    background:
      "#059669",
    color:
      "white",
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      7,
    cursor:
      "pointer",
    fontWeight:
      700
  };


const errorBox:
  CSSProperties = {
    padding:
      12,
    marginBottom:
      14,
    borderRadius:
      10,
    background:
      "#fef2f2",
    color:
      "#b91c1c"
  };


const tableCard:
  CSSProperties = {
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      16,
    overflow:
      "hidden"
  };


const tableHeader:
  CSSProperties = {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      8,
    padding:
      15,
    borderBottom:
      "1px solid #e2e8f0",
    color:
      "#334155"
  };


const tableWrap:
  CSSProperties = {
    overflowX:
      "auto"
  };


const table:
  CSSProperties = {
    width:
      "100%",
    borderCollapse:
      "collapse",
    minWidth:
      900
  };


const th:
  CSSProperties = {
    padding:
      11,
    textAlign:
      "left",
    background:
      "#f8fafc",
    color:
      "#64748b",
    fontSize:
      11,
    whiteSpace:
      "nowrap"
  };


const td:
  CSSProperties = {
    padding:
      11,
    borderTop:
      "1px solid #f1f5f9",
    fontSize:
      12,
    color:
      "#334155",
    whiteSpace:
      "nowrap"
  };


const empty:
  CSSProperties = {
    minHeight:
      260,
    display:
      "grid",
    placeItems:
      "center",
    color:
      "#94a3b8"
  };