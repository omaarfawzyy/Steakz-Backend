# Steakz Backend Testing Methodology

## Testing approach

The Steakz backend should be tested using a combination of manual API testing and automated checks.

## 1. Manual API testing

- Use Postman to test all REST endpoints.
- Verify successful login and token generation for each role.
- Verify role restrictions by attempting allowed and disallowed actions.
- Verify branch restrictions by attempting to access another branch's orders, bookings, and shifts.
- Verify order creation with valid and invalid menu items.
- Verify that public guests can submit a table booking without logging in.

## 2. Functional validation

- Confirm that customer registration creates a `CUSTOMER` role account.
- Confirm that admins can create branches and update user roles.
- Confirm that HQ managers can access cross-branch reports.
- Confirm that branch managers and chefs only interact with their assigned branch.
- Confirm that customers can only view their own orders.
- Confirm that table bookings can be created by guests and logged-in customers.
- Confirm that HQ managers can view all-branch sales and staff.
- Confirm that branch managers can view only their own branch sales and staff.

## 3. Data validation checks

- Test missing required fields.
- Test invalid email addresses.
- Test weak or short passwords.
- Test invalid enum values such as unsupported roles or order statuses.
- Test invalid route parameters.

## 4. Security checks

- Test requests without tokens.
- Test expired or invalid JWT tokens.
- Test privilege escalation attempts, such as a customer trying to update order status.
- Test cross-branch access attempts from branch-restricted roles.

## 5. Suggested future automation

- Unit tests for middleware and access helpers
- Integration tests for auth, orders, bookings, and reporting
- Seed-based smoke tests for the 5 London branches
