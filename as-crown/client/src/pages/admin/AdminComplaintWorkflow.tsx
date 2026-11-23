import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Clock3,
  UserRound,
  CheckCircle2,
  Save,
  History
} from "lucide-react";

import {
  getComplaints,
  getComplaintById,
  updateComplaint
} from "../../api/complaints.api";

import type {
  ComplaintPriority,
  ComplaintStatus
} from "../../api/complaints.api";

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


interface Complaint {

  id:
    number;

  complaint_number:
    string;

  user_id:
    number;

  flat_id:
    number |
    null;

  title:
    string;

  description:
    string;

  category:
    string;

  priority:
    string;

  status:
    string;

  assigned_to:
    number |
    null;

  sla_due_at:
    string |
    null;

  resolution_notes:
    string |
    null;

  resolved_at:
    string |
    null;

  acknowledged_at:
    string |
    null;

  user_first_name?:
    string;

  user_last_name?:
    string;

  flat_number?:
    string;

  building_name?:
    string;

  staff_first_name?:
    string;

  staff_last_name?:
    string;

}


interface HistoryItem {

  id:
    number;

  old_status?:
    string |
    null;

  new_status?:
    string;

  old_assigned_to?:
    number |
    null;

  new_assigned_to?:
    number |
    null;

  changed_by?:
    number |
    null;

  assigned_by?:
    number |
    null;

  notes?:
    string |
    null;

  created_at:
    string;

  first_name?:
    string;

  last_name?:
    string;

  old_staff_first_name?:
    string;

  old_staff_last_name?:
    string;

  new_staff_first_name?:
    string;

  new_staff_last_name?:
    string;

}


const statuses = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "rejected"
];


const priorities = [
  "low",
  "medium",
  "high",
  "urgent"
];


export default function AdminComplaintWorkflow() {

  const [currentTime] = useState(() => Date.now());

  const [
    complaints,
    setComplaints
  ] =
    useState<Complaint[]>([]);


  const [
    selected,
    setSelected
  ] =
    useState<Complaint | null>(
      null
    );


  const [
    statusHistory,
    setStatusHistory
  ] =
    useState<HistoryItem[]>([]);


  const [
    assignmentHistory,
    setAssignmentHistory
  ] =
    useState<HistoryItem[]>([]);


  const [
    search,
    setSearch
  ] =
    useState("");


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    saving,
    setSaving
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
    status,
    setStatus
  ] =
    useState<ComplaintStatus | "">("");


  const [
    priority,
    setPriority
  ] =
    useState<ComplaintPriority | "">("");


  const [
    assignedTo,
    setAssignedTo
  ] =
    useState("");


  const [
    slaDueAt,
    setSlaDueAt
  ] =
    useState("");


  const [
    resolutionNotes,
    setResolutionNotes
  ] =
    useState("");


  const [
    historyNote,
    setHistoryNote
  ] =
    useState("");


  const loadComplaints = useCallback(async function loadComplaints() {

    try {

      setLoading(
        true
      );


      const response =
        await getComplaints({

          search:
            search.trim() ||
            undefined

        });


      setComplaints(
        response
          ?.data
          ?.complaints ||
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
          "Unable to load complaints."
        )
      );

    } finally {

      setLoading(
        false
      );

    }

  }, [search]);


  useEffect(() => {

    void loadComplaints();

  }, [loadComplaints]);


  async function openComplaint(
    id:
      number
  ) {

    try {

      setError("");

      setSuccess("");


      const response =
        await getComplaintById(
          id
        );


      const data =
        response
          ?.data;


      const complaint =
        data
          ?.complaint ||
        null;


      setSelected(
        complaint
      );


      setStatus(
        complaint
          ?.status ||
        ""
      );


      setPriority(
        complaint
          ?.priority ||
        ""
      );


      setAssignedTo(
        complaint
          ?.assigned_to
          ? String(
              complaint.assigned_to
            )
          : ""
      );


      setSlaDueAt(
        toDatetimeLocal(
          complaint
            ?.sla_due_at
        )
      );


      setResolutionNotes(
        complaint
          ?.resolution_notes ||
        ""
      );


      setStatusHistory(
        data
          ?.statusHistory ||
        []
      );


      setAssignmentHistory(
        data
          ?.assignmentHistory ||
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
          "Unable to open complaint."
        )
      );

    }

  }


  async function saveChanges() {

    if (
      !selected
    ) {

      return;

    }


    try {

      setSaving(
        true
      );

      setError("");

      setSuccess("");


      await updateComplaint(

        selected.id,

        {

          status:
            status as ComplaintStatus,

          priority:
            priority as ComplaintPriority,

          assignedTo:
            assignedTo
              ? Number(
                  assignedTo
                )
              : null,

          slaDueAt:
            slaDueAt
              ? new Date(
                  slaDueAt
                ).toISOString()
              : null,

          resolutionNotes:
            resolutionNotes,

          historyNote:
            historyNote.trim() ||
            null

        }

      );


      setHistoryNote("");


      await openComplaint(
        selected.id
      );


      await loadComplaints();


      setSuccess(
        "Complaint workflow updated successfully."
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
          "Unable to update complaint."
        )
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  const filtered =
    complaints.filter(
      complaint =>
        !search.trim() ||
        complaint.complaint_number
          .toLowerCase()
          .includes(
            search
              .toLowerCase()
          ) ||
        complaint.title
          .toLowerCase()
          .includes(
            search
              .toLowerCase()
          )
    );


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

        <div
          style={
            top
          }
        >

          <div>

            <div
              style={
                eyebrow
              }
            >
              OPERATIONS
            </div>

            <h1
              style={
                title
              }
            >
              Complaint Workflow
            </h1>

            <p
              style={
                subtitle
              }
            >
              Assign, prioritize, track SLA and close resident complaints.
            </p>

          </div>

        </div>


        {error && (

          <div
            style={
              errorBox
            }
          >
            {error}
          </div>

        )}


        {success && (

          <div
            style={
              successBox
            }
          >
            {success}
          </div>

        )}


        <div
          style={
            layout
          }
        >

          <section
            style={
              listCard
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

              placeholder="Search complaint..."
              style={
                input
              }
            />


            {loading ? (

              <div
                style={
                  empty
                }
              >
                Loading...
              </div>

            ) : filtered.length === 0 ? (

              <div
                style={
                  empty
                }
              >
                No complaints found.
              </div>

            ) : (

              filtered.map(
                complaint => (

                  <button
                    key={
                      complaint.id
                    }

                    type="button"

                    onClick={() =>
                      void openComplaint(
                        complaint.id
                      )
                    }

                    style={{
                      ...listItem,

                      borderColor:
                        selected?.id ===
                        complaint.id
                          ? "#2563eb"
                          : "#e2e8f0"
                    }}
                  >

                    <div
                      style={
                        listHeader
                      }
                    >

                      <strong>
                        {
                          complaint.title
                        }
                      </strong>


                      <span
                        style={
                          badge(
                            complaint.priority
                          )
                        }
                      >
                        {
                          complaint.priority
                        }
                      </span>

                    </div>


                    <span
                      style={
                        muted
                      }
                    >
                      {
                        complaint.complaint_number
                      }
                    </span>


                    <span
                      style={
                        muted
                      }
                    >
                      {
                        complaint.user_first_name
                      }{" "}
                      {
                        complaint.user_last_name ||
                        ""
                      }
                    </span>


                    <span
                      style={
                        statusBadge(
                          complaint.status
                        )
                      }
                    >
                      {
                        complaint.status
                      }
                    </span>

                  </button>

                )

              )

            )}

          </section>


          <section
            style={
              detailCard
            }
          >

            {!selected ? (

              <div
                style={
                  emptyDetail
                }
              >

                <History
                  size={
                    38
                  }
                />

                <strong>
                  Select a complaint
                </strong>

                <span>
                  Choose a complaint from the list to manage its complete workflow.
                </span>

              </div>

            ) : (

              <>

                <div
                  style={
                    detailHeader
                  }
                >

                  <div>

                    <small
                      style={
                        muted
                      }
                    >
                      {
                        selected.complaint_number
                      }
                    </small>


                    <h2
                      style={{
                        margin:
                          "4px 0"
                      }}
                    >
                      {
                        selected.title
                      }
                    </h2>


                    <p
                      style={
                        muted
                      }
                    >
                      {
                        selected.user_first_name
                      }{" "}
                      {
                        selected.user_last_name ||
                        ""
                      }
                      {" · "}
                      {
                        selected.flat_number ||
                        "No flat"
                      }
                    </p>

                  </div>


                  <span
                    style={
                      statusBadge(
                        selected.status
                      )
                    }
                  >
                    {
                      selected.status
                    }
                  </span>

                </div>


                <div
                  style={
                    description
                  }
                >
                  {
                    selected.description
                  }
                </div>


                <div
                  style={
                    formGrid
                  }
                >

                  <label
                    style={
                      label
                    }
                  >
                    Status

                    <select
                      value={
                        status
                      }

                      onChange={
                        event =>
                          setStatus(
                            event.target.value as ComplaintStatus
                          )
                      }

                      style={
                        input
                      }
                    >

                      {statuses.map(
                        value => (

                          <option
                            key={
                              value
                            }

                            value={
                              value
                            }
                          >
                            {
                              value.replace(
                                "_",
                                " "
                              )
                            }
                          </option>

                        )
                      )}

                    </select>

                  </label>


                  <label
                    style={
                      label
                    }
                  >
                    Priority

                    <select
                      value={
                        priority
                      }

                      onChange={
                        event =>
                          setPriority(
                            event.target.value as ComplaintPriority
                          )
                      }

                      style={
                        input
                      }
                    >

                      {priorities.map(
                        value => (

                          <option
                            key={
                              value
                            }

                            value={
                              value
                            }
                          >
                            {
                              value
                            }
                          </option>

                        )
                      )}

                    </select>

                  </label>


                  <label
                    style={
                      label
                    }
                  >
                    Assign staff/user ID

                    <input
                      value={
                        assignedTo
                      }

                      onChange={
                        event =>
                          setAssignedTo(
                            event.target.value
                          )
                      }

                      placeholder="e.g. 12"
                      style={
                        input
                      }
                    />

                  </label>


                  <label
                    style={
                      label
                    }
                  >
                    SLA due

                    <input
                      type="datetime-local"

                      value={
                        slaDueAt
                      }

                      onChange={
                        event =>
                          setSlaDueAt(
                            event.target.value
                          )
                      }

                      style={
                        input
                      }
                    />

                  </label>

                </div>


                <label
                  style={
                    label
                  }
                >
                  Resolution notes

                  <textarea
                    value={
                      resolutionNotes
                    }

                    onChange={
                      event =>
                        setResolutionNotes(
                          event.target.value
                        )
                    }

                    rows={
                      5
                    }

                    style={
                      textarea
                    }

                    placeholder="Describe the work performed and resolution."
                  />

                </label>


                <label
                  style={
                    label
                  }
                >
                  Workflow note

                  <input
                    value={
                      historyNote
                    }

                    onChange={
                      event =>
                        setHistoryNote(
                          event.target.value
                        )
                    }

                    style={
                      input
                    }

                    placeholder="Optional note for the history record"
                  />

                </label>


                <button
                  type="button"

                  disabled={
                    saving
                  }

                  onClick={() =>
                    void saveChanges()
                  }

                  style={
                    saveButton
                  }
                >

                  <Save
                    size={
                      17
                    }
                  />

                  {
                    saving
                      ? "Saving..."
                      : "Save Workflow"
                  }

                </button>


                <div
                  style={
                    infoGrid
                  }
                >

                  <InfoBox
                    icon={
                      <Clock3
                        size={
                          17
                        }
                      />
                    }

                    label="SLA"

                    value={
                      selected.sla_due_at
                        ? formatDateTime(
                            selected.sla_due_at
                          )
                        : "Not set"
                    }

                    danger={
                      Boolean(
                        selected.sla_due_at &&
                        new Date(
                          selected.sla_due_at
                        ).getTime() <
                          currentTime &&
                        ![
                          "resolved",
                          "closed",
                          "rejected"
                        ].includes(
                          selected.status
                        )
                      )
                    }
                  />


                  <InfoBox
                    icon={
                      <UserRound
                        size={
                          17
                        }
                      />
                    }

                    label="Assigned"

                    value={
                      selected.staff_first_name
                        ? `${selected.staff_first_name} ${
                            selected.staff_last_name ||
                            ""
                          }`
                        : "Unassigned"
                    }
                  />


                  <InfoBox
                    icon={
                      <CheckCircle2
                        size={
                          17
                        }
                      />
                    }

                    label="Acknowledgement"

                    value={
                      selected.acknowledged_at
                        ? formatDateTime(
                            selected.acknowledged_at
                          )
                        : "Waiting"
                    }
                  />

                </div>


                <div
                  style={
                    historyGrid
                  }
                >

                  <div>

                    <h3>
                      Status history
                    </h3>


                    {
                      statusHistory.length ===
                      0 ? (

                        <p
                          style={
                            muted
                          }
                        >
                          No history yet.
                        </p>

                      ) : (

                        statusHistory.map(
                          item => (

                            <div
                              key={
                                item.id
                              }

                              style={
                                historyItem
                              }
                            >

                              <strong>
                                {
                                  item.old_status ||
                                  "—"
                                }
                                {" → "}
                                {
                                  item.new_status
                                }
                              </strong>

                              <span
                                style={
                                  muted
                                }
                              >
                                {
                                  formatDateTime(
                                    item.created_at
                                  )
                                }
                              </span>

                              {item.notes && (
                                <span
                                  style={
                                    muted
                                  }
                                >
                                  {
                                    item.notes
                                  }
                                </span>
                              )}

                            </div>

                          )
                        )

                      )
                    }

                  </div>


                  <div>

                    <h3>
                      Assignment history
                    </h3>


                    {
                      assignmentHistory.length ===
                      0 ? (

                        <p
                          style={
                            muted
                          }
                        >
                          No assignment changes yet.
                        </p>

                      ) : (

                        assignmentHistory.map(
                          item => (

                            <div
                              key={
                                item.id
                              }

                              style={
                                historyItem
                              }
                            >

                              <strong>
                                {
                                  item.old_staff_first_name ||
                                  "Unassigned"
                                }
                                {" → "}
                                {
                                  item.new_staff_first_name ||
                                  "Unassigned"
                                }
                              </strong>

                              <span
                                style={
                                  muted
                                }
                              >
                                {
                                  formatDateTime(
                                    item.created_at
                                  )
                                }
                              </span>

                              {item.notes && (
                                <span
                                  style={
                                    muted
                                  }
                                >
                                  {
                                    item.notes
                                  }
                                </span>
                              )}

                            </div>

                          )
                        )

                      )
                    }

                  </div>

                </div>

              </>

            )}

          </section>

        </div>

      </div>

    </div>

  );

}


/* =========================================================
   HELPERS
========================================================= */

function toDatetimeLocal(
  value:
    string |
    null |
    undefined
) {

  if (
    !value
  ) {

    return "";

  }


  const date =
    new Date(
      value
    );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return "";

  }


  const offset =
    date.getTimezoneOffset();


  const local =
    new Date(
      date.getTime() -
      offset * 60 * 1000
    );


  return local
    .toISOString()
    .slice(
      0,
      16
    );

}


function formatDateTime(
  value:
    string
) {

  return new Date(
    value
  ).toLocaleString(
    "en-IN"
  );

}


/* =========================================================
   COMPONENTS
========================================================= */

function InfoBox({
  icon,
  label,
  value,
  danger = false
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;

  danger?:
    boolean;
}) {

  return (

    <div
      style={{
        ...infoBox,

        borderColor:
          danger
            ? "#fecaca"
            : "#e2e8f0",

        background:
          danger
            ? "#fef2f2"
            : "#f8fafc"
      }}
    >

      <div
        style={
          iconBox
        }
      >
        {icon}
      </div>


      <div>

        <small
          style={
            muted
          }
        >
          {label}
        </small>

        <strong
          style={{
            display:
              "block",

            marginTop:
              3
          }}
        >
          {value}
        </strong>

      </div>

    </div>

  );

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


const top:
  React.CSSProperties = {

    marginBottom:
      18

  };


const eyebrow:
  React.CSSProperties = {

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


const layout:
  React.CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "360px minmax(0,1fr)",

    gap:
      16,

    alignItems:
      "start"

  };


const listCard:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    padding:
      14,

    maxHeight:
      "calc(100vh - 180px)",

    overflowY:
      "auto"

  };


const detailCard:
  React.CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    padding:
      20

  };


const listItem:
  React.CSSProperties = {

    width:
      "100%",

    textAlign:
      "left",

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      12,

    padding:
      13,

    marginTop:
      10,

    cursor:
      "pointer"

  };


const listHeader:
  React.CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    gap:
      8,

    marginBottom:
      5

  };


const muted:
  React.CSSProperties = {

    color:
      "#64748b",

    fontSize:
      11

  };


const badge = (
  value:
    string
): React.CSSProperties => ({

  display:
    "inline-flex",

  padding:
    "4px 8px",

  borderRadius:
    999,

  fontSize:
    9,

  fontWeight:
    800,

  background:
    value === "urgent"
      ? "#fef2f2"
      : value === "high"
        ? "#fff7ed"
        : "#f1f5f9",

  color:
    value === "urgent"
      ? "#b91c1c"
      : value === "high"
        ? "#c2410c"
        : "#475569"

});


const statusBadge = (
  value:
    string
): React.CSSProperties => ({

  display:
    "inline-flex",

  padding:
    "4px 8px",

  borderRadius:
    999,

  fontSize:
    9,

  fontWeight:
    800,

  textTransform:
    "uppercase",

  background:
    value === "resolved" ||
    value === "closed"
      ? "#ecfdf5"
      : value === "rejected"
        ? "#fef2f2"
        : "#fff7ed",

  color:
    value === "resolved" ||
    value === "closed"
      ? "#047857"
      : value === "rejected"
        ? "#b91c1c"
        : "#b45309"

});


const empty:
  React.CSSProperties = {

    padding:
      30,

    textAlign:
      "center",

    color:
      "#94a3b8"

  };


const emptyDetail:
  React.CSSProperties = {

    minHeight:
      450,

    display:
      "grid",

    placeItems:
      "center",

    alignContent:
      "center",

    gap:
      8,

    color:
      "#94a3b8",

    textAlign:
      "center"

  };


const detailHeader:
  React.CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    gap:
      15,

    marginBottom:
      16

  };


const description:
  React.CSSProperties = {

    background:
      "#f8fafc",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      12,

    padding:
      14,

    lineHeight:
      1.6,

    marginBottom:
      16

  };


const formGrid:
  React.CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      12

  };


const label:
  React.CSSProperties = {

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

    marginBottom:
      12

  };


const input:
  React.CSSProperties = {

    width:
      "100%",

    height:
      40,

    boxSizing:
      "border-box",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    padding:
      "0 11px",

    background:
      "white",

    outline:
      "none"

  };


const textarea:
  React.CSSProperties = {

    width:
      "100%",

    boxSizing:
      "border-box",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    padding:
      11,

    background:
      "white",

    resize:
      "vertical",

    outline:
      "none"

  };


const saveButton:
  React.CSSProperties = {

    height:
      42,

    border:
      0,

    borderRadius:
      9,

    padding:
      "0 15px",

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
      700,

    marginBottom:
      18

  };


const infoGrid:
  React.CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(3,minmax(0,1fr))",

    gap:
      10,

    marginBottom:
      20

  };


const infoBox:
  React.CSSProperties = {

    border:
      "1px solid #e2e8f0",

    borderRadius:
      11,

    padding:
      11,

    display:
      "flex",

    alignItems:
      "center",

    gap:
      9

  };


const iconBox:
  React.CSSProperties = {

    width:
      32,

    height:
      32,

    borderRadius:
      8,

    background:
      "#eff6ff",

    color:
      "#2563eb",

    display:
      "grid",

    placeItems:
      "center",

    flexShrink:
      0

  };


const historyGrid:
  React.CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      15,

    borderTop:
      "1px solid #e2e8f0",

    paddingTop:
      18

  };


const historyItem:
  React.CSSProperties = {

    border:
      "1px solid #e2e8f0",

    borderRadius:
      10,

    padding:
      11,

    display:
      "grid",

    gap:
      4,

    marginBottom:
      8

  };


const errorBox:
  React.CSSProperties = {

    background:
      "#fef2f2",

    color:
      "#b91c1c",

    border:
      "1px solid #fecaca",

    borderRadius:
      10,

    padding:
      11,

    marginBottom:
      12

  };


const successBox:
  React.CSSProperties = {

    background:
      "#ecfdf5",

    color:
      "#047857",

    border:
      "1px solid #a7f3d0",

    borderRadius:
      10,

    padding:
      11,

    marginBottom:
      12

  };