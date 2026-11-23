import {
  Router
} from "express";


import {
  authenticate,
  authorize
} from "../middleware/auth.js";


import {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  acknowledgeComplaint,
  getComplaintStats
} from "../controllers/complaints.controller.js";


const router =
  Router();


/* =========================================================
   STATS
========================================================= */

router.get(
  "/stats",
  authenticate,
  authorize("admin"),
  getComplaintStats
);


/* =========================================================
   RESIDENT ACKNOWLEDGEMENT
   Must be BEFORE /:id
========================================================= */

router.patch(
  "/:id/acknowledge",
  authenticate,
  authorize("resident"),
  acknowledgeComplaint
);


/* =========================================================
   ADMIN LIST
========================================================= */

router.get(
  "/",
  authenticate,
  authorize("admin"),
  getComplaints
);


/* =========================================================
   ADMIN DETAILS
========================================================= */

router.get(
  "/:id",
  authenticate,
  authorize("admin"),
  getComplaintById
);


/* =========================================================
   ADMIN CREATE
========================================================= */

router.post(
  "/",
  authenticate,
  authorize("admin"),
  createComplaint
);


/* =========================================================
   ADMIN UPDATE
========================================================= */

router.put(
  "/:id",
  authenticate,
  authorize("admin"),
  updateComplaint
);


export default router;