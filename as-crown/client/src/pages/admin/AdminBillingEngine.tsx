import {
  useEffect,
  useState
} from "react";

import type {
  FormEvent,
  CSSProperties
} from "react";

import {
  Calculator,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Receipt,
  Building2
} from "lucide-react";

import {
  getBuildings
} from "../../api/buildings.api";

import {
  generateMaintenanceBills
} from "../../api/maintenance-billing.api";


interface Building {

  id:
    number;

  name:
    string;

  building_code?:
    string;

}


interface GeneratedBill {

  id:
    number;

  billNumber:
    string;

  flatNumber:
    string;

  buildingName:
    string;

  flatType:
    string;

  total:
    number;

  dueDate:
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


export default function AdminBillingEngine() {

  const [
    buildings,
    setBuildings
  ] =
    useState<
      Building[]
    >([]);


  const [
    billingMonth,
    setBillingMonth
  ] =
    useState(
      currentMonth()
    );


  const [
    dueDate,
    setDueDate
  ] =
    useState(
      ""
    );


  const [
    buildingId,
    setBuildingId
  ] =
    useState("");


  const [
    loadingBuildings,
    setLoadingBuildings
  ] =
    useState(true);


  const [
    generating,
    setGenerating
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
    result,
    setResult
  ] =
    useState<{
      totalFlats:
        number;

      generatedCount:
        number;

      skippedCount:
        number;

      failedCount:
        number;

      generated:
        GeneratedBill[];

      skipped:
        {
          flatNumber:
            string;

          reason:
            string;
        }[];

      failed:
        {
          flatNumber:
            string;

          reason:
            string;
        }[];

    } | null>(
      null
    );


  async function loadBuildings() {

    try {

      setLoadingBuildings(
        true
      );


      const response =
        await getBuildings();


      setBuildings(
        response
          ?.data
          ?.buildings ||
        []
      );

    } catch (
      requestError
    ) {

      console.error(
        requestError
      );

    } finally {

      setLoadingBuildings(
        false
      );

    }

  }


  useEffect(() => {

    void loadBuildings();

  }, []);


  async function handleGenerate(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (
      !billingMonth
    ) {

      setError(
        "Select a billing month."
      );

      return;

    }


    if (
      !dueDate
    ) {

      setError(
        "Select a due date."
      );

      return;

    }


    setError("");
    setSuccess("");
    setResult(null);


    try {

      setGenerating(
        true
      );


      const response =
        await generateMaintenanceBills({

          billingMonth,

          dueDate,

          buildingId:
            buildingId
              ? Number(
                  buildingId
                )
              : null

        });


      const data =
        response?.data;


      setResult(
        data || null
      );


      setSuccess(
        `${data?.generatedCount || 0} maintenance bill(s) generated successfully.`
      );

    } catch (
      requestError: unknown
    ) {

      console.error(
        requestError
      );


      setError(getErrorMessage(requestError, "Unable to generate maintenance bills."));

    } finally {

      setGenerating(
        false
      );

    }

  }


  return (

    <div
      style={
        page
      }
    >

      <div
        style={
          container
        }
      >

        <header
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
              Maintenance Billing Engine
            </h1>


            <p
              style={
                subtitle
              }
            >
              Generate monthly maintenance bills from BHK rates and flat-specific overrides.
            </p>

          </div>

        </header>


        {error && (

          <div
            style={
              errorBox
            }
          >

            <AlertTriangle
              size={
                17
              }
            />

            {
              error
            }

          </div>

        )}


        {success && (

          <div
            style={
              successBox
            }
          >

            <CheckCircle2
              size={
                17
              }
            />

            {
              success
            }

          </div>

        )}


        <div
          style={
            layout
          }
        >

          {/* =================================================
              GENERATOR
          ================================================= */}

          <form
            onSubmit={
              handleGenerate
            }

            style={
              card
            }
          >

            <div
              style={
                cardHeader
              }
            >

              <div
                style={
                  icon
                }
              >

                <Calculator
                  size={
                    21
                  }
                />

              </div>


              <div>

                <strong>
                  Generate Monthly Bills
                </strong>

                <div
                  style={
                    muted
                  }
                >
                  One click generates bills for all eligible active flats.
                </div>

              </div>

            </div>


            <label
              style={
                label
              }
            >

              Billing Month

              <input
                type="month"

                value={
                  billingMonth
                }

                onChange={
                  event =>
                    setBillingMonth(
                      event.target.value
                    )
                }

                style={
                  input
                }

                required
              />

            </label>


            <label
              style={
                label
              }
            >

              Due Date

              <input
                type="date"

                value={
                  dueDate
                }

                onChange={
                  event =>
                    setDueDate(
                      event.target.value
                    )
                }

                style={
                  input
                }

                required
              />

            </label>


            <label
              style={
                label
              }
            >

              Building

              <select
                value={
                  buildingId
                }

                onChange={
                  event =>
                    setBuildingId(
                      event.target.value
                    )
                }

                style={
                  input
                }

                disabled={
                  loadingBuildings
                }
              >

                <option value="">
                  All Buildings
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
                      }

                      {
                        building.building_code
                          ? ` (${building.building_code})`
                          : ""
                      }

                    </option>

                  )
                )}

              </select>

            </label>


            <div
              style={
                info
              }
            >

              <Building2
                size={
                  17
                }
              />

              <div>

                The engine automatically uses:

                <strong>
                  {" "}
                  BHK rate
                </strong>

                {" + "}

                <strong>
                  flat override
                </strong>

                {" + configured charges."}

              </div>

            </div>


            <button
              type="submit"

              disabled={
                generating
              }

              style={{
                ...primary,

                opacity:
                  generating
                    ? 0.6
                    : 1
              }}
            >

              <Receipt
                size={
                  17
                }
              />

              {
                generating
                  ? "Generating Bills..."
                  : "Generate Bills"
              }

            </button>

          </form>


          {/* =================================================
              HOW IT WORKS
          ================================================= */}

          <div
            style={
              card
            }
          >

            <div
              style={
                cardHeader
              }
            >

              <div
                style={
                  icon
                }
              >

                <RefreshCw
                  size={
                    21
                  }
                />

              </div>


              <div>

                <strong>
                  Billing Rules
                </strong>

                <div
                  style={
                    muted
                  }
                >
                  Applied automatically to every flat.
                </div>

              </div>

            </div>


            <Rule
              number="01"
              title="Find active flats"
              text="Only active flats in active buildings are billed."
            />


            <Rule
              number="02"
              title="Read flat type"
              text="The engine selects the matching 1BHK, 2BHK, 3BHK, 4BHK, Penthouse or Other rate."
            />


            <Rule
              number="03"
              title="Check flat override"
              text="A configured per-flat override replaces individual default charges."
            />


            <Rule
              number="04"
              title="Prevent duplicates"
              text="A flat cannot receive the same billing month twice."
            />


            <Rule
              number="05"
              title="Notify resident"
              text="The resident receives a payment notification after bill creation."
            />

          </div>

        </div>


        {/* =================================================
            RESULTS
        ================================================= */}

        {result && (

          <section
            style={
              resultsCard
            }
          >

            <div
              style={
                resultHeader
              }
            >

              <div>

                <div
                  style={
                    eyebrow
                  }
                >
                  GENERATION RESULT
                </div>


                <h2
                  style={
                    resultTitle
                  }
                >
                  {
                    billingMonth
                  }
                </h2>

              </div>


              <button
                type="button"

                onClick={() =>
                  setResult(
                    null
                  )
                }

                style={
                  clearButton
                }
              >
                Clear
              </button>

            </div>


            <div
              style={
                resultStats
              }
            >

              <Stat
                label="Eligible flats"
                value={
                  result.totalFlats
                }
              />


              <Stat
                label="Generated"
                value={
                  result.generatedCount
                }
              />


              <Stat
                label="Skipped"
                value={
                  result.skippedCount
                }
              />


              <Stat
                label="Failed"
                value={
                  result.failedCount
                }
              />

            </div>


            {result.generated.length >
              0 && (

              <div
                style={
                  tableWrapper
                }
              >

                <table
                  style={
                    table
                  }
                >

                  <thead>

                    <tr>

                      <th
                        style={
                          th
                        }
                      >
                        Bill
                      </th>

                      <th
                        style={
                          th
                        }
                      >
                        Building
                      </th>

                      <th
                        style={
                          th
                        }
                      >
                        Flat
                      </th>

                      <th
                        style={
                          th
                        }
                      >
                        Type
                      </th>

                      <th
                        style={
                          th
                        }
                      >
                        Total
                      </th>

                      <th
                        style={
                          th
                        }
                      >
                        Due
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {result.generated.map(
                      bill => (

                        <tr
                          key={
                            bill.id
                          }
                        >

                          <td
                            style={
                              td
                            }
                          >
                            {
                              bill.billNumber
                            }
                          </td>


                          <td
                            style={
                              td
                            }
                          >
                            {
                              bill.buildingName
                            }
                          </td>


                          <td
                            style={
                              td
                            }
                          >
                            {
                              bill.flatNumber
                            }
                          </td>


                          <td
                            style={
                              td
                            }
                          >
                            {
                              bill.flatType
                            }
                          </td>


                          <td
                            style={
                              td
                            }
                          >

                            ₹
                            {
                              Number(
                                bill.total
                              ).toLocaleString(
                                "en-IN"
                              )
                            }

                          </td>


                          <td
                            style={
                              td
                            }
                          >
                            {
                              bill.dueDate
                            }
                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            )}


            {result.skipped.length >
              0 && (

              <div
                style={
                  warningBox
                }
              >

                <strong>
                  Skipped bills
                </strong>


                {result.skipped.map(
                  (item, index) => (

                    <div
                      key={
                        `${item.flatNumber}-${index}`
                      }

                      style={
                        warningLine
                      }
                    >

                      {
                        item.flatNumber
                      }

                      {" — "}

                      {
                        item.reason
                      }

                    </div>

                  )
                )}

              </div>

            )}

          </section>

        )}

      </div>

    </div>

  );

}


function Rule({
  number,
  title,
  text
}: {
  number:
    string;

  title:
    string;

  text:
    string;
}) {

  return (

    <div
      style={
        rule
      }
    >

      <span
        style={
          ruleNumber
        }
      >
        {number}
      </span>


      <div>

        <strong>
          {title}
        </strong>


        <p
          style={
            ruleText
          }
        >
          {text}
        </p>

      </div>

    </div>

  );

}


function Stat({
  label,
  value
}: {
  label:
    string;

  value:
    number;
}) {

  return (

    <div
      style={
        stat
      }
    >

      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>

    </div>

  );

}


function currentMonth() {

  const now =
    new Date();

  return `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(
    2,
    "0"
  )}`;

}


const page:
  CSSProperties = {

    minHeight:
      "100vh",

    background:
      "#f8fafc",

    padding:
      28

  };


const container:
  CSSProperties = {

    maxWidth:
      1300,

    margin:
      "0 auto"

  };


const header:
  CSSProperties = {

    marginBottom:
      20

  };


const eyebrow:
  CSSProperties = {

    fontSize:
      10,

    fontWeight:
      800,

    letterSpacing:
      1.4,

    color:
      "#2563eb"

  };


const title:
  CSSProperties = {

    margin:
      "5px 0",

    fontSize:
      29,

    color:
      "#0f172a"

  };


const subtitle:
  CSSProperties = {

    margin:
      0,

    color:
      "#64748b"

  };


const layout:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "1.1fr .9fr",

    gap:
      15

  };


const card:
  CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    padding:
      22

  };


const cardHeader:
  CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      10,

    marginBottom:
      20

  };


const icon:
  CSSProperties = {

    width:
      42,

    height:
      42,

    borderRadius:
      10,

    background:
      "#eff6ff",

    color:
      "#2563eb",

    display:
      "grid",

    placeItems:
      "center"

  };


const muted:
  CSSProperties = {

    color:
      "#94a3b8",

    fontSize:
      11,

    marginTop:
      2

  };


const label:
  CSSProperties = {

    display:
      "block",

    marginBottom:
      15,

    color:
      "#334155",

    fontSize:
      13,

    fontWeight:
      700

  };


const input:
  CSSProperties = {

    width:
      "100%",

    height:
      44,

    marginTop:
      6,

    boxSizing:
      "border-box",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    background:
      "white",

    padding:
      "0 11px"

  };


const info:
  CSSProperties = {

    display:
      "flex",

    gap:
      9,

    padding:
      13,

    borderRadius:
      10,

    background:
      "#f8fafc",

    color:
      "#64748b",

    fontSize:
      12,

    lineHeight:
      1.5,

    marginBottom:
      15

  };


const primary:
  CSSProperties = {

    width:
      "100%",

    height:
      44,

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

    justifyContent:
      "center",

    gap:
      7,

    cursor:
      "pointer",

    fontWeight:
      800

  };


const errorBox:
  CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      8,

    padding:
      12,

    marginBottom:
      14,

    borderRadius:
      10,

    background:
      "#fef2f2",

    color:
      "#b91c1c",

    border:
      "1px solid #fecaca"

  };


const successBox:
  CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      8,

    padding:
      12,

    marginBottom:
      14,

    borderRadius:
      10,

    background:
      "#ecfdf5",

    color:
      "#047857",

    border:
      "1px solid #a7f3d0"

  };


const rule:
  CSSProperties = {

    display:
      "flex",

    gap:
      11,

    padding:
      "13px 0",

    borderBottom:
      "1px solid #f1f5f9"

  };


const ruleNumber:
  CSSProperties = {

    width:
      28,

    height:
      28,

    borderRadius:
      8,

    background:
      "#eff6ff",

    color:
      "#2563eb",

    display:
      "grid",

    placeItems:
      "center",

    fontSize:
      10,

    fontWeight:
      800,

    flexShrink:
      0

  };


const ruleText:
  CSSProperties = {

    margin:
      "4px 0 0",

    color:
      "#64748b",

    fontSize:
      12,

    lineHeight:
      1.5

  };


const resultsCard:
  CSSProperties = {

    marginTop:
      15,

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    padding:
      22

  };


const resultHeader:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    marginBottom:
      15

  };


const resultTitle:
  CSSProperties = {

    margin:
      "5px 0 0",

    fontSize:
      20

  };


const clearButton:
  CSSProperties = {

    border:
      "1px solid #e2e8f0",

    background:
      "white",

    borderRadius:
      8,

    padding:
      "8px 11px",

    cursor:
      "pointer"

  };


const resultStats:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(4,1fr)",

    gap:
      10,

    marginBottom:
      16

  };


const stat:
  CSSProperties = {

    padding:
      14,

    borderRadius:
      10,

    background:
      "#f8fafc",

    display:
      "flex",

    flexDirection:
      "column",

    gap:
      3

  };


const tableWrapper:
  CSSProperties = {

    overflowX:
      "auto"

  };


const table:
  CSSProperties = {

    width:
      "100%",

    borderCollapse:
      "collapse",

    minWidth:
      700

  };


const th:
  CSSProperties = {

    textAlign:
      "left",

    padding:
      11,

    background:
      "#f8fafc",

    color:
      "#64748b",

    fontSize:
      11

  };


const td:
  CSSProperties = {

    padding:
      11,

    borderTop:
      "1px solid #f1f5f9",

    fontSize:
      12

  };


const warningBox:
  CSSProperties = {

    marginTop:
      15,

    padding:
      14,

    borderRadius:
      10,

    background:
      "#fffbeb",

    color:
      "#92400e"

  };


const warningLine:
  CSSProperties = {

    marginTop:
      6,

    fontSize:
      12

  };