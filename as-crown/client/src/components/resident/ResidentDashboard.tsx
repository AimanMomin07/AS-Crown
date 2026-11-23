import {
  useEffect,
  useState
} from "react";

import type {
  CSSProperties
} from "react";

import {
  Home,
  Receipt,
  CreditCard,
  Users,
  MessageSquareWarning,
  Car,
  Bell,
  ArrowRight,
  IndianRupee,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Clock3,
  RefreshCw
} from "lucide-react";

import {
  useNavigate
} from "react-router-dom";

import {
  getResidentDashboard
} from "../../api/residents.api";


interface ResidentDashboardData {

  profile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    mobile?: string;
  };

  home?: {
    flatId?: number;
    flatNumber?: string;
    floorNumber?: number;
    flatType?: string;
    occupancyStatus?: string;
    buildingId?: number;
    buildingName?: string;
    buildingCode?: string;
    ownershipType?: string;
    leaseStartDate?: string | null;
    leaseEndDate?: string | null;
  } | null;

  maintenance?: {
    outstandingAmount?: number;

    currentBill?: {
      id: number;
      billNumber: string;
      totalAmount: number;
      dueDate: string;
      status: string;
    } | null;
  };

  payments?: {
    totalPaid?: number;

    recent?: {
      id: number;
      amount: number;
      paymentMethod: string;
      paymentStatus: string;
      createdAt: string;
    }[];
  };

  visitors?: {
    today?: number;
    inside?: number;
  };

  complaints?: {
    open?: number;
    inProgress?: number;
  };

  announcements?: {
    id: number;
    title: string;
    message: string;
    createdAt: string;
  }[];
}


export default function ResidentDashboard() {

  const navigate =
    useNavigate();


  const [
    data,
    setData
  ] =
    useState<ResidentDashboardData | null>(
      null
    );


  const [
    loading,
    setLoading
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing
  ] =
    useState(false);


  const [
    error,
    setError
  ] =
    useState("");


  async function loadDashboard(
    refresh = false
  ) {

    try {

      if (refresh) {

        setRefreshing(true);

      } else {

        setLoading(true);

      }

      setError("");


      const response =
        await getResidentDashboard();


      setData(
        response?.data ||
        null
      );

    } catch (
      requestError: any
    ) {

      console.error(
        "Resident dashboard error:",
        requestError
      );


      setError(
        requestError
          ?.response
          ?.data
          ?.message ||
        "Unable to load your dashboard."
      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }


  useEffect(() => {

    void loadDashboard();

  }, []);


  if (loading) {

    return (

      <div
        style={
          loadingPage
        }
      >

        <div
          style={
            loadingCard
          }
        >

          <div
            style={
              loadingSpinner
            }
          />

          <strong>
            Loading your AS CROWN dashboard...
          </strong>

          <span
            style={
              muted
            }
          >
            Fetching your home, bills and society activity.
          </span>

        </div>

      </div>

    );

  }


  const firstName =
    data?.profile?.firstName ||
    "Resident";


  const home =
    data?.home ||
    null;


  const outstanding =
    Number(
      data?.maintenance
        ?.outstandingAmount ||
      0
    );


  const totalPaid =
    Number(
      data?.payments
        ?.totalPaid ||
      0
    );


  const visitorToday =
    Number(
      data?.visitors
        ?.today ||
      0
    );


  const visitorsInside =
    Number(
      data?.visitors
        ?.inside ||
      0
    );


  const openComplaints =
    Number(
      data?.complaints
        ?.open ||
      0
    );


  const complaintsInProgress =
    Number(
      data?.complaints
        ?.inProgress ||
      0
    );


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

        {/* =================================================
            HEADER
        ================================================= */}

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
              AS CROWN RESIDENT PORTAL
            </div>


            <h1
              style={
                heading
              }
            >
              Good evening, {firstName} 👋
            </h1>


            <p
              style={
                subtitle
              }
            >
              Here's what's happening with your home.
            </p>

          </div>


          <button
            type="button"

            onClick={() =>
              void loadDashboard(
                true
              )
            }

            disabled={
              refreshing
            }

            style={
              refreshButton
            }
          >

            <RefreshCw
              size={
                16
              }
            />

            {
              refreshing
                ? "Refreshing..."
                : "Refresh"
            }

          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div
            style={
              errorBox
            }
          >

            <AlertCircle
              size={
                18
              }
            />

            <div>

              <strong>
                Unable to load dashboard
              </strong>

              <div
                style={
                  errorText
                }
              >
                {error}
              </div>

            </div>

          </div>

        )}


        {/* =================================================
            HOME + BILL
        ================================================= */}

        <div
          style={
            heroGrid
          }
        >

          <button
            type="button"

            onClick={() =>
              navigate(
                "/resident/home"
              )
            }

            style={
              homeCard
            }
          >

            <div
              style={
                homeCardTop
              }
            >

              <div>

                <div
                  style={
                    cardEyebrow
                  }
                >
                  MY HOME
                </div>


                <h2
                  style={
                    homeHeading
                  }
                >

                  {
                    home?.buildingName ||
                    "AS CROWN"
                  }

                </h2>

              </div>


              <Home
                size={
                  28
                }
              />

            </div>


            <div
              style={
                flatNumber
              }
            >

              {
                home?.flatNumber ||
                "Flat not assigned"
              }

            </div>


            <div
              style={
                homeMeta
              }
            >

              <span>
                {
                  home?.flatType ||
                  "—"
                }
              </span>

              <span>
                •
              </span>

              <span>
                {
                  home?.ownershipType ||
                  "Resident"
                }
              </span>

              <span>
                •
              </span>

              <span>
                {
                  home?.occupancyStatus ||
                  "—"
                }
              </span>

            </div>


            {home?.leaseEndDate && (

              <div
                style={
                  lease
                }
              >

                <CalendarDays
                  size={
                    15
                  }
                />

                Lease ends{" "}

                {
                  new Date(
                    home.leaseEndDate
                  ).toLocaleDateString(
                    "en-IN"
                  )
                }

              </div>

            )}


            <div
              style={
                cardLink
              }
            >

              View My Home

              <ArrowRight
                size={
                  16
                }
              />

            </div>

          </button>


          {/* BILL */}

          <div
            style={
              billCard
            }
          >

            <div
              style={
                cardEyebrowDark
              }
            >
              MAINTENANCE
            </div>


            <div
              style={
                billAmount
              }
            >

              ₹
              {
                outstanding.toLocaleString(
                  "en-IN"
                )
              }

            </div>


            <div
              style={
                billDescription
              }
            >

              {
                data?.maintenance
                  ?.currentBill
                  ? `Due ${new Date(
                      data.maintenance.currentBill.dueDate
                    ).toLocaleDateString("en-IN")}`
                  : "No outstanding maintenance bill"
              }

            </div>


            <button
              type="button"

              onClick={() =>
                navigate(
                  "/resident/bills"
                )
              }

              style={
                payButton
              }
            >

              <Receipt
                size={
                  16
                }
              />

              {
                outstanding > 0
                  ? "View & Pay Bill"
                  : "View Bills"
              }

            </button>

          </div>

        </div>


        {/* =================================================
            STATISTICS
        ================================================= */}

        <div
          style={
            statsGrid
          }
        >

          <StatCard
            icon={
              <IndianRupee
                size={
                  19
                }
              />
            }

            label="Outstanding"

            value={
              `₹${outstanding.toLocaleString("en-IN")}`
            }

            background="#fef2f2"
            color="#dc2626"

          />


          <StatCard
            icon={
              <CreditCard
                size={
                  19
                }
              />
            }

            label="Total Paid"

            value={
              `₹${totalPaid.toLocaleString("en-IN")}`
            }

            background="#ecfdf5"
            color="#059669"

          />


          <StatCard
            icon={
              <Users
                size={
                  19
                }
              />
            }

            label="Visitors Today"

            value={
              String(
                visitorToday
              )
            }

            background="#eff6ff"
            color="#2563eb"

          />


          <StatCard
            icon={
              <MessageSquareWarning
                size={
                  19
                }
              />
            }

            label="Active Complaints"

            value={
              String(
                openComplaints +
                complaintsInProgress
              )
            }

            background="#fff7ed"
            color="#ea580c"

          />

        </div>


        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section
          style={
            section
          }
        >

          <div
            style={
              sectionHeader
            }
          >

            <div>

              <div
                style={
                  cardEyebrowDark
                }
              >
                QUICK ACTIONS
              </div>


              <h2
                style={
                  sectionTitle
                }
              >
                What would you like to do?
              </h2>

            </div>

          </div>


          <div
            style={
              actionGrid
            }
          >

            <ActionCard
              icon={
                <CreditCard
                  size={
                    21
                  }
                />
              }

              title="Pay Maintenance"

              description="View bills and record payment."

              onClick={() =>
                navigate(
                  "/resident/payments"
                )
              }

            />


            <ActionCard
              icon={
                <Users
                  size={
                    21
                  }
                />
              }

              title="Invite Visitor"

              description="Register an expected visitor."

              onClick={() =>
                navigate(
                  "/resident/visitors"
                )
              }

            />


            <ActionCard
              icon={
                <MessageSquareWarning
                  size={
                    21
                  }
                />
              }

              title="Raise Complaint"

              description="Report an issue to administration."

              onClick={() =>
                navigate(
                  "/resident/complaints"
                )
              }

            />


            <ActionCard
              icon={
                <Car
                  size={
                    21
                  }
                />
              }

              title="My Vehicles"

              description="Manage vehicles and parking."

              onClick={() =>
                navigate(
                  "/resident/vehicles"
                )
              }

            />

          </div>

        </section>


        {/* =================================================
            ACTIVITY
        ================================================= */}

        <div
          style={
            twoColumns
          }
        >

          {/* PAYMENTS */}

          <section
            style={
              section
            }
          >

            <div
              style={
                sectionHeader
              }
            >

              <div>

                <div
                  style={
                    cardEyebrowDark
                  }
                >
                  PAYMENTS
                </div>


                <h2
                  style={
                    sectionTitle
                  }
                >
                  Recent Payments
                </h2>

              </div>


              <button
                type="button"

                onClick={() =>
                  navigate(
                    "/resident/payments"
                  )
                }

                style={
                  linkButton
                }
              >
                View all
              </button>

            </div>


            {!data?.payments?.recent?.length ? (

              <EmptyState
                text="No recent payments."
              />

            ) : (

              <div>

                {
                  data.payments.recent.map(
                    payment => (

                      <div
                        key={
                          payment.id
                        }

                        style={
                          activityRow
                        }
                      >

                        <div
                          style={
                            activityIcon
                        }
>
                          <CheckCircle2
                            size={
                              17
                            }
                          />
                        </div>


                        <div
                          style={
                            activityContent
                          }
                        >

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


                          <span
                            style={
                              muted
                            }
                          >

                            {
                              payment.paymentMethod
                            }

                            {" • "}

                            {
                              new Date(
                                payment.createdAt
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            }

                          </span>

                        </div>


                        <span
                          style={
                            successBadge
                          }
                        >
                          {
                            payment.paymentStatus
                          }
                        </span>

                      </div>

                    )
                  )
                }

              </div>

            )}

          </section>


          {/* ANNOUNCEMENTS */}

          <section
            style={
              section
            }
          >

            <div
              style={
                sectionHeader
              }
            >

              <div>

                <div
                  style={
                    cardEyebrowDark
                  }
                >
                  SOCIETY
                </div>


                <h2
                  style={
                    sectionTitle
                  }
                >
                  Announcements
                </h2>

              </div>


              <button
                type="button"

                onClick={() =>
                  navigate(
                    "/resident/announcements"
                  )
                }

                style={
                  linkButton
                }
              >
                View all
              </button>

            </div>


            {!data?.announcements?.length ? (

              <EmptyState
                text="No announcements."
              />

            ) : (

              <div>

                {
                  data.announcements
                    .slice(
                      0,
                      4
                    )
                    .map(
                      announcement => (

                        <div
                          key={
                            announcement.id
                          }

                          style={
                            announcementRow
                          }
                        >

                          <div
                            style={
                              announcementIcon
                            }
                          >

                            <Bell
                              size={
                                17
                              }
                            />

                          </div>


                          <div>

                            <strong>
                              {
                                announcement.title
                              }
                            </strong>


                            <div
                              style={
                                announcementText
                              }
                            >
                              {
                                announcement.message
                              }
                            </div>

                          </div>

                        </div>

                      )
                    )
                }

              </div>

            )}

          </section>

        </div>


        {/* =================================================
            VISITOR STATUS
        ================================================= */}

        <section
          style={{
            ...section,
            marginTop:
              16
          }}
        >

          <div
            style={
              visitorSummary
            }
          >

            <div
              style={
                visitorSummaryIcon
              }
            >

              <Users
                size={
                  21
                }
              />

            </div>


            <div>

              <strong>
                Visitor activity
              </strong>


              <div
                style={
                  muted
                }
              >

                {
                  visitorToday
                }{" "}
                visitors today •{" "}
                {
                  visitorsInside
                }{" "}
                currently inside

              </div>

            </div>


            <button
              type="button"

              onClick={() =>
                navigate(
                  "/resident/visitors"
                )
              }

              style={
                secondaryButton
              }
            >

              Manage Visitors

              <ArrowRight
                size={
                  15
                }
              />

            </button>

          </div>

        </section>

      </div>

    </div>

  );

}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
  background,
  color
}: {
  icon:
    React.ReactNode;

  label:
    string;

  value:
    string;

  background:
    string;

  color:
    string;
}) {

  return (

    <div
      style={
        statCard
      }
    >

      <div
        style={{
          ...statIcon,
          background,
          color
        }}
      >
        {icon}
      </div>


      <div>

        <div
          style={
            muted
          }
        >
          {label}
        </div>


        <strong
          style={
            statValue
          }
        >
          {value}
        </strong>

      </div>

    </div>

  );

}


/* =========================================================
   ACTION CARD
========================================================= */

function ActionCard({
  icon,
  title,
  description,
  onClick
}: {
  icon:
    React.ReactNode;

  title:
    string;

  description:
    string;

  onClick:
    () => void;
}) {

  return (

    <button
      type="button"

      onClick={
        onClick
      }

      style={
        actionCard
      }
    >

      <div
        style={
          actionIcon
        }
      >
        {icon}
      </div>


      <div
        style={
          actionContent
        }
      >

        <strong>
          {title}
        </strong>


        <span
          style={
            muted
          }
        >
          {description}
        </span>

      </div>


      <ArrowRight
        size={
          16
        }

        color="#94a3b8"
      />

    </button>

  );

}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  text
}: {
  text:
    string;
}) {

  return (

    <div
      style={
        emptyState
      }
    >

      <Clock3
        size={
          17
        }
      />

      {text}

    </div>

  );

}


/* =========================================================
   STYLES
========================================================= */

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
      1400,

    margin:
      "0 auto"

  };


const header:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      15,

    flexWrap:
      "wrap",

    marginBottom:
      22

  };


const eyebrow:
  CSSProperties = {

    fontSize:
      11,

    fontWeight:
      800,

    letterSpacing:
      1.5,

    color:
      "#2563eb"

  };


const heading:
  CSSProperties = {

    margin:
      "5px 0",

    fontSize:
      31,

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


const refreshButton:
  CSSProperties = {

    height:
      40,

    padding:
      "0 13px",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      9,

    background:
      "white",

    color:
      "#334155",

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


const errorBox:
  CSSProperties = {

    padding:
      13,

    marginBottom:
      16,

    borderRadius:
      11,

    background:
      "#fef2f2",

    color:
      "#b91c1c",

    border:
      "1px solid #fecaca",

    display:
      "flex",

    alignItems:
      "flex-start",

    gap:
      9

  };


const errorText:
  CSSProperties = {

    marginTop:
      3,

    fontSize:
      12

  };


const heroGrid:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      16,

    marginBottom:
      16

  };


const homeCard:
  CSSProperties = {

    border:
      0,

    textAlign:
      "left",

    color:
      "white",

    background:
      "linear-gradient(135deg,#1d4ed8,#2563eb)",

    borderRadius:
      18,

    padding:
      24,

    minHeight:
      245,

    cursor:
      "pointer",

    boxShadow:
      "0 15px 35px rgba(37,99,235,.18)",

    boxSizing:
      "border-box"

  };


const homeCardTop:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start"

  };


const cardEyebrow:
  CSSProperties = {

    fontSize:
      10,

    fontWeight:
      800,

    letterSpacing:
      1.4,

    opacity:
      .8

  };


const cardEyebrowDark:
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


const homeHeading:
  CSSProperties = {

    margin:
      "5px 0 0",

    fontSize:
      22

  };


const flatNumber:
  CSSProperties = {

    fontSize:
      40,

    fontWeight:
      900,

    marginTop:
      28

  };


const homeMeta:
  CSSProperties = {

    display:
      "flex",

    flexWrap:
      "wrap",

    gap:
      8,

    marginTop:
      8,

    fontSize:
      13,

    opacity:
      .9

  };


const lease:
  CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      6,

    marginTop:
      18,

    fontSize:
      12,

    opacity:
      .9

  };


const cardLink:
  CSSProperties = {

    marginTop:
      18,

    display:
      "flex",

    alignItems:
      "center",

    gap:
      6,

    fontSize:
      12,

    fontWeight:
      800

  };


const billCard:
  CSSProperties = {

    minHeight:
      245,

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      18,

    padding:
      24,

    boxSizing:
      "border-box"

  };


const billAmount:
  CSSProperties = {

    marginTop:
      19,

    fontSize:
      40,

    fontWeight:
      900,

    color:
      "#0f172a"

  };


const billDescription:
  CSSProperties = {

    marginTop:
      7,

    color:
      "#64748b",

    fontSize:
      13

  };


const payButton:
  CSSProperties = {

    height:
      43,

    marginTop:
      25,

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


const statsGrid:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",

    gap:
      14,

    marginBottom:
      16

  };


const statCard:
  CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      14,

    padding:
      16,

    display:
      "flex",

    alignItems:
      "center",

    gap:
      12

  };


const statIcon:
  CSSProperties = {

    width:
      42,

    height:
      42,

    borderRadius:
      11,

    display:
      "grid",

    placeItems:
      "center",

    flexShrink:
      0

  };


const statValue:
  CSSProperties = {

    display:
      "block",

    marginTop:
      3,

    fontSize:
      21,

    color:
      "#0f172a"

  };


const section:
  CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    padding:
      20

  };


const sectionHeader:
  CSSProperties = {

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      12,

    marginBottom:
      15

  };


const sectionTitle:
  CSSProperties = {

    margin:
      "5px 0 0",

    fontSize:
      18,

    color:
      "#0f172a"

  };


const actionGrid:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(4,minmax(0,1fr))",

    gap:
      10

  };


const actionCard:
  CSSProperties = {

    border:
      "1px solid #e2e8f0",

    borderRadius:
      13,

    background:
      "white",

    padding:
      14,

    display:
      "flex",

    alignItems:
      "center",

    gap:
      10,

    textAlign:
      "left",

    cursor:
      "pointer"

  };


const actionIcon:
  CSSProperties = {

    width:
      39,

    height:
      39,

    borderRadius:
      10,

    background:
      "#eff6ff",

    color:
      "#2563eb",

    display:
      "grid",

    placeItems:
      "center",

    flexShrink:
      0

  };


const actionContent:
  CSSProperties = {

    flex:
      1,

    minWidth:
      0,

    display:
      "flex",

    flexDirection:
      "column",

    gap:
      3

  };


const twoColumns:
  CSSProperties = {

    display:
      "grid",

    gridTemplateColumns:
      "repeat(2,minmax(0,1fr))",

    gap:
      16,

    marginTop:
      16

  };


const activityRow:
  CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      10,

    padding:
      "12px 0",

    borderBottom:
      "1px solid #f1f5f9"

  };


const activityIcon:
  CSSProperties = {

    width:
      34,

    height:
      34,

    borderRadius:
      9,

    background:
      "#ecfdf5",

    color:
      "#059669",

    display:
      "grid",

    placeItems:
      "center",

    flexShrink:
      0

  };


const activityContent:
  CSSProperties = {

    flex:
      1,

    minWidth:
      0,

    display:
      "flex",

    flexDirection:
      "column",

    gap:
      2

  };


const successBadge:
  CSSProperties = {

    padding:
      "5px 9px",

    borderRadius:
      999,

    background:
      "#ecfdf5",

    color:
      "#047857",

    fontSize:
      10,

    fontWeight:
      800

  };


const announcementRow:
  CSSProperties = {

    display:
      "flex",

    gap:
      10,

    padding:
      "12px 0",

    borderBottom:
      "1px solid #f1f5f9"

  };


const announcementIcon:
  CSSProperties = {

    width:
      34,

    height:
      34,

    borderRadius:
      9,

    background:
      "#eff6ff",

    color:
      "#2563eb",

    display:
      "grid",

    placeItems:
      "center",

    flexShrink:
      0

  };


const announcementText:
  CSSProperties = {

    marginTop:
      3,

    color:
      "#64748b",

    fontSize:
      12,

    lineHeight:
      1.5

  };


const visitorSummary:
  CSSProperties = {

    display:
      "flex",

    alignItems:
      "center",

    gap:
      12

  };


const visitorSummaryIcon:
  CSSProperties = {

    width:
      42,

    height:
      42,

    borderRadius:
      11,

    background:
      "#eff6ff",

    color:
      "#2563eb",

    display:
      "grid",

    placeItems:
      "center"

  };


const secondaryButton:
  CSSProperties = {

    marginLeft:
      "auto",

    height:
      39,

    padding:
      "0 12px",

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
      6,

    cursor:
      "pointer",

    fontWeight:
      700,

    color:
      "#334155"

  };


const linkButton:
  CSSProperties = {

    border:
      0,

    background:
      "transparent",

    color:
      "#2563eb",

    cursor:
      "pointer",

    fontWeight:
      700,

    fontSize:
      12

  };


const muted:
  CSSProperties = {

    color:
      "#64748b",

    fontSize:
      12,

    lineHeight:
      1.5

  };


const emptyState:
  CSSProperties = {

    minHeight:
      110,

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    gap:
      7,

    color:
      "#94a3b8",

    fontSize:
      13

  };


const loadingPage:
  CSSProperties = {

    minHeight:
      "100vh",

    background:
      "#f8fafc",

    display:
      "grid",

    placeItems:
      "center"

  };


const loadingCard:
  CSSProperties = {

    background:
      "white",

    border:
      "1px solid #e2e8f0",

    borderRadius:
      16,

    padding:
      28,

    display:
      "flex",

    flexDirection:
      "column",

    alignItems:
      "center",

    gap:
      8

  };


const loadingSpinner:
  CSSProperties = {

    width:
      26,

    height:
      26,

    borderRadius:
      "50%",

    border:
      "3px solid #dbeafe",

    borderTopColor:
      "#2563eb",

    animation:
      "spin 1s linear infinite"

  };