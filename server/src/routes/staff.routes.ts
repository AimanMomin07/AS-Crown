import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getStaff,
  createStaff,
  getAttendance,
  upsertAttendance,
  removeStaff
} from "../controllers/staff.controller.js";


const router =
  Router();


router.use(
  authenticate,
  authorize("admin")
);


router.get(
  "/",
  getStaff
);


router.post(
  "/",
  createStaff
);


router.delete(
  "/:id",
  removeStaff
);


export default router;