import type { Request, Response } from "express";
import { BookingStatus, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { assertBranchAccess, getBranchFilter } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getRequiredParam, getStringQuery } from "../utils/request";
import { publicUserSelect, serializeUser } from "../utils/serializers";

const WAITER_ROLE = "WAITER" as Role;

export const createBooking = catchAsync(async (request: Request, response: Response) => {
  const {
    branchId,
    customerName,
    customerEmail,
    customerPhone,
    partySize,
    bookingTime,
    specialRequests
  } = request.body as {
    branchId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    partySize: number;
    bookingTime: string;
    specialRequests?: string;
  };

  const branch = await prisma.branch.findUnique({
    where: { id: branchId }
  });

  if (!branch || !branch.isActive) {
    throw new AppError(404, "Selected branch is not available for bookings.");
  }

  if (request.user && request.user.role !== Role.CUSTOMER) {
    assertBranchAccess(request.user, branchId);
  }

  const booking = await prisma.tableBooking.create({
    data: {
      branchId,
      customerId: request.user?.role === Role.CUSTOMER ? request.user.id : null,
      customerName,
      customerEmail,
      customerPhone,
      partySize,
      bookingTime: new Date(bookingTime),
      specialRequests
    },
    include: {
      branch: true
    }
  });

  response.status(201).json({
    success: true,
    message: "Table booking request created successfully.",
    data: booking
  });
});

export const listBookings = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = getStringQuery(request.query.branchId);
  const where =
    request.user.role === Role.CUSTOMER
      ? { customerId: request.user.id }
      : getBranchFilter(request.user, branchId);

  const bookings = await prisma.tableBooking.findMany({
    where,
    include: {
      branch: true,
      customer: {
        select: publicUserSelect
      }
    },
    orderBy: { bookingTime: "asc" }
  });

  response.json({
    success: true,
    data: bookings.map((booking) => ({
      ...booking,
      customer: booking.customer ? serializeUser(booking.customer) : null
    }))
  });
});

export const updateBookingStatus = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  if (
    request.user.role !== Role.ADMIN &&
    request.user.role !== Role.HQ_MANAGER &&
    request.user.role !== Role.BRANCH_MANAGER &&
    request.user.role !== WAITER_ROLE
  ) {
    throw new AppError(403, "You do not have permission to update table bookings.");
  }

  const bookingId = getRequiredParam(request.params.bookingId, "bookingId");

  const existingBooking = await prisma.tableBooking.findUnique({
    where: { id: bookingId }
  });

  if (!existingBooking) {
    throw new AppError(404, "Table booking not found.");
  }

  assertBranchAccess(request.user, existingBooking.branchId);

  if (request.user.role === WAITER_ROLE) {
    if (request.body.status !== BookingStatus.CONFIRMED) {
      throw new AppError(403, "Waiters can only confirm table bookings.");
    }

    if (existingBooking.status !== BookingStatus.PENDING) {
      throw new AppError(400, "Only pending bookings can be confirmed by waiters.");
    }
  }

  const booking = await prisma.tableBooking.update({
    where: { id: bookingId },
    data: {
      status: request.body.status
    },
    include: {
      branch: true
    }
  });

  response.json({
    success: true,
    message: "Table booking status updated successfully.",
    data: booking
  });
});
