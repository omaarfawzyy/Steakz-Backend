import { Router } from "express";
import authRoutes from "./auth.routes";
import bookingRoutes from "./booking.routes";
import branchRoutes from "./branch.routes";
import inventoryRoutes from "./inventory.routes";
import menuRoutes from "./menu.routes";
import orderRoutes from "./order.routes";
import reportRoutes from "./report.routes";
import salesRoutes from "./sales.routes";
import shiftRoutes from "./shift.routes";
import staffRoutes from "./staff.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/bookings", bookingRoutes);
router.use("/branches", branchRoutes);
router.use("/users", userRoutes);
router.use("/menu", menuRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/orders", orderRoutes);
router.use("/sales", salesRoutes);
router.use("/shifts", shiftRoutes);
router.use("/staff", staffRoutes);
router.use("/reports", reportRoutes);

export default router;
