import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Ambulance,
  Building2,
  Flame,
  Phone,
  RefreshCw,
  ShieldAlert,
  Siren
} from "lucide-react";

import {
  getEmergencyContacts
} from "../../api/emergency-contacts.api";

import type {
  EmergencyContact
} from "../../api/emergency-contacts.api";

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


function getIcon(
  category: string
) {

  switch (
    category
      .trim()
      .toLowerCase()
  ) {

    case "police":
      return Siren;

    case "fire":
      return Flame;

    case "ambulance":
      return Ambulance;

    case "security":
      return ShieldAlert;

    case "society office":
      return Building2;

    default:
      return Phone;

  }

}


export default function ResidentEmergencyContacts() {

  const [
    contacts,
    setContacts
  ] =
    useState<EmergencyContact[]>([]);

  const [
    loading,
    setLoading
  ] =
    useState(true);

  const [
    error,
    setError
  ] =
    useState("");


  const load =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await getEmergencyContacts();

          setContacts(
            response
              ?.data
              ?.contacts ||
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
              "Unable to load emergency contacts."
            )
          );

        } finally {

          setLoading(false);

        }

      },
      []
    );


  useEffect(() => {
    const initialLoad = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(initialLoad);
  }, [load]);


  return (
    <div style={page}>

      <div style={container}>

        <header style={header}>

          <div>

            <div style={eyebrow}>
              SAFETY
            </div>

            <h1 style={title}>
              Emergency Contacts
            </h1>

            <p style={subtitle}>
              Important society and emergency numbers.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              void load()
            }
            style={refresh}
          >
            <RefreshCw size={16}/>
            Refresh
          </button>

        </header>


        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}


        {loading ? (

          <div style={empty}>
            <RefreshCw size={26}/>
            Loading emergency contacts...
          </div>

        ) : contacts.length === 0 ? (

          <div style={empty}>
            <ShieldAlert size={32}/>
            <strong>
              No emergency contacts configured.
            </strong>
          </div>

        ) : (

          <div style={grid}>

            {contacts.map(
              contact => {

                const Icon =
                  getIcon(
                    contact.category
                  );

                return (
                  <article
                    key={
                      contact.id
                    }
                    style={card}
                  >

                    <div style={iconWrap}>
                      <Icon size={25}/>
                    </div>

                    <div style={content}>

                      <div style={type}>
                        {
                          contact.category
                        }
                      </div>

                      <h2 style={name}>
                        {
                          contact.name
                        }
                      </h2>

                      <a
                        href={
                          `tel:${contact.phone}`
                        }
                        style={callButton}
                      >
                        <Phone size={16}/>
                        Call {contact.phone}
                      </a>

                    </div>

                  </article>
                );

              }
            )}

          </div>

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

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 15,
  flexWrap: "wrap",
  marginBottom: 20
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: 1.5,
  color: "#dc2626"
};

const title: React.CSSProperties = {
  margin: "5px 0",
  fontSize: 30,
  color: "#0f172a"
};

const subtitle: React.CSSProperties = {
  margin: 0,
  color: "#64748b"
};

const refresh: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  background: "white",
  borderRadius: 9,
  padding: "10px 13px",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  cursor: "pointer",
  fontWeight: 700
};

const errorBox: React.CSSProperties = {
  background: "#fef2f2",
  color: "#b91c1c",
  border: "1px solid #fecaca",
  borderRadius: 10,
  padding: 12,
  marginBottom: 12
};

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2,minmax(0,1fr))",
  gap: 14
};

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 18,
  display: "flex",
  gap: 15
};

const iconWrap: React.CSSProperties = {
  width: 50,
  height: 50,
  borderRadius: 14,
  background: "#fef2f2",
  color: "#dc2626",
  display: "grid",
  placeItems: "center",
  flexShrink: 0
};

const content: React.CSSProperties = {
  minWidth: 0
};

const type: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1,
  color: "#64748b"
};

const name: React.CSSProperties = {
  margin: "4px 0 12px",
  color: "#0f172a",
  fontSize: 20
};

const callButton: React.CSSProperties = {
  textDecoration: "none",
  background: "#dc2626",
  color: "white",
  borderRadius: 9,
  padding: "9px 11px",
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  fontWeight: 800,
  fontSize: 11
};

const empty: React.CSSProperties = {
  minHeight: 280,
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  gap: 8,
  color: "#94a3b8"
};
