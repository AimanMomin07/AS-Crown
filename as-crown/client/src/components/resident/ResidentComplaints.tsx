import {
  useCallback,
  useEffect,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  Plus,
  Search,
  X,
  Eye,
  AlertCircle
} from "lucide-react";

import {
  createResidentComplaint,
  getResidentComplaint,
  getResidentComplaints,
  acknowledgeResidentComplaint
} from "../../api/residents.api";

type Category =
  | "maintenance"
  | "electricity"
  | "water"
  | "security"
  | "cleaning"
  | "parking"
  | "noise"
  | "staff"
  | "other";

type Priority =
  | "low"
  | "medium"
  | "high"
  | "urgent";

interface Complaint {
  id: number;
  complaint_number: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  status: string;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
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

export default function ResidentComplaints() {

  const [
    complaints,
    setComplaints
  ] = useState<Complaint[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    showCreate,
    setShowCreate
  ] = useState(false);

  const [
    selected,
    setSelected
  ] = useState<Complaint | null>(null);

  const [
    search,
    setSearch
  ] = useState("");

  const [
    status,
    setStatus
  ] = useState("");

  const [
    priority,
    setPriority
  ] = useState("");

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    error,
    setError
  ] = useState("");

  const [
    form,
    setForm
  ] = useState({
    title: "",
    description: "",
    category: "maintenance" as Category,
    priority: "medium" as Priority
  });

  const load = useCallback(async function load() {
    try {
      setLoading(true);

      const response =
        await getResidentComplaints({
          search:
            search.trim() ||
            undefined,

          status:
            status ||
            undefined,

          priority:
            priority ||
            undefined
        });

      setComplaints(
        response?.data?.complaints ||
        []
      );
    } catch (error: unknown) {
      console.error(error);
      setError(getErrorMessage(error, "Unable to load complaints."));
    } finally {
      setLoading(false);
    }
  }, [priority, search, status]);

  useEffect(() => {
    void load();
  }, [
    search,
    status,
    load
  ]);

  async function handleCreate(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      await createResidentComplaint(
        form
      );

      setShowCreate(false);

      setForm({
        title: "",
        description: "",
        category:
          "maintenance",
        priority:
          "medium"
      });

      await load();

    } catch (error: unknown) {
      console.error(error);
      setError(getErrorMessage(error, "Unable to create complaint."));
    } finally {
      setSaving(false);
    }
  }

  async function openComplaint(
    id: number
  ) {
    try {
      const response =
        await getResidentComplaint(
          id
        );

      setSelected(
        response?.data?.complaint ||
        null
      );
    } catch (error: unknown) {
      console.error(error);
      setError(getErrorMessage(error, "Unable to load complaint."));
    }
  }

  async function acknowledgeResolution(
  id: number
) {

  try {

    setSaving(
      true
    );

    setError("");


    await acknowledgeResidentComplaint(
      id
    );


    setSelected(
      current =>
        current
          ? {
              ...current,

              status:
                "closed",

              acknowledged_at:
                new Date().toISOString()
            }
          : current
    );


    await load();

  } catch (
    requestError: unknown
  ) {

    console.error(
      "Acknowledge resolution error:",
      requestError
    );


    setError(
      getErrorMessage(
        requestError,
        "Unable to acknowledge resolution."
      )
    );

  } finally {

    setSaving(
      false
    );

  }

}

  return (
    <div style={page}>
      <div style={container}>

        <div style={header}>
          <div>
            <div style={eyebrow}>
              SUPPORT
            </div>

            <h1 style={heading}>
              My Complaints
            </h1>

            <p style={subtitle}>
              Raise issues and track their resolution.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowCreate(true)
            }
            style={button}
          >
            <Plus size={17} />
            New Complaint
          </button>
        </div>

        {error && (
          <div style={errorBox}>
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <div style={filters}>

          <div style={searchWrap}>
            <Search size={17} />

            <input
              value={search}
              onChange={event =>
                setSearch(
                  event.target.value
                )
              }
              placeholder=
                "Search complaint..."
              style={searchInput}
            />
          </div>

          <select
            value={status}
            onChange={event =>
              setStatus(
                event.target.value
              )
            }
            style={select}
          >
            <option value="">
              All statuses
            </option>

            <option value="open">
              Open
            </option>

            <option value="in_progress">
              In Progress
            </option>

            <option value="resolved">
              Resolved
            </option>

            <option value="closed">
              Closed
            </option>

            <option value="rejected">
              Rejected
            </option>
          </select>

          <select
            value={priority}
            onChange={event =>
              setPriority(
                event.target.value
              )
            }
            style={select}
          >
            <option value="">
              All priorities
            </option>

            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>

            <option value="urgent">
              Urgent
            </option>
          </select>

        </div>

        {loading ? (
          <div style={empty}>
            Loading complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div style={empty}>
            No complaints found.
          </div>
        ) : (
          complaints.map(
            complaint => (
              <div
                key={complaint.id}
                style={card}
              >

                <div style={cardTop}>
                  <div>
                    <div style={smallLabel}>
                      {
                        complaint.complaint_number
                      }
                    </div>

                    <h2 style={complaintTitle}>
                      {complaint.title}
                    </h2>
                  </div>

                  <span
                    style={statusBadge(
                      complaint.status
                    )}
                  >
                    {
                      complaint.status
                    }
                  </span>
                </div>

                <p style={descriptionText}>
                  {
                    complaint.description
                  }
                </p>

                <div style={meta}>
                  <span>
                    Category:{" "}
                    {complaint.category}
                  </span>

                  <span>
                    Priority:{" "}
                    {complaint.priority}
                  </span>

                  <span>
                    Created:{" "}
                    {
                      new Date(
                        complaint.created_at
                      ).toLocaleDateString(
                        "en-IN"
                      )
                    }
                  </span>
                </div>

                {complaint.resolution_notes && (
                  <div style={resolution}>
                    <strong>
                      Admin update
                    </strong>

                    <div>
                      {
                        complaint.resolution_notes
                      }
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() =>
                    void openComplaint(
                      complaint.id
                    )
                  }
                  style={viewButton}
                >
                  <Eye size={15} />
                  View Details
                </button>

              </div>
            )
          )
        )}
      </div>

      {showCreate && (
        <div style={overlay}>
          <form
            onSubmit={handleCreate}
            style={modal}
          >

            <div style={modalHeader}>
              <div>
                <div style={eyebrow}>
                  SUPPORT REQUEST
                </div>

                <h2>
                  New Complaint
                </h2>

                <p style={small}>
                  Describe the issue clearly so the society team can act quickly.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                style={close}
              >
                <X size={18} />
              </button>
            </div>

            <Field
              label="Title"
              value={
                form.title
              }
              onChange={value =>
                setForm(current => ({
                  ...current,
                  title:
                    value
                }))
              }
              required
            />

            <label style={label}>
              Category

              <select
                value={
                  form.category
                }
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    category:
                      event.target
                        .value as Category
                  }))
                }
                style={input}
              >
                <option value="maintenance">
                  Maintenance
                </option>

                <option value="electricity">
                  Electricity
                </option>

                <option value="water">
                  Water
                </option>

                <option value="security">
                  Security
                </option>

                <option value="cleaning">
                  Cleaning
                </option>

                <option value="parking">
                  Parking
                </option>

                <option value="noise">
                  Noise
                </option>

                <option value="staff">
                  Staff
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </label>

            <label style={label}>
              Priority

              <select
                value={
                  form.priority
                }
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    priority:
                      event.target
                        .value as Priority
                  }))
                }
                style={input}
              >
                <option value="low">
                  Low
                </option>

                <option value="medium">
                  Medium
                </option>

                <option value="high">
                  High
                </option>

                <option value="urgent">
                  Urgent
                </option>
              </select>
            </label>

            <label style={label}>
              Description

              <textarea
                rows={7}
                value={
                  form.description
                }
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    description:
                      event.target.value
                  }))
                }
                style={textarea}
                required
              />
            </label>

            <div style={footer}>
              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                style={secondary}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                style={button}
              >
                {saving
                  ? "Submitting..."
                  : "Submit Complaint"}
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div style={overlay}>
          <div style={modal}>
            <div style={modalHeader}>
              <div>
                <div style={eyebrow}>
                  COMPLAINT DETAILS
                </div>

                <h2>
                  {
                    selected.title
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelected(null)
                }
                style={close}
              >
                <X size={18} />
              </button>
            </div>

            <div style={detailBox}>
              <strong>
                Status
              </strong>

              <div>
                {
                  selected.status
                }
              </div>
            </div>

            <div style={detailBox}>
              <strong>
                Category
              </strong>

              <div>
                {
                  selected.category
                }
              </div>
            </div>

            <div style={detailBox}>
              <strong>
                Priority
              </strong>

              <div>
                {
                  selected.priority
                }
              </div>
            </div>

            <div style={detailBox}>
              <strong>
                Description
              </strong>

              <div>
                {
                  selected.description
                }
              </div>
            </div>

            {selected.resolution_notes && (
              <div style={resolution}>
                <strong>
                  Resolution
                </strong>

                <div>
                  {
                    selected.resolution_notes
                  }
                </div>
              </div>
            )}

            {selected.status === "resolved" && (
  <button
    type="button"

    onClick={() =>
      void acknowledgeResolution(
        selected.id
      )
    }

    disabled={
      saving
    }

    style={
      button
    }
  >
    {
      saving
        ? "Acknowledging..."
        : "Acknowledge Resolution"
    }
  </button>
)}

          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {

  return (
    <div
      style={{
        marginBottom: 14
      }}
    >

      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 700,
          color: "#334155"
        }}
      >

        {label}

        <input
          value={value}
          onChange={
            event =>
              onChange(
                event.target.value
              )
          }
          required={required}
          style={input}
        />

      </label>

    </div>
  );
}

function statusBadge(
  status: string
): React.CSSProperties {
  return {
    padding: "5px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    background:
      status === "resolved" ||
      status === "closed"
        ? "#ecfdf5"
        : status === "rejected"
          ? "#fef2f2"
          : "#fff7ed",
    color:
      status === "resolved" ||
      status === "closed"
        ? "#047857"
        : status === "rejected"
          ? "#b91c1c"
          : "#b45309"
  };
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 28
};

const container: React.CSSProperties = {
  maxWidth: 1250,
  margin: "0 auto"
};

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 15,
  flexWrap: "wrap",
  marginBottom: 20
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 1.5,
  color: "#2563eb"
};

const heading: React.CSSProperties = {
  margin: "5px 0",
  fontSize: 30
};

const subtitle: React.CSSProperties = {
  margin: 0,
  color: "#64748b"
};

const filters: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 13,
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
  marginBottom: 15
};

const searchWrap: React.CSSProperties = {
  flex: 1,
  minWidth: 240,
  display: "flex",
  alignItems: "center",
  gap: 8,
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: "0 12px"
};

const searchInput: React.CSSProperties = {
  border: 0,
  outline: "none",
  height: 40,
  width: "100%"
};

const select: React.CSSProperties = {
  height: 40,
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: "0 10px",
  background: "white"
};

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 15,
  padding: 19,
  marginBottom: 12
};

const cardTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start"
};

const complaintTitle: React.CSSProperties = {
  margin: "4px 0"
};

const smallLabel: React.CSSProperties = {
  color: "#94a3b8",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1
};

const descriptionText: React.CSSProperties = {
  color: "#475569",
  lineHeight: 1.6
};

const meta: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 15,
  fontSize: 12,
  color: "#64748b",
  paddingTop: 12,
  borderTop: "1px solid #f1f5f9"
};

const resolution: React.CSSProperties = {
  marginTop: 14,
  background: "#eff6ff",
  borderRadius: 10,
  padding: 12,
  color: "#1e3a8a"
};

const viewButton: React.CSSProperties = {
  marginTop: 14,
  height: 34,
  padding: "0 11px",
  border: "1px solid #dbeafe",
  borderRadius: 8,
  background: "#eff6ff",
  color: "#2563eb",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  cursor: "pointer",
  fontWeight: 700
};

const button: React.CSSProperties = {
  height: 42,
  padding: "0 15px",
  border: 0,
  borderRadius: 9,
  background: "#2563eb",
  color: "white",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  cursor: "pointer",
  fontWeight: 700
};

const secondary: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  background: "white",
  cursor: "pointer"
};

const errorBox: React.CSSProperties = {
  background: "#fef2f2",
  color: "#b91c1c",
  borderRadius: 10,
  padding: 12,
  marginBottom: 15,
  display: "flex",
  alignItems: "center",
  gap: 7
};

const empty: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  color: "#94a3b8"
};

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 3000,
  background: "rgba(15,23,42,.58)",
  overflowY: "auto",
  padding: 25
};

const modal: React.CSSProperties = {
  width: "100%",
  maxWidth: 700,
  maxHeight:
    "calc(100vh - 50px)",
  overflowY: "auto",
  background: "white",
  borderRadius: 18,
  padding: 25,
  boxSizing: "border-box",
  margin: "0 auto 25px"
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 10,
  marginBottom: 20
};

const close: React.CSSProperties = {
  width: 36,
  height: 36,
  border: 0,
  borderRadius: 9,
  background: "#f1f5f9",
  cursor: "pointer"
};

const label: React.CSSProperties = {
  display: "block",
  marginBottom: 14,
  fontSize: 13,
  fontWeight: 700
};

const input: React.CSSProperties = {
  width: "100%",
  height: 44,
  marginTop: 6,
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: "0 12px",
  boxSizing: "border-box"
};

const textarea: React.CSSProperties = {
  width: "100%",
  minHeight: 150,
  marginTop: 6,
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: 12,
  boxSizing: "border-box",
  resize: "vertical"
};

const footer: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  paddingTop: 16,
  borderTop: "1px solid #f1f5f9",
  marginTop: 18
};

const detailBox: React.CSSProperties = {
  background: "#f8fafc",
  borderRadius: 10,
  padding: 13,
  marginBottom: 10
};

const small: React.CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.5
};