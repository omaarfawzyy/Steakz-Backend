import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { AppError } from "../utils/app-error";

const router = Router();

const inventoryDisabled = (
  _request: Request,
  _response: Response,
  next: NextFunction
) => next(new AppError(403, "Inventory access is disabled for all roles."));

router.use(authenticate);
router.all("/", inventoryDisabled);
router.all("/:itemId", inventoryDisabled);

export default router;
