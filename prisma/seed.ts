import {
  BookingStatus,
  OrderStatus,
  OrderType,
  PrismaClient,
  Role,
  ShiftStatus
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const WAITER_ROLE = "WAITER" as Role;

const passwordForRole = (role: Role) => {
  switch (role) {
    case Role.ADMIN:
      return process.env.SEED_ADMIN_PASSWORD ?? "Admin@123";
    case Role.HQ_MANAGER:
      return process.env.SEED_HQ_PASSWORD ?? "HQManager@123";
    case Role.BRANCH_MANAGER:
      return process.env.SEED_BRANCH_MANAGER_PASSWORD ?? "BranchManager@123";
    case Role.CHEF:
      return process.env.SEED_CHEF_PASSWORD ?? "Chef@123";
    case WAITER_ROLE:
      return process.env.SEED_WAITER_PASSWORD ?? "Waiter@123";
    case Role.CUSTOMER:
      return process.env.SEED_CUSTOMER_PASSWORD ?? "Customer@123";
    default:
      return "ChangeMe@123";
  }
};

async function upsertUser(input: {
  fullName: string;
  email: string;
  role: Role;
  branchId?: string;
  previousEmail?: string;
}) {
  const passwordHash = await bcrypt.hash(passwordForRole(input.role), 10);
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email }
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        fullName: input.fullName,
        role: input.role,
        branchId: input.branchId,
        passwordHash,
        isActive: true
      }
    });
  }

  if (input.previousEmail && input.previousEmail !== input.email) {
    const existingPreviousUser = await prisma.user.findUnique({
      where: { email: input.previousEmail }
    });

    if (existingPreviousUser) {
      return prisma.user.update({
        where: { id: existingPreviousUser.id },
        data: {
          fullName: input.fullName,
          email: input.email,
          role: input.role,
          branchId: input.branchId,
          passwordHash,
          isActive: true
        }
      });
    }
  }

  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      fullName: input.fullName,
      role: input.role,
      branchId: input.branchId,
      passwordHash,
      isActive: true
    },
    create: {
      fullName: input.fullName,
      email: input.email,
      role: input.role,
      passwordHash,
      ...(input.branchId
        ? {
            branch: {
              connect: { id: input.branchId }
            }
          }
        : {})
    }
  });
}

async function main() {
  const dohaWestBay = await prisma.branch.upsert({
    where: { code: "STK-DOH-01" },
    update: {
      name: "Steakz London West End",
      city: "London",
      address: "Covent Garden, London WC2E"
    },
    create: {
      name: "Steakz London West End",
      code: "STK-DOH-01",
      city: "London",
      address: "Covent Garden, London WC2E"
    }
  });

  const lusailMarina = await prisma.branch.upsert({
    where: { code: "STK-LUS-01" },
    update: {
      name: "Steakz Canary Wharf Riverside",
      city: "London",
      address: "South Dock, Canary Wharf, London E14"
    },
    create: {
      name: "Steakz Canary Wharf Riverside",
      code: "STK-LUS-01",
      city: "London",
      address: "South Dock, Canary Wharf, London E14"
    }
  });

  const pearlBranch = await prisma.branch.upsert({
    where: { code: "STK-PRL-01" },
    update: {
      name: "Steakz Mayfair",
      city: "London",
      address: "Berkeley Square, Mayfair, London W1J"
    },
    create: {
      name: "Steakz Mayfair",
      code: "STK-PRL-01",
      city: "London",
      address: "Berkeley Square, Mayfair, London W1J"
    }
  });

  const alWakrahBranch = await prisma.branch.upsert({
    where: { code: "STK-WKR-01" },
    update: {
      name: "Steakz Greenwich",
      city: "London",
      address: "Greenwich Market, London SE10"
    },
    create: {
      name: "Steakz Greenwich",
      code: "STK-WKR-01",
      city: "London",
      address: "Greenwich Market, London SE10"
    }
  });

  const alRayyanBranch = await prisma.branch.upsert({
    where: { code: "STK-RYN-01" },
    update: {
      name: "Steakz Camden Town",
      city: "London",
      address: "Camden Lock, London NW1"
    },
    create: {
      name: "Steakz Camden Town",
      code: "STK-RYN-01",
      city: "London",
      address: "Camden Lock, London NW1"
    }
  });

  await upsertUser({
    fullName: "System Admin",
    email: "admin@steakz.local",
    role: Role.ADMIN
  });

  await upsertUser({
    fullName: "HQ Manager",
    email: "hq.manager@steakz.local",
    role: Role.HQ_MANAGER
  });

  await upsertUser({
    fullName: "West End Branch Manager",
    email: "westend.manager@steakz.local",
    role: Role.BRANCH_MANAGER,
    branchId: dohaWestBay.id,
    previousEmail: "branch.manager@steakz.local"
  });

  await upsertUser({
    fullName: "Canary Wharf Branch Manager",
    email: "canary.manager@steakz.local",
    role: Role.BRANCH_MANAGER,
    branchId: lusailMarina.id,
    previousEmail: "lusail.manager@steakz.local"
  });

  await upsertUser({
    fullName: "Mayfair Branch Manager",
    email: "mayfair.manager@steakz.local",
    role: Role.BRANCH_MANAGER,
    branchId: pearlBranch.id,
    previousEmail: "pearl.manager@steakz.local"
  });

  await upsertUser({
    fullName: "Greenwich Branch Manager",
    email: "greenwich.manager@steakz.local",
    role: Role.BRANCH_MANAGER,
    branchId: alWakrahBranch.id,
    previousEmail: "wakrah.manager@steakz.local"
  });

  await upsertUser({
    fullName: "Camden Branch Manager",
    email: "camden.manager@steakz.local",
    role: Role.BRANCH_MANAGER,
    branchId: alRayyanBranch.id,
    previousEmail: "rayyan.manager@steakz.local"
  });

  await upsertUser({
    fullName: "West End Head Chef",
    email: "westend.chef@steakz.local",
    role: Role.CHEF,
    branchId: dohaWestBay.id,
    previousEmail: "chef@steakz.local"
  });

  await upsertUser({
    fullName: "Canary Wharf Head Chef",
    email: "canary.chef@steakz.local",
    role: Role.CHEF,
    branchId: lusailMarina.id,
    previousEmail: "lusail.chef@steakz.local"
  });

  await upsertUser({
    fullName: "Mayfair Head Chef",
    email: "mayfair.chef@steakz.local",
    role: Role.CHEF,
    branchId: pearlBranch.id,
    previousEmail: "pearl.chef@steakz.local"
  });

  await upsertUser({
    fullName: "Greenwich Grill Chef",
    email: "greenwich.chef@steakz.local",
    role: Role.CHEF,
    branchId: alWakrahBranch.id,
    previousEmail: "wakrah.chef@steakz.local"
  });

  await upsertUser({
    fullName: "Camden Head Chef",
    email: "camden.chef@steakz.local",
    role: Role.CHEF,
    branchId: alRayyanBranch.id,
    previousEmail: "rayyan.chef@steakz.local"
  });

  await upsertUser({
    fullName: "West End Service Waiter",
    email: "westend.waiter@steakz.local",
    role: WAITER_ROLE,
    branchId: dohaWestBay.id,
    previousEmail: "waiter@steakz.local"
  });

  await upsertUser({
    fullName: "Canary Wharf Service Waiter",
    email: "canary.waiter@steakz.local",
    role: WAITER_ROLE,
    branchId: lusailMarina.id,
    previousEmail: "lusail.waiter@steakz.local"
  });

  await upsertUser({
    fullName: "Mayfair Service Waiter",
    email: "mayfair.waiter@steakz.local",
    role: WAITER_ROLE,
    branchId: pearlBranch.id,
    previousEmail: "pearl.waiter@steakz.local"
  });

  await upsertUser({
    fullName: "Greenwich Service Waiter",
    email: "greenwich.waiter@steakz.local",
    role: WAITER_ROLE,
    branchId: alWakrahBranch.id,
    previousEmail: "wakrah.waiter@steakz.local"
  });

  await upsertUser({
    fullName: "Camden Service Waiter",
    email: "camden.waiter@steakz.local",
    role: WAITER_ROLE,
    branchId: alRayyanBranch.id,
    previousEmail: "rayyan.waiter@steakz.local"
  });

  const oliverCustomer = await upsertUser({
    fullName: "Oliver Bennett",
    email: "customer@steakz.local",
    role: Role.CUSTOMER
  });

  const ameliaCustomer = await upsertUser({
    fullName: "Amelia Clarke",
    email: "amelia.customer@steakz.local",
    role: Role.CUSTOMER,
    previousEmail: "mariam.customer@steakz.local"
  });

  const danielCustomer = await upsertUser({
    fullName: "Daniel Hughes",
    email: "daniel.customer@steakz.local",
    role: Role.CUSTOMER,
    previousEmail: "faisal.customer@steakz.local"
  });

  const sophiaCustomer = await upsertUser({
    fullName: "Sophia Turner",
    email: "sophia.customer@steakz.local",
    role: Role.CUSTOMER,
    previousEmail: "noora.customer@steakz.local"
  });

  const sharedMenuItems: Array<[string, string, string, number]> = [
    ["Smoked Bone Marrow Toast", "Charred sourdough with smoked marrow, parsley, and lemon salt.", "Starters", 12],
    ["Wagyu Beef Tartare", "Hand-cut wagyu, cured egg yolk, capers, and crisp potato.", "Starters", 16],
    ["Truffle Beef Sliders", "Two wagyu sliders with truffle mayo and aged cheddar.", "Starters", 15],
    ["Charred Halloumi", "Halloumi, honey, zaatar, and pomegranate.", "Starters", 11],
    ["Crispy Wagyu Bites", "Crispy beef bites with smoked paprika mayo.", "Starters", 14],
    ["Oyster Mushroom Tempura", "Crisp oyster mushrooms with saffron aioli.", "Starters", 13],
    ["Ribeye Steak", "Signature ribeye with herb butter and pepper jus.", "Steaks", 34],
    ["Dry-Aged Porterhouse", "Large-format porterhouse with roasted garlic and thyme jus.", "Steaks", 62],
    ["Ember Wagyu Striploin", "Australian wagyu finished over oak embers with pepper jus.", "Steaks", 48],
    ["Mayfair Reserve Ribeye", "40-day aged ribeye with smoked bone marrow butter.", "Steaks", 44],
    ["Butter-Basted Tenderloin", "Tenderloin medallions with cafe de Paris butter.", "Steaks", 38],
    ["London Tomahawk", "Sharing cut with smoked sea salt and roasted garlic jus.", "Steaks", 72],
    ["Date-Glazed Short Rib", "Slow-braised short rib with date lacquer and saffron onion jam.", "Signature Plates", 29],
    ["Saffron Seabass", "Pan-seared seabass with saffron cream and grilled fennel.", "Signature Plates", 27],
    ["Harissa Half Chicken", "Charred half chicken with citrus yogurt and herb freekeh.", "Signature Plates", 24],
    ["Wagyu Burger", "Premium wagyu burger with truffle fries.", "Signature Plates", 26],
    ["Charcoal Prawn Skewers", "Tiger prawns, chili butter, and grilled lime.", "Signature Plates", 28],
    ["Family Mixed Grill", "Steak skewers, chicken, lamb, and grilled vegetables.", "Signature Plates", 32],
    ["Black Truffle Mash", "Silky potato mash with roasted garlic and truffle cream.", "Sides", 9],
    ["Ember Asparagus", "Charred asparagus finished with lemon ash and brown butter.", "Sides", 8],
    ["Smoked Mac and Cheese", "Aged cheddar, smoked paprika crumb, and chives.", "Sides", 10],
    ["Market Greens", "Little gem, herbs, cucumber ribbons, and citrus vinaigrette.", "Sides", 7],
    ["Crispy Potato Pave", "Layered potato with parmesan and smoked aioli.", "Sides", 8],
    ["Loaded Steak Fries", "Fries with steak pieces, cheese sauce, and jalapeno.", "Sides", 9],
    ["Pistachio Basque Cheesecake", "Burnt cheesecake with pistachio praline and rose cream.", "Desserts", 9],
    ["Chocolate Date Fondant", "Warm chocolate fondant with date caramel and vanilla cream.", "Desserts", 10],
    ["Sticky Date Pudding", "Warm pudding, miso caramel, and vanilla bean creme.", "Desserts", 8],
    ["Rose Milk Cake", "Three-milk sponge with rose cream and berries.", "Desserts", 9],
    ["Vanilla Lotus Pudding", "Creamy pudding with lotus crumb and caramel.", "Desserts", 8],
    ["Mango Saffron Mille-Feuille", "Crisp pastry, mango cream, and saffron syrup.", "Desserts", 10],
    ["London Rose Cooler", "Rose, lychee, citrus, and sparkling mint.", "Beverages", 6],
    ["Thames Citrus Spritz", "Grapefruit, lemon, tonic, and rosemary.", "Beverages", 7],
    ["Mint Lemon Sparkler", "Fresh mint, lemon, soda, and crushed ice.", "Beverages", 5],
    ["Watermelon Mint Cooler", "Watermelon, mint, lime, and soda.", "Beverages", 6],
    ["Smoked Cardamom Old Fashioned", "Aromatic house signature served under a smoked cloche.", "Beverages", 9],
    ["British Apple Fizz", "Apple, citrus, mint, and sparkling juice.", "Beverages", 7]
  ];

  const menuCatalog: Array<{
    branchId: string;
    items: Array<[string, string, string, number]>;
  }> = [
    {
      branchId: dohaWestBay.id,
      items: sharedMenuItems
    },
    {
      branchId: lusailMarina.id,
      items: sharedMenuItems
    },
    {
      branchId: pearlBranch.id,
      items: sharedMenuItems
    },
    {
      branchId: alWakrahBranch.id,
      items: sharedMenuItems
    },
    {
      branchId: alRayyanBranch.id,
      items: sharedMenuItems
    }
  ];

  await Promise.all(
    menuCatalog.flatMap(({ branchId, items }) =>
      items.map(([name, description, category, price]) =>
        prisma.menuItem.upsert({
          where: {
            branchId_name: {
              branchId,
              name
            }
          },
          update: {
            description,
            category,
            price: Number(price),
            isActive: true
          },
          create: {
            branchId,
            name,
            description,
            category,
            price: Number(price)
          }
        })
      )
    )
  );

  const sharedMenuNames = sharedMenuItems.map(([name]) => name);
  const seededBranchIds = [
    dohaWestBay.id,
    lusailMarina.id,
    pearlBranch.id,
    alWakrahBranch.id,
    alRayyanBranch.id
  ];

  await prisma.menuItem.updateMany({
    where: {
      branchId: { in: seededBranchIds },
      name: { notIn: sharedMenuNames }
    },
    data: { isActive: false }
  });

  await prisma.inventoryItem.createMany({
    data: [
      {
        branchId: dohaWestBay.id,
        name: "Ribeye Cut",
        sku: "RBY-001",
        quantityOnHand: 50,
        reorderLevel: 20,
        unit: "kg"
      },
      {
        branchId: dohaWestBay.id,
        name: "Rosemary",
        sku: "RSM-001",
        quantityOnHand: 8,
        reorderLevel: 5,
        unit: "packs"
      },
      {
        branchId: lusailMarina.id,
        name: "Tomahawk Cut",
        sku: "TMH-001",
        quantityOnHand: 38,
        reorderLevel: 12,
        unit: "kg"
      },
      {
        branchId: lusailMarina.id,
        name: "Citrus Mix",
        sku: "CTR-001",
        quantityOnHand: 26,
        reorderLevel: 10,
        unit: "packs"
      },
      {
        branchId: pearlBranch.id,
        name: "Wagyu Patty",
        sku: "WGY-001",
        quantityOnHand: 74,
        reorderLevel: 25,
        unit: "pcs"
      },
      {
        branchId: pearlBranch.id,
        name: "Lobster Meat",
        sku: "LBS-001",
        quantityOnHand: 16,
        reorderLevel: 8,
        unit: "kg"
      },
      {
        branchId: alWakrahBranch.id,
        name: "Salmon Fillet",
        sku: "SLM-001",
        quantityOnHand: 44,
        reorderLevel: 16,
        unit: "kg"
      },
      {
        branchId: alWakrahBranch.id,
        name: "Halloumi",
        sku: "HLM-001",
        quantityOnHand: 18,
        reorderLevel: 10,
        unit: "kg"
      },
      {
        branchId: alRayyanBranch.id,
        name: "Tenderloin Cut",
        sku: "TND-001",
        quantityOnHand: 41,
        reorderLevel: 14,
        unit: "kg"
      },
      {
        branchId: alRayyanBranch.id,
        name: "Lotus Crumb",
        sku: "LTS-001",
        quantityOnHand: 12,
        reorderLevel: 6,
        unit: "packs"
      }
    ],
    skipDuplicates: true
  });

  const branchIds = [
    dohaWestBay.id,
    lusailMarina.id,
    pearlBranch.id,
    alWakrahBranch.id,
    alRayyanBranch.id
  ];
  const legacyOrderNotePrefix = ["Seed", "flow:"].join(" ");
  const legacyReservationNotePrefix = ["Seed", "booking:"].join(" ");
  const legacyShiftNotePrefix = ["Seed", "shift:"].join(" ");
  const legacyRoleShiftPrefix = ["De", "mo role shift:"].join("");

  const seededOrders = await prisma.order.findMany({
    where: {
      OR: [
        { notes: { startsWith: legacyOrderNotePrefix } },
        { notes: { startsWith: "Service note:" } }
      ]
    },
    select: { id: true }
  });
  const seededOrderIds = seededOrders.map((order) => order.id);

  if (seededOrderIds.length) {
    await prisma.orderItem.deleteMany({
      where: { orderId: { in: seededOrderIds } }
    });
    await prisma.order.deleteMany({
      where: { id: { in: seededOrderIds } }
    });
  }

  await prisma.tableBooking.deleteMany({
    where: {
      OR: [
        { specialRequests: { startsWith: legacyReservationNotePrefix } },
        { specialRequests: { startsWith: "Reservation note:" } }
      ]
    }
  });
  await prisma.shift.deleteMany({
    where: {
      OR: [
        { notes: { startsWith: legacyShiftNotePrefix } },
        { notes: { startsWith: "Scheduled rota:" } }
      ]
    }
  });

  const activeMenu = await prisma.menuItem.findMany({
    where: {
      branchId: { in: branchIds },
      isActive: true
    }
  });
  const menuItemFor = (branchId: string, name: string) => {
    const item = activeMenu.find(
      (candidate) => candidate.branchId === branchId && candidate.name === name
    );

    if (!item) {
      throw new Error(`Missing seeded menu item ${name}`);
    }

    return item;
  };

  const createSeedOrder = async (input: {
    branchId: string;
    customerId: string;
    itemNames: string[];
    orderType: OrderType;
    status: OrderStatus;
    notes: string;
    minutesAgo: number;
    statusAgeSeconds: number;
  }) => {
    const lineItems = input.itemNames.map((name) => {
      const menuItem = menuItemFor(input.branchId, name);

      return {
        menuItemId: menuItem.id,
        quantity: 1,
        unitPrice: menuItem.price
      };
    });
    const totalAmount = lineItems.reduce(
      (sum, lineItem) => sum + lineItem.quantity * lineItem.unitPrice,
      0
    );

    const createdAt = new Date(Date.now() - input.minutesAgo * 60_000);
    const updatedAt = new Date(Date.now() - input.statusAgeSeconds * 1000);

    await prisma.order.create({
      data: {
        branchId: input.branchId,
        customerId: input.customerId,
        createdById: input.customerId,
        orderType: input.orderType,
        status: input.status,
        totalAmount,
        notes: input.notes,
        createdAt,
        updatedAt,
        orderItems: {
          create: lineItems
        }
      }
    });
  };

  await Promise.all([
    createSeedOrder({
      branchId: dohaWestBay.id,
      customerId: oliverCustomer.id,
      itemNames: ["Ribeye Steak", "London Rose Cooler"],
      orderType: OrderType.DINE_IN,
      status: OrderStatus.PENDING,
      notes: "Service note: West End table 14 dinner order",
      minutesAgo: 4,
      statusAgeSeconds: 5
    }),
    createSeedOrder({
      branchId: dohaWestBay.id,
      customerId: ameliaCustomer.id,
      itemNames: ["Dry-Aged Porterhouse", "Black Truffle Mash", "Chocolate Date Fondant"],
      orderType: OrderType.DINE_IN,
      status: OrderStatus.PREPARING,
      notes: "Service note: West End private dining order",
      minutesAgo: 18,
      statusAgeSeconds: 18
    }),
    createSeedOrder({
      branchId: lusailMarina.id,
      customerId: danielCustomer.id,
      itemNames: ["Butter-Basted Tenderloin", "Sticky Date Pudding", "Thames Citrus Spritz"],
      orderType: OrderType.TAKEAWAY,
      status: OrderStatus.PREPARING,
      notes: "Service note: Canary Wharf pickup order",
      minutesAgo: 35,
      statusAgeSeconds: 65
    }),
    createSeedOrder({
      branchId: lusailMarina.id,
      customerId: sophiaCustomer.id,
      itemNames: ["London Tomahawk", "Crispy Potato Pave"],
      orderType: OrderType.DINE_IN,
      status: OrderStatus.COMPLETED,
      notes: "Service note: Canary Wharf sharing table completed",
      minutesAgo: 110,
      statusAgeSeconds: 240
    }),
    createSeedOrder({
      branchId: pearlBranch.id,
      customerId: ameliaCustomer.id,
      itemNames: ["Mayfair Reserve Ribeye", "Rose Milk Cake"],
      orderType: OrderType.DINE_IN,
      status: OrderStatus.PREPARING,
      notes: "Service note: Mayfair celebration order",
      minutesAgo: 44,
      statusAgeSeconds: 75
    }),
    createSeedOrder({
      branchId: pearlBranch.id,
      customerId: oliverCustomer.id,
      itemNames: ["Wagyu Burger", "London Rose Cooler"],
      orderType: OrderType.TAKEAWAY,
      status: OrderStatus.PREPARING,
      notes: "Service note: Mayfair pickup order",
      minutesAgo: 22,
      statusAgeSeconds: 22
    }),
    createSeedOrder({
      branchId: alWakrahBranch.id,
      customerId: danielCustomer.id,
      itemNames: ["Ribeye Steak", "Mint Lemon Sparkler"],
      orderType: OrderType.DINE_IN,
      status: OrderStatus.PENDING,
      notes: "Service note: Greenwich family lunch order",
      minutesAgo: 7,
      statusAgeSeconds: 8
    }),
    createSeedOrder({
      branchId: alWakrahBranch.id,
      customerId: sophiaCustomer.id,
      itemNames: ["Charcoal Prawn Skewers", "Mango Saffron Mille-Feuille"],
      orderType: OrderType.DINE_IN,
      status: OrderStatus.COMPLETED,
      notes: "Service note: Greenwich seafood completed",
      minutesAgo: 150,
      statusAgeSeconds: 260
    }),
    createSeedOrder({
      branchId: alRayyanBranch.id,
      customerId: ameliaCustomer.id,
      itemNames: ["Family Mixed Grill", "British Apple Fizz"],
      orderType: OrderType.DINE_IN,
      status: OrderStatus.PREPARING,
      notes: "Service note: Camden family order",
      minutesAgo: 50,
      statusAgeSeconds: 85
    }),
    createSeedOrder({
      branchId: alRayyanBranch.id,
      customerId: oliverCustomer.id,
      itemNames: ["Butter-Basted Tenderloin", "Vanilla Lotus Pudding"],
      orderType: OrderType.TAKEAWAY,
      status: OrderStatus.PREPARING,
      notes: "Service note: Camden takeaway order",
      minutesAgo: 28,
      statusAgeSeconds: 24
    })
  ]);

  await prisma.tableBooking.createMany({
    data: [
      {
        branchId: dohaWestBay.id,
        customerId: oliverCustomer.id,
        customerName: oliverCustomer.fullName,
        customerEmail: oliverCustomer.email,
        customerPhone: "+447700900001",
        partySize: 4,
        bookingTime: new Date(Date.now() + 2 * 60 * 60_000),
        status: BookingStatus.CONFIRMED,
        specialRequests: "Reservation note: West End business dinner"
      },
      {
        branchId: lusailMarina.id,
        customerId: ameliaCustomer.id,
        customerName: ameliaCustomer.fullName,
        customerEmail: ameliaCustomer.email,
        customerPhone: "+447700900002",
        partySize: 2,
        bookingTime: new Date(Date.now() + 5 * 60 * 60_000),
        status: BookingStatus.PENDING,
        specialRequests: "Reservation note: Canary Wharf terrace request"
      },
      {
        branchId: pearlBranch.id,
        customerId: danielCustomer.id,
        customerName: danielCustomer.fullName,
        customerEmail: danielCustomer.email,
        customerPhone: "+447700900003",
        partySize: 6,
        bookingTime: new Date(Date.now() + 24 * 60 * 60_000),
        status: BookingStatus.CONFIRMED,
        specialRequests: "Reservation note: Mayfair celebration table"
      },
      {
        branchId: alWakrahBranch.id,
        customerId: sophiaCustomer.id,
        customerName: sophiaCustomer.fullName,
        customerEmail: sophiaCustomer.email,
        customerPhone: "+447700900004",
        partySize: 5,
        bookingTime: new Date(Date.now() + 30 * 60 * 60_000),
        status: BookingStatus.CONFIRMED,
        specialRequests: "Reservation note: Greenwich family lunch"
      },
      {
        branchId: alRayyanBranch.id,
        customerId: oliverCustomer.id,
        customerName: oliverCustomer.fullName,
        customerEmail: oliverCustomer.email,
        customerPhone: "+447700900005",
        partySize: 3,
        bookingTime: new Date(Date.now() + 48 * 60 * 60_000),
        status: BookingStatus.PENDING,
        specialRequests: "Reservation note: Camden weekend table"
      }
    ]
  });

  await prisma.shift.deleteMany({
    where: {
      OR: [
        { notes: { startsWith: legacyShiftNotePrefix } },
        { notes: { startsWith: legacyRoleShiftPrefix } },
        { notes: { startsWith: "Scheduled rota:" } }
      ]
    }
  });

  const todayAt = (hour: number, minute = 0, dayOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hour, minute, 0, 0);
    return date;
  };

  const roleShiftUsers = await prisma.user.findMany({
    where: {
      branchId: { in: branchIds },
      role: {
        in: [Role.BRANCH_MANAGER, Role.CHEF, WAITER_ROLE]
      }
    }
  });

  const roleShiftWindows = {
    [Role.BRANCH_MANAGER]: { startHour: 11, endHour: 19 },
    [Role.CHEF]: { startHour: 15, endHour: 23 },
    [WAITER_ROLE]: { startHour: 16, endHour: 22 }
  } as Record<Role, { startHour: number; endHour: number }>;

  const roleShiftOffsets = {
    [Role.BRANCH_MANAGER]: [0],
    [Role.CHEF]: [0, 2, 4, 6],
    [WAITER_ROLE]: [0, 1, 3, 5]
  } as Record<Role, number[]>;

  await prisma.shift.createMany({
    data: roleShiftUsers.flatMap((user) => {
      const window = roleShiftWindows[user.role];
      const offsets = roleShiftOffsets[user.role] ?? [0];

      return offsets.map((dayOffset) => ({
        branchId: user.branchId!,
        userId: user.id,
        startTime: todayAt(window.startHour, 0, dayOffset),
        endTime: todayAt(window.endHour, 0, dayOffset),
        status: ShiftStatus.SCHEDULED,
        notes: `Scheduled rota: ${user.fullName} ${dayOffset === 0 ? "today" : `in ${dayOffset} days`}`
      }));
    })
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
