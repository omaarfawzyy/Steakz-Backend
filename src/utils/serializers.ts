import type { Prisma, User } from "@prisma/client";

type PublicUser = Pick<
  User,
  "id" | "fullName" | "email" | "phone" | "role" | "branchId" | "isActive" | "createdAt" | "updatedAt"
>;

export const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  role: true,
  branchId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.UserSelect;

export const serializeUser = (user: PublicUser) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  branchId: user.branchId,
  isActive: user.isActive,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});
