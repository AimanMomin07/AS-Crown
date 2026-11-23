import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getVehicles, createVehicle, updateVehicle } from "../controllers/vehicles.controller.js";

const router = Router();
router.use(authenticate, authorize("admin", "resident"));
router.get("/", getVehicles);
router.post("/", createVehicle);
router.put("/:id", updateVehicle);
export default router;
