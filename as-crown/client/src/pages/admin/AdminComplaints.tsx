import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Search,
  RefreshCw,
  Plus,
  MessageSquareWarning,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  X,
  Save
} from "lucide-react";

import api from "../../api/axios";

interface Complaint {
  id: number;
  complaint_number: string;
  user_id: number;
  flat_id: number | null;

  title: string;
  description: string;

  category:
    | "maintenance"
    | "electricity"
    | "water"
    | "security"
    | "cleaning"
    | "parking"
    | "noise"
    | "staff"
    | "other";

  priority:
    | "low"
    | "medium"
    | "high"
    | "urgent";

  status:
    | "open"
    | "in_progress"
    | "resolved"
    | "closed"
    | "rejected";

  assigned_to: number | null;

  user_first_name?: string;
  user_last_name?: string;

  flat_number?: string;

  building_name?: string;
  building_code?: string;

  staff_first_name?: string;
  staff_last_name?: string;

  created_at: string;
}

interface ComplaintStats {
  total_complaints: number;
  open_complaints: number;
  in_progress_complaints: number;
  resolved_complaints: number;
  closed_complaints: number;
  urgent_complaints: number;
}

const categories = [
  "maintenance",
  "electricity",
  "water",
  "security",
  "cleaning",
  "parking",
  "noise",
  "staff",
  "other"
];

const priorities = [
  "low",
  "medium",
  "high",
  "urgent"
];

const statuses = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "rejected"
];

export default function AdminComplaints() {
  const [
    complaints,
    setComplaints
  ] = useState<Complaint[]>([]);

  const [
    stats,
    setStats
  ] = useState<ComplaintStats>({
    total_complaints: 0,
    open_complaints: 0,
    in_progress_complaints: 0,
    resolved_complaints: 0,
    closed_complaints: 0,
    urgent_complaints: 0
  });

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  const [
    search,
    setSearch
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter
  ] = useState("");

  const [
    priorityFilter,
    setPriorityFilter
  ] = useState("");

  const [
    showCreate,
    setShowCreate
  ] = useState(false);

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    form,
    setForm
  ] = useState({
    userId: "",
    flatId: "",
    title: "",
    description: "",
    category: "other",
    priority: "medium"
  });

  const loadComplaints =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            complaintsResponse,
            statsResponse
          ] = await Promise.all([
            api.get(
              "/complaints",
              {
                params: {
                  search:
                    search || undefined,
                  status:
                    statusFilter || undefined,
                  priority:
                    priorityFilter || undefined
                }
              }
            ),
            api.get(
              "/complaints/stats"
            )
          ]);

          setComplaints(
            complaintsResponse.data?.data
              ?.complaints || []
          );

          setStats(
            statsResponse.data?.data
              ?.stats || {
                total_complaints: 0,
                open_complaints: 0,
                in_progress_complaints: 0,
                resolved_complaints: 0,
                closed_complaints: 0,
                urgent_complaints: 0
              }
          );
        } catch (
          requestError: unknown
        ) {
          console.error(
            "Complaints loading error:",
            requestError
          );

          setError(
            "Unable to load complaints."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        search,
        statusFilter,
        priorityFilter
      ]
    );

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints]);

  async function createComplaint(
    event: React.FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      await api.post(
        "/complaints",
        {
          userId:
            Number(form.userId),
          flatId:
            form.flatId
              ? Number(form.flatId)
              : undefined,
          title:
            form.title.trim(),
          description:
            form.description.trim(),
          category:
            form.category,
          priority:
            form.priority
        }
      );

      setForm({
        userId: "",
        flatId: "",
        title: "",
        description: "",
        category: "other",
        priority: "medium"
      });

      setShowCreate(false);

      await loadComplaints();
    } catch (
      requestError: unknown
    ) {
      console.error(
        "Create complaint error:",
        requestError
      );

      setError(
        "Unable to create complaint."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateComplaint(
    id: number,
    update: {
      status?: string;
      priority?: string;
    }
  ) {
    try {
      await api.put(
        `/complaints/${id}`,
        update
      );

      await loadComplaints();
    } catch (
      requestError: unknown
    ) {
      console.error(
        "Complaint update error:",
        requestError
      );

      setError(
        "Unable to update complaint."
      );
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px"
      }}
    >
      <div
        style={{
          maxWidth: "1450px",
          margin: "0 auto"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "24px"
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#2563eb",
                fontSize: "11px",
                fontWeight: 800,
                letterSpacing: "1.5px"
              }}
            >
              COMMUNITY OPERATIONS
            </p>

            <h1
              style={{
                margin:
                  "5px 0",
                color:
                  "#0f172a"
              }}
            >
              Complaints
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b"
              }}
            >
              Track, assign and resolve
              society complaints.
            </p>
          </div>

          <button
            onClick={() =>
              setShowCreate(true)
            }
            style={{
              border: 0,
              background: "#2563eb",
              color: "white",
              borderRadius: "10px",
              padding:
                "11px 16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              fontWeight: 700
            }}
          >
            <Plus size={17} />
            New Complaint
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(200px,1fr))",
            gap: "16px",
            marginBottom: "18px"
          }}
        >
          <Stat
            title="Total"
            value={
              stats.total_complaints
            }
            icon={
              <MessageSquareWarning
                size={20}
              />
            }
          />

          <Stat
            title="Open"
            value={
              stats.open_complaints
            }
            icon={
              <Clock3 size={20} />
            }
          />

          <Stat
            title="In Progress"
            value={
              stats.in_progress_complaints
            }
            icon={
              <RefreshCw
                size={20}
              />
            }
          />

          <Stat
            title="Urgent"
            value={
              stats.urgent_complaints
            }
            icon={
              <AlertTriangle
                size={20}
              />
            }
          />

          <Stat
            title="Resolved"
            value={
              stats.resolved_complaints
            }
            icon={
              <CheckCircle2
                size={20}
              />
            }
          />
        </div>

        <div
          style={{
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: "15px",
            padding: "15px",
            marginBottom: "18px"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "2fr 1fr 1fr auto",
              gap: "10px"
            }}
          >
            <div
              style={{
                position: "relative"
              }}
            >
              <Search
                size={17}
                style={{
                  position:
                    "absolute",
                  left: "13px",
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color:
                    "#94a3b8"
                }}
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder=
                  "Search complaint, title, resident or flat"
                style={{
                  width: "100%",
                  height: "44px",
                  boxSizing:
                    "border-box",
                  padding:
                    "0 12px 0 40px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
                  outline: "none"
                }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              style={selectStyle}
            >
              <option value="">
                All status
              </option>

              {statuses.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item.replace(
                      "_",
                      " "
                    )}
                  </option>
                )
              )}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) =>
                setPriorityFilter(
                  event.target.value
                )
              }
              style={selectStyle}
            >
              <option value="">
                All priority
              </option>

              {priorities.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <button
              onClick={() =>
                void loadComplaints()
              }
              style={{
                border:
                  "1px solid #e2e8f0",
                background:
                  "white",
                borderRadius:
                  "10px",
                padding:
                  "0 14px",
                cursor:
                  "pointer"
              }}
            >
              <RefreshCw
                size={17}
              />
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background:
                "#fef2f2",
              border:
                "1px solid #fecaca",
              color:
                "#b91c1c",
              padding:
                "12px 15px",
              borderRadius:
                "10px",
              marginBottom:
                "15px"
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            background: "white",
            border:
              "1px solid #e2e8f0",
            borderRadius: "16px",
            overflow: "hidden"
          }}
        >
          <div
            style={{
              overflowX: "auto"
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse"
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "#f8fafc"
                  }}
                >
                  <th style={th}>
                    Complaint
                  </th>

                  <th style={th}>
                    Resident
                  </th>

                  <th style={th}>
                    Location
                  </th>

                  <th style={th}>
                    Category
                  </th>

                  <th style={th}>
                    Priority
                  </th>

                  <th style={th}>
                    Status
                  </th>

                  <th style={th}>
                    Created
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding:
                          "60px",
                        textAlign:
                          "center",
                        color:
                          "#64748b"
                      }}
                    >
                      Loading complaints...
                    </td>
                  </tr>
                ) : complaints.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding:
                          "60px",
                        textAlign:
                          "center",
                        color:
                          "#64748b"
                      }}
                    >
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  complaints.map(
                    (complaint) => (
                      <tr
                        key={
                          complaint.id
                        }
                        style={{
                          borderTop:
                            "1px solid #f1f5f9"
                        }}
                      >
                        <td
                          style={
                            cell
                          }
                        >
                          <strong
                            style={{
                              color:
                                "#0f172a"
                            }}
                          >
                            {
                              complaint.title
                            }
                          </strong>

                          <div
                            style={{
                              fontSize:
                                "11px",
                              color:
                                "#94a3b8",
                              marginTop:
                                "4px"
                            }}
                          >
                            {
                              complaint
                                .complaint_number
                            }
                          </div>
                        </td>

                        <td
                          style={
                            cell
                          }
                        >
                          {complaint.user_first_name}{" "}
                          {complaint.user_last_name ||
                            ""}
                        </td>

                        <td
                          style={
                            cell
                          }
                        >
                          {complaint.flat_number ||
                            "—"}

                          {complaint.building_name && (
                            <div
                              style={{
                                fontSize:
                                  "11px",
                                color:
                                  "#94a3b8",
                                marginTop:
                                  "3px"
                              }}
                            >
                              {
                                complaint.building_name
                              }
                            </div>
                          )}
                        </td>

                        <td
                          style={
                            cell
                          }
                        >
                          {complaint.category}
                        </td>

                        <td
                          style={
                            cell
                          }
                        >
                          <span
                            style={{
                              ...badge,
                              background:
                                complaint.priority ===
                                "urgent"
                                  ? "#fef2f2"
                                  : complaint.priority ===
                                    "high"
                                    ? "#fff7ed"
                                    : "#f8fafc",
                              color:
                                complaint.priority ===
                                "urgent"
                                  ? "#b91c1c"
                                  : complaint.priority ===
                                    "high"
                                    ? "#c2410c"
                                    : "#475569"
                            }}
                          >
                            {complaint.priority}
                          </span>
                        </td>

                        <td
                          style={
                            cell
                          }
                        >
                          <select
                            value={
                              complaint.status
                            }
                            onChange={(event) =>
                              void updateComplaint(
                                complaint.id,
                                {
                                  status:
                                    event.target
                                      .value
                                }
                              )
                            }
                            style={{
                              ...selectStyle,
                              height:
                                "34px"
                            }}
                          >
                            {statuses.map(
                              (item) => (
                                <option
                                  key={
                                    item
                                  }
                                  value={
                                    item
                                  }
                                >
                                  {item.replace(
                                    "_",
                                    " "
                                  )}
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td
                          style={
                            cell
                          }
                        >
                          {new Date(
                            complaint.created_at
                          ).toLocaleDateString(
                            "en-IN"
                          )}
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreate && (
       <div
  style={{
    position: "fixed",
    inset: 0,
    zIndex: 3000,
    background:
      "rgba(15,23,42,.60)",
    overflowY: "auto",
    padding: "30px 20px"
  }}
>
          <form
            onSubmit={
              createComplaint
            }
            style={{
              width:
                "100%",
              maxWidth:
                "650px",
                maxHeight:
      "calc(100vh - 60px)",
    overflowY: "auto",
              background:
                "white",
              borderRadius:
                "18px",
              padding:
                "25px",
                boxSizing: "border-box",
    margin:
      "0 auto 30px"
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "20px"
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0
                  }}
                >
                  New Complaint
                </h2>

                <p
                  style={{
                    color:
                      "#64748b",
                    fontSize:
                      "13px"
                  }}
                >
                  Create a complaint manually.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
                style={{
                  border: 0,
                  background:
                    "#f1f5f9",
                  width: "36px",
                  height: "36px",
                  borderRadius:
                    "9px",
                  cursor: "pointer"
                }}
              >
                <X size={18} />
              </button>
            </div>

            <Field
              label="Resident User ID"
              value={
                form.userId
              }
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  userId:
                    value
                }))
              }
              type="number"
            />

            <Field
              label="Flat ID"
              value={
                form.flatId
              }
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  flatId:
                    value
                }))
              }
              type="number"
              required={false}
            />

            <Field
              label="Title"
              value={
                form.title
              }
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  title:
                    value
                }))
              }
            />

            <label
              style={{
                display:
                  "block",
                marginBottom:
                  "15px"
              }}
            >
              <span
                style={{
                  display:
                    "block",
                  marginBottom:
                    "6px",
                  fontSize:
                    "13px",
                  fontWeight:
                    600
                }}
              >
                Description
              </span>

              <textarea
                value={
                  form.description
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description:
                      event.target.value
                  }))
                }
                rows={5}
                style={{
                  width:
                    "100%",
                  boxSizing:
                    "border-box",
                  padding:
                    "12px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
                  resize:
                    "vertical"
                }}
              />
            </label>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "1fr 1fr",
                gap:
                  "12px"
              }}
            >
              <label>
                <span
                  style={
                    labelStyle
                  }
                >
                  Category
                </span>

                <select
                  value={
                    form.category
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category:
                        event.target.value
                    }))
                  }
                  style={
                    selectStyle
                  }
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label>
                <span
                  style={
                    labelStyle
                  }
                >
                  Priority
                </span>

                <select
                  value={
                    form.priority
                  }
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority:
                        event.target.value
                    }))
                  }
                  style={
                    selectStyle
                  }
                >
                  {priorities.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </label>
            </div>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                gap:
                  "10px",
                marginTop:
                  "22px"
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
                style={
                  secondaryButton
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  saving
                }
                style={
                  primaryButton
                }
              >
                <Save size={16} />
                {saving
                  ? "Creating..."
                  : "Create Complaint"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({
  title,
  value,
  icon
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div
      style={{
        background:
          "white",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "15px",
        padding:
          "18px",
        display:
          "flex",
        gap:
          "12px",
        alignItems:
          "center"
      }}
    >
      <div
        style={{
          width:
            "42px",
          height:
            "42px",
          borderRadius:
            "11px",
          background:
            "#eff6ff",
          color:
            "#2563eb",
          display:
            "grid",
          placeItems:
            "center"
        }}
      >
        {icon}
      </div>

      <div>
        <div
          style={{
            fontSize:
              "12px",
            color:
              "#64748b"
          }}
        >
          {title}
        </div>

        <strong
          style={{
            fontSize:
              "22px",
            color:
              "#0f172a"
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = true
}: {
  label: string;
  value: string;
  onChange:
    (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label
      style={{
        display:
          "block",
        marginBottom:
          "15px"
      }}
    >
      <span
        style={
          labelStyle
        }
      >
        {label}
      </span>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        style={{
          width:
            "100%",
          height:
            "43px",
          boxSizing:
            "border-box",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "9px",
          padding:
            "0 12px"
        }}
      />
    </label>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding:
    "13px 16px",
  fontSize: "11px",
  color: "#64748b",
  textTransform:
    "uppercase"
};

const cell: React.CSSProperties = {
  padding:
    "15px 16px",
  fontSize: "13px",
  color: "#475569"
};

const selectStyle:
  React.CSSProperties = {
    width: "100%",
    height: "44px",
    border:
      "1px solid #e2e8f0",
    borderRadius: "10px",
    padding:
      "0 10px",
    background: "white"
  };

const badge:
  React.CSSProperties = {
    display:
      "inline-flex",
    padding:
      "5px 9px",
    borderRadius:
      "999px",
    fontSize:
      "11px",
    fontWeight: 700
  };

const labelStyle:
  React.CSSProperties = {
    display:
      "block",
    marginBottom:
      "6px",
    fontSize:
      "13px",
    fontWeight:
      600
  };

const primaryButton:
  React.CSSProperties = {
    border: 0,
    background:
      "#2563eb",
    color:
      "white",
    borderRadius:
      "9px",
    padding:
      "10px 15px",
    display:
      "flex",
    alignItems:
      "center",
    gap:
      "7px",
    cursor:
      "pointer"
  };

const secondaryButton:
  React.CSSProperties = {
    border:
      "1px solid #e2e8f0",
    background:
      "white",
    borderRadius:
      "9px",
    padding:
      "10px 15px",
    cursor:
      "pointer"
  };