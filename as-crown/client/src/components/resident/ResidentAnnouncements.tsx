import {
  useEffect,
  useState
} from "react";

import {
  Megaphone,
  CalendarDays
} from "lucide-react";

import {
  getResidentAnnouncements
} from "../../api/residents.api";

interface Announcement {
  id: number;
  title: string;
  message: string;
  createdAt: string;
}

export default function ResidentAnnouncements() {
  const [
    announcements,
    setAnnouncements
  ] = useState<Announcement[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  async function load() {
    try {
      const response =
        await getResidentAnnouncements();

      setAnnouncements(
        response?.data?.announcements ||
        []
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div style={page}>
      <div style={container}>

        <div style={eyebrow}>
          SOCIETY
        </div>

        <h1 style={heading}>
          Announcements
        </h1>

        <p style={subtitle}>
          Important updates from AS CROWN administration.
        </p>

        {loading ? (
          <div style={empty}>
            Loading...
          </div>
        ) : announcements.length === 0 ? (
          <div style={empty}>
            No announcements available.
          </div>
        ) : (
          announcements.map(item => (
            <article
              key={item.id}
              style={card}
            >
              <div style={icon}>
                <Megaphone size={20} />
              </div>

              <div>
                <h2>
                  {item.title}
                </h2>

                <div style={date}>
                  <CalendarDays size={14} />
                  {new Date(
                    item.createdAt
                  ).toLocaleDateString(
                    "en-IN"
                  )}
                </div>

                <p style={message}>
                  {item.message}
                </p>
              </div>
            </article>
          ))
        )}

      </div>
    </div>
  );
}

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  padding: 28
};

const container: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto"
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
  color: "#64748b",
  marginBottom: 20
};

const card: React.CSSProperties = {
  display: "flex",
  gap: 15,
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 15,
  padding: 18,
  marginBottom: 12
};

const icon: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 10,
  background: "#eff6ff",
  color: "#2563eb",
  display: "grid",
  placeItems: "center",
  flexShrink: 0
};

const date: React.CSSProperties = {
  display: "flex",
  gap: 5,
  alignItems: "center",
  color: "#94a3b8",
  fontSize: 11
};

const message: React.CSSProperties = {
  color: "#475569",
  lineHeight: 1.6
};

const empty: React.CSSProperties = {
  minHeight: 220,
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 15,
  display: "grid",
  placeItems: "center",
  color: "#94a3b8"
};