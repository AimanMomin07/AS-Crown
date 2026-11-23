import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "path";

import authRoutes
  from "./routes/auth.routes.js";

import adminRoutes
  from "./routes/admin.routes.js";

import adminUserRoutes
  from "./routes/admin-users.routes.js";

import buildingsRoutes
  from "./routes/buildings.routes.js";

import flatRoutes
  from "./routes/flats.routes.js";

import residentRoutes
  from "./routes/residents.routes.js";

import familyRoutes
  from "./routes/family.routes.js";

import billRoutes
  from "./routes/bills.routes.js";

import paymentRoutes
  from "./routes/payments.routes.js";

import visitorRoutes
  from "./routes/visitors.routes.js";

import vehicleRoutes
  from "./routes/vehicles.routes.js";

import staffRoutes
  from "./routes/staff.routes.js";

import attendanceRoutes
  from "./routes/attendance.routes.js";

import announcementRoutes
  from "./routes/announcements.routes.js";

import notificationRoutes
  from "./routes/notifications.routes.js";

import complaintRoutes
  from "./routes/complaints.routes.js";

import flatAssignmentRoutes
  from "./routes/flat-assignment.routes.js";

import portalRoutes
  from "./routes/portal.routes.js";

import aiRoutes
  from "./routes/ai.routes.js";

import residentFlatRoutes
  from "./routes/resident-flat.routes.js";

import profileRoutes
  from "./routes/profile.routes.js";

  import adminAnalyticsRoutes
  from "./routes/admin-analytics.routes.js";

  import maintenanceRateRoutes
  from "./routes/maintenance-rates.routes.js";

  import maintenanceBillingRoutes
  from "./routes/maintenance-billing.routes.js";

  import reportsRoutes
  from "./routes/reports.routes.js";

  import globalSearchRoutes 
  from "./routes/global-search.routes.js";
import auditLogsRoutes 
from "./routes/audit-logs.routes.js";
import emergencyContactsRoutes 
from "./routes/emergency-contacts.routes.js";
import permissionsRoutes 
from "./routes/permissions.routes.js";
import communityRoutes 
from "./routes/community.routes.js";
import staffDashboardRoutes
from "./routes/staff-dashboard.routes.js";

import staffPortalRoutes
from "./routes/staff-portal.routes.js";

import securityPortalRoutes
from "./routes/security-portal.routes.js";
import documentRoutes
  from "./routes/documents.routes.js";

import visitorPreapprovalRoutes
  from "./routes/visitor-preapproval.routes.js";


dotenv.config();


/* =========================================================
   APP
========================================================= */

const app =
  express();


/* =========================================================
   SECURITY
========================================================= */

app.use(
  helmet()
);


app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",

    credentials:
      true
  })
);


app.use(
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit:
      200,

    standardHeaders:
      true,

    legacyHeaders:
      false
  })
);

app.use(
  "/api/staff-dashboard",
  staffDashboardRoutes
);

/* =========================================================
   BODY PARSERS
   Must run before routes that read req.body.
========================================================= */

app.use(
  express.json({
    limit:
      "1mb"
  })
);

app.use(
  express.urlencoded({
    extended:
      true
  })
);

/* =========================================================
   ROLE PORTAL ROUTES
========================================================= */

app.use(
  "/api/staff-portal",
  staffPortalRoutes
);

app.use(
  "/api/security-portal",
  securityPortalRoutes
);

app.use(
  "/api/visitor-preapproval",
  visitorPreapprovalRoutes
);



app.use(
  "/api/documents",
  documentRoutes
);

/* =========================================================
   LOGGING
========================================================= */

app.use(
  morgan("dev")
);


/* =========================================================
   STATIC FILES
========================================================= */

app.use(
  "/uploads/documents",
  (_req, res) => {
    return res.status(404).json({
      success: false,
      message: "Document downloads must use the authenticated document endpoint"
    });
  }
);

app.use(
  "/uploads",
  express.static(
    path.join(
      process.cwd(),
      "uploads"
    )
  )
);


/* =========================================================
   ROOT
========================================================= */

app.get(
  "/",
  (_req, res) => {

    return res.json({

      success:
        true,

      message:
        "AS CROWN API is running",

      society:
        "AS CROWN"

    });

  }
);


/* =========================================================
   HEALTH
========================================================= */

app.get(
  "/api/health",
  (_req, res) => {

    return res.json({

      success:
        true,

      message:
        "AS CROWN backend is healthy"

    });

  }
);


/* =========================================================
   AUTH
========================================================= */

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/reports",
  reportsRoutes
);

app.use(
  "/api/search",
   globalSearchRoutes
  );
app.use(
  "/api/audit-logs",
   auditLogsRoutes
  );
app.use(
  "/api/emergency-contacts",
   emergencyContactsRoutes
  );
app.use(
  "/api/permissions",
   permissionsRoutes
  );
app.use
("/api/community",
   communityRoutes
  );

/* =========================================================
   ADMIN
========================================================= */

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/admin/analytics",
  adminAnalyticsRoutes
);


/* =========================================================
   ADMIN RESIDENT / FLAT ASSIGNMENT
========================================================= */

app.use(
  "/api/admin/residents",
  residentFlatRoutes
);


/* =========================================================
   ADMIN USERS
========================================================= */

app.use(
  "/api/admin/users",
  adminUserRoutes
);


/* =========================================================
   BUILDINGS
========================================================= */

app.use(
  "/api/buildings",
  buildingsRoutes
);


/* =========================================================
   FLATS
========================================================= */

app.use(
  "/api/flats",
  flatRoutes
);


/* =========================================================
   FLAT ASSIGNMENT
========================================================= */

app.use(
  "/api/flats",
  flatAssignmentRoutes
);


/* =========================================================
   RESIDENT PORTAL

   IMPORTANT:
   Keep the singular /api/resident path because
   the frontend resident API calls use:

   /resident/dashboard
   /resident/home
   /resident/bills
   etc.

   We ALSO keep /api/residents temporarily for
   backward compatibility with any old frontend code.
========================================================= */

app.use(
  "/api/resident",
  residentRoutes
);


app.use(
  "/api/residents",
  residentRoutes
);


/* =========================================================
   PORTAL
========================================================= */

app.use(
  "/api/portal",
  portalRoutes
);


/* =========================================================
   AI
========================================================= */

app.use(
  "/api/ai",
  aiRoutes
);


/* =========================================================
   PROFILE
========================================================= */

app.use(
  "/api/profile",
  profileRoutes
);


/* =========================================================
   FAMILY
========================================================= */

app.use(
  "/api/family",
  familyRoutes
);


/* =========================================================
   MAINTENANCE BILLS
========================================================= */

app.use(
  "/api/bills",
  billRoutes
);

app.use(
  "/api/maintenance-rates",
  maintenanceRateRoutes
);

app.use(
  "/api/maintenance-billing",
  maintenanceBillingRoutes
);

/* =========================================================
   PAYMENTS
========================================================= */

app.use(
  "/api/payments",
  paymentRoutes
);


/* =========================================================
   COMPLAINTS
========================================================= */

app.use(
  "/api/complaints",
  complaintRoutes
);


/* =========================================================
   VISITORS
========================================================= */

app.use(
  "/api/visitors",
  visitorRoutes
);


/* =========================================================
   VEHICLES
========================================================= */

app.use(
  "/api/vehicles",
  vehicleRoutes
);


/* =========================================================
   STAFF
========================================================= */

app.use(
  "/api/staff",
  staffRoutes
);


/* =========================================================
   STAFF ATTENDANCE
========================================================= */

app.use(
  "/api/attendance",
  attendanceRoutes
);


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

app.use(
  "/api/announcements",
  announcementRoutes
);


/* =========================================================
   NOTIFICATIONS
========================================================= */

app.use(
  "/api/notifications",
  notificationRoutes
);


/* =========================================================
   404
========================================================= */

app.use(
  (_req, res) => {

    return res.status(
      404
    ).json({

      success:
        false,

      message:
        "API endpoint not found"

    });

  }
);


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    error:
      unknown,

    _req:
      express.Request,

    res:
      express.Response,

    _next:
      express.NextFunction
  ) => {

    console.error(
      "Unhandled server error:",
      error
    );


    return res.status(
      500
    ).json({

      success:
        false,

      message:
        "Internal server error"

    });

  }
);


export default app;