import {
  useEffect,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  Plus,
  UsersRound,
  Trash2,
  X
} from "lucide-react";

import {
  createResidentFamilyMember,
  getResidentFamily,
  removeResidentFamilyMember
} from "../../api/residents.api";

interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  date_of_birth?: string | null;
  gender?: string | null;
  phone?: string | null;
  emergency_contact?: number;
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

export default function ResidentFamily() {

  const [
    members,
    setMembers
  ] = useState<FamilyMember[]>([]);

  const [
    showModal,
    setShowModal
  ] = useState(false);

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
    name: "",
    relationship: "",
    dateOfBirth: "",
    gender: "other",
    phone: "",
    emergencyContact: false
  });

  async function load() {
    try {
      const response =
        await getResidentFamily();

      setMembers(
        response?.data?.members ||
        []
      );
    } catch (error: unknown) {
      console.error(error);

      setError(getErrorMessage(error, "Unable to load family members."));
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    try {
      setSaving(true);

      await createResidentFamilyMember({
        name:
          form.name.trim(),

        relationship:
          form.relationship.trim(),

        dateOfBirth:
          form.dateOfBirth ||
          null,

        gender:
          form.gender as
            | "male"
            | "female"
            | "other",

        phone:
          form.phone.trim() ||
          null,

        emergencyContact:
          form.emergencyContact
            ? 1
            : 0
      });

      setShowModal(false);

      setForm({
        name: "",
        relationship: "",
        dateOfBirth: "",
        gender: "other",
        phone: "",
        emergencyContact: false
      });

      await load();

    } catch (error: unknown) {
      console.error(error);

      setError(getErrorMessage(error, "Unable to add family member."));
    } finally {
      setSaving(false);
    }
  }

  async function remove(
    id: number
  ) {
    if (
      !window.confirm(
        "Remove this family member?"
      )
    ) {
      return;
    }

    try {
      await removeResidentFamilyMember(
        id
      );

      await load();

    } catch (error: unknown) {
      console.error(error);

      setError(getErrorMessage(error, "Unable to remove family member."));
    }
  }

  return (
    <div style={page}>
      <div style={container}>

        <div style={header}>
          <div>
            <div style={eyebrow}>
              FAMILY
            </div>

            <h1 style={heading}>
              Family Members
            </h1>

            <p style={subtitle}>
              Manage family members linked to your home.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowModal(true)
            }
            style={button}
          >
            <Plus size={17} />
            Add Family Member
          </button>
        </div>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        {members.length === 0 ? (
          <div style={empty}>
            <UsersRound size={34} />
            No family members added.
          </div>
        ) : (
          <div style={grid}>
            {members.map(member => (
              <div
                key={member.id}
                style={card}
              >
                <div style={top}>
                  <div style={avatar}>
                    {member.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void remove(
                        member.id
                      )
                    }
                    style={deleteButton}
                  >
                    <Trash2
                      size={16}
                    />
                  </button>
                </div>

                <h3>
                  {member.name}
                </h3>

                <div style={{fontSize: 12, color: "#64748b", marginTop: 4}}>
                  {member.relationship}
                </div>

                <div style={details}>
                  Phone:{" "}
                  {member.phone ||
                    "—"}
                </div>

                <div style={details}>
                  Gender:{" "}
                  {member.gender ||
                    "—"}
                </div>

                {Boolean(
                  member.emergency_contact
                ) && (
                  <div style={emergency}>
                    Emergency Contact
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div style={overlay}>
          <form
            onSubmit={handleSubmit}
            style={modal}
          >
            <div style={modalHeader}>
              <h2>
                Add Family Member
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                style={close}
              >
                <X size={18} />
              </button>
            </div>

            <Field
              label="Name"
              value={form.name}
              onChange={value =>
                setForm(current => ({
                  ...current,
                  name:
                    value
                }))
              }
              required
            />

            <Field
              label="Relationship"
              value={
                form.relationship
              }
              onChange={value =>
                setForm(current => ({
                  ...current,
                  relationship:
                    value
                }))
              }
              required
            />

            <Field
              label="Date of Birth"
              type="date"
              value={
                form.dateOfBirth
              }
              onChange={value =>
                setForm(current => ({
                  ...current,
                  dateOfBirth:
                    value
                }))
              }
            />

            <label style={label}>
              Gender

              <select
                value={
                  form.gender
                }
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    gender:
                      event.target.value
                  }))
                }
                style={input}
              >
                <option value="male">
                  Male
                </option>

                <option value="female">
                  Female
                </option>

                <option value="other">
                  Other
                </option>
              </select>
            </label>

            <Field
              label="Phone"
              value={
                form.phone
              }
              onChange={value =>
                setForm(current => ({
                  ...current,
                  phone:
                    value
                }))
              }
            />

            <label style={checkbox}>
              <input
                type="checkbox"
                checked={
                  form.emergencyContact
                }
                onChange={event =>
                  setForm(current => ({
                    ...current,
                    emergencyContact:
                      event.target.checked
                  }))
                }
              />

              Emergency contact
            </label>

            <div style={footer}>
              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
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
                  ? "Saving..."
                  : "Save Member"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label: fieldLabel,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
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

        {fieldLabel}

        <input
          type={type}
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

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 28
};

const container: React.CSSProperties = {
  maxWidth: 1200,
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

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3,minmax(0,1fr))",
  gap: 14
};

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 15,
  padding: 18
};

const top: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const avatar: React.CSSProperties = {
  width: 45,
  height: 45,
  borderRadius: "50%",
  background: "#eff6ff",
  color: "#2563eb",
  display: "grid",
  placeItems: "center",
  fontWeight: 800,
  fontSize: 18
};

const deleteButton: React.CSSProperties = {
  border: 0,
  background: "#fef2f2",
  color: "#dc2626",
  width: 34,
  height: 34,
  borderRadius: 8,
  cursor: "pointer"
};

const details: React.CSSProperties = {
  marginTop: 8,
  fontSize: 12,
  color: "#64748b"
};

const emergency: React.CSSProperties = {
  marginTop: 12,
  padding: "6px 9px",
  background: "#fff7ed",
  color: "#b45309",
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 700
};

const empty: React.CSSProperties = {
  minHeight: 220,
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  color: "#94a3b8"
};

const errorBox: React.CSSProperties = {
  padding: 12,
  marginBottom: 15,
  borderRadius: 10,
  background: "#fef2f2",
  color: "#b91c1c"
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
  maxWidth: 620,
  margin: "0 auto",
  background: "white",
  borderRadius: 18,
  padding: 25,
  boxSizing: "border-box"
};

const modalHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
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

const checkbox: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  marginBottom: 15,
  fontSize: 13,
  fontWeight: 700
};

const footer: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 18,
  paddingTop: 15,
  borderTop: "1px solid #f1f5f9"
};

const secondary: React.CSSProperties = {
  height: 42,
  padding: "0 14px",
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  background: "white",
  cursor: "pointer"
};