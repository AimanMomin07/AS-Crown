import {
  Router
} from "express";

import {
  authenticate,
  authorize
} from "../middleware/auth.js";

import {
  generateMaintenanceBills
} from "../controllers/maintenance-billing.controller.js";


const router =
  Router();


router.use(
  authenticate,
  authorize("admin")
);


router.post(
  "/generate",
  generateMaintenanceBills
);


export default router;