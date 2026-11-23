import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { askAssistant } from "../controllers/ai.controller.js";

const router = Router();
router.post("/ask", authenticate, authorize("admin", "resident", "staff", "security", "committee"), askAssistant);
export default router;
