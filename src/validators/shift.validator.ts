import { ShiftStatus } from "@prisma/client";
import { z } from "zod";

export const createShiftSchema = z.object({
  body: z.object({
    userId: z.string().min(1),
    branchId: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    notes: z.string().max(250).optional()
  })
});

export const updateShiftSchema = z.object({
  body: z.object({
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    status: z.nativeEnum(ShiftStatus).optional(),
    notes: z.string().max(250).optional()
  }),
  params: z.object({
    shiftId: z.string().min(1)
  })
});
