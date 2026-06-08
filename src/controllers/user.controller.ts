import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getBranchFilter } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getRequiredParam, getStringQuery } from "../utils/request";
import { serializeUser } from "../utils/serializers";

const WAITER_ROLE = "WAITER" as Role;
const branchBoundRoles = new Set<Role>([Role.BRANCH_MANAGER, Role.CHEF, WAITER_ROLE]);

export const listUsers = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const requestedBranchId = getStringQuery(request.query.branchId);
  const where = getBranchFilter(request.user, requestedBranchId);

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  response.json({
    success: true,
    data: users.map(serializeUser)
  });
});

export const createUser = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const { fullName, email, phone, password, role, branchId } = request.body as {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role: Role;
    branchId?: string;
  };

  if (role === Role.ADMIN && request.user.role !== Role.ADMIN) {
    throw new AppError(403, "Only Admin can create another admin.");
  }

  if (branchBoundRoles.has(role) && !branchId) {
    throw new AppError(400, "A branch must be assigned for branch-based roles.");
  }

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
      role,
      branchId: branchBoundRoles.has(role) ? branchId : null
    }
  });

  response.status(201).json({
    success: true,
    message: "User created successfully.",
    data: serializeUser(user)
  });
});

export const updateUserRole = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  if (request.user.role !== Role.ADMIN) {
    throw new AppError(403, "Only Admin can modify roles and account status.");
  }

  const userId = getRequiredParam(request.params.userId, "userId");
  const { role, branchId, isActive } = request.body as {
    role: Role;
    branchId?: string | null;
    isActive?: boolean;
  };

  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new AppError(404, "User not found.");
  }

  if (role === Role.ADMIN && request.user.id === userId && isActive === false) {
    throw new AppError(400, "You cannot deactivate your own admin account.");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      branchId: branchBoundRoles.has(role) ? branchId ?? existingUser.branchId : null,
      isActive: isActive ?? existingUser.isActive
    }
  });

  response.json({
    success: true,
    message: "User role updated successfully.",
    data: serializeUser(user)
  });
});

export const deleteUser = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  if (request.user.role !== Role.ADMIN) {
    throw new AppError(403, "Only Admin can delete users.");
  }

  const userId = getRequiredParam(request.params.userId, "userId");

  if (request.user.id === userId) {
    throw new AppError(400, "You cannot delete your own admin account.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!existingUser) {
    throw new AppError(404, "User not found.");
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false }
  });

  response.json({
    success: true,
    message: "User deactivated successfully.",
    data: serializeUser(user)
  });
});
