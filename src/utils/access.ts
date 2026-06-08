import { Role } from "@prisma/client";
import { AppError } from "./app-error";

type RequestUser = NonNullable<Express.Request["user"]>;
const WAITER_ROLE = "WAITER" as Role;

export const isGlobalRole = (role: Role) =>
  role === Role.ADMIN || role === Role.HQ_MANAGER;

export const isBranchScopedRole = (role: Role) =>
  role === Role.BRANCH_MANAGER || role === Role.CHEF || role === WAITER_ROLE;

export const assertBranchAccess = (user: RequestUser, branchId: string) => {
  if (isGlobalRole(user.role)) {
    return;
  }

  if (!user.branchId) {
    throw new AppError(403, "No branch assigned to this account.");
  }

  if (user.branchId !== branchId) {
    throw new AppError(403, "You can only access data for your own branch.");
  }
};

export const getBranchFilter = (
  user: RequestUser,
  requestedBranchId?: string
) => {
  if (isGlobalRole(user.role)) {
    return requestedBranchId ? { branchId: requestedBranchId } : {};
  }

  if (isBranchScopedRole(user.role)) {
    if (!user.branchId) {
      throw new AppError(403, "No branch assigned to this account.");
    }

    if (requestedBranchId && requestedBranchId !== user.branchId) {
      throw new AppError(403, "You can only access data for your own branch.");
    }

    return { branchId: user.branchId };
  }

  return {};
};

export const resolveWriteBranchId = (
  user: RequestUser,
  requestedBranchId?: string
) => {
  if (isGlobalRole(user.role)) {
    if (!requestedBranchId) {
      throw new AppError(400, "branchId is required.");
    }

    return requestedBranchId;
  }

  if (!user.branchId) {
    throw new AppError(403, "No branch assigned to this account.");
  }

  if (requestedBranchId && requestedBranchId !== user.branchId) {
    throw new AppError(403, "You can only manage data for your own branch.");
  }

  return user.branchId;
};
