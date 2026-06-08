# Steakz API Endpoints

This document is designed to support the future lab presentation and Postman collection.

## Authentication

- `POST /api/v1/auth/register-customer`
  - Access: Public
- `POST /api/v1/auth/login`
  - Access: Public
- `GET /api/v1/auth/me`
  - Access: Any authenticated role

## Branches

- `GET /api/v1/branches`
  - Access: Public
- `POST /api/v1/branches`
  - Access: `ADMIN`
- `PATCH /api/v1/branches/:branchId`
  - Access: `ADMIN`

## Table Bookings

- `POST /api/v1/bookings`
  - Access: Public, optional authenticated customer
- `GET /api/v1/bookings`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`, `CUSTOMER`
- `PATCH /api/v1/bookings/:bookingId/status`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`

## Users

- `GET /api/v1/users`
  - Access: `ADMIN`, `HQ_MANAGER`
- `POST /api/v1/users`
  - Access: `ADMIN`, `HQ_MANAGER`
- `PATCH /api/v1/users/:userId/role`
  - Access: `ADMIN`
- `DELETE /api/v1/users/:userId`
  - Access: `ADMIN`

## Sales

- `GET /api/v1/sales/summary`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`
  - Scope: `HQ_MANAGER` sees all branches; `BRANCH_MANAGER` sees own branch only

## Staff Members

- `GET /api/v1/staff`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`
  - Scope: `HQ_MANAGER` sees staff across branches; `BRANCH_MANAGER` sees own branch staff only

## Menu

- `GET /api/v1/menu`
  - Access: Public
- `POST /api/v1/menu`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`
- `PATCH /api/v1/menu/:itemId`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`
- `DELETE /api/v1/menu/:itemId`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`

## Orders

- `GET /api/v1/orders`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`, `CHEF`, `CUSTOMER`
- `POST /api/v1/orders`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`, `CHEF`, `CUSTOMER`
- `PATCH /api/v1/orders/:orderId/status`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`, `CHEF`

## Shifts

- `GET /api/v1/shifts`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`, `CHEF`
- `POST /api/v1/shifts`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`
- `PATCH /api/v1/shifts/:shiftId`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`, `CHEF`

## Reports

- `GET /api/v1/reports/summary`
  - Access: `ADMIN`, `HQ_MANAGER`, `BRANCH_MANAGER`

## London branch footprint used in seed data

- London West End
- Canary Wharf Riverside
- Mayfair
- Greenwich
- Camden Town

## Access rules summary

- `ADMIN`: full technical administration, all branches
- `HQ_MANAGER`: full business visibility across all branches
- `BRANCH_MANAGER`: full access inside own branch
- `CHEF`: orders and shifts in own branch
- `CUSTOMER`: own account and own orders
