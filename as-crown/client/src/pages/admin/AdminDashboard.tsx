import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  Building2,
  Home,
  Users,
  UserRoundCheck,
  MessageSquareWarning,
  CreditCard,
  IndianRupee,
  DoorOpen,
  RefreshCw
} from "lucide-react";

import {
  getAdminDashboard
} from "../../api/admin.api";


interface DashboardStats {

  users: {
    total_users: number;
    active_users: number;
    pending_users: number;
    blocked_users: number;
  };

  residents: {
    total_residents: number;
  };

  buildings: {
    total_buildings: number;
  };

  flats: {
    total_flats: number;
    active_flats: number;
    occupied_flats: number;
    vacant_flats: number;
    rented_flats: number;
    maintenance_flats: number;
  };

  complaints: {
    total_complaints: number;
    open_complaints: number;
    in_progress_complaints: number;
    resolved_complaints: number;
    closed_complaints: number;
  };

  bills: {
    total_bills: number;
    total_billed: number;
    total_paid: number;
    total_pending: number;
  };

  payments: {
    total_payments: number;
    total_payment_amount: number;
    successful_payments: number;
    failed_payments: number;
  };

  visitors: {
    total_visitors: number;
    visitors_inside: number;
    visitors_expected: number;
  };

  staff: {
    total_staff: number;
  };

  announcements: {
    total_announcements: number;
    published_announcements: number;
  };

}


function currency(
  amount: number
) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency:
        "INR",

      maximumFractionDigits:
        0
    }
  ).format(
    Number(amount || 0)
  );

}


function StatCard({
  title,
  value,
  subtitle,
  icon
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
}) {

  return (

    <div
      style={{
        background:
          "#ffffff",

        border:
          "1px solid #e2e8f0",

        borderRadius:
          "18px",

        padding:
          "20px"
      }}
    >

      <div
        style={{
          display:
            "flex",

          justifyContent:
            "space-between",

          gap:
            "12px"
        }}
      >

        <div>

          <p
            style={{
              margin:
                0,

              fontSize:
                "13px",

              color:
                "#64748b"
            }}
          >
            {title}
          </p>

          <h2
            style={{
              margin:
                "8px 0 4px",

              fontSize:
                "28px",

              color:
                "#0f172a"
            }}
          >
            {value}
          </h2>

          <p
            style={{
              margin:
                0,

              fontSize:
                "12px",

              color:
                "#94a3b8"
            }}
          >
            {subtitle}
          </p>

        </div>

        <div
          style={{
            width:
              "46px",

            height:
              "46px",

            borderRadius:
              "13px",

            background:
              "#eff6ff",

            color:
              "#2563eb",

            display:
              "grid",

            placeItems:
              "center"
          }}
        >
          {icon}
        </div>

      </div>

    </div>

  );

}


export default function AdminDashboard() {

  const [
    stats,
    setStats
  ] =
    useState<
      DashboardStats | null
    >(null);


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


  const loadDashboard =
    useCallback(
      async () => {

        try {

          setLoading(true);

          setError("");


          const response =
            await getAdminDashboard();


          if (
            !response?.success
          ) {

            throw new Error(
              response?.message ||
              "Unable to load dashboard"
            );

          }


          setStats(
            response.data
          );

        } catch (
          error: unknown
        ) {

          console.error(
            "Dashboard error:",
            error
          );


          setError(
            "Unable to load AS CROWN dashboard"
          );

        } finally {

          setLoading(false);

        }

      },
      []
    );


  useEffect(() => {

    void loadDashboard();

  }, [
    loadDashboard
  ]);


  if (loading) {

    return (

      <div
        style={{
          minHeight:
            "80vh",

          display:
            "grid",

          placeItems:
            "center",

          background:
            "#f8fafc"
        }}
      >

        <div
          style={{
            textAlign:
              "center"
          }}
        >

          <RefreshCw
            size={30}
            className="animate-spin"
          />

          <p
            style={{
              color:
                "#64748b"
            }}
          >
            Loading AS CROWN dashboard...
          </p>

        </div>

      </div>

    );

  }


  if (error || !stats) {

    return (

      <div
        style={{
          padding:
            "30px",

          background:
            "#f8fafc",

          minHeight:
            "80vh"
        }}
      >

        <div
          style={{
            maxWidth:
              "600px",

            margin:
              "80px auto",

            padding:
              "30px",

            background:
              "white",

            borderRadius:
              "18px",

            border:
              "1px solid #fecaca",

            textAlign:
              "center"
          }}
        >

          <MessageSquareWarning
            size={40}
          />

          <h2>
            Dashboard unavailable
          </h2>

          <p
            style={{
              color:
                "#b91c1c"
            }}
          >
            {error ||
              "No dashboard data available."}
          </p>

          <button
            onClick={() =>
              void loadDashboard()
            }
            style={{
              border:
                0,

              background:
                "#2563eb",

              color:
                "white",

              padding:
                "11px 18px",

              borderRadius:
                "10px",

              cursor:
                "pointer"
            }}
          >
            Retry
          </button>

        </div>

      </div>

    );

  }


  return (

    <div
      style={{
        minHeight:
          "100vh",

        background:
          "#f8fafc",

        padding:
          "28px"
      }}
    >

      <div
        style={{
          maxWidth:
            "1400px",

          margin:
            "0 auto"
        }}
      >

        {/* HEADER */}

        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              "16px",

            flexWrap:
              "wrap",

            marginBottom:
              "26px"
          }}
        >

          <div>

            <p
              style={{
                color:
                  "#2563eb",

                fontSize:
                  "11px",

                fontWeight:
                  800,

                letterSpacing:
                  "1.5px",

                margin:
                  0
              }}
            >
              AS CROWN ADMINISTRATION
            </p>

            <h1
              style={{
                margin:
                  "5px 0",

                color:
                  "#0f172a",

                fontSize:
                  "30px"
              }}
            >
              Admin Dashboard
            </h1>

            <p
              style={{
                margin:
                  0,

                color:
                  "#64748b"
              }}
            >
              Live overview of AS CROWN society operations.
            </p>

          </div>


          <button
            onClick={() =>
              void loadDashboard()
            }
            style={{
              border:
                "1px solid #e2e8f0",

              background:
                "white",

              padding:
                "10px 14px",

              borderRadius:
                "10px",

              display:
                "flex",

              gap:
                "8px",

              alignItems:
                "center",

              cursor:
                "pointer"
            }}
          >

            <RefreshCw
              size={16}
            />

            Refresh

          </button>

        </div>


        {/* PRIMARY */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",

            gap:
              "16px"
          }}
        >

          <StatCard
            title="Residents"
            value={
              stats.residents.total_residents
            }
            subtitle="Registered residents"
            icon={
              <Users size={21} />
            }
          />

          <StatCard
            title="Buildings"
            value={
              stats.buildings.total_buildings
            }
            subtitle="Active buildings"
            icon={
              <Building2 size={21} />
            }
          />

          <StatCard
            title="Flats"
            value={
              stats.flats.total_flats
            }
            subtitle={
              `${stats.flats.occupied_flats} occupied`
            }
            icon={
              <Home size={21} />
            }
          />

          <StatCard
            title="Staff"
            value={
              stats.staff.total_staff
            }
            subtitle="Active staff"
            icon={
              <UserRoundCheck size={21} />
            }
          />

        </div>


        {/* SECONDARY */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",

            gap:
              "16px",

            marginTop:
              "16px"
          }}
        >

          <StatCard
            title="Complaints"
            value={
              stats.complaints.total_complaints
            }
            subtitle={
              `${stats.complaints.open_complaints} open`
            }
            icon={
              <MessageSquareWarning
                size={21}
              />
            }
          />

          <StatCard
            title="Payments"
            value={
              currency(
                stats.payments
                  .total_payment_amount
              )
            }
            subtitle={
              `${stats.payments.successful_payments} successful`
            }
            icon={
              <CreditCard
                size={21}
              />
            }
          />

          <StatCard
            title="Bills"
            value={
              currency(
                stats.bills.total_billed
              )
            }
            subtitle={
              `${currency(stats.bills.total_pending)} pending`
            }
            icon={
              <IndianRupee
                size={21}
              />
            }
          />

          <StatCard
            title="Visitors Inside"
            value={
              stats.visitors.visitors_inside
            }
            subtitle={
              `${stats.visitors.visitors_expected} expected`
            }
            icon={
              <DoorOpen size={21} />
            }
          />

        </div>


        {/* LOWER GRID */}

        <div
          style={{
            display:
              "grid",

            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",

            gap:
              "18px",

            marginTop:
              "18px"
          }}
        >

          <Panel title="Flat Occupancy">

            <MetricRow
              label="Occupied"
              value={
                stats.flats.occupied_flats
              }
            />

            <MetricRow
              label="Vacant"
              value={
                stats.flats.vacant_flats
              }
            />

            <MetricRow
              label="Rented"
              value={
                stats.flats.rented_flats
              }
            />

            <MetricRow
              label="Maintenance"
              value={
                stats.flats.maintenance_flats
              }
            />

          </Panel>


          <Panel title="Maintenance Finance">

            <MetricRow
              label="Total billed"
              value={
                currency(
                  stats.bills.total_billed
                )
              }
            />

            <MetricRow
              label="Paid bills"
              value={
                currency(
                  stats.bills.total_paid
                )
              }
            />

            <MetricRow
              label="Pending"
              value={
                currency(
                  stats.bills.total_pending
                )
              }
            />

          </Panel>


          <Panel title="Society Activity">

            <MetricRow
              label="Announcements"
              value={
                stats.announcements
                  .published_announcements
              }
            />

            <MetricRow
              label="Visitors"
              value={
                stats.visitors.total_visitors
              }
            />

            <MetricRow
              label="Users"
              value={
                stats.users.total_users
              }
            />

          </Panel>

        </div>

      </div>

    </div>

  );

}


function Panel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {

  return (

    <div
      style={{
        background:
          "white",

        border:
          "1px solid #e2e8f0",

        borderRadius:
          "18px",

        padding:
          "20px"
      }}
    >

      <h3
        style={{
          margin:
            "0 0 15px",

          color:
            "#0f172a"
        }}
      >
        {title}
      </h3>

      {children}

    </div>

  );

}


function MetricRow({
  label,
  value
}: {
  label: string;
  value: string | number;
}) {

  return (

    <div
      style={{
        display:
          "flex",

        justifyContent:
          "space-between",

        padding:
          "12px 0",

        borderBottom:
          "1px solid #f1f5f9"
      }}
    >

      <span
        style={{
          color:
            "#64748b",

          fontSize:
            "13px"
        }}
      >
        {label}
      </span>

      <strong
        style={{
          color:
            "#0f172a"
        }}
      >
        {value}
      </strong>

    </div>

  );

}