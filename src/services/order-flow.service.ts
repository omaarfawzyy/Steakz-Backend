import { OrderStatus } from "@prisma/client";
import { prisma } from "../config/prisma";

const ORDER_FLOW_RULES = [
  {
    from: OrderStatus.PENDING,
    to: OrderStatus.PREPARING,
    afterMs: 20_000
  },
  {
    from: OrderStatus.PREPARING,
    to: OrderStatus.READY,
    afterMs: 40_000
  },
  {
    from: OrderStatus.READY,
    to: OrderStatus.COMPLETED,
    afterMs: 180_000
  }
];

export async function advanceOrderStatuses(now = new Date()) {
  const activeOrders = await prisma.order.findMany({
    where: {
      status: {
        in: ORDER_FLOW_RULES.map((rule) => rule.from)
      }
    },
    select: {
      id: true,
      status: true,
      updatedAt: true
    }
  });

  const updates = activeOrders.flatMap((order) => {
    const rule = ORDER_FLOW_RULES.find((entry) => entry.from === order.status);
    const ageMs = now.getTime() - order.updatedAt.getTime();

    if (!rule || ageMs < rule.afterMs) {
      return [];
    }

    return [
      prisma.order.update({
        where: { id: order.id },
        data: { status: rule.to }
      })
    ];
  });

  await Promise.all(updates);

  return updates.length;
}

export function startOrderStatusAutomation() {
  void advanceOrderStatuses().catch((error) => {
    console.error("Failed to advance order statuses on startup.", error);
  });

  const interval = setInterval(() => {
    void advanceOrderStatuses().catch((error) => {
      console.error("Failed to advance order statuses.", error);
    });
  }, 15_000);

  interval.unref();

  return () => clearInterval(interval);
}
