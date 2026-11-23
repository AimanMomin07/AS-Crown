import {
  useEffect,
  useState
} from "react";

import {
  Receipt,
  CreditCard,
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import {
  getResidentBills
} from "../../api/residents.api";

interface Bill {
  id: number;
  bill_number: string;
  billing_month: string;
  maintenance_amount: number;
  electricity_amount: number;
  water_amount: number;
  parking_amount: number;
  penalty_amount: number;
  other_amount: number;
  total_amount: number;
  due_date: string;
  status: string;
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

export default function ResidentBills() {
  const navigate =
    useNavigate();

  const [
    bills,
    setBills
  ] = useState<Bill[]>([]);

  const [
    loading,
    setLoading
  ] = useState(true);

  const [
    error,
    setError
  ] = useState("");

  async function loadBills() {
    try {
      setLoading(true);

      const response =
        await getResidentBills();

      setBills(
        response?.data?.bills ||
        []
      );
    } catch (error: unknown) {
      console.error(error);

      setError(getErrorMessage(error, "Unable to load bills."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBills();
  }, []);

  if (loading) {
    return (
      <div style={center}>
        Loading maintenance bills...
      </div>
    );
  }

  return (
    <div style={page}>
      <div style={container}>

        <div style={header}>
          <div>
            <div style={eyebrow}>
              MAINTENANCE
            </div>

            <h1 style={heading}>
              My Maintenance Bills
            </h1>

            <p style={subtitle}>
              View your bills, due dates and payment status.
            </p>
          </div>
        </div>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        {bills.length === 0 ? (
          <div style={empty}>
            <Receipt size={32} />
            <strong>
              No bills found
            </strong>
            <span>
              Your maintenance bills will appear here.
            </span>
          </div>
        ) : (
          bills.map(bill => (
            <div
              key={bill.id}
              style={card}
            >
              <div style={cardTop}>
                <div>
                  <div style={smallLabel}>
                    BILL
                  </div>

                  <h2 style={billNumber}>
                    {bill.bill_number}
                  </h2>

                  <div style={small}>
                    Billing month:{" "}
                    {new Date(
                      bill.billing_month
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        month: "long",
                        year: "numeric"
                      }
                    )}
                  </div>
                </div>

                <span
                  style={statusBadge(
                    bill.status
                  )}
                >
                  {bill.status}
                </span>
              </div>

              <div style={amountGrid}>
                <Amount
                  label="Maintenance"
                  value={bill.maintenance_amount}
                />

                <Amount
                  label="Electricity"
                  value={bill.electricity_amount}
                />

                <Amount
                  label="Water"
                  value={bill.water_amount}
                />

                <Amount
                  label="Parking"
                  value={bill.parking_amount}
                />

                <Amount
                  label="Penalty"
                  value={bill.penalty_amount}
                />

                <Amount
                  label="Other"
                  value={bill.other_amount}
                />
              </div>

              <div style={totalRow}>
                <div>
                  <div style={small}>
                    Due date
                  </div>

                  <strong>
                    {new Date(
                      bill.due_date
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </strong>
                </div>

                <div style={totalAmount}>
                  ₹
                  {Number(
                    bill.total_amount
                  ).toLocaleString("en-IN")}
                </div>

                {bill.status !== "paid" && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/resident/payments",
                        {
                          state: {
                            billId: bill.id
                          }
                        }
                      )
                    }
                    style={payButton}
                  >
                    <CreditCard size={16} />
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Amount({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={amountBox}>
      <div style={small}>
        {label}
      </div>
      <strong>
        ₹
        {Number(
          value || 0
        ).toLocaleString("en-IN")}
      </strong>
    </div>
  );
}

function statusBadge(
  status: string
): React.CSSProperties {
  if (status === "paid") {
    return {
      ...badge,
      background: "#ecfdf5",
      color: "#047857"
    };
  }

  if (status === "overdue") {
    return {
      ...badge,
      background: "#fef2f2",
      color: "#b91c1c"
    };
  }

  return {
    ...badge,
    background: "#fff7ed",
    color: "#b45309"
  };
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

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 20,
  marginBottom: 15
};

const cardTop: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start"
};

const smallLabel: React.CSSProperties = {
  fontSize: 10,
  color: "#94a3b8",
  fontWeight: 800,
  letterSpacing: 1
};

const billNumber: React.CSSProperties = {
  margin: "4px 0"
};

const small: React.CSSProperties = {
  color: "#64748b",
  fontSize: 12
};

const badge: React.CSSProperties = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700
};

const amountGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(6,minmax(0,1fr))",
  gap: 10,
  marginTop: 20
};

const amountBox: React.CSSProperties = {
  background: "#f8fafc",
  borderRadius: 10,
  padding: 12
};

const totalRow: React.CSSProperties = {
  marginTop: 18,
  paddingTop: 18,
  borderTop: "1px solid #f1f5f9",
  display: "flex",
  alignItems: "center",
  gap: 15,
  flexWrap: "wrap"
};

const totalAmount: React.CSSProperties = {
  marginLeft: "auto",
  fontSize: 24,
  fontWeight: 900
};

const payButton: React.CSSProperties = {
  height: 42,
  padding: "0 15px",
  border: 0,
  borderRadius: 9,
  background: "#2563eb",
  color: "white",
  display: "inline-flex",
  alignItems: "center",
  gap: 7,
  cursor: "pointer",
  fontWeight: 700
};

const errorBox: React.CSSProperties = {
  background: "#fef2f2",
  color: "#b91c1c",
  padding: 12,
  borderRadius: 10,
  marginBottom: 15
};

const empty: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  minHeight: 260,
  display: "flex",
  flexDirection: "column",
  gap: 8,
  alignItems: "center",
  justifyContent: "center",
  color: "#94a3b8"
};

const center: React.CSSProperties = {
  minHeight: "70vh",
  display: "grid",
  placeItems: "center",
  color: "#64748b"
};