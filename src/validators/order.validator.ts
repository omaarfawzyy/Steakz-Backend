import { OrderStatus } from "@prisma/client";
import { z } from "zod";

const customerOrderTypes = z.enum(["DINE_IN", "TAKEAWAY"]);

export const createOrderSchema = z.object({
  body: z.object({
    branchId: z.string().min(1),
    orderType: customerOrderTypes,
    notes: z.string().max(250).optional(),
    customerId: z.string().optional(),
    items: z
      .array(
        z.object({
          menuItemId: z.string().min(1),
          quantity: z.number().int().positive()
        })
      )
      .min(1)
  })
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(OrderStatus)
  }),
  params: z.object({
    orderId: z.string().min(1)
  })
});
