import { Router } from "express";
import { login, me, registerCustomer } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerCustomerSchema } from "../validators/auth.validator";

const router = Router();

router.post("/register-customer", validate(registerCustomerSchema), registerCustomer);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;

