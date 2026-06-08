import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  updateMenuItem
} from "../controllers/menu.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createMenuItemSchema, updateMenuItemSchema } from "../validators/menu.validator";

const router = Router();

router.get("/", listMenuItems);
router.post(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER),
  validate(createMenuItemSchema),
  createMenuItem
);
router.patch(
  "/:itemId",
  authenticate,
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER),
  validate(updateMenuItemSchema),
  updateMenuItem
);
router.delete(
  "/:itemId",
  authenticate,
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER),
  deleteMenuItem
);

export default router;

