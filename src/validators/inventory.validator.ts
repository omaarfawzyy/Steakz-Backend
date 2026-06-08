import { z } from "zod";

export const createInventoryItemSchema = z.object({
  body: z.object({
    branchId: z.string().optional(),
    name: z.string().min(2).max(120),
    sku: z.string().min(2).max(40),
    quantityOnHand: z.number().int().nonnegative(),
    reorderLevel: z.number().int().nonnegative(),
    unit: z.string().min(1).max(20)
  })
});

export const updateInventoryItemSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(120).optional(),
    quantityOnHand: z.number().int().nonnegative().optional(),
    reorderLevel: z.number().int().nonnegative().optional(),
    unit: z.string().min(1).max(20).optional(),
    lastRestockedAt: z.string().datetime().optional()
  }),
  params: z.object({
    itemId: z.string().min(1)
  })
});

