import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createBranch,
  deleteBranch,
  listBranches,
  updateBranch
} from "../controllers/branch.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createBranchSchema, updateBranchSchema } from "../validators/branch.validator";

const router = Router();

router.get("/", listBranches);
router.post("/", authenticate, authorize(Role.ADMIN, Role.HQ_MANAGER), validate(createBranchSchema), createBranch);
router.patch(
  "/:branchId",
  authenticate,
  authorize(Role.ADMIN),
  validate(updateBranchSchema),
  updateBranch
);
router.delete("/:branchId", authenticate, authorize(Role.ADMIN, Role.HQ_MANAGER), deleteBranch);

export default router;
