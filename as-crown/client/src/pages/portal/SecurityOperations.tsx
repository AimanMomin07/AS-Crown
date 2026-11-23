import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  LogIn,
  LogOut,
  RefreshCw,
  ShieldAlert,
  Users,
  XCircle
} from "lucide-react";

import {
  getVisitors,
  updateVisitorStatus
} from "../../api/visitors.api";


type VisitorStatus =
  | "expected"
  | "inside"
  | "completed"
  | "rejected";


interface Visitor {

  id:
    number;

  visitor_name:
    string;

  phone?:
    string |
    null;

  flat_id?:
    number |
    null;

  resident_id?:
    number |
    null;

  purpose?:
    string |
    null;

  vehicle_number?:
    string |
    null;

  parking_access?:
    number;

  parking_slot?:
    string |
    null;

  visitor_type:
    string;

  check_in?:
    string |
    null;

  check_out?:
    string |
    null;

  status:
    VisitorStatus;

  notes?:
    string |
    null;

  created_at:
    string;

  flat_number?:
    string |
    null;

  building_name?:
    string |
    null;

  building_code?:
    string |
    null;

  resident_first_name?:
    string |
    null;

  resident_last_name?:
    string |
    null;

}


const STATUS_OPTIONS:
  VisitorStatus[] = [

  "expected",

  "inside",

  "completed",

  "rejected"

];


export default function SecurityOperations() {

  const [
    visitors,
    setVisitors
  ] =
    useState<Visitor[]>([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    success,
    setSuccess
  ] =
    useState("");


  const [
    search,
    setSearch
  ] =
    useState("");


  const [
    statusFilter,
    setStatusFilter
  ] =
    useState<
      "all" |
      VisitorStatus
    >(
      "all"
    );


  const [
    processingId,
    setProcessingId
  ] =
    useState<
      number |
      null
    >(null);


  /* =========================================================
     LOAD VISITORS
  ========================================================= */

  const loadVisitors =
    useCallback(
      async (
        showLoading =
          true
      ) => {

        try {

          if (
            showLoading
          ) {

            setLoading(
              true
            );

          } else {

            setRefreshing(
              true
            );

          }


          setError("");


          const response =
            await getVisitors();


          setVisitors(
            response
              ?.data
              ?.visitors ||
            []
          );

        } catch (
          requestError: any
        ) {

          console.error(
            "Security visitor load error:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load visitor operations."
          );

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      []
    );


  useEffect(() => {

    void loadVisitors();

  }, [
    loadVisitors
  ]);


  /* =========================================================
     FILTER
  ========================================================= */

  const filteredVisitors =
    useMemo(
      () => {

        const value =
          search
            .trim()
            .toLowerCase();


        return visitors.filter(
          visitor => {

            const matchesStatus =
              statusFilter ===
                "all" ||
              visitor.status ===
                statusFilter;


            if (
              !matchesStatus
            ) {

              return false;

            }


            if (
              !value
            ) {

              return true;

            }


            return [

              visitor.visitor_name,

              visitor.phone ||
                "",

              visitor.vehicle_number ||
                "",

              visitor.flat_number ||
                "",

              visitor.building_name ||
                "",

              visitor.resident_first_name ||
                "",

              visitor.resident_last_name ||
                ""

            ]
              .join(" ")
              .toLowerCase()
              .includes(
                value
              );

          }
        );

      },
      [
        visitors,
        search,
        statusFilter
      ]
    );


  /* =========================================================
     COUNTS
  ========================================================= */

  const counts =
    useMemo(
      () => ({

        total:
          visitors.length,

        expected:
          visitors.filter(
            item =>
              item.status ===
              "expected"
          ).length,

        inside:
          visitors.filter(
            item =>
              item.status ===
              "inside"
          ).length,

        completed:
          visitors.filter(
            item =>
              item.status ===
              "completed"
          ).length,

        rejected:
          visitors.filter(
            item =>
              item.status ===
              "rejected"
          ).length

      }),
      [
        visitors
      ]
    );


  /* =========================================================
     CHANGE STATUS
  ========================================================= */

  async function changeStatus(
    visitor:
      Visitor,

    status:
      VisitorStatus
  ) {

    if (
      visitor.status ===
      status
    ) {

      return;

    }


    try {

      setProcessingId(
        visitor.id
      );

      setError("");

      setSuccess("");


      await updateVisitorStatus(
        visitor.id,
        status
      );


      setSuccess(
        `${visitor.visitor_name} status updated to ${formatStatus(
          status
        )}.`
      );


      await loadVisitors(
        false
      );

    } catch (
      requestError: any
    ) {

      console.error(
        "Security visitor status error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to update visitor status."
      );

    } finally {

      setProcessingId(
        null
      );

    }

  }


  /* =========================================================
     QUICK ACTION
  ========================================================= */

  function nextAction(
    visitor:
      Visitor
  ) {

    if (
      visitor.status ===
      "expected"
    ) {

      return (
        <button
          type="button"

          onClick={() =>
            void changeStatus(
              visitor,
              "inside"
            )
          }

          disabled={
            processingId ===
            visitor.id
          }

          style={
            greenButton
          }
        >

          <LogIn
            size={
              15
            }
          />

          Check In

        </button>
      );

    }


    if (
      visitor.status ===
      "inside"
    ) {

      return (
        <button
          type="button"

          onClick={() =>
            void changeStatus(
              visitor,
              "completed"
            )
          }

          disabled={
            processingId ===
            visitor.id
          }

          style={
            blueButton
          }
        >

          <LogOut
            size={
              15
            }
          />

          Check Out

        </button>
      );

    }


    return null;

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

        {/* =================================================
            HEADER
        ================================================= */}

        <div
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
              SECURITY OPERATIONS
            </div>


            <h1
              style={
                title
              }
            >
              Visitor Control Center
            </h1>


            <p
              style={
                subtitle
              }
            >
              Monitor expected visitors, entry, exit and vehicle activity.
            </p>

          </div>


          <button
            type="button"

            onClick={() =>
              void loadVisitors(
                false
              )
            }

            disabled={
              refreshing
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

            {
              refreshing
                ? "Refreshing..."
                : "Refresh"
            }

          </button>

        </div>


        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (

          <div
            style={
              errorBox
            }
          >

            <AlertTriangle
              size={
                17
              }
            />

            {
              error
            }

          </div>

        )}


        {success && (

          <div
            style={
              successBox
            }
          >

            <CheckCircle2
              size={
                17
              }
            />

            {
              success
            }

          </div>

        )}


        {/* =================================================
            SUMMARY
        ================================================= */}

        <div
          style={
            statsGrid
          }
        >

          <StatCard
            icon={
              <Users
                size={
                  20
                }
              />
            }
            label="Today's visitor records"
            value={
              counts.total
            }
          />


          <StatCard
            icon={
              <Clock3
                size={
                  20
                }
              />
            }
            label="Expected"
            value={
              counts.expected
            }
            tone="orange"
          />


          <StatCard
            icon={
              <LogIn
                size={
                  20
                }
              />
            }
            label="Currently inside"
            value={
              counts.inside
            }
            tone="green"
          />


          <StatCard
            icon={
              <LogOut
                size={
                  20
                }
              />
            }
            label="Completed"
            value={
              counts.completed
            }
            tone="blue"
          />


          <StatCard
            icon={
              <XCircle
                size={
                  20
                }
              />
            }
            label="Rejected"
            value={
              counts.rejected
            }
            tone="red"
          />

        </div>


        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div
          style={
            filterCard
          }
        >

          <input
            value={
              search
            }

            onChange={
              event =>
                setSearch(
                  event.target.value
                )
            }

            placeholder="Search visitor, flat, vehicle or resident..."
            style={
              searchInput
            }
          />


          <select
            value={
              statusFilter
            }

            onChange={
              event =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | VisitorStatus
                )
            }

            style={
              select
            }
          >

            <option value="all">
              All statuses
            </option>

            {STATUS_OPTIONS.map(
              status => (

                <option
                  key={
                    status
                  }

                  value={
                    status
                  }
                >
                  {
                    formatStatus(
                      status
                    )
                  }
                </option>

              )
            )}

          </select>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div
          style={
            tableCard
          }
        >

          {loading ? (

            <div
              style={
                empty
              }
            >

              <RefreshCw
                size={
                  27
                }
              />

              Loading visitor operations...

            </div>

          ) : filteredVisitors.length ===
            0 ? (

            <div
              style={
                empty
              }
            >

              <ShieldAlert
                size={
                  30
                }
              />

              <strong>
                No matching visitor records
              </strong>

              <span
                style={
                  muted
                }
              >
                Expected and active visitor activity will appear here.
              </span>

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

                    <th
                      style={
                        th
                      }
                    >
                      Visitor
                    </th>

                    <th
                      style={
                        th
                      }
                    >
                      Resident / Flat
                    </th>

                    <th
                      style={
                        th
                      }
                    >
                      Vehicle
                    </th>

                    <th
                      style={
                        th
                      }
                    >
                      Type
                    </th>

                    <th
                      style={
                        th
                      }
                    >
                      Status
                    </th>

                    <th
                      style={
                        th
                      }
                    >
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredVisitors.map(
                    visitor => (

                      <tr
                        key={
                          visitor.id
                        }
                      >

                        <td
                          style={
                            td
                          }
                        >

                          <strong>
                            {
                              visitor.visitor_name
                            }
                          </strong>

                          <div
                            style={
                              small
                            }
                          >
                            {
                              visitor.phone ||
                              "No phone"
                            }
                          </div>

                        </td>


                        <td
                          style={
                            td
                          }
                        >

                          <strong>

                            {
                              [
                                visitor.resident_first_name,
                                visitor.resident_last_name
                              ]
                                .filter(
                                  Boolean
                                )
                                .join(" ") ||
                              "Resident"
                            }

                          </strong>

                          <div
                            style={
                              small
                            }
                          >

                            {
                              visitor.flat_number ||
                              "No flat"
                            }

                            {visitor.building_name
                              ? ` · ${visitor.building_name}`
                              : ""}

                          </div>

                        </td>


                        <td
                          style={
                            td
                          }
                        >

                          {
                            visitor.vehicle_number ||
                            "No vehicle"
                          }

                          {visitor.parking_access ? (

                            <div
                              style={
                                small
                              }
                            >
                              Parking:
                              {" "}
                              {
                                visitor.parking_slot ||
                                "Allocated"
                              }
                            </div>

                          ) : null}

                        </td>


                        <td
                          style={
                            td
                          }
                        >
                          {
                            visitor.visitor_type
                          }
                        </td>


                        <td
                          style={
                            td
                          }
                        >

                          <span
                            style={
                              statusBadge(
                                visitor.status
                              )
                            }
                          >
                            {
                              formatStatus(
                                visitor.status
                              )
                            }
                          </span>

                        </td>


                        <td
                          style={
                            td
                          }
                        >

                          <div
                            style={
                              actionRow
                            }
                          >

                            {
                              nextAction(
                                visitor
                              )
                            }


                            {visitor.status ===
                              "expected" && (

                              <button
                                type="button"

                                onClick={() =>
                                  void changeStatus(
                                    visitor,
                                    "rejected"
                                  )
                                }

                                disabled={
                                  processingId ===
                                  visitor.id
                                }

                                style={
                                  rejectButton
                                }
                              >

                                <XCircle
                                  size={
                                    15
                                  }
                                />

                                Reject

                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =================================================
            FOOTER STATUS
        ================================================= */}

        <div
          style={
            footer
          }
        >

          <ShieldAlert
            size={
              16
            }
          />

          <span>
            Security actions update the same visitor record used by residents and administrators.
          </span>

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  tone = "default"
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    number;

  tone?:
    "default" |
    "orange" |
    "green" |
    "blue" |
    "red";
}) {

  const tones =
    {

      default: {
        background:
          "#f8fafc",
        color:
          "#475569"
      },

      orange: {
        background:
          "#fff7ed",
        color:
          "#c2410c"
      },

      green: {
        background:
          "#ecfdf5",
        color:
          "#047857"
      },

      blue: {
        background:
          "#eff6ff",
        color:
          "#1d4ed8"
      },

      red: {
        background:
          "#fef2f2",
        color:
          "#b91c1c"
      }

    };


  const selected =
    tones[
      tone
    ];


  return (

    <div
      style={
        statCard
      }
    >

      <div
        style={{
          ...statIcon,
          background:
            selected.background,
          color:
            selected.color
        }}
      >

        {icon}

      </div>


      <div>

        <div
          style={
            small
          }
        >
          {
            label
          }
        </div>


        <strong
          style={
            statValue
          }
        >
          {
            value
          }
        </strong>

      </div>

    </div>

  );

}


/* =========================================================
   HELPERS
========================================================= */

function formatStatus(
  status: VisitorStatus
) {

  switch (status) {

    case "expected":
      return "Expected";

    case "inside":
      return "Inside";

    case "completed":
      return "Completed";

    case "rejected":
      return "Rejected";

    default:
      return status;

  }

}


/* =========================================================
   STYLES
========================================================= */

const page:
  React.CSSProperties = {

    minHeight:
      "100vh",

    background:
      "#f8fafc",

    padding:
      28

  };


const container:
  React.CSSProperties = {

    maxWidth:
      1450,

    margin:
      "0 auto"

  };


const header:
  React.CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      16,

    flexWrap:
      "wrap",

    marginBottom:
      18

  };


const eyebrow:
  React.CSSProperties = {

    fontSize:
      11,

    fontWeight:
      800,

    letterSpacing:
      1.5,

    color:
      "#2563eb"

  };


const title:
  React.CSSProperties = {

    margin:
      "5px 0",

    fontSize:
      30,

    color:
      "#0f172a"

  };


const subtitle:
  React.CSSProperties = {

    margin:
      0,

    color:
      "#64748b"

  };


const refreshButton:
  React.CSSProperties = {

    height:
      40,

    padding:
      "0 13px",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    background:
      "white",

    color:
      "#334155",

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
  React.CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      8,

    background:
      "#fef2f2",

    border:
      "1px solid #fecaca",

    color:
      "#b91c1c",

    borderRadius:
      10,

    padding:
      12,

    marginBottom:
      12

  };


const successBox:
  React.CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      8,

    background:
      "#ecfdf5",

    border:
      "1px solid #a7f3d0",

    color:
      "#047857",

    borderRadius:
      10,

    padding:
      12,

    marginBottom:
      12

  };


const statsGrid:
  React.CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(5,minmax(0,1fr))",

    gap:
      10,

    marginBottom:
      14

  };


const statCard:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      14,

    padding:
      14,

    display:
      "flex",

    alignItems:
      "center",

    gap:
      10

  };


const statIcon:
  React.CSSProperties = {

    width:
      38,

    height:
      38,

    borderRadius:
      10,

    display:
      "grid",

    placeItems:
      "center",

    flexShrink:
      0

  };


const statValue:
  React.CSSProperties = {

    display:
      "block",

    marginTop:
      2,

    fontSize:
      21,

    color:
      "#0f172a"

  };


const filterCard:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      14,

    padding:
      12,

    display:
      "flex",

    gap:
      10,

    flexWrap:
      "wrap",

    marginBottom:
      12

  };


const searchInput:
  React.CSSProperties = {

    flex:
      1,

    minWidth:
      260,

    height:
      40,

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    padding:
      "0 12px",

    outline:
      "none",

    boxSizing:
      "border-box"

  };


const select:
  React.CSSProperties = {

    minWidth:
      170,

    height:
      40,

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    padding:
      "0 10px",

    background:
      "white"

  };


const tableCard:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    overflow:
      "hidden"

  };


const tableWrap:
  React.CSSProperties = {

    overflowX:
      "auto"

  };


const table:
  React.CSSProperties = {

    width:
      "100%",

    borderCollapse:
      "collapse",

    minWidth:
      1000

  };


const th:
  React.CSSProperties = {

    textAlign:
      "left",

    padding:
      13,

    fontSize:
      10,

    textTransform:
      "uppercase",

    letterSpacing:
      0.8,

    color:
      "#64748b",

    borderBottom:
      "1px solid #e2e8f0",

    background:
      "#f8fafc"

  };


const td:
  React.CSSProperties = {

    padding:
      13,

    borderBottom:
      "1px solid #f1f5f9",

    fontSize:
      12,

    color:
      "#334155",

    verticalAlign:
      "top"

  };


const small:
  React.CSSProperties = {

    color:
      "#94a3b8",

    fontSize:
      10,

    marginTop:
      3

  };


const muted:
  React.CSSProperties = {

    color:
      "#94a3b8",

    fontSize:
      11

  };


const actionRow:
  React.CSSProperties = {

    display:
      "flex",

    gap:
      6,

    flexWrap:
      "wrap"

  };


const greenButton:
  React.CSSProperties = {

    border:
      0,

    borderRadius:
      8,

    background:
      "#ecfdf5",

    color:
      "#047857",

    padding:
      "8px 10px",

    display:
      "inline-flex",

    alignItems:
      "center",

    gap:
      5,

    cursor:
      "pointer",

    fontWeight:
      700,

    fontSize:
      11

  };


const blueButton:
  React.CSSProperties = {

    border:
      0,

    borderRadius:
      8,

    background:
      "#eff6ff",

    color:
      "#1d4ed8",

    padding:
      "8px 10px",

    display:
      "inline-flex",

    alignItems:
      "center",

    gap:
      5,

    cursor:
      "pointer",

    fontWeight:
      700,

    fontSize:
      11

  };


const rejectButton:
  React.CSSProperties = {

    border:
      0,

    borderRadius:
      8,

    background:
      "#fef2f2",

    color:
      "#b91c1c",

    padding:
      "8px 10px",

    display:
      "inline-flex",

    alignItems:
      "center",

    gap:
      5,

    cursor:
      "pointer",

    fontWeight:
      700,

    fontSize:
      11

  };


function statusBadge(
  status:
    VisitorStatus
):
  React.CSSProperties {

  const styles:
    Record<
      VisitorStatus,
      {
        background:
          string;

        color:
          string;
      }
    > = {

      expected: {
        background:
          "#fff7ed",
        color:
          "#c2410c"
      },

      inside: {
        background:
          "#ecfdf5",
        color:
          "#047857"
      },

      completed: {
        background:
          "#eff6ff",
        color:
          "#1d4ed8"
      },

      rejected: {
        background:
          "#fef2f2",
        color:
          "#b91c1c"
      }

    };


  return {

    display:
      "inline-flex",

    padding:
      "5px 9px",

    borderRadius:
      999,

    fontSize:
      9,

    fontWeight:
      800,

    textTransform:
      "uppercase",

    background:
      styles[
        status
      ].background,

    color:
      styles[
        status
      ].color

  };

}


const empty:
  React.CSSProperties = {

    minHeight:
      280,

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      8,

    color:
      "#94a3b8"

  };


const footer:
  React.CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      7,

    marginTop:
      12,

    color:
      "#64748b",

    fontSize:
      11

  };