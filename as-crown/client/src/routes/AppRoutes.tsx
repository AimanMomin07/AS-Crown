import {
  Routes,
  Route
} from "react-router-dom";


/* =========================================================
   PUBLIC
========================================================= */

import Login
  from "../pages/auth/Login";

import Register
  from "../pages/auth/Register";

import ForgotPassword
  from "../pages/auth/ForgotPassword";


/* =========================================================
   COMMON
========================================================= */

import DashboardRedirect
  from "../pages/DashboardRedirect";

import ProtectedRoute
  from "./ProtectedRoute";


/* =========================================================
   ADMIN
========================================================= */

import AdminLayout
  from "../components/admin/AdminLayout";

import AdminDashboard
  from "../pages/admin/AdminDashboard";

import AdminUsers
  from "../pages/admin/AdminUsers";

import AdminResidents
  from "../pages/admin/AdminResidents";

import AdminBuildings
  from "../pages/admin/AdminBuildings";

import AdminFlats
  from "../pages/admin/AdminFlats";

import AdminComplaints
  from "../pages/admin/AdminComplaints";

import AdminBills
  from "../pages/admin/AdminBills";

import AdminPayments
  from "../pages/admin/AdminPayments";

import AdminVisitors
  from "../pages/admin/AdminVisitors";

import AdminVehicles
  from "../pages/admin/AdminVehicles";

import AdminStaff
  from "../pages/admin/AdminStaff";

import AdminAnnouncements
  from "../pages/admin/AdminAnnouncements";

import AdminNotifications
  from "../pages/admin/AdminNotifications";

import AdminReports
  from "../pages/admin/AdminReports";

import AdminProfile
  from "../pages/admin/AdminProfile";

import AdminBillingEngine
  from "../pages/admin/AdminBillingEngine";


/* =========================================================
   RESIDENT
========================================================= */

import ResidentLayout
  from "../components/resident/ResidentLayout";

import ResidentDashboard
  from "../components/resident/ResidentDashboard";

import ResidentHome
  from "../components/resident/ResidentHome";

import ResidentBills
  from "../components/resident/ResidentBills";

import ResidentPayments
  from "../components/resident/ResidentPayments";

import ResidentVisitorsHub
  from "../pages/portal/ResidentVisitorsHub";

import ResidentComplaints
  from "../components/resident/ResidentComplaints";

import ResidentFamily
  from "../components/resident/ResidentFamily";

import ResidentAnnouncements
  from "../components/resident/ResidentAnnouncements";

import ResidentVehicles
  from "../pages/portal/ResidentVehicles";

import ResidentNotifications
  from "../pages/portal/ResidentNotifications";

  import ResidentProfile
  from "../components/resident/ResidentProfile";

import ResidentDocuments
  from "../pages/portal/ResidentDocuments";

import ResidentEmergencyContacts
  from "../pages/portal/ResidentEmergencyContacts";

import PortalLayout
  from "../components/portal/PortalLayout";

/* =========================================================
   NEW FEATURES
========================================================= */

import SecurityGateScan
  from "../pages/portal/SecurityGateScan";

import ResidentAmenityBooking
  from "../pages/portal/ResidentAmenityBooking";

import AdminAmenities
  from "../pages/admin/AdminAmenities";

import ResidentMarketplace
  from "../pages/portal/ResidentMarketplace";

import AdminVendors
  from "../pages/admin/AdminVendors";

import SustainabilityDashboard
  from "../pages/portal/SustainabilityDashboard";

import AdminDuesIntelligence
  from "../pages/admin/AdminDuesIntelligence";

import AdminSOSAlerts
  from "../pages/admin/AdminSOSAlerts";

/* =========================================================
   OTHER ROLE PORTALS
========================================================= */

import StaffDashboard
  from "../pages/portal/StaffDashboard";

import StaffAttendance
  from "../pages/staff/StaffAttendance";

import SecurityDashboard
  from "../pages/portal/SecurityDashboard";

import CommitteeDashboard
  from "../pages/portal/CommitteeDashboard";

import AdminAnalytics
  from "../pages/admin/AdminAnalytics";

import AdminMaintenanceRates
  from "../pages/admin/AdminMaintenanceRates";

import AdminComplaintWorkflow 
  from "../pages/admin/AdminComplaintWorkflow";
import AdminAttendance 
  from "../pages/admin/AdminAttendance";
import AdminAuditLogs 
  from "../pages/admin/AdminAuditLogs";
import AdminEmergencyContacts 
  from "../pages/admin/AdminEmergencyContacts";
import AdminPermissions 
  from "../pages/admin/AdminPermissions";
import SecurityOperations 
  from "../pages/portal/SecurityOperations";
import Community 
  from "../pages/portal/Community";



/* =========================================================
   PLACEHOLDER
========================================================= */

function Placeholder({
  title
}: {
  title:
    string;
}) {

  return (

    <div
      style={{
        minHeight:
          "70vh",

        padding:
          "50px",

        background:
          "#f8fafc",

        boxSizing:
          "border-box"
      }}
    >

      <div
        style={{
          maxWidth:
            900,

          margin:
            "0 auto",

          background:
            "white",

          border:
            "1px solid #e2e8f0",

          borderRadius:
            18,

          padding:
            30
        }}
      >

        <h1>
          {title}
        </h1>


        <p
          style={{
            color:
              "#64748b"
          }}
        >
          AS CROWN module is under development.
        </p>

      </div>

    </div>

  );

}


/* =========================================================
   ROUTES
========================================================= */

export default function AppRoutes() {

  return (

    <Routes>


      {/* =====================================================
          PUBLIC
      ===================================================== */}

      <Route
        path="/"
        element={
          <Login />
        }
      />


      <Route
        path="/login"
        element={
          <Login />
        }
      />


      <Route
        path="/register"
        element={
          <Register />
        }
      />

      <Route
        path="/forgot-password"
        element={
          <ForgotPassword />
        }
      />


      {/* =====================================================
          PROTECTED
      ===================================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >


        {/* ===================================================
            COMMON DASHBOARD REDIRECT
        =================================================== */}

        <Route
          path="/dashboard"
          element={
            <DashboardRedirect />
          }
        />


        {/* ===================================================
            ADMIN
        =================================================== */}

        <Route
          path="/admin/dashboard"
          element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/users"
          element={
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/residents"
          element={
            <AdminLayout>
              <AdminResidents />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/buildings"
          element={
            <AdminLayout>
              <AdminBuildings />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/flats"
          element={
            <AdminLayout>
              <AdminFlats />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/complaints"
          element={
            <AdminLayout>
              <AdminComplaints />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/bills"
          element={
            <AdminLayout>
              <AdminBills />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/payments"
          element={
            <AdminLayout>
              <AdminPayments />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/visitors"
          element={
            <AdminLayout>
              <AdminVisitors />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/vehicles"
          element={
            <AdminLayout>
              <AdminVehicles />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/staff"
          element={
            <AdminLayout>
              <AdminStaff />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/announcements"
          element={
            <AdminLayout>
              <AdminAnnouncements />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/notifications"
          element={
            <AdminLayout>
              <AdminNotifications />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/reports"
          element={
            <AdminLayout>
              <AdminReports />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/profile"
          element={
            <AdminLayout>
              <AdminProfile />
            </AdminLayout>
          }
        />


        <Route
          path="/admin/settings"
          element={
            <AdminLayout>
              <Placeholder
                title="AS CROWN Settings"
              />
            </AdminLayout>
          }
        />


        <Route
  path="/admin/analytics"
  element={
    <AdminLayout>
      <AdminAnalytics />
    </AdminLayout>
  }
/>

<Route
  path="/admin/maintenance-rates"
  element={
    <AdminLayout>
      <AdminMaintenanceRates />
    </AdminLayout>
  }
/>

<Route
  path="/admin/billing-engine"
  element={
    <AdminLayout>
      <AdminBillingEngine />
    </AdminLayout>
  }
/>

<Route 
  path="/admin/complaint-workflow" 
  element={
  <AdminLayout>
    <AdminComplaintWorkflow />
    </AdminLayout>
  } 
/>
        <Route
          path="/admin/attendance" 
          element={
          <AdminLayout>
            <AdminAttendance />
            </AdminLayout>
          }
        />
        <Route 
          path="/admin/audit-logs" 
          element={
          <AdminLayout>
            <AdminAuditLogs />
            </AdminLayout>
          } 
        />
        <Route
          path="/admin/emergency-contacts" 
          element={
          <AdminLayout>
            <AdminEmergencyContacts />
            </AdminLayout>
          } 
        />
        <Route 
          path="/admin/permissions" 
          element={
          <AdminLayout>
            <AdminPermissions />
            </AdminLayout>
          } 
        />



        {/* ===================================================
            RESIDENT
        =================================================== */}

        <Route
          path="/resident"
          element={
            <ResidentLayout>
              <ResidentDashboard />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/home"
          element={
            <ResidentLayout>
              <ResidentHome />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/bills"
          element={
            <ResidentLayout>
              <ResidentBills />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/payments"
          element={
            <ResidentLayout>
              <ResidentPayments />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/visitors"
          element={
            <ResidentLayout>
              <ResidentVisitorsHub />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/complaints"
          element={
            <ResidentLayout>
              <ResidentComplaints />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/family"
          element={
            <ResidentLayout>
              <ResidentFamily />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/announcements"
          element={
            <ResidentLayout>
              <ResidentAnnouncements />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/vehicles"
          element={
            <ResidentLayout>
              <ResidentVehicles />
            </ResidentLayout>
          }
        />


        <Route
          path="/resident/notifications"
          element={
            <ResidentLayout>
              <ResidentNotifications />
            </ResidentLayout>
          }
        />


        {/* ===================================================
            NEW FEATURES — RESIDENT
        =================================================== */}

        <Route
          path="/resident/amenities"
          element={
            <ResidentLayout>
              <ResidentAmenityBooking />
            </ResidentLayout>
          }
        />

        <Route
          path="/resident/marketplace"
          element={
            <ResidentLayout>
              <ResidentMarketplace />
            </ResidentLayout>
          }
        />

        <Route
          path="/resident/sustainability"
          element={
            <ResidentLayout>
              <SustainabilityDashboard />
            </ResidentLayout>
          }
        />


        {/* ===================================================
            RESIDENT PROFILE
        =================================================== */}

         <Route
  path="/resident/profile"
  element={
    <ResidentLayout>
      <ResidentProfile />
    </ResidentLayout>
  }
/>


        <Route
          path="/resident/documents"
          element={
            <ResidentLayout>
              <ResidentDocuments />
            </ResidentLayout>
          }
        />

        <Route
          path="/resident/emergency-contacts"
          element={
            <ResidentLayout>
              <ResidentEmergencyContacts />
            </ResidentLayout>
          }
        />


        {/* ===================================================
            STAFF
        =================================================== */}

        <Route
          path="/staff"
          element={
            <PortalLayout>
              <StaffDashboard />
            </PortalLayout>
          }
        />

        <Route
          path="/staff/attendance"
          element={
            <PortalLayout>
              <StaffAttendance />
            </PortalLayout>
          }
        />

        <Route
          path="/staff/community"
          element={
            <PortalLayout>
              <Community />
            </PortalLayout>
          }
        />

        <Route
          path="/staff/documents"
          element={
            <PortalLayout>
              <ResidentDocuments />
            </PortalLayout>
          }
        />

        <Route
          path="/staff/emergency-contacts"
          element={
            <PortalLayout>
              <ResidentEmergencyContacts />
            </PortalLayout>
          }
        />


        {/* ===================================================
            SECURITY
        =================================================== */}

        <Route
          path="/security"
          element={
            <PortalLayout>
              <SecurityDashboard />
            </PortalLayout>
          }
        />

        <Route
          path="/security/operations"
          element={
            <PortalLayout>
              <SecurityOperations />
            </PortalLayout>
          }
        />

        <Route
          path="/security/sos-alerts"
          element={
            <PortalLayout>
              <AdminSOSAlerts />
            </PortalLayout>
          }
        />


        <Route
          path="/security/gate-scan"
          element={
            <PortalLayout>
              <SecurityGateScan />
            </PortalLayout>
          }
        />

        <Route
          path="/security/community"
          element={
            <PortalLayout>
              <Community />
            </PortalLayout>
          }
        />

        <Route
          path="/security/documents"
          element={
            <PortalLayout>
              <ResidentDocuments />
            </PortalLayout>
          }
        />

        <Route
          path="/security/emergency-contacts"
          element={
            <PortalLayout>
              <ResidentEmergencyContacts />
            </PortalLayout>
          }
        />

        <Route
          path="/admin/sos-alerts"
          element={
            <AdminLayout>
              <AdminSOSAlerts />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/amenities"
          element={
            <AdminLayout>
              <AdminAmenities />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/vendors"
          element={
            <AdminLayout>
              <AdminVendors />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/dues-intelligence"
          element={
            <AdminLayout>
              <AdminDuesIntelligence />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/sustainability"
          element={
            <AdminLayout>
              <SustainabilityDashboard />
            </AdminLayout>
          }
        />

        <Route
          path="/admin/community"
          element={
            <AdminLayout>
              <Community />
            </AdminLayout>
          }
        />

        {/* ===================================================
            COMMITTEE
        =================================================== */}

        <Route
          path="/committee"
          element={
            <PortalLayout>
              <CommitteeDashboard />
            </PortalLayout>
          }
        />

        <Route
          path="/committee/community"
          element={
            <PortalLayout>
              <Community />
            </PortalLayout>
          }
        />

        <Route
          path="/committee/documents"
          element={
            <PortalLayout>
              <ResidentDocuments />
            </PortalLayout>
          }
        />

        <Route
          path="/committee/emergency-contacts"
          element={
            <PortalLayout>
              <ResidentEmergencyContacts />
            </PortalLayout>
          }
        />

        <Route
  path="/resident/community"
  element={
    <ResidentLayout>
      <Community />
    </ResidentLayout>
  }
/>


      </Route>


      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={
          <Placeholder
            title="Page Not Found"
          />
        }
      />

    </Routes>

  );

}