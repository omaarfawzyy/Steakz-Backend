import type { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getBranchFilter } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getStringQuery } from "../utils/request";

export const getSalesSummary = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = getStringQuery(request.query.branchId);
  const branchFilter = getBranchFilter(request.user, branchId);

  const [totalOrders, completedOrders, revenueAggregate, salesByBranch] =
    await Promise.all([
      prisma.order.count({ where: branchFilter }),
      prisma.order.count({
        where: {
          ...branchFilter,
          status: "COMPLETED"
        }
      }),
      prisma.order.aggregate({
        where: branchFilter,
        _sum: { totalAmount: true },
        _avg: { totalAmount: true }
      }),
      prisma.order.groupBy({
        by: ["branchId"],
        where: branchFilter,
        _count: { id: true },
        _sum: { totalAmount: true }
      })
    ]);

  const branches = await prisma.branch.findMany({
    where: {
      id: {
        in: salesByBranch.map((item) => item.branchId)
      }
    }
  });

  response.json({
    success: true,
    data: {
      totalOrders,
      completedOrders,
      totalSales: revenueAggregate._sum.totalAmount ?? 0,
      averageOrderValue: revenueAggregate._avg.totalAmount ?? 0,
      salesByBranch: salesByBranch.map((item) => {
        const branch = branches.find((candidate) => candidate.id === item.branchId);

        return {
          branchId: item.branchId,
          branchName: branch?.name ?? "Unknown branch",
          orderCount: item._count.id,
          totalSales: item._sum.totalAmount ?? 0
        };
      })
    }
  });
});

