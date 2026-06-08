import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createShift,
  listShifts,
  updateShift
} from "../controllers/shift.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createShiftSchema, updateShiftSchema } from "../validators/shift.validator";

const router = Router();
const WAITER_ROLE = "WAITER" as Role;

router.use(authenticate);
router.get("/", authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER, Role.CHEF, WAITER_ROLE), listShifts);
router.post(
  "/",
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER),
  validate(createShiftSchema),
  createShift
);
router.patch(
  "/:shiftId",
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER, Role.CHEF, WAITER_ROLE),
  validate(updateShiftSchema),
  updateShift
);

export default router;
