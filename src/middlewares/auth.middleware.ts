import type { NextFunction, Request, Response } from "express";
import jwt, { type SignOptions } from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";

type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
  branchId: string | null;
};

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  });

export const authenticate = async (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "Authentication token is missing.");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    });

    if (!user || !user.isActive) {
      throw new AppError(401, "User account is not available.");
    }

    request.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      branchId: user.branchId
    };

    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (
  request: Request,
  _response: Response,
  next: NextFunction
) => {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return next();
  }

  return authenticate(request, _response, next);
};

export const authorize =
  (...roles: Role[]) =>
  (request: Request, _response: Response, next: NextFunction) => {
    if (!request.user) {
      return next(new AppError(401, "Authentication is required."));
    }

    if (!roles.includes(request.user.role)) {
      return next(new AppError(403, "You do not have permission for this action."));
    }

    next();
  };
