import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.js";
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
  requestService,
  getMyServiceRequests,
  getAllServiceRequests,
  updateServiceRequestStatus
} from "../controllers/vendors.controller.js";

const router = Router();

router.use(authenticate);

router.get("/", getVendors);
router.post("/", authorize("admin"), createVendor);
router.patch("/:id", authorize("admin"), updateVendor);
router.delete("/:id", authorize("admin"), deleteVendor);

router.post("/requests", authorize("resident", "committee"), requestService);
router.get("/requests/mine", authorize("resident", "committee"), getMyServiceRequests);
router.get("/requests/all", authorize("admin"), getAllServiceRequests);
router.patch("/requests/:id/status", authorize("admin"), updateServiceRequestStatus);

export default router;
