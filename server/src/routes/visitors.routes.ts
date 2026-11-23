import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  getVisitors,
  createVisitor,
  updateVisitorStatus
} from "../controllers/visitors.controller.js";


const router =
  Router();


router.use(
  authenticate,
  authorize("admin")
);


router.get(
  "/",
  getVisitors
);


router.post(
  "/",
  createVisitor
);


router.patch(
  "/:id/status",
  updateVisitorStatus
);


export default router;