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
  getBills,
  generateBills
} from "../../api/bills.api";

import {
  getBuildings
} from "../../api/buildings.api";


interface Bill {

  id:
    number;

  bill_number:
    string;

  billing_month:
    string;

  flat_number:
    string;

  building_name:
    string;

  total_amount:
    number | string;

  due_date:
    string;

  status:
    string;

}


interface Building {

  id:
    number;

  name:
    string;

  building_code:
    string;

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


export default function AdminBills() {

  const [
    bills,
    setBills
  ] =
    useState<Bill[]>([]);


  const [
    buildings,
    setBuildings
  ] =
    useState<Building[]>([]);


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

      buildingId:
        "",

      billingMonth:
        new Date()
          .toISOString()
          .slice(
            0,
            7
          ) + "-01",

      maintenanceAmount:
        "3500",

      electricityAmount:
        "800",

      waterAmount:
        "300",

      parkingAmount:
        "500",

      penaltyAmount:
        "0",

      otherAmount:
        "0",

      dueDate:
        new Date()
          .toISOString()
          .slice(
            0,
            7
          ) + "-28"

    });


  const loadBills =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError("");


          const response =
            await getBills();


          setBills(
            response?.data?.bills ||
            []
          );

        } catch (
          requestError: unknown
        ) {

          console.error(
            requestError
          );

          setError(getErrorMessage(requestError, "Unable to load maintenance bills."));

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  async function loadBuildings() {

    try {

      const response =
        await getBuildings();


      setBuildings(
        response?.data?.buildings ||
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

    void loadBills();

    void loadBuildings();

  }, [
    loadBills
  ]);


  function openCreate() {

    setError("");

    setSuccess("");

    setShowModal(
      true
    );

  }


  function closeModal() {

    if (!saving) {

      setShowModal(
        false
      );

    }

  }


  const totalPerFlat =
    Number(
      form.maintenanceAmount
    ) +
    Number(
      form.electricityAmount
    ) +
    Number(
      form.waterAmount
    ) +
    Number(
      form.parkingAmount
    ) +
    Number(
      form.penaltyAmount
    ) +
    Number(
      form.otherAmount
    );


  async function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();

    setError("");

    setSuccess("");


    if (
      !form.buildingId
    ) {

      setError(
        "Select a building."
      );

      return;

    }


    if (
      totalPerFlat <= 0
    ) {

      setError(
        "Total bill amount must be greater than zero."
      );

      return;

    }


    try {

      setSaving(
        true
      );


      const response =
        await generateBills({

          buildingId:
            Number(
              form.buildingId
            ),

          billingMonth:
            form.billingMonth,

          maintenanceAmount:
            Number(
              form.maintenanceAmount
            ),

          electricityAmount:
            Number(
              form.electricityAmount
            ),

          waterAmount:
            Number(
              form.waterAmount
            ),

          parkingAmount:
            Number(
              form.parkingAmount
            ),

          penaltyAmount:
            Number(
              form.penaltyAmount
            ),

          otherAmount:
            Number(
              form.otherAmount
            ),

          dueDate:
            form.dueDate

        });


      setShowModal(
        false
      );


      setSuccess(
        response?.message ||
        "Maintenance bills generated successfully."
      );


      await loadBills();

    } catch (
      requestError: unknown
    ) {

      console.error(
        "Generate bills error:",
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to generate maintenance bills."));

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
          style={header}
        >

          <div>

            <div
              style={eyebrow}
            >
              FINANCE
            </div>

            <h1
              style={title}
            >
              Maintenance Bills
            </h1>

            <p
              style={description}
            >
              Generate and manage monthly maintenance bills.
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
                void loadBills()
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
              Generate Bill
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
                    Bill
                  </th>

                  <th style={th}>
                    Flat
                  </th>

                  <th style={th}>
                    Amount
                  </th>

                  <th style={th}>
                    Due
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
                      colSpan={5}
                      style={empty}
                    >
                      Loading bills...
                    </td>

                  </tr>

                ) : bills.length === 0 ? (

                  <tr>

                    <td
                      colSpan={5}
                      style={empty}
                    >
                      No maintenance bills found.
                    </td>

                  </tr>

                ) : (

                  bills.map(
                    bill => (

                      <tr
                        key={
                          bill.id
                        }
                        style={
                          row
                        }
                      >

                        <td style={td}>

                          <strong>
                            {
                              bill.bill_number
                            }
                          </strong>

                          <div
                            style={
                              small
                            }
                          >
                            {
                              bill.billing_month
                            }
                          </div>

                        </td>


                        <td style={td}>

                          {
                            bill.building_name
                          }

                          {" • "}

                          {
                            bill.flat_number
                          }

                        </td>


                        <td style={td}>

                          <strong>
                            ₹
                            {
                              Number(
                                bill.total_amount
                              ).toLocaleString(
                                "en-IN"
                              )
                            }
                          </strong>

                        </td>


                        <td style={td}>
                          {
                            bill.due_date
                          }
                        </td>


                        <td style={td}>

                          <span
                            style={
                              statusBadge(
                                bill.status
                              )
                            }
                          >
                            {
                              bill.status
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
                    BILLING
                  </div>

                  <h2
                    style={{
                      margin:
                        "4px 0"
                    }}
                  >
                    Generate Maintenance Bills
                  </h2>

                  <p
                    style={
                      description
                    }
                  >
                    One bill will be generated for each active flat in the selected building.
                  </p>

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
                  Building
                </span>

                <select
                  value={
                    form.buildingId
                  }
                  onChange={
                    event =>
                      setForm(
                        current => ({
                          ...current,
                          buildingId:
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
                    Select building
                  </option>

                  {buildings.map(
                    building => (

                      <option
                        key={
                          building.id
                        }
                        value={
                          building.id
                        }
                      >
                        {
                          building.name
                        }{" "}
                        (
                        {
                          building.building_code
                        }
                        )
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
                  label="Billing Month"
                  type="date"
                  value={
                    form.billingMonth
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          billingMonth:
                            value
                        })
                      )
                  }
                  required
                />


                <Field
                  label="Due Date"
                  type="date"
                  value={
                    form.dueDate
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          dueDate:
                            value
                        })
                      )
                  }
                  required
                />

              </div>


              <div
                style={
                  two
                }
              >

                <Field
                  label="Maintenance"
                  value={
                    form.maintenanceAmount
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          maintenanceAmount:
                            value
                        })
                      )
                  }
                />


                <Field
                  label="Electricity"
                  value={
                    form.electricityAmount
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          electricityAmount:
                            value
                        })
                      )
                  }
                />

              </div>


              <div
                style={
                  two
                }
              >

                <Field
                  label="Water"
                  value={
                    form.waterAmount
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          waterAmount:
                            value
                        })
                      )
                  }
                />


                <Field
                  label="Parking"
                  value={
                    form.parkingAmount
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          parkingAmount:
                            value
                        })
                      )
                  }
                />

              </div>


              <div
                style={
                  two
                }
              >

                <Field
                  label="Penalty"
                  value={
                    form.penaltyAmount
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          penaltyAmount:
                            value
                        })
                      )
                  }
                />


                <Field
                  label="Other"
                  value={
                    form.otherAmount
                  }
                  onChange={
                    value =>
                      setForm(
                        current => ({
                          ...current,
                          otherAmount:
                            value
                        })
                      )
                  }
                />

              </div>


              <div
                style={{
                  marginTop:
                    8,
                  padding:
                    "16px 18px",
                  background:
                    "#eff6ff",
                  borderRadius:
                    12
                }}
              >

                <div
                  style={{
                    color:
                      "#64748b",
                    fontSize:
                      12
                  }}
                >
                  Total per flat
                </div>

                <strong
                  style={{
                    display:
                      "block",
                    fontSize:
                      28,
                    marginTop:
                      4,
                    color:
                      "#0f172a"
                  }}
                >
                  ₹
                  {
                    totalPerFlat.toLocaleString(
                      "en-IN"
                    )
                  }
                </strong>

              </div>


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
                      ? "Generating..."
                      : "Generate Bills"
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
  type = "number",
  required = false
}: {
  label:
    string;
  value:
    string;
  onChange:
    (
      value: string
    ) => void;
  type?:
    string;
  required?:
    boolean;
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
        type={
          type
        }
        value={
          value
        }
        required={
          required
        }
        min={
          type === "number"
            ? "0"
            : undefined
        }
        onChange={
          event =>
            onChange(
              event.target.value
            )
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


const empty:
  React.CSSProperties = {
    padding:
      50,
    textAlign:
      "center",
    color:
      "#94a3b8"
  };


const small:
  React.CSSProperties = {
    fontSize:
      11,
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
    status === "paid"
      ? "#ecfdf5"
      : "#fff7ed",

  color:
    status === "paid"
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
      650,
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
      15,
    marginTop:
      10
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