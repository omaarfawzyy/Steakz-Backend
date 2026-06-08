import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { assertBranchAccess, getBranchFilter, resolveWriteBranchId } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getRequiredParam, getStringQuery } from "../utils/request";

export const listInventoryItems = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = getStringQuery(request.query.branchId);
  const inventoryItems = await prisma.inventoryItem.findMany({
    where: getBranchFilter(request.user, branchId),
    orderBy: { name: "asc" }
  });

  response.json({
    success: true,
    data: inventoryItems
  });
});

export const createInventoryItem = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = resolveWriteBranchId(request.user, request.body.branchId);

  const inventoryItem = await prisma.inventoryItem.create({
    data: {
      branchId,
      name: request.body.name,
      sku: request.body.sku,
      quantityOnHand: request.body.quantityOnHand,
      reorderLevel: request.body.reorderLevel,
      unit: request.body.unit
    }
  });

  response.status(201).json({
    success: true,
    message: "Inventory item created successfully.",
    data: inventoryItem
  });
});

export const updateInventoryItem = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const itemId = getRequiredParam(request.params.itemId, "itemId");

  const existingItem = await prisma.inventoryItem.findUnique({
    where: { id: itemId }
  });

  if (!existingItem) {
    throw new AppError(404, "Inventory item not found.");
  }

  assertBranchAccess(request.user, existingItem.branchId);

  const inventoryItem = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: {
      ...request.body,
      ...(request.body.lastRestockedAt
        ? { lastRestockedAt: new Date(request.body.lastRestockedAt) }
        : {})
    }
  });

  response.json({
    success: true,
    message: "Inventory item updated successfully.",
    data: inventoryItem
  });
});
