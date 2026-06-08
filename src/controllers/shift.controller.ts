import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { assertBranchAccess, getBranchFilter, resolveWriteBranchId } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getRequiredParam, getStringQuery } from "../utils/request";

export const listShifts = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = getStringQuery(request.query.branchId);
  const branchFilter = getBranchFilter(request.user, branchId);
  const personalShiftFilter =
    request.user.role === Role.CHEF || request.user.role === ("WAITER" as Role)
      ? { userId: request.user.id }
      : {};

  const shifts = await prisma.shift.findMany({
    where: {
      ...branchFilter,
      ...personalShiftFilter
    },
    include: {
      user: true,
      branch: true
    },
    orderBy: { startTime: "asc" }
  });

  response.json({
    success: true,
    data: shifts
  });
});

export const createShift = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = resolveWriteBranchId(request.user, request.body.branchId);

  const shift = await prisma.shift.create({
    data: {
      branchId,
      userId: request.body.userId,
      startTime: new Date(request.body.startTime),
      endTime: request.body.endTime ? new Date(request.body.endTime) : null,
      notes: request.body.notes
    }
  });

  response.status(201).json({
    success: true,
    message: "Shift created successfully.",
    data: shift
  });
});

export const updateShift = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const shiftId = getRequiredParam(request.params.shiftId, "shiftId");

  const existingShift = await prisma.shift.findUnique({
    where: { id: shiftId }
  });

  if (!existingShift) {
    throw new AppError(404, "Shift not found.");
  }

  assertBranchAccess(request.user, existingShift.branchId);

  if (
    (request.user.role === Role.CHEF || request.user.role === ("WAITER" as Role)) &&
    existingShift.userId !== request.user.id
  ) {
    throw new AppError(403, "You can only update your own shifts.");
  }

  const shift = await prisma.shift.update({
    where: { id: shiftId },
    data: {
      ...(request.body.startTime ? { startTime: new Date(request.body.startTime) } : {}),
      ...(request.body.endTime ? { endTime: new Date(request.body.endTime) } : {}),
      ...(request.body.status ? { status: request.body.status } : {}),
      ...(request.body.notes ? { notes: request.body.notes } : {})
    }
  });

  response.json({
    success: true,
    message: "Shift updated successfully.",
    data: shift
  });
});
