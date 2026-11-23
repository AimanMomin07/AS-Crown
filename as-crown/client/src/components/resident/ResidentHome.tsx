import {
  useEffect,
  useState
} from "react";

import {
  Home,
  Building2,
  CalendarDays,
  UserRound,
  ShieldCheck
} from "lucide-react";

import {
  getResidentHome
} from "../../api/residents.api";

interface HomeData {
  buildingName?: string;
  buildingCode?: string;
  flatNumber?: string;
  floorNumber?: number;
  flatType?: string;
  occupancyStatus?: string;
  ownershipType?: string;
  leaseStartDate?: string | null;
  leaseEndDate?: string | null;
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

export default function ResidentHome() {
  const [
    home,
    setHome
  ] = useState<HomeData | null>(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  async function loadHome() {
    try {
      setLoading(true);
      setError("");

      const response =
        await getResidentHome();

      setHome(
        response?.data?.home ||
        response?.data ||
        null
      );

    } catch (error: unknown) {
      console.error(error);

      setError(getErrorMessage(error, "Unable to load your home details."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHome();
  }, []);

  if (loading) {
    return (
      <div style={center}>
        Loading your home...
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={container}>

        <div style={header}>
          <div>
            <div style={eyebrow}>
              MY HOME
            </div>

            <h1 style={heading}>
              My Home
            </h1>

            <p style={subtitle}>
              Your current AS CROWN occupancy information.
            </p>
          </div>
        </div>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        {!home ? (
          <div style={emptyCard}>
            <Home size={34} />
            <h3>
              No flat assigned yet
            </h3>
            <p>
              Your administrator has not assigned you a flat.
            </p>
          </div>
        ) : (
          <>
            <div style={heroCard}>
              <Building2 size={34} />

              <div>
                <div style={heroSmall}>
                  BUILDING
                </div>

                <h2 style={heroTitle}>
                  {home.buildingName ||
                    home.buildingCode ||
                    "AS CROWN"}
                </h2>

                <div style={heroFlat}>
                  {home.flatNumber}
                </div>
              </div>
            </div>

            <div style={grid}>

              <InfoCard
                icon={<Home size={20} />}
                label="Flat"
                value={home.flatNumber || "—"}
              />

              <InfoCard
                icon={<Building2 size={20} />}
                label="Type"
                value={home.flatType || "—"}
              />

              <InfoCard
                icon={<Building2 size={20} />}
                label="Floor"
                value={
                  home.floorNumber !== undefined
                    ? String(home.floorNumber)
                    : "—"
                }
              />

              <InfoCard
                icon={<UserRound size={20} />}
                label="Occupancy"
                value={home.occupancyStatus || "—"}
              />

              <InfoCard
                icon={<ShieldCheck size={20} />}
                label="Ownership"
                value={home.ownershipType || "—"}
              />

              <InfoCard
                icon={<CalendarDays size={20} />}
                label="Lease Start"
                value={
                  home.leaseStartDate
                    ? new Date(
                        home.leaseStartDate
                      ).toLocaleDateString("en-IN")
                    : "Not applicable"
                }
              />

              <InfoCard
                icon={<CalendarDays size={20} />}
                label="Lease End"
                value={
                  home.leaseEndDate
                    ? new Date(
                        home.leaseEndDate
                      ).toLocaleDateString("en-IN")
                    : "Not applicable"
                }
              />

            </div>

            {home.leaseEndDate && (
              <div style={leaseCard}>
                <CalendarDays size={20} />

                <div>
                  <strong>
                    Lease Information
                  </strong>

                  <div style={small}>
                    Your current lease ends on{" "}
                    {new Date(
                      home.leaseEndDate
                    ).toLocaleDateString("en-IN")}.
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div style={infoCard}>
      <div style={iconBox}>
        {icon}
      </div>

      <div>
        <div style={labelStyle}>
          {label}
        </div>

        <strong>
          {value}
        </strong>
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
  maxWidth: 1300,
  margin: "0 auto"
};

const header: React.CSSProperties = {
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

const heroCard: React.CSSProperties = {
  background: "linear-gradient(135deg,#1d4ed8,#2563eb)",
  color: "white",
  borderRadius: 18,
  padding: 26,
  display: "flex",
  gap: 16,
  alignItems: "flex-start",
  marginBottom: 16
};

const heroSmall: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.4,
  opacity: 0.8
};

const heroTitle: React.CSSProperties = {
  margin: "4px 0"
};

const heroFlat: React.CSSProperties = {
  fontSize: 38,
  fontWeight: 900,
  marginTop: 18
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3,minmax(0,1fr))",
  gap: 14
};

const infoCard: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 17,
  display: "flex",
  alignItems: "center",
  gap: 12
};

const iconBox: React.CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 10,
  display: "grid",
  placeItems: "center",
  background: "#eff6ff",
  color: "#2563eb"
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: "#94a3b8",
  marginBottom: 4,
  fontWeight: 700
};

const leaseCard: React.CSSProperties = {
  marginTop: 16,
  background: "#eff6ff",
  color: "#1e3a8a",
  borderRadius: 14,
  padding: 17,
  display: "flex",
  gap: 10,
  alignItems: "flex-start"
};

const small: React.CSSProperties = {
  marginTop: 4,
  fontSize: 12,
  color: "#64748b"
};

const errorBox: React.CSSProperties = {
  padding: 13,
  marginBottom: 15,
  background: "#fef2f2",
  color: "#b91c1c",
  borderRadius: 10
};

const emptyCard: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  minHeight: 260,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
  color: "#94a3b8"
};

const center: React.CSSProperties = {
  minHeight: "70vh",
  display: "grid",
  placeItems: "center",
  color: "#64748b"
};