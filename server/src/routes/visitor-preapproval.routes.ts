import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.js";
import {
  createPreapproval,
  getMyPreapprovals,
  cancelPreapproval,
  verifyPreapproval
} from "../controllers/visitor-preapproval.controller.js";

const router = Router();

router.use(authenticate);

// Resident actions
router.post("/", authorize("resident", "committee"), createPreapproval);
router.get("/mine", authorize("resident", "committee"), getMyPreapprovals);
router.delete("/:id", authorize("resident", "committee"), cancelPreapproval);

// Gate verification
router.post("/verify", authorize("security", "admin"), verifyPreapproval);

export default router;
