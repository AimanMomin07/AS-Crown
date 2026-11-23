import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.js";
import { getDuesIntelligence } from "../controllers/dues-intelligence.controller.js";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", getDuesIntelligence);

export default router;
