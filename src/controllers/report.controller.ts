import type { Request, Response } from "express";
import { OrderStatus, ShiftStatus } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getBranchFilter } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getStringQuery } from "../utils/request";

export const getSummaryReport = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = getStringQuery(request.query.branchId);
  const branchFilter = getBranchFilter(request.user, branchId);

  const [totalOrders, revenueAggregate, activeMenuItems, openShifts, activeOrders] =
    await Promise.all([
      prisma.order.count({ where: branchFilter }),
      prisma.order.aggregate({
        where: branchFilter,
        _sum: { totalAmount: true }
      }),
      prisma.menuItem.count({
        where: {
          ...branchFilter,
          isActive: true
        }
      }),
      prisma.shift.count({
        where: {
          ...branchFilter,
          status: {
            in: [ShiftStatus.SCHEDULED, ShiftStatus.ACTIVE]
          }
        }
      }),
      prisma.order.count({
        where: {
          ...branchFilter,
          status: {
            in: [OrderStatus.PENDING, OrderStatus.PREPARING, OrderStatus.READY]
          }
        }
      })
    ]);

  response.json({
    success: true,
    data: {
      totalOrders,
      totalRevenue: revenueAggregate._sum.totalAmount ?? 0,
      activeMenuItems,
      openShifts,
      activeOrders
    }
  });
});
