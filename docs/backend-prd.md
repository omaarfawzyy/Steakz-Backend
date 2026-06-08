# Steakz Backend PRD

## 1. Product overview

The Steakz backend is the core MIS service for a London-based restaurant chain operating across 5 branches. It centralises operational data such as branches, employees, customers, menu items, orders, bookings, shifts, and management reporting. The backend exposes a REST API to support the future web portal and role-based dashboards required for the final-year project.

## 2. Problem statement

Steakz needs a structured information system to replace fragmented or manual workflows across its branches. The current challenge is the lack of a unified backend that can:

- control access by user role
- separate branch-level and company-wide visibility
- track operational transactions such as bookings, orders, and service status updates
- support management reporting
- provide a secure technical foundation for the frontend portal

## 3. Goals

- Build a secure role-based backend for the core user roles.
- Support branch-aware access rules for operational staff.
- Enable the main business modules required by the assignment.
- Provide clear, reusable REST endpoints for frontend integration.
- Improve future competitiveness through better visibility, speed, and consistency.

## 4. Non-goals for V1

- payment gateway integration
- supplier procurement workflows
- live dine-in and pickup order tracking
- advanced analytics and forecasting
- mobile application support

## 5. Users and roles

- `ADMIN`: manages branches, users, roles, and admin accounts.
- `HQ_MANAGER`: views and manages business data across all branches.
- `BRANCH_MANAGER`: manages data inside the assigned branch.
- `CHEF`: works with branch orders and shifts.
- `CUSTOMER`: registers, logs in, places orders, and views own order history.

## 6. Branch footprint

- London West End
- Canary Wharf Riverside
- Mayfair
- Greenwich
- Camden Town

## 7. Core modules

- Authentication and authorisation
- Branch management
- User management
- Menu management
- Order management
- Table booking
- Shift scheduling
- Summary reporting

## 8. Key user stories

- As an admin, I want to create a new branch so that the business can expand without rebuilding the system.
- As an admin, I want to create and update user roles so that permissions stay aligned with organisational responsibilities.
- As an HQ manager, I want to view cross-branch reports so that I can make strategic decisions.
- As a branch manager, I want to manage my branch menu, staff data, orders, and bookings so that local operations run smoothly.
- As a chef, I want to check order queues in my branch so that kitchen operations stay efficient.
- As a customer, I want to register and place an order so that I can use the online service.
- As a guest, I want to book a table without creating an account so that I can reserve quickly.
- As a branch manager, I want to see table booking requests for my branch so that I can manage restaurant capacity.
- As an HQ manager, I want to view sales and staff across all branches so that I can monitor organisational performance.
- As a branch manager, I want to view sales and staff for my own branch so that I can manage local performance.

## 9. Functional scope

- Secure login using email and password
- JWT-based session model for API access
- CRUD-style management for branches, users, menu items, orders, bookings, and shifts
- Order creation with line items and automatic total calculation
- Branch-scoped access enforcement
- Summary reporting for tactical and strategic management

## 10. Success metrics

- All core roles can authenticate and receive correct access boundaries.
- Branch-restricted users cannot access another branch's data.
- Orders, bookings, and shifts can be created and queried through the API.
- Management reporting endpoints return usable summary data.
- The backend can serve as the operational base for the lab portal.
