# Steakz Backend SRS

## 1. Purpose

This Software Requirements Specification defines the backend service requirements for the Steakz MIS web application. The backend will support secure, role-based access for restaurant management and customer-facing workflows across 5 branches in London.

## 2. Scope

The system provides RESTful APIs for the following domains:

- authentication
- user and role administration
- branch administration
- menu records
- customer and staff orders
- table bookings
- shift scheduling
- summary reporting

## 3. Technology stack

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- Zod

### Frontend integration target

- Web portal consuming REST APIs
- Role-based dashboards for the selected actors

## 4. Functional requirements

### FR1 Authentication

- The system shall allow customers to self-register.
- The system shall allow all active users to log in with email and password.
- The system shall issue a JWT token after successful login.
- The system shall provide an endpoint to return the currently authenticated user profile.

### FR2 Role-based access control

- The system shall store a role for each user.
- The system shall restrict API access based on the role attached to the JWT token.
- The system shall restrict branch managers, chefs, and waiters to their assigned branch.
- The system shall allow HQ managers to access all 5 branches.
- The system shall allow admins to manage branches, roles, and user accounts.

### FR3 Branch management

- The system shall allow branch records to be created by admins.
- The system shall allow branch details to be updated by admins.
- The system shall allow branches to be listed for application use.

### FR4 User management

- The system shall allow admins and HQ managers to create user accounts.
- The system shall allow only admins to assign admin role privileges.
- The system shall allow only admins to modify roles and deactivate users.

### FR5 Menu management

- The system shall allow authorised staff to create menu items for branches.
- The system shall allow authorised staff to update menu item details.
- The system shall allow public or authenticated users to view active menu items.

### FR7 Order management

- The system shall allow customers and authorised staff to create orders.
- The system shall calculate order totals from line items.
- The system shall allow authorised staff to update order statuses.
- The system shall allow customers to view only their own orders.

### FR7A Table booking

- The system shall allow public guests to request a table booking.
- The system shall allow authenticated customers to request a table booking from their account.
- The system shall allow admins, HQ managers, and branch managers to view and manage table bookings based on role and branch scope.

### FR8 Shift management

- The system shall allow admins, HQ managers, and branch managers to create shifts.
- The system shall allow authorised users to view shifts based on role and branch scope.
- The system shall allow authorised users to update shift details and status.

### FR9 Reporting

- The system shall provide a summary report endpoint.
- The report shall include order volume, revenue, open shifts, active menu count, and service activity indicators.
- The system shall allow HQ managers to view sales across all branches.
- The system shall allow branch managers to view sales for their own branch only.
- The system shall allow HQ managers to view staff members across all branches.
- The system shall allow branch managers to view staff members assigned to their own branch only.

## 5. Non-functional requirements

### NFR1 Security

- Passwords shall be stored as hashes, not plain text.
- JWT secrets shall be stored in environment variables.
- Role checks shall be enforced server-side.

### NFR2 Performance

- The API should respond quickly for normal CRUD operations during lab presentation usage.
- Summary reports should use aggregated queries where practical.

### NFR3 Maintainability

- The backend shall use modular route, controller, middleware, and schema layers.
- The codebase shall be written in TypeScript for clarity and maintainability.

### NFR4 Scalability

- The schema shall support multiple branches.
- Business modules shall remain separable for future expansion.

### NFR5 Reliability

- The system shall validate request bodies before processing.
- The API shall return structured JSON error responses.

## 6. Data entities

- `Branch`
- `User`
- `MenuItem`
- `Order`
- `OrderItem`
- `Shift`
- `TableBooking`

## 7. Constraints

- The project uses a relational database design through Prisma and PostgreSQL.
- The assignment scope focuses on a working academic project rather than a production-complete platform.
- Public access is represented by frontend routes rather than a dedicated stored role.

## 8. External interfaces

- REST API over HTTP
- JSON request and response bodies
- PostgreSQL database connection via environment variables

## 9. Future enhancements

- supplier management
- reservations
- analytics dashboards
- email notifications
- audit logs
- loyalty features
