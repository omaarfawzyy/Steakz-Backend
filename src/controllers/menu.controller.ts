import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { assertBranchAccess, resolveWriteBranchId } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getRequiredParam, getStringQuery } from "../utils/request";

export const listMenuItems = catchAsync(async (request: Request, response: Response) => {
  const branchId = getStringQuery(request.query.branchId);

  if (request.user && branchId) {
    assertBranchAccess(request.user, branchId);
  }

  const items = await prisma.menuItem.findMany({
    where: {
      ...(branchId ? { branchId } : {}),
      isActive: true
    },
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });

  response.json({
    success: true,
    data: items
  });
});

export const createMenuItem = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = resolveWriteBranchId(request.user, request.body.branchId);

  const item = await prisma.menuItem.create({
    data: {
      branchId,
      name: request.body.name,
      description: request.body.description,
      category: request.body.category,
      price: request.body.price,
      isActive: request.body.isActive ?? true
    }
  });

  response.status(201).json({
    success: true,
    message: "Menu item created successfully.",
    data: item
  });
});

export const updateMenuItem = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const itemId = getRequiredParam(request.params.itemId, "itemId");

  const existingItem = await prisma.menuItem.findUnique({
    where: { id: itemId }
  });

  if (!existingItem) {
    throw new AppError(404, "Menu item not found.");
  }

  assertBranchAccess(request.user, existingItem.branchId);

  const item = await prisma.menuItem.update({
    where: { id: itemId },
    data: request.body
  });

  response.json({
    success: true,
    message: "Menu item updated successfully.",
    data: item
  });
});

export const deleteMenuItem = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const itemId = getRequiredParam(request.params.itemId, "itemId");

  const existingItem = await prisma.menuItem.findUnique({
    where: { id: itemId }
  });

  if (!existingItem) {
    throw new AppError(404, "Menu item not found.");
  }

  assertBranchAccess(request.user, existingItem.branchId);

  const item = await prisma.menuItem.update({
    where: { id: itemId },
    data: { isActive: false }
  });

  response.json({
    success: true,
    message: "Menu item archived successfully.",
    data: item
  });
});
