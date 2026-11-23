import { useState } from "react";
import type { ReactNode } from "react";

import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Building2,
  Home,
  MessageSquareWarning,
  Receipt,
  CreditCard,
  ShieldCheck,
  UserRoundCheck,
  Car,
  Bell,
  BarChart3,
  Settings2,
  Calculator,
  FileBarChart,
  Menu,
  X,
  LogOut,
  ChevronDown,
  UserCircle,
  ShieldAlert,
  CalendarRange,
  Store,
  BrainCircuit,
  Leaf,
  MessageCircle
} from "lucide-react";

import {
  useAuth
} from "../../context/AuthContext";

import {
  useTheme
} from "../../context/ThemeContext";


interface AdminLayoutProps {
  children: ReactNode;
}


const navigation = [
  [
    "Dashboard",
    "/admin/dashboard",
    LayoutDashboard
  ],

  [
    "Residents",
    "/admin/users",
    Users
  ],

  [
    "Buildings",
    "/admin/buildings",
    Building2
  ],

  [
    "Flats",
    "/admin/flats",
    Home
  ],

  [
    "Complaints",
    "/admin/complaints",
    MessageSquareWarning
  ],

  [
    "Maintenance Bills",
    "/admin/bills",
    Receipt
  ],

  [
    "Payments",
    "/admin/payments",
    CreditCard
  ],

  [
    "Visitors",
    "/admin/visitors",
    ShieldCheck
  ],

  [
    "Staff",
    "/admin/staff",
    UserRoundCheck
  ],

  [
    "Vehicles",
    "/admin/vehicles",
    Car
  ],

  [
    "Announcements",
    "/admin/announcements",
    Bell
  ],

  [
    "Notifications",
    "/admin/notifications",
    Bell
  ],

  [
  "Analytics",
  "/admin/analytics",
  BarChart3
],

[
  "Billing Rates",
  "/admin/maintenance-rates",
  Settings2
],

[
  "Billing Engine",
  "/admin/billing-engine",
  Calculator
],

[
  "Complaint Workflow",
  "/admin/complaint-workflow",
  MessageSquareWarning
],

[
  "Attendance",
  "/admin/attendance",
  UserRoundCheck
],

[
  "Audit Logs",
  "/admin/audit-logs",
  FileBarChart
],

[
  "Emergency Contacts",
  "/admin/emergency-contacts",
  ShieldCheck
],

[
  "Permissions",
  "/admin/permissions",
  ShieldCheck
],

[
  "Reports",
  "/admin/reports",
  FileBarChart
],

[
  "SOS Alerts",
  "/admin/sos-alerts",
  ShieldAlert
],

[
  "Amenities",
  "/admin/amenities",
  CalendarRange
],

[
  "Vendors",
  "/admin/vendors",
  Store
],

[
  "Dues Intelligence",
  "/admin/dues-intelligence",
  BrainCircuit
],

[
  "Sustainability",
  "/admin/sustainability",
  Leaf
],

[
  "Community Groups",
  "/admin/community",
  MessageCircle
]
] as const;


export default function AdminLayout({
  children
}: AdminLayoutProps) {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const {
    user,
    logout
  } = useAuth();

  const {
    theme,
    toggleTheme
  } = useTheme();


  const [
    mobileOpen,
    setMobileOpen
  ] =
    useState(false);


  const [
    profileOpen,
    setProfileOpen
  ] =
    useState(false);


  function handleLogout() {

    setProfileOpen(false);

    setMobileOpen(false);

    logout();

    navigate(
      "/login",
      {
        replace: true
      }
    );

  }


  function openProfile() {

    setProfileOpen(false);

    setMobileOpen(false);

    navigate(
      "/admin/profile"
    );

  }


  return (

    <div
      className="as-admin-shell"
    >

      <style>
        {`
          :root {
            --as-bg: #f8fafc;
            --as-surface: #ffffff;
            --as-text: #0f172a;
            --as-text-soft: #64748b;
            --as-border: #e2e8f0;
          }

          html[data-theme="dark"] {
            --as-bg: #0f172a;
            --as-surface: #111827;
            --as-text: #f8fafc;
            --as-text-soft: #94a3b8;
            --as-border: #334155;
          }

          .as-admin-shell {
            min-height: 100vh;
            background: var(--as-bg, #f8fafc);
            color: var(--as-text, #0f172a);
          }

          .as-admin-sidebar {
            position: fixed;
            inset: 0 auto 0 0;
            width: 260px;
            background: #0f172a;
            color: white;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            transform: translateX(0);
          }

          .as-admin-main {
            margin-left: 260px;
            min-height: 100vh;
            min-width: 0;
          }

          .as-admin-header {
            height: 72px;
            background: var(--as-surface, white);
            border-bottom: 1px solid var(--as-border, #e2e8f0);
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0 24px;
            position: sticky;
            top: 0;
            z-index: 50;
          }

          .as-admin-nav {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 18px 12px;
          }

          .as-admin-nav::-webkit-scrollbar {
            width: 5px;
          }

          .as-admin-nav::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 999px;
          }

          .as-admin-footer {
            flex-shrink: 0;
            padding: 14px;
            border-top: 1px solid rgba(255,255,255,.08);
            background: #0f172a;
          }

          .as-admin-menu-btn {
            display: none;
          }

          .as-admin-overlay {
            display: none;
          }

          @media (max-width: 1024px) {

            .as-admin-sidebar {
              transform: translateX(-100%);
              transition: transform .2s ease;
            }

            .as-admin-sidebar.open {
              transform: translateX(0);
            }

            .as-admin-main {
              margin-left: 0;
            }

            .as-admin-header {
              justify-content: space-between;
            }

            .as-admin-menu-btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border: 0;
              background: transparent;
              color: #0f172a;
              cursor: pointer;
            }

            .as-admin-overlay.open {
              display: block;
              position: fixed;
              inset: 0;
              background: rgba(15,23,42,.45);
              z-index: 999;
            }

          }
        `}
      </style>


      {/* OVERLAY */}

      <div
        className={
          `as-admin-overlay ${
            mobileOpen
              ? "open"
              : ""
          }`
        }

        onClick={() =>
          setMobileOpen(false)
        }
      />


      {/* SIDEBAR */}

      <aside
        className={
          `as-admin-sidebar ${
            mobileOpen
              ? "open"
              : ""
          }`
        }
      >

        {/* BRAND */}

        <div
          style={{
            height: 72,
            flexShrink: 0,
            padding: "0 18px",
            display: "flex",
            alignItems: "center",
            borderBottom:
              "1px solid rgba(255,255,255,.08)"
          }}
        >

          <ShieldCheck
            size={25}
            color="#60a5fa"
          />

          <div
            style={{
              marginLeft: 10
            }}
          >

            <strong>
              AS CROWN
            </strong>

            <span
              style={{
                display: "block",
                fontSize: 10,
                color: "#94a3b8"
              }}
            >
              SOCIETY MANAGEMENT
            </span>

          </div>


          <button
            className="as-admin-menu-btn"

            onClick={() =>
              setMobileOpen(false)
            }

            style={{
              marginLeft: "auto",
              color: "#94a3b8"
            }}
          >

            <X size={20} />

          </button>

        </div>


        {/* NAVIGATION */}

        <nav
          className="as-admin-nav"
        >

          <div
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 1,
              color: "#64748b",
              padding:
                "0 12px 10px"
            }}
          >
            MAIN MENU
          </div>


          {navigation.map(
            ([
              label,
              path,
              Icon
            ]) => {

              const active =
                location.pathname === path ||
                location.pathname.startsWith(
                  path + "/"
                );


              return (

                <Link
                  key={path}
                  to={path}
                  onClick={() =>
                    setMobileOpen(false)
                  }

                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: 11,

                    padding:
                      "10px 12px",

                    marginBottom: 4,

                    borderRadius: 10,

                    textDecoration:
                      "none",

                    color: active
                      ? "#fff"
                      : "#94a3b8",

                    background: active
                      ? "#2563eb"
                      : "transparent",

                    fontSize: 13,

                    fontWeight: active
                      ? 700
                      : 500
                  }}
                >

                  <Icon size={18} />

                  <span>
                    {label}
                  </span>

                </Link>

              );

            }
          )}

        </nav>


        {/* FIXED FOOTER */}

        <div
          className="as-admin-footer"
        >

          <button
            onClick={
              openProfile
            }

            style={{
              width: "100%",
              border: 0,
              background:
                "transparent",
              color: "#cbd5e1",
              display: "flex",
              alignItems:
                "center",
              gap: 10,
              padding:
                "10px 11px",
              cursor: "pointer",
              borderRadius: 9
            }}
          >

            <UserCircle
              size={18}
            />

            My Profile

          </button>


          <button
            onClick={
              handleLogout
            }

            style={{
              width: "100%",
              border: 0,
              background:
                "transparent",
              color: "#f87171",
              display: "flex",
              alignItems:
                "center",
              gap: 10,
              padding:
                "10px 11px",
              cursor: "pointer",
              borderRadius: 9
            }}
          >

            <LogOut
              size={18}
            />

            Sign out

          </button>

        </div>

      </aside>


      {/* MAIN */}

      <main
        className="as-admin-main"
      >

        <header
          className="as-admin-header"
        >

          <button
            className="as-admin-menu-btn"

            onClick={() =>
              setMobileOpen(true)
            }
          >

            <Menu size={23} />

          </button>


          {/* THEME TOGGLE */}

          <button
            type="button"
            onClick={toggleTheme}
            title={
              theme === "light"
                ? "Switch to dark mode"
                : "Switch to light mode"
            }
            style={{
              width: 40,
              height: 40,
              border: "1px solid var(--as-border, #e2e8f0)",
              background: "var(--as-surface, white)",
              color: "var(--as-text, #0f172a)",
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              marginRight: 10
            }}
          >
            {theme === "light" ? "☾" : "☀"}
          </button>


          {/* PROFILE MENU */}

          <div
            style={{
              position:
                "relative"
            }}
          >

            <button
              onClick={() =>
                setProfileOpen(
                  value => !value
                )
              }

              style={{
                border: 0,
                background:
                  "transparent",
                display: "flex",
                alignItems:
                  "center",
                gap: 9,
                cursor: "pointer"
              }}
            >

              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius:
                    "50%",
                  background:
                    "#dbeafe",
                  color:
                    "#1d4ed8",
                  display:
                    "grid",
                  placeItems:
                    "center",
                  fontWeight: 800
                }}
              >
                {
                  user?.first_name
                    ?.charAt(0)
                    ?.toUpperCase() ||
                  "A"
                }
              </div>


              <div
                style={{
                  textAlign:
                    "left"
                }}
              >

                <strong
                  style={{
                    display:
                      "block"
                  }}
                >
                  {
                    user?.first_name ||
                    "Admin"
                  }
                </strong>

                <span
                  style={{
                    fontSize: 11,
                    color:
                      "#64748b"
                  }}
                >
                  {
                    user?.role ===
                    "admin"
                      ? "Administrator"
                      : user?.role ||
                        "User"
                  }
                </span>

              </div>


              <ChevronDown
                size={16}
              />

            </button>


            {profileOpen && (

              <div
                style={{
                  position:
                    "absolute",
                  right: 0,
                  top: 48,
                  width: 210,
                  background:
                    "white",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: 12,
                  boxShadow:
                    "0 18px 45px rgba(15,23,42,.15)",
                  padding: 7,
                  zIndex: 100
                }}
              >

                <button
                  onClick={
                    openProfile
                  }

                  style={{
                    width:
                      "100%",
                    border: 0,
                    background:
                      "transparent",
                    padding: 10,
                    textAlign:
                      "left",
                    cursor:
                      "pointer",
                    color:
                      "#334155",
                    borderRadius: 8
                  }}
                >
                  My Profile
                </button>


                <button
                  onClick={
                    handleLogout
                  }

                  style={{
                    width:
                      "100%",
                    border: 0,
                    background:
                      "transparent",
                    padding: 10,
                    textAlign:
                      "left",
                    cursor:
                      "pointer",
                    color:
                      "#dc2626",
                    borderRadius: 8
                  }}
                >
                  Sign out
                </button>

              </div>

            )}

          </div>

        </header>


        <div>
          {children}
        </div>

      </main>

    </div>

  );

}