import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import { getFamilyMembers, createFamilyMember, deleteFamilyMember } from "../controllers/family.controller.js";

const router = Router();
router.use(authenticate, authorize("admin"));
router.get("/user/:userId", getFamilyMembers);
router.post("/user/:userId", createFamilyMember);
router.delete("/:id", deleteFamilyMember);
export default router;
