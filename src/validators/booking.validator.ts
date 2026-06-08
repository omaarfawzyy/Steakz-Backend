import { BookingStatus } from "@prisma/client";
import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    branchId: z.string().min(1),
    customerName: z.string().min(2).max(120),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(7).max(20).optional(),
    partySize: z.number().int().min(1).max(20),
    bookingTime: z.string().datetime(),
    specialRequests: z.string().max(300).optional()
  })
});

export const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(BookingStatus)
  }),
  params: z.object({
    bookingId: z.string().min(1)
  })
});

