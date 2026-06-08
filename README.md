# Steakz Backend

Role-based MIS backend for the Steakz restaurant chain in London. This API is designed for the final-year project scope and supports operational workflows such as authentication, branch management, menu management, order handling, bookings, shifts, and summary reporting across 5 branches.

## Stack

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT authentication

## Core roles

- `ADMIN`: IT technician with system administration rights
- `HQ_MANAGER`: full cross-branch business visibility
- `BRANCH_MANAGER`: full access within the assigned branch
- `CHEF`: access to shifts and kitchen orders within the assigned branch
- `WAITER`: access to branch bookings, shifts, and ready orders for service
- `CUSTOMER`: customer-facing account for login and order history

## Seeded branch footprint

- London West End
- Canary Wharf Riverside
- Mayfair
- Greenwich
- Camden Town

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
cp .env.example .env
```

3. Generate Prisma client and push the schema:

```bash
npm run prisma:generate
npm run db:push
```

4. Load starter restaurant data:

```bash
npm run prisma:seed
```

5. Start the development server:

```bash
npm run dev
```

The API will run on `http://localhost:4000`.

Open the Steakz website and MIS portal in your browser:

```bash
http://localhost:4000
```

The first screen is the public open area. Visitors can continue as a guest or log in; both paths can book a table. Management sections such as reports, bookings, orders, shifts, staff, menus, and the API tester only appear after a role with access logs in.

Use the login panel or sign in manually with one of the prepared Steakz accounts:

- `admin@steakz.local` / `Admin@123`
- `hq.manager@steakz.local` / `HQManager@123`
- Branch managers: `westend.manager@steakz.local`, `canary.manager@steakz.local`, `mayfair.manager@steakz.local`, `greenwich.manager@steakz.local`, `camden.manager@steakz.local` / `BranchManager@123`
- Chefs: `westend.chef@steakz.local`, `canary.chef@steakz.local`, `mayfair.chef@steakz.local`, `greenwich.chef@steakz.local`, `camden.chef@steakz.local` / `Chef@123`
- Waiters: `westend.waiter@steakz.local`, `canary.waiter@steakz.local`, `mayfair.waiter@steakz.local`, `greenwich.waiter@steakz.local`, `camden.waiter@steakz.local` / `Waiter@123`
- `customer@steakz.local` / `Customer@123`

## Default assumptions used for V1

- Customers can self-register.
- Branch managers and chefs are limited to their own branch.
- HQ managers can see all branches and reports.
- Admin users manage branches, users, roles, and administrative accounts.
- Orders support `DINE_IN` and `TAKEAWAY`.
