import AdminResourcePage from "../../components/admin/AdminResourcePage";
import { getResidents } from "../../api/society.api";

interface Resident { id: number; first_name: string; last_name?: string | null; email?: string | null; mobile?: string | null; status: string; flat_number?: string | null; building_name?: string | null; }

export default function AdminResidents() {
  return <AdminResourcePage<Resident>
    eyebrow="Community"
    title="Residents"
    description="Manage registered AS CROWN residents, contact details and home assignments."
    addLabel="Add Resident"
    emptyLabel="No residents found."
    load={async (search) => (await getResidents({ search: search || undefined, limit: 100 })).data?.residents ?? []}
    columns={[
      { key: "name", label: "Resident", render: (row) => <strong>{row.first_name} {row.last_name ?? ""}</strong> },
      { key: "contact", label: "Contact", render: (row) => <>{row.email || "—"}<br /><span style={{ color: "#94a3b8" }}>{row.mobile || "—"}</span></> },
      { key: "flat", label: "Home", render: (row) => row.flat_number ? `${row.building_name ?? ""} • ${row.flat_number}` : "Unassigned" },
      { key: "status", label: "Status", render: (row) => <span style={{ color: row.status === "active" ? "#047857" : "#b91c1c", fontWeight: 700 }}>{row.status}</span> }
    ]}
  />;
}
