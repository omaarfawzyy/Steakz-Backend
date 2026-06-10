import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createBooking,
  listBookings,
  updateBookingStatus
} from "../controllers/booking.controller";
import {
  authenticate,
  authorize
} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createBookingSchema,
  updateBookingStatusSchema
} from "../validators/booking.validator";

const router = Router();
const WAITER_ROLE = "WAITER" as Role;

router.post("/", authenticate, authorize(Role.CUSTOMER), validate(createBookingSchema), createBooking);
router.get(
  "/",
  authenticate,
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER, Role.CHEF, WAITER_ROLE, Role.CUSTOMER),
  listBookings
);
router.patch(
  "/:bookingId/status",
  authenticate,
  authorize(Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER),
  validate(updateBookingStatusSchema),
  updateBookingStatus
);

export default router;
