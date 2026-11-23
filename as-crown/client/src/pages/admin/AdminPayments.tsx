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
  RefreshCw,
  X,
  Save
} from "lucide-react";

import {
  getPayments,
  recordPayment
} from "../../api/payments.api";

import {
  getBills
} from "../../api/bills.api";

import {
  getAdminUsers
} from "../../api/admin.api";


interface Payment {

  id:
    number;

  payment_number:
    string;

  first_name:
    string;

  last_name?:
    string | null;

  flat_number:
    string;

  amount:
    number | string;

  payment_method:
    string;

  payment_status:
    string;

  transaction_id?:
    string | null;

  created_at:
    string;

}


interface Bill {

  id:
    number;

  bill_number:
    string;

  total_amount:
    number | string;

  flat_number:
    string;

  building_name:
    string;

  status:
    string;

}


interface User {

  id:
    number;

  first_name:
    string;

  last_name?:
    string | null;

  email?:
    string | null;

}


export default function AdminPayments() {

  const [
    payments,
    setPayments
  ] =
    useState<Payment[]>([]);


  const [
    bills,
    setBills
  ] =
    useState<Bill[]>([]);


  const [
    residents,
    setResidents
  ] =
    useState<User[]>([]);


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    saving,
    setSaving
  ] =
    useState(false);


  const [
    showModal,
    setShowModal
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  const [
    success,
    setSuccess
  ] =
    useState("");


  const [
    form,
    setForm
  ] =
    useState({

      billId:
        "",

      userId:
        "",

      amount:
        "",

      paymentMethod:
        "upi",

      transactionId:
        "",

      notes:
        ""

    });


  const loadPayments =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const response =
            await getPayments();


          setPayments(
            response?.data?.payments ||
            []
          );

        } catch (
          requestError: any
        ) {

          console.error(
            requestError
          );

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            "Unable to load payments."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  async function loadFormData() {

    try {

      const [
        billsResponse,
        usersResponse
      ] =
        await Promise.all([

          getBills(),

          getAdminUsers({
            role:
              "resident",
            status:
              "active",
            limit:
              200
          })

        ]);


      setBills(
        billsResponse?.data?.bills ||
        []
      );


      setResidents(
        usersResponse?.data?.users ||
        []
      );

    } catch (
      requestError
    ) {

      console.error(
        requestError
      );

    }

  }


  useEffect(() => {

    void loadPayments();

    void loadFormData();

  }, [
    loadPayments
  ]);


  function openCreate() {

    setForm({

      billId:
        "",

      userId:
        "",

      amount:
        "",

      paymentMethod:
        "upi",

      transactionId:
        "",

      notes:
        ""

    });

    setError("");

    setSuccess("");

    setShowModal(
      true
    );

  }


  function closeModal() {

    if (
      !saving
    ) {

      setShowModal(
        false
      );

    }

  }


  function handleBillChange(
    value: string
  ) {

    const bill =
      bills.find(
        item =>
          String(
            item.id
          ) === value
      );


    setForm(
      current => ({

        ...current,

        billId:
          value,

        amount:
          bill
            ? String(
                bill.total_amount
              )
            : current.amount

      })
    );

  }


  async function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    const billId =
      Number(
        form.billId
      );


    const userId =
      Number(
        form.userId
      );


    const amount =
      Number(
        form.amount
      );


    if (
      !Number.isInteger(
        billId
      )
    ) {

      setError(
        "Select a bill."
      );

      return;

    }


    if (
      !Number.isInteger(
        userId
      )
    ) {

      setError(
        "Select a resident."
      );

      return;

    }


    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {

      setError(
        "Enter a valid payment amount."
      );

      return;

    }


    try {

      setSaving(
        true
      );


      await recordPayment({

        billId,

        userId,

        amount,

        paymentMethod:
          form.paymentMethod as "upi" | "cash" | "card" | "net_banking" | "bank_transfer" | "other",

        transactionId:
          form.transactionId.trim() ||
          undefined,

        notes:
          form.notes.trim() ||
          undefined

      });


      setShowModal(
        false
      );


      setSuccess(
        "Payment recorded successfully."
      );


      await loadPayments();

      await loadFormData();

    } catch (
      requestError: any
    ) {

      console.error(
        "Record payment error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to record payment."
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  return (

    <div
      style={{
        minHeight:
          "100vh",
        background:
          "#f8fafc",
        padding:
          28
      }}
    >

      <div
        style={{
          maxWidth:
            1400,
          margin:
            "0 auto"
        }}
      >

        <div
          style={
            header
          }
        >

          <div>

            <div
              style={
                eyebrow
              }
            >
              FINANCE
            </div>

            <h1
              style={
                title
              }
            >
              Payments
            </h1>

            <p
              style={
                description
              }
            >
              Record and monitor society payment transactions.
            </p>

          </div>


          <div
            style={{
              display:
                "flex",
              gap:
                9
            }}
          >

            <button
              onClick={() =>
                void loadPayments()
              }
              style={
                secondary
              }
            >
              <RefreshCw
                size={16}
              />
              Refresh
            </button>


            <button
              onClick={
                openCreate
              }
              style={
                primary
              }
            >
              <Plus
                size={17}
              />
              Record Payment
            </button>

          </div>

        </div>


        {error && (

          <Message
            type="error"
            text={error}
          />

        )}


        {success && (

          <Message
            type="success"
            text={success}
          />

        )}


        <div
          style={
            tableWrap
          }
        >

          <div
            style={{
              overflowX:
                "auto"
            }}
          >

            <table
              style={
                tableStyle
              }
            >

              <thead>

                <tr>

                  <th style={th}>
                    Payment
                  </th>

                  <th style={th}>
                    Resident
                  </th>

                  <th style={th}>
                    Flat
                  </th>

                  <th style={th}>
                    Amount
                  </th>

                  <th style={th}>
                    Method
                  </th>

                  <th style={th}>
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan={6}
                      style={
                        empty
                      }
                    >
                      Loading payments...
                    </td>

                  </tr>

                ) : payments.length === 0 ? (

                  <tr>

                    <td
                      colSpan={6}
                      style={
                        empty
                      }
                    >
                      No payments recorded.
                    </td>

                  </tr>

                ) : (

                  payments.map(
                    payment => (

                      <tr
                        key={
                          payment.id
                        }
                        style={
                          row
                        }
                      >

                        <td style={td}>

                          <strong>
                            {
                              payment.payment_number
                            }
                          </strong>

                          <div
                            style={
                              small
                            }
                          >
                            {
                              payment.transaction_id ||
                              "No transaction ID"
                            }
                          </div>

                        </td>


                        <td style={td}>
                          {
                            payment.first_name
                          }{" "}
                          {
                            payment.last_name ||
                            ""
                          }
                        </td>


                        <td style={td}>
                          {
                            payment.flat_number
                          }
                        </td>


                        <td style={td}>

                          <strong>
                            ₹
                            {
                              Number(
                                payment.amount
                              ).toLocaleString(
                                "en-IN"
                              )
                            }
                          </strong>

                        </td>


                        <td style={td}>
                          {
                            payment.payment_method
                          }
                        </td>


                        <td style={td}>

                          <span
                            style={
                              statusBadge(
                                payment.payment_status
                              )
                            }
                          >
                            {
                              payment.payment_status
                            }
                          </span>

                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>


        {showModal && (

          <div
            style={
              overlay
            }
          >

            <form
              onSubmit={
                handleSubmit
              }
              style={
                modal
              }
            >

              <div
                style={
                  modalHeader
                }
              >

                <div>

                  <div
                    style={
                      eyebrow
                    }
                  >
                    FINANCE
                  </div>

                  <h2
                    style={{
                      margin:
                        "4px 0"
                    }}
                  >
                    Record Payment
                  </h2>

                </div>


                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  style={
                    closeButton
                  }
                >
                  <X
                    size={18}
                  />
                </button>

              </div>


              <label
                style={
                  labelStyle
                }
              >

                <span>
                  Bill
                </span>

                <select
                  value={
                    form.billId
                  }
                  onChange={
                    event =>
                      handleBillChange(
                        event.target.value
                      )
                  }
                  required
                  style={
                    input
                  }
                >

                  <option value="">
                    Select bill
                  </option>

                  {bills.map(
                    bill => (

                      <option
                        key={
                          bill.id
                        }
                        value={
                          bill.id
                        }
                      >
                        {
                          bill.bill_number
                        }{" "}
                        —{" "}
                        {
                          bill.building_name
                        }{" "}
                        {
                          bill.flat_number
                        }{" "}
                        — ₹
                        {
                          Number(
                            bill.total_amount
                          ).toLocaleString(
                            "en-IN"
                          )
                        }
                      </option>

                    )
                  )}

                </select>

              </label>


              <label
                style={
                  labelStyle
                }
              >

                <span>
                  Resident
                </span>

                <select
                  value={
                    form.userId
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,
                          userId:
                            event.target.value
                        })
                      )
                  }
                  required
                  style={
                    input
                  }
                >

                  <option value="">
                    Select resident
                  </option>

                  {residents.map(
                    resident => (

                      <option
                        key={
                          resident.id
                        }
                        value={
                          resident.id
                        }
                      >
                        {
                          resident.first_name
                        }{" "}
                        {
                          resident.last_name ||
                          ""
                        }
                      </option>

                    )
                  )}

                </select>

              </label>


              <div
                style={
                  two
                }
              >

                <Field
                  label="Amount"
                  type="number"
                  value={
                    form.amount
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          amount:
                            value
                        })
                      )
                  }
                  required
                />


                <label
                  style={
                    labelStyle
                  }
                >

                  <span>
                    Payment Method
                  </span>

                  <select
                    value={
                      form.paymentMethod
                    }
                    onChange={
                      event =>
                        setForm(
                          current => ({
                            ...current,
                            paymentMethod:
                              event.target.value
                          })
                        )
                    }
                    style={
                      input
                    }
                  >

                    <option value="upi">
                      UPI
                    </option>

                    <option value="card">
                      Card
                    </option>

                    <option value="cash">
                      Cash
                    </option>

                    <option value="net_banking">
                      Net Banking
                    </option>

                    <option value="bank_transfer">
                      Bank Transfer
                    </option>

                    <option value="other">
                      Other
                    </option>

                  </select>

                </label>

              </div>


              <Field
                label="Transaction ID"
                value={
                  form.transactionId
                }
                onChange={
                  value =>
                    setForm(
                      current => ({
                        ...current,
                        transactionId:
                          value
                      })
                    )
                }
              />


              <label
                style={
                  labelStyle
                }
              >

                <span>
                  Notes
                </span>

                <textarea
                  value={
                    form.notes
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,
                          notes:
                            event.target.value
                        })
                      )
                  }
                  rows={4}
                  style={{
                    ...input,
                    height:
                      "auto",
                    padding:
                      12,
                    resize:
                      "vertical"
                  }}
                />

              </label>


              <div
                style={
                  modalFooter
                }
              >

                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  style={
                    secondary
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
                    primary
                  }
                >
                  <Save
                    size={16}
                  />

                  {
                    saving
                      ? "Saving..."
                      : "Record Payment"
                  }

                </button>

              </div>

            </form>

          </div>

        )}

      </div>

    </div>

  );

}


function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text"
}: {
  label:
    string;
  value:
    string;
  onChange:
    (
      value: string
    ) => void;
  required?:
    boolean;
  type?:
    string;
}) {

  return (

    <label
      style={
        labelStyle
      }
    >

      <span>
        {label}
      </span>

      <input
        required={
          required
        }
        type={
          type
        }
        value={
          value
        }
        onChange={
          event =>
            onChange(
              event.target.value
            )
        }
        min={
          type === "number"
            ? "0"
            : undefined
        }
        style={
          input
        }
      />

    </label>

  );

}


function Message({
  type,
  text
}: {
  type:
    "error"
    | "success";
  text:
    string;
}) {

  return (

    <div
      style={{
        marginBottom:
          15,
        padding:
          12,
        borderRadius:
          10,
        background:
          type === "error"
            ? "#fef2f2"
            : "#ecfdf5",
        color:
          type === "error"
            ? "#b91c1c"
            : "#047857"
      }}
    >
      {text}
    </div>

  );

}


const header:
  React.CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      15,
    marginBottom:
      22,
    flexWrap:
      "wrap"
  };


const eyebrow:
  React.CSSProperties = {
    fontSize:
      11,
    fontWeight:
      800,
    letterSpacing:
      1.5,
    color:
      "#2563eb"
  };


const title:
  React.CSSProperties = {
    margin:
      "5px 0",
    fontSize:
      30
  };


const description:
  React.CSSProperties = {
    margin:
      0,
    color:
      "#64748b"
  };


const primary:
  React.CSSProperties = {
    height:
      42,
    padding:
      "0 15px",
    border:
      0,
    borderRadius:
      9,
    background:
      "#2563eb",
    color:
      "white",
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      7,
    cursor:
      "pointer",
    fontWeight:
      700
  };


const secondary:
  React.CSSProperties = {
    height:
      42,
    padding:
      "0 14px",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      9,
    background:
      "white",
    display:
      "inline-flex",
    alignItems:
      "center",
    gap:
      7,
    cursor:
      "pointer"
  };


const input:
  React.CSSProperties = {
    width:
      "100%",
    height:
      44,
    boxSizing:
      "border-box",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      9,
    padding:
      "0 12px",
    background:
      "white",
    marginTop:
      6
  };


const labelStyle:
  React.CSSProperties = {
    display:
      "block",
    marginBottom:
      14,
    fontSize:
      13,
    fontWeight:
      700
  };


const two:
  React.CSSProperties = {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",
    gap:
      12
  };


const tableWrap:
  React.CSSProperties = {
    background:
      "white",
    border:
      "1px solid #e2e8f0",
    borderRadius:
      16,
    overflow:
      "hidden"
  };


const tableStyle:
  React.CSSProperties = {
    width:
      "100%",
    borderCollapse:
      "collapse"
  };


const th:
  React.CSSProperties = {
    textAlign:
      "left",
    padding:
      "13px 16px",
    fontSize:
      11,
    color:
      "#64748b",
    textTransform:
      "uppercase"
  };


const td:
  React.CSSProperties = {
    padding:
      "14px 16px",
    fontSize:
      13
  };


const row:
  React.CSSProperties = {
    borderTop:
      "1px solid #f1f5f9"
  };


const small:
  React.CSSProperties = {
    fontSize:
      11,
    color:
      "#94a3b8"
  };


const empty:
  React.CSSProperties = {
    padding:
      50,
    textAlign:
      "center",
    color:
      "#94a3b8"
  };


const statusBadge = (
  status:
    string
): React.CSSProperties => ({

  display:
    "inline-flex",

  padding:
    "5px 9px",

  borderRadius:
    999,

  background:
    status === "success"
      ? "#ecfdf5"
      : "#fff7ed",

  color:
    status === "success"
      ? "#047857"
      : "#b45309",

  fontSize:
    11,

  fontWeight:
    700

});


const overlay:
  React.CSSProperties = {
    position:
      "fixed",
    inset:
      0,
    background:
      "rgba(15,23,42,.55)",
    zIndex:
      2000,
    display:
      "grid",
    placeItems:
      "center",
    padding:
      20
  };


const modal:
  React.CSSProperties = {
    width:
      "100%",
    maxWidth:
      620,
    maxHeight:
      "calc(100vh - 40px)",
    overflowY:
      "auto",
    background:
      "white",
    borderRadius:
      18,
    padding:
      25
  };


const modalHeader:
  React.CSSProperties = {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginBottom:
      20
  };


const modalFooter:
  React.CSSProperties = {
    display:
      "flex",
    justifyContent:
      "flex-end",
    gap:
      10,
    borderTop:
      "1px solid #f1f5f9",
    paddingTop:
      15
  };


const closeButton:
  React.CSSProperties = {
    border:
      0,
    background:
      "#f1f5f9",
    width:
      36,
    height:
      36,
    borderRadius:
      9,
    cursor:
      "pointer",
    display:
      "grid",
    placeItems:
      "center"
  };