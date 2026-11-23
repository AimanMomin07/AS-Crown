import { 
  useEffect,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  CreditCard,
  CheckCircle2,
  History
} from "lucide-react";

import {
  useLocation
} from "react-router-dom";

import {
  getResidentBills,
  getResidentPayments,
  payResidentBill
} from "../../api/residents.api";

interface Bill {
  id: number;
  bill_number: string;
  total_amount: number;
  due_date: string;
  status: string;
}

interface Payment {
  id: number;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string | null;
  created_at?: string;
}

export default function ResidentPayments() {
  const location =
    useLocation();

  const [
    bills,
    setBills
  ] = useState<Bill[]>([]);

  const [
    payments,
    setPayments
  ] = useState<Payment[]>([]);

  const [
    selectedBillId,
    setSelectedBillId
  ] = useState(
    location.state?.billId
      ? String(location.state.billId)
      : ""
  );

  const [
    amount,
    setAmount
  ] = useState("");

  const [
    method,
    setMethod
  ] = useState<
    "upi" |
    "card" |
    "net_banking" |
    "bank_transfer"
  >("upi");

  const [
    transactionId,
    setTransactionId
  ] = useState("");

  const [
    processing,
    setProcessing
  ] = useState(false);

  const [
    success,
    setSuccess
  ] = useState("");

  const [
    error,
    setError
  ] = useState("");

  async function load() {
    try {
      const [
        billsResponse,
        paymentsResponse
      ] = await Promise.all([
        getResidentBills(),
        getResidentPayments()
      ]);

      setBills(
        billsResponse?.data?.bills ||
        []
      );

      setPayments(
        paymentsResponse?.data?.payments ||
        []
      );
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
        "Unable to load payment data."
      );
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    if (
      selectedBillId
    ) {
      const bill =
        bills.find(
          item =>
            String(item.id) ===
            selectedBillId
        );

      if (bill) {
        setAmount(
          String(
            bill.total_amount
          )
        );
      }
    }
  }, [
    bills,
    selectedBillId
  ]);

  async function handlePay(
    event: FormEvent
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const billId =
      Number(selectedBillId);

    const numericAmount =
      Number(amount);

    if (!billId) {
      setError(
        "Please select a bill."
      );
      return;
    }

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
      setError(
        "Enter a valid payment amount."
      );
      return;
    }

    try {
      setProcessing(true);

      await payResidentBill({
        billId,
        amount: numericAmount,
        paymentMethod: method,
        transactionId:
          transactionId.trim() ||
          undefined
      });

      setSuccess(
        "Payment recorded successfully."
      );

      setTransactionId("");

      await load();

    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.message ||
        "Unable to record payment."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div style={page}>
      <div style={container}>

        <div style={header}>
          <div>
            <div style={eyebrow}>
              PAYMENTS
            </div>

            <h1 style={heading}>
              Payments
            </h1>

            <p style={subtitle}>
              Pay outstanding maintenance bills and view your payment history.
            </p>
          </div>
        </div>

        {error && (
          <div style={errorBox}>
            {error}
          </div>
        )}

        {success && (
          <div style={successBox}>
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <div style={grid}>

          <form
            onSubmit={handlePay}
            style={card}
          >

            <div style={cardIcon}>
              <CreditCard size={20} />
            </div>

            <h2>
              Make a Payment
            </h2>

            <label style={label}>
              Bill

              <select
                value={
                  selectedBillId
                }
                onChange={
                  event =>
                    setSelectedBillId(
                      event.target.value
                    )
                }
                style={input}
              >

                <option value="">
                  Select outstanding bill
                </option>

                {bills
                  .filter(
                    bill =>
                      bill.status !==
                      "paid"
                  )
                  .map(
                    bill => (
                      <option
                        key={bill.id}
                        value={bill.id}
                      >
                        {bill.bill_number}
                        {" • ₹"}
                        {Number(
                          bill.total_amount
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </option>
                    )
                  )}

              </select>
            </label>

            <label style={label}>
              Amount

              <input
                type="number"
                min="1"
                value={amount}
                onChange={
                  event =>
                    setAmount(
                      event.target.value
                    )
                }
                style={input}
              />
            </label>

            <label style={label}>
              Payment Method

              <select
                value={method}
                onChange={
                  event =>
                    setMethod(
                      event.target.value as
                        | "upi"
                        | "card"
                        | "net_banking"
                        | "bank_transfer"
                    )
                }
                style={input}
              >

                <option value="upi">
                  UPI
                </option>

                <option value="card">
                  Card
                </option>

                <option value="net_banking">
                  Net Banking
                </option>

                <option value="bank_transfer">
                  Bank Transfer
                </option>

              </select>
            </label>

            <label style={label}>
              Transaction ID

              <input
                value={
                  transactionId
                }
                onChange={
                  event =>
                    setTransactionId(
                      event.target.value
                    )
                }
                placeholder="Optional"
                style={input}
              />
            </label>

            <button
              type="submit"
              disabled={
                processing
              }
              style={button}
            >
              <CreditCard size={17} />

              {processing
                ? "Processing..."
                : "Record Payment"}
            </button>

          </form>

          <section style={card}>

            <div style={historyHeader}>
              <div>
                <div style={eyebrow}>
                  HISTORY
                </div>

                <h2>
                  Recent Payments
                </h2>
              </div>

              <History size={22} />
            </div>

            {payments.length === 0 ? (
              <div style={empty}>
                No payments yet.
              </div>
            ) : (
              payments.map(payment => (
                <div
                  key={payment.id}
                  style={paymentRow}
                >
                  <div>
                    <strong>
                      ₹
                      {Number(
                        payment.amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <div style={small}>
                      {payment.payment_method}
                      {payment.transaction_id
                        ? ` • ${payment.transaction_id}`
                        : ""}
                    </div>
                  </div>

                  <span
                    style={{
                      ...badge,
                      background:
                        payment.payment_status ===
                        "success"
                          ? "#ecfdf5"
                          : "#fff7ed",
                      color:
                        payment.payment_status ===
                        "success"
                          ? "#047857"
                          : "#b45309"
                    }}
                  >
                    {payment.payment_status}
                  </span>
                </div>
              ))
            )}

          </section>

        </div>

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
  maxWidth: 1200,
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

const grid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2,minmax(0,1fr))",
  gap: 16
};

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 22
};

const cardIcon: React.CSSProperties = {
  width: 42,
  height: 42,
  borderRadius: 10,
  background: "#eff6ff",
  color: "#2563eb",
  display: "grid",
  placeItems: "center"
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 14
};

const input: React.CSSProperties = {
  width: "100%",
  height: 44,
  marginTop: 6,
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: "0 12px",
  boxSizing: "border-box",
  background: "white"
};

const button: React.CSSProperties = {
  width: "100%",
  height: 44,
  border: 0,
  borderRadius: 9,
  background: "#2563eb",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  cursor: "pointer",
  fontWeight: 700,
  marginTop: 10
};

const historyHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const paymentRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #f1f5f9"
};

const badge: React.CSSProperties = {
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 700
};

const small: React.CSSProperties = {
  fontSize: 12,
  color: "#64748b",
  marginTop: 3
};

const errorBox: React.CSSProperties = {
  padding: 12,
  marginBottom: 15,
  background: "#fef2f2",
  color: "#b91c1c",
  borderRadius: 10
};

const successBox: React.CSSProperties = {
  padding: 12,
  marginBottom: 15,
  background: "#ecfdf5",
  color: "#047857",
  borderRadius: 10,
  display: "flex",
  gap: 7,
  alignItems: "center"
};

const empty: React.CSSProperties = {
  minHeight: 200,
  display: "grid",
  placeItems: "center",
  color: "#94a3b8"
};