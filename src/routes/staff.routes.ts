import { Router } from "express";
import { Role } from "@prisma/client";
import { listStaffMembers } from "../controllers/staff.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/", authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER), listStaffMembers);

export default router;

