import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { catchAsync } from "../utils/catch-async";
import { getRequiredParam } from "../utils/request";

export const listBranches = catchAsync(async (_request: Request, response: Response) => {
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" }
  });

  response.json({
    success: true,
    data: branches
  });
});

export const createBranch = catchAsync(async (request: Request, response: Response) => {
  const branch = await prisma.branch.create({
    data: request.body
  });

  response.status(201).json({
    success: true,
    message: "Branch created successfully.",
    data: branch
  });
});

export const updateBranch = catchAsync(async (request: Request, response: Response) => {
  const branchId = getRequiredParam(request.params.branchId, "branchId");

  const existingBranch = await prisma.branch.findUnique({
    where: { id: branchId }
  });

  if (!existingBranch) {
    throw new AppError(404, "Branch not found.");
  }

  const branch = await prisma.branch.update({
    where: { id: branchId },
    data: request.body
  });

  response.json({
    success: true,
    message: "Branch updated successfully.",
    data: branch
  });
});

export const deleteBranch = catchAsync(async (request: Request, response: Response) => {
  const branchId = getRequiredParam(request.params.branchId, "branchId");

  const existingBranch = await prisma.branch.findUnique({
    where: { id: branchId }
  });

  if (!existingBranch) {
    throw new AppError(404, "Branch not found.");
  }

  const branchCount = await prisma.branch.count();

  if (branchCount <= 1) {
    throw new AppError(409, "At least one branch must remain in the system.");
  }

  await prisma.$transaction(async (transaction) => {
    const branchOrders = await transaction.order.findMany({
      where: { branchId },
      select: { id: true }
    });
    const orderIds = branchOrders.map((order) => order.id);

    await transaction.orderItem.deleteMany({
      where: {
        orderId: { in: orderIds }
      }
    });

    await transaction.order.deleteMany({ where: { branchId } });
    await transaction.shift.deleteMany({ where: { branchId } });
    await transaction.tableBooking.deleteMany({ where: { branchId } });
    await transaction.inventoryItem.deleteMany({ where: { branchId } });
    await transaction.menuItem.deleteMany({ where: { branchId } });

    await transaction.user.updateMany({
      where: { branchId },
      data: {
        branchId: null,
        isActive: false
      }
    });

    await transaction.branch.delete({
      where: { id: branchId }
    });
  });

  response.json({
    success: true,
    message: "Branch deleted successfully.",
    data: existingBranch
  });
});
