import { z } from "zod";

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    code: z.string().min(3).max(20),
    city: z.string().min(2).max(80),
    address: z.string().min(5).max(200)
  })
});

export const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    city: z.string().min(2).max(80).optional(),
    address: z.string().min(5).max(200).optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    branchId: z.string().min(1)
  })
});

