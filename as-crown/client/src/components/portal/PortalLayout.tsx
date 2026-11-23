import {
  type ReactNode,
  useCallback,
  useEffect,
  useState
} from "react";


import {
  Link,
  useLocation,
  useNavigate
} from "react-router-dom";


import {
  Bell,
  Home,
  FileText,
  MessageSquareWarning,
  Car,
  Users,
  LogOut,
  ShieldCheck,
  CalendarCheck2,
  MessageCircle,
  FileStack
} from "lucide-react";


import {
  useAuth
} from "../../context/AuthContext";


import {
  getUnreadNotificationCount
} from "../../api/notifications.api";


import {
  useTheme
} from "../../context/ThemeContext";


export default function PortalLayout({
  children
}: {
  children:
    ReactNode;
}) {

  const {
    user,
    logout
  } =
    useAuth();


  const {
    theme,
    toggleTheme
  } =
    useTheme();


  const location =
    useLocation();


  const navigate =
    useNavigate();


  const role =
    user?.role ||
    user?.role_name;


  const [
    unreadCount,
    setUnreadCount
  ] =
    useState(0);


  /* =========================================================
     LOAD UNREAD NOTIFICATIONS
  ========================================================= */

  const loadUnreadCount =
    useCallback(
      async () => {

        if (
          role !==
          "resident"
        ) {

          setUnreadCount(
            0
          );

          return;

        }


        try {

          const response =
            await getUnreadNotificationCount();


          const count =
            Number(
              response
                ?.data
                ?.unreadCount ||
              0
            );


          setUnreadCount(
            Math.max(
              0,
              count
            )
          );

        } catch (
          error
        ) {

          console.error(
            "Portal notification count error:",
            error
          );

        }

      },
      [
        role
      ]
    );


  /* =========================================================
     LOAD ON LOGIN / ROLE CHANGE
  ========================================================= */

  useEffect(() => {

    void loadUnreadCount();

  }, [
    loadUnreadCount
  ]);


  /* =========================================================
     REFRESH WHEN NAVIGATING
  ========================================================= */

  useEffect(() => {

    void loadUnreadCount();

  }, [
    location.pathname,
    loadUnreadCount
  ]);


  /* =========================================================
     AUTO REFRESH
     Every 30 seconds for residents
  ========================================================= */

  useEffect(() => {

    if (
      role !==
      "resident"
    ) {

      return;

    }


    const interval =
      window.setInterval(
        () => {

          void loadUnreadCount();

        },
        30_000
      );


    return () => {

      window.clearInterval(
        interval
      );

    };

  }, [
    role,
    loadUnreadCount
  ]);


  /* =========================================================
     NAVIGATION ITEMS
  ========================================================= */

  const items =
    role === "resident"

      ? [
          [
            "Dashboard",
            "/resident",
            Home
          ],

          [
            "Bills",
            "/resident/bills",
            FileText
          ],

          [
            "Complaints",
            "/resident/complaints",
            MessageSquareWarning
          ],

          [
            "Visitors",
            "/resident/visitors",
            Users
          ],

          [
            "Vehicles",
            "/resident/vehicles",
            Car
          ],

          [
            "Committee",
            "/resident/community",
            MessageCircle
          ],

          [
            "Documents",
            "/resident/documents",
            FileStack
          ],

          [
            "Notifications",
            "/resident/notifications",
            Bell
          ],

          [
            "Emergency Contacts",
            "/resident/emergency-contacts",
            ShieldCheck
          ]

        ] as const

      : role === "security"

        ? [
            [
              "Security Dashboard",
              "/security",
              ShieldCheck
            ],

            [
              "Visitor Control",
              "/security/operations",
              Users
            ],

            [
              "Gate QR / OTP Scan",
              "/security/gate-scan",
              FileStack
            ],

            [
              "Attendance & Shift",
              "/security",
              CalendarCheck2
            ],

            [
              "Committee",
              "/security/community",
              MessageCircle
            ],

            [
              "Documents",
              "/security/documents",
              FileStack
            ],

            [
              "Emergency Contacts",
              "/security/emergency-contacts",
              ShieldCheck
            ]

          ] as const

        : role === "staff"

          ? [
              [
                "Staff Workspace",
                "/staff",
                Home
              ],

              [
                "Attendance & Shift",
                "/staff/attendance",
                CalendarCheck2
              ],

              [
                "Assigned Work",
                "/staff",
                FileText
              ],

              [
                "Committee",
                "/staff/community",
                MessageCircle
              ],

              [
                "Documents",
                "/staff/documents",
                FileStack
              ]

            ] as const

          : [
              [
                "Committee Dashboard",
                "/committee",
                Users
              ],

              [
                "Committee Group",
                "/committee/community",
                MessageCircle
              ],

              [
                "Documents",
                "/committee/documents",
                FileStack
              ],

              [
                "Emergency Contacts",
                "/committee/emergency-contacts",
                ShieldCheck
              ]

            ] as const;


  /* =========================================================
     LOGOUT
  ========================================================= */

  function handleLogout() {

    logout();

    navigate(
      "/login"
    );

  }


  return (

    <div
      style={{
        minHeight:
          "100vh",

        background:
          "var(--as-bg, #f8fafc)",

        display:
          "flex"
      }}
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        style={{
          width:
            250,

          background:
            "#0f172a",

          minHeight:
            "100vh",

          padding:
            20,

          boxSizing:
            "border-box",

          flexShrink:
            0
        }}
      >

        {/* BRAND */}

        <div
          style={{
            color:
              "white",

            fontWeight:
              800,

            fontSize:
              20,

            marginBottom:
              8
          }}
        >
          AS CROWN
        </div>


        <div
          style={{
            color:
              "#94a3b8",

            fontSize:
              11,

            marginBottom:
              22,

            letterSpacing:
              0.5
          }}
        >
          MY SOCIETY PORTAL
        </div>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        {items.map(
          ([
            label,
            path,
            Icon
          ]) => {

            const active =
              location.pathname ===
              path;


            const isNotification =
              path ===
              "/resident/notifications";


            return (

              <Link
                key={
                  path
                }

                to={
                  path
                }

                style={{
                  display:
                    "flex",

                  gap:
                    10,

                  alignItems:
                    "center",

                  padding:
                    "11px 12px",

                  borderRadius:
                    10,

                  marginBottom:
                    6,

                  color:
                    active
                      ? "#fff"
                      : "#cbd5e1",

                  background:
                    active
                      ? "#1d4ed8"
                      : "transparent",

                  textDecoration:
                    "none",

                  position:
                    "relative",

                  transition:
                    "background 0.15s ease"
                }}
              >

                <Icon
                  size={
                    17
                  }
                />


                <span
                  style={{
                    flex:
                      1
                  }}
                >
                  {
                    label
                  }
                </span>


                {/* =================================================
                    UNREAD NOTIFICATION BADGE
                ================================================= */}

                {
                  isNotification &&
                  unreadCount >
                    0 &&
                  (
                    <span
                      style={{
                        minWidth:
                          20,

                        height:
                          20,

                        padding:
                          "0 6px",

                        borderRadius:
                          999,

                        background:
                          "#ef4444",

                        color:
                          "white",

                        display:
                          "inline-flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        fontSize:
                          10,

                        fontWeight:
                          800,

                        lineHeight:
                          1,

                        boxSizing:
                          "border-box"
                      }}
                    >

                      {
                        unreadCount >
                        99
                          ? "99+"
                          : unreadCount
                      }

                    </span>
                  )
                }

              </Link>

            );

          }
        )}


        {/* =================================================
            THEME
        ================================================= */}

        <button
          type="button"
          onClick={
            toggleTheme
          }
          title={
            theme ===
              "light"
              ? "Switch to dark mode"
              : "Switch to light mode"
          }
          style={{
            marginTop:
              14,

            width:
              "100%",

            border:
              "1px solid rgba(255,255,255,.08)",

            background:
              "#172033",

            color:
              "#cbd5e1",

            borderRadius:
              10,

            padding:
              11,

            display:
              "flex",

            gap:
              9,

            alignItems:
              "center",

            justifyContent:
              "center",

            cursor:
              "pointer",

            fontWeight:
              700
          }}
        >

          {
            theme ===
              "light"
              ? "☾  Dark Mode"
              : "☀  Light Mode"
          }

        </button>


        {/* =================================================
            LOGOUT
        ================================================= */}

        <button
          type="button"

          onClick={
            handleLogout
          }

          style={{
            marginTop:
              30,

            width:
              "100%",

            border:
              0,

            background:
              "#1e293b",

            color:
              "#cbd5e1",

            borderRadius:
              10,

            padding:
              12,

            display:
              "flex",

            gap:
              9,

            alignItems:
              "center",

            cursor:
              "pointer"
          }}
        >

          <LogOut
            size={
              16
            }
          />

          Logout

        </button>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main
        style={{
          flex:
            1,

          padding:
            28,

          minWidth:
            0,

          boxSizing:
            "border-box"
        }}
      >

        {children}

      </main>

    </div>

  );

}
