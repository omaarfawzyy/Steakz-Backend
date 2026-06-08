import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createOrder,
  listOrders,
  updateOrderStatus
} from "../controllers/order.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../validators/order.validator";

const router = Router();
const WAITER_ROLE = "WAITER" as Role;

router.use(authenticate);
router.get(
  "/",
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER, Role.CHEF, WAITER_ROLE, Role.CUSTOMER),
  listOrders
);
router.post(
  "/",
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER, WAITER_ROLE, Role.CUSTOMER),
  validate(createOrderSchema),
  createOrder
);
router.patch(
  "/:orderId/status",
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER, Role.CHEF, WAITER_ROLE),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

export default router;
