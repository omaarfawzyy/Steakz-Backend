import { Router } from "express";
import { Role } from "@prisma/client";
import { getSummaryReport } from "../controllers/report.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);
router.get("/summary", authorize(Role.HQ_MANAGER, Role.BRANCH_MANAGER), getSummaryReport);

export default router;
