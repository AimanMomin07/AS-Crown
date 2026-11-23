import AdminResourcePage from "../../components/admin/AdminResourcePage";
import { getAnnouncements } from "../../api/society.api";

interface Announcement { id: number; title: string; category: string; priority: string; status: string; publish_at?: string | null; created_at: string; }

export default function AdminAnnouncements() {
  return <AdminResourcePage<Announcement>
    eyebrow="Communication"
    title="Announcements"
    description="Publish important AS CROWN notices, events and security communications."
    addLabel="Create Announcement"
    emptyLabel="No announcements found."
    load={async () => (await getAnnouncements()).data?.announcements ?? []}
    columns={[
      { key: "title", label: "Announcement", render: (row) => <strong>{row.title}</strong> },
      { key: "category", label: "Category", render: (row) => row.category },
      { key: "priority", label: "Priority", render: (row) => row.priority },
      { key: "status", label: "Status", render: (row) => row.status },
      { key: "published", label: "Publish", render: (row) => row.publish_at ? new Date(row.publish_at).toLocaleString("en-IN") : "—" }
    ]}
  />;
}
