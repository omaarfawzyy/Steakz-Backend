import { Role } from "@prisma/client";
import { z } from "zod";

const roleSchema = z.enum([
  "ADMIN",
  "HQ_MANAGER",
  "BRANCH_MANAGER",
  "CHEF",
  "WAITER",
  "CUSTOMER"
]) as z.ZodType<Role>;

export const createUserSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().min(7).max(20).optional(),
    password: z.string().min(8).max(100),
    role: roleSchema,
    branchId: z.string().optional()
  })
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: roleSchema,
    branchId: z.string().nullable().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    userId: z.string().min(1)
  })
});
