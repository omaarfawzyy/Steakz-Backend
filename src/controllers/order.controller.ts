import type { Request, Response } from "express";
import { OrderStatus, OrderType, Role } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/app-error";
import { assertBranchAccess, getBranchFilter } from "../utils/access";
import { catchAsync } from "../utils/catch-async";
import { getRequiredParam, getStringQuery } from "../utils/request";
import { publicUserSelect, serializeUser } from "../utils/serializers";

const WAITER_ROLE = "WAITER" as Role;

export const listOrders = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const branchId = getStringQuery(request.query.branchId);
  const where =
    request.user.role === Role.CUSTOMER
      ? { customerId: request.user.id }
      : getBranchFilter(request.user, branchId);

  const orders = await prisma.order.findMany({
    where,
    include: {
      orderItems: {
        include: {
          menuItem: true
        }
      },
      branch: true,
      customer: {
        select: publicUserSelect
      }
    },
    orderBy: { createdAt: "desc" }
  });

  response.json({
    success: true,
    data: orders.map((order) => ({
      ...order,
      customer: order.customer ? serializeUser(order.customer) : null
    }))
  });
});

export const createOrder = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const { branchId, orderType, items, notes, customerId } = request.body as {
    branchId: string;
    orderType: OrderType;
    items: Array<{ menuItemId: string; quantity: number }>;
    notes?: string;
    customerId?: string;
  };

  if (request.user.role !== Role.CUSTOMER) {
    assertBranchAccess(request.user, branchId);
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: items.map((item) => item.menuItemId) },
      branchId,
      isActive: true
    }
  });

  if (menuItems.length !== items.length) {
    throw new AppError(400, "One or more menu items are invalid for the selected branch.");
  }

  const lineItems = items.map((item) => {
    const menuItem = menuItems.find((candidate) => candidate.id === item.menuItemId);

    if (!menuItem) {
      throw new AppError(400, "Menu item was not found.");
    }

    return {
      menuItemId: menuItem.id,
      quantity: item.quantity,
      unitPrice: menuItem.price
    };
  });

  const totalAmount = lineItems.reduce(
    (sum, lineItem) => sum + lineItem.quantity * lineItem.unitPrice,
    0
  );

  const order = await prisma.order.create({
    data: {
      branchId,
      orderType,
      status: OrderStatus.PENDING,
      notes,
      customerId: request.user.role === Role.CUSTOMER ? request.user.id : customerId,
      createdById: request.user.id,
      totalAmount,
      orderItems: {
        create: lineItems
      }
    },
    include: {
      orderItems: true
    }
  });

  response.status(201).json({
    success: true,
    message: "Order created successfully.",
    data: order
  });
});

export const updateOrderStatus = catchAsync(async (request: Request, response: Response) => {
  if (!request.user) {
    throw new AppError(401, "Authentication is required.");
  }

  const orderId = getRequiredParam(request.params.orderId, "orderId");
  const { status } = request.body as { status: OrderStatus };

  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!existingOrder) {
    throw new AppError(404, "Order not found.");
  }

  if (request.user.role === Role.CUSTOMER) {
    throw new AppError(403, "Customers cannot update order status.");
  }

  assertBranchAccess(request.user, existingOrder.branchId);

  if (request.user.role === Role.CHEF && status !== OrderStatus.READY) {
    throw new AppError(403, "Chefs can only mark orders as ready.");
  }

  if (
    request.user.role === Role.CHEF &&
    existingOrder.status !== OrderStatus.PENDING &&
    existingOrder.status !== OrderStatus.PREPARING
  ) {
    throw new AppError(400, "Chefs can only mark pending or preparing orders as ready.");
  }

  if (request.user.role === WAITER_ROLE) {
    if (status !== OrderStatus.COMPLETED) {
      throw new AppError(403, "Waiters can only mark ready orders as served.");
    }

    if (existingOrder.status !== OrderStatus.READY) {
      throw new AppError(400, "Waiters can only serve orders that are ready.");
    }
  }

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });

  response.json({
    success: true,
    message: "Order status updated successfully.",
    data: order
  });
});
