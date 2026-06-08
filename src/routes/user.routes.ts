import { Router } from "express";
import { Role } from "@prisma/client";
import {
  createUser,
  deleteUser,
  listUsers,
  updateUserRole
} from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createUserSchema, updateUserRoleSchema } from "../validators/user.validator";

const router = Router();

router.use(authenticate);
router.get("/", authorize(Role.ADMIN, Role.HQ_MANAGER), listUsers);
router.post("/", authorize(Role.ADMIN, Role.HQ_MANAGER), validate(createUserSchema), createUser);
router.patch(
  "/:userId/role",
  authorize(Role.ADMIN),
  validate(updateUserRoleSchema),
  updateUserRole
);
router.delete("/:userId", authorize(Role.ADMIN), deleteUser);

export default router;

