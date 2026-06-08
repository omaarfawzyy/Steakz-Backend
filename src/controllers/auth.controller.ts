import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { signToken } from "../middlewares/auth.middleware";
import { AppError } from "../utils/app-error";
import { catchAsync } from "../utils/catch-async";
import { serializeUser } from "../utils/serializers";

export const registerCustomer = catchAsync(async (request: Request, response: Response) => {
  const { fullName, email, password, phone } = request.body;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new AppError(409, "An account with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      phone,
      passwordHash,
      role: Role.CUSTOMER
    }
  });

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    branchId: user.branchId
  });

  response.status(201).json({
    success: true,
    message: "Customer account created successfully.",
    data: {
      token,
      user: serializeUser(user)
    }
  });
});

export const login = catchAsync(async (request: Request, response: Response) => {
  const { email, password } = request.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user || !user.isActive) {
    throw new AppError(401, "Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password.");
  }

  const token = signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    branchId: user.branchId
  });

  response.json({
    success: true,
    message: "Login successful.",
    data: {
      token,
      user: serializeUser(user)
    }
  });
});

export const me = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const user = await prisma.user.findUnique({
    where: { id: request.user.id }
  });

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  response.json({
    success: true,
    data: serializeUser(user)
  });
});

