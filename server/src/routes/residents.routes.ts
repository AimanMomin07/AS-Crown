import {
  Router
} from "express";


import {
  authenticate,
  authorize
} from "../middleware/auth.js";


import {
  getResidentDashboard,
  getResidentHome,
  getResidentBills,
  getResidentBillById,
  getResidentPayments,
  createResidentPayment,
  getResidentVisitors,
  createResidentVisitor,
  updateResidentVisitorStatus,
  getResidentComplaints,
  getResidentComplaintById,
  createResidentComplaint,
  getResidentFamily,
  createResidentFamilyMember,
  removeResidentFamilyMember,
  getResidentAnnouncements,
  getResidentNotifications,
  markResidentNotificationRead,
  getResidentProfile,
  updateResidentProfile
} from "../controllers/residents.controller.js";


const router =
  Router();


/* =========================================================
   ALL RESIDENT ROUTES
========================================================= */

router.use(
  authenticate,
  authorize("resident")
);


/* =========================================================
   DASHBOARD
========================================================= */

router.get(
  "/dashboard",
  getResidentDashboard
);


/* =========================================================
   HOME
========================================================= */

router.get(
  "/home",
  getResidentHome
);


/* =========================================================
   BILLS
========================================================= */

router.get(
  "/bills",
  getResidentBills
);


router.get(
  "/bills/:id",
  getResidentBillById
);


/* =========================================================
   PAYMENTS
========================================================= */

router.get(
  "/payments",
  getResidentPayments
);


router.post(
  "/payments",
  createResidentPayment
);


/* =========================================================
   VISITORS
========================================================= */

router.get(
  "/visitors",
  getResidentVisitors
);


router.post(
  "/visitors",
  createResidentVisitor
);


router.patch(
  "/visitors/:id/status",
  updateResidentVisitorStatus
);


/* =========================================================
   COMPLAINTS
========================================================= */

router.get(
  "/complaints",
  getResidentComplaints
);


router.get(
  "/complaints/:id",
  getResidentComplaintById
);


router.post(
  "/complaints",
  createResidentComplaint
);


/* =========================================================
   FAMILY MEMBERS
========================================================= */

router.get(
  "/family",
  getResidentFamily
);


router.post(
  "/family",
  createResidentFamilyMember
);


router.delete(
  "/family/:id",
  removeResidentFamilyMember
);


/* =========================================================
   ANNOUNCEMENTS
========================================================= */

router.get(
  "/announcements",
  getResidentAnnouncements
);


/* =========================================================
   NOTIFICATIONS
========================================================= */

router.get(
  "/notifications",
  getResidentNotifications
);


router.patch(
  "/notifications/:id/read",
  markResidentNotificationRead
);


/* =========================================================
   PROFILE
========================================================= */

router.get(
  "/profile",
  getResidentProfile
);


router.put(
  "/profile",
  updateResidentProfile
);


export default router;