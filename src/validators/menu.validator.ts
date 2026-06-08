import { z } from "zod";

export const createMenuItemSchema = z.object({
  body: z.object({
    branchId: z.string().optional(),
    name: z.string().min(2).max(120),
    description: z.string().max(250).optional(),
    category: z.string().min(2).max(50),
    price: z.number().positive(),
    isActive: z.boolean().optional()
  })
});

export const updateMenuItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    description: z.string().max(250).optional(),
    category: z.string().min(2).max(50).optional(),
    price: z.number().positive().optional(),
    isActive: z.boolean().optional()
  }),
  params: z.object({
    itemId: z.string().min(1)
  })
});

