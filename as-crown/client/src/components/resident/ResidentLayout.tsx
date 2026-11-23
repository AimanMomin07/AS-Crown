import {
  useState
} from "react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";

import {
  LayoutDashboard,
  Home,
  Receipt,
  CreditCard,
  Users,
  MessageSquareWarning,
  Car,
  UsersRound,
  FileText,
  Megaphone,
  Bell,
  UserCircle,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Menu,
  X,
  CalendarRange,
  Store,
  Leaf
} from "lucide-react";

import {
  useAuth
} from "../../context/AuthContext";

import SOSButton from "../common/SOSButton";


interface ResidentLayoutProps {
  children: React.ReactNode;
}


export default function ResidentLayout({
  children
}: ResidentLayoutProps) {

  const navigate =
    useNavigate();

  const {
    user,
    logout
  } =
    useAuth();

  const [
    mobileOpen,
    setMobileOpen
  ] =
    useState(false);


  const navigation = [

    {
      path:
        "/resident",
      label:
        "Dashboard",
      icon:
        LayoutDashboard
    },

    {
      path:
        "/resident/home",
      label:
        "My Home",
      icon:
        Home
    },

    {
      path:
        "/resident/bills",
      label:
        "Maintenance",
      icon:
        Receipt
    },

    {
      path:
        "/resident/payments",
      label:
        "Payments",
      icon:
        CreditCard
    },

    {
      path:
        "/resident/visitors",
      label:
        "Visitors",
      icon:
        Users
    },

    {
      path:
        "/resident/complaints",
      label:
        "Complaints",
      icon:
        MessageSquareWarning
    },

    {
      path:
        "/resident/vehicles",
      label:
        "Vehicles",
      icon:
        Car
    },

    {
      path:
        "/resident/family",
      label:
        "Family",
      icon:
        UsersRound
    },

    {
      path:
        "/resident/announcements",
      label:
        "Announcements",
      icon:
        Megaphone
    },

    {
      path:
        "/resident/community",
      label:
        "Committee",
      icon:
        MessageCircle
    },

    {
      path:
        "/resident/documents",
      label:
        "Documents",
      icon:
        FileText
    },

    {
      path:
        "/resident/emergency-contacts",
      label:
        "Emergency Contacts",
      icon:
        ShieldCheck
    },

    {
      path:
        "/resident/notifications",
      label:
        "Notifications",
      icon:
        Bell
    },

    {
      path:
        "/resident/profile",
      label:
        "My Profile",
      icon:
        UserCircle
    },

    {
      path:
        "/resident/amenities",
      label:
        "Amenity Booking",
      icon:
        CalendarRange
    },

    {
      path:
        "/resident/marketplace",
      label:
        "Marketplace",
      icon:
        Store
    },

    {
      path:
        "/resident/sustainability",
      label:
        "Sustainability",
      icon:
        Leaf
    }

  ];


  async function handleLogout() {

    try {

      await logout();

    } catch (
      error
    ) {

      console.error(
        error
      );

    }

    navigate(
      "/login",
      {
        replace:
          true
      }
    );

  }


  return (

    <div
      style={
        page
      }
    >

      {/* MOBILE HEADER */}

      <header
        style={
          mobileHeader
        }
      >

        <button
          type="button"
          onClick={() =>
            setMobileOpen(
              true
            )
          }
          style={
            iconButton
          }
        >

          <Menu
            size={21}
          />

        </button>


        <div
          style={
            mobileBrand
          }
        >
          AS CROWN
        </div>


        <button
          type="button"
          onClick={() =>
            navigate(
              "/resident/profile"
            )
          }
          style={
            iconButton
          }
        >

          <UserCircle
            size={21}
          />

        </button>

      </header>


      {/* SIDEBAR */}

      <aside
        style={
          sidebar
        }
      >

        <div
          style={
            brand
          }
        >

          <div
            style={
              brandMark
            }
          >
            AS
          </div>


          <div>

            <strong>
              AS CROWN
            </strong>

            <span>
              Resident Portal
            </span>

          </div>

        </div>


        <div
          style={
            residentCard
          }
        >

          <div
            style={
              avatar
            }
          >

            {
              user?.firstName
                ?.charAt(0)
                .toUpperCase() ||
              "R"
            }

          </div>


          <div
            style={{
              minWidth:
                0
            }}
          >

            <strong
              style={
                truncate
              }
            >

              {
                user?.firstName ||
                "Resident"
              }

            </strong>

            <span
              style={
                truncate
              }
            >
              Resident
            </span>

          </div>

        </div>


        <nav
          style={
            nav
          }
        >

          {navigation.map(
            item => {

              const Icon =
                item.icon;


              return (

                <NavLink
                  key={
                    item.path
                  }

                  to={
                    item.path
                  }

                  end={
                    item.path ===
                    "/resident"
                  }

                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }

                  style={
                    ({ isActive }) =>
                      ({
                        ...navLink,

                        ...(isActive
                          ? navLinkActive
                          : {})
                      })
                  }
                >

                  <Icon
                    size={18}
                  />

                  <span>
                    {
                      item.label
                    }
                  </span>

                </NavLink>

              );

            }
          )}

        </nav>


        <div
          style={
            sidebarBottom
          }
        >

          <button
            type="button"

            onClick={
              handleLogout
            }

            style={
              logoutButton
            }
          >

            <LogOut
              size={18}
            />

            Logout

          </button>

        </div>

      </aside>


      {/* MOBILE SIDEBAR */}

      {mobileOpen && (

        <div
          style={
            mobileOverlay
          }
        >

          <div
            style={
              mobileDrawer
            }
          >

            <div
              style={
                mobileDrawerHeader
              }
>

              <strong>
                AS CROWN
              </strong>


              <button
                type="button"

                onClick={() =>
                  setMobileOpen(
                    false
                  )
                }

                style={
                  iconButton
                }
              >

                <X
                  size={20}
                />

              </button>

            </div>


            {navigation.map(
              item => {

                const Icon =
                  item.icon;


                return (

                  <NavLink
                    key={
                      item.path
                    }

                    to={
                      item.path
                    }

                    end={
                      item.path ===
                      "/resident"
                    }

                    onClick={() =>
                      setMobileOpen(
                        false
                      )
                    }

                    style={
                      navLink
                    }
                  >

                    <Icon
                      size={18}
                    />

                    {
                      item.label
                    }

                  </NavLink>

                );

              }
            )}

          </div>

        </div>

      )}


      {/* MAIN */}

      <main
        style={
          main
        }
      >
        {children}
      </main>

      <SOSButton />

    </div>

  );

}


/* =========================================================
   STYLES
========================================================= */

const page:
  React.CSSProperties = {
    minHeight:
      "100vh",
    background:
      "#f8fafc"
  };


const sidebar:
  React.CSSProperties = {
    position:
      "fixed",
    top:
      0,
    left:
      0,
    bottom:
      0,
    width:
      255,
    background:
      "#0f172a",
    color:
      "white",
    padding:
      "20px 14px",
    display:
      "flex",
    flexDirection:
      "column",
    boxSizing:
      "border-box",
    zIndex:
      1000
  };


const brand:
  React.CSSProperties = {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      10,
    padding:
      "5px 8px 20px",
    borderBottom:
      "1px solid rgba(255,255,255,.08)"
  };


const brandMark:
  React.CSSProperties = {
    width:
      39,
    height:
      39,
    borderRadius:
      11,
    background:
      "#2563eb",
    display:
      "grid",
    placeItems:
      "center",
    fontWeight:
      900
  };


const residentCard:
  React.CSSProperties = {
    display:
      "flex",
    alignItems:
      "center",
    gap:
      10,
    margin:
      "18px 6px",
    padding:
      11,
    background:
      "rgba(255,255,255,.06)",
    borderRadius:
      12
  };


const avatar:
  React.CSSProperties = {
    width:
      37,
    height:
      37,
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
    fontWeight:
      800
  };


const truncate:
  React.CSSProperties = {
    display:
      "block",
    overflow:
      "hidden",
    textOverflow:
      "ellipsis",
    whiteSpace:
      "nowrap"
  };


const nav:
  React.CSSProperties = {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      4,
    overflowY:
      "auto",
    paddingRight:
      2
  };


const navLink:
  React.CSSProperties = {
    minHeight:
      43,
    padding:
      "0 12px",
    borderRadius:
      9,
    color:
      "#cbd5e1",
    textDecoration:
      "none",
    display:
      "flex",
    alignItems:
      "center",
    gap:
      10,
    fontSize:
      13,
    fontWeight:
      600
  };


const navLinkActive:
  React.CSSProperties = {
    background:
      "#2563eb",
    color:
      "white"
  };


const sidebarBottom:
  React.CSSProperties = {
    marginTop:
      "auto",
    paddingTop:
      15,
    borderTop:
      "1px solid rgba(255,255,255,.08)"
  };


const logoutButton:
  React.CSSProperties = {
    width:
      "100%",
    border:
      0,
    background:
      "transparent",
    color:
      "#cbd5e1",
    minHeight:
      43,
    borderRadius:
      9,
    display:
      "flex",
    alignItems:
      "center",
    gap:
      10,
    padding:
      "0 12px",
    cursor:
      "pointer",
    fontWeight:
      600
  };


const main:
  React.CSSProperties = {
    marginLeft:
      255,
    minHeight:
      "100vh"
  };


const mobileHeader:
  React.CSSProperties = {
    display:
      "none"
  };


const mobileBrand:
  React.CSSProperties = {
    fontWeight:
      900
  };


const iconButton:
  React.CSSProperties = {
    width:
      40,
    height:
      40,
    border:
      0,
    borderRadius:
      9,
    background:
      "transparent",
    cursor:
      "pointer",
    display:
      "grid",
    placeItems:
      "center",
    color:
      "inherit"
  };


const mobileOverlay:
  React.CSSProperties = {
    position:
      "fixed",
    inset:
      0,
    zIndex:
      3000,
    background:
      "rgba(15,23,42,.55)"
  };


const mobileDrawer:
  React.CSSProperties = {
    width:
      280,
    height:
      "100%",
    background:
      "#0f172a",
    color:
      "white",
    padding:
      18,
    boxSizing:
      "border-box",
    display:
      "flex",
    flexDirection:
      "column"
  };


const mobileDrawerHeader:
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