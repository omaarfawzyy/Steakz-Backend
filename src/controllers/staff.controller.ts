import type { Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { getBranchFilter } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getStringQuery } from "../utils/request";
import { serializeUser } from "../utils/serializers";

const WAITER_ROLE = "WAITER" as Role;
const staffRoles = [Role.ADMIN, Role.HQ_MANAGER, Role.BRANCH_MANAGER, Role.CHEF, WAITER_ROLE];

export const listStaffMembers = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = getStringQuery(request.query.branchId);
  const branchFilter = getBranchFilter(request.user, branchId);

  const staffMembers = await prisma.user.findMany({
    where: {
      ...branchFilter,
      role: {
        in: staffRoles
      }
    },
    include: {
      branch: true
    },
    orderBy: [{ role: "asc" }, { fullName: "asc" }]
  });

  response.json({
    success: true,
    data: staffMembers.map((member) => ({
      ...serializeUser(member),
      branchName: member.branch?.name ?? "Head office"
    }))
  });
});
