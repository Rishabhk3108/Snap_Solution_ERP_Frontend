# ROLE_ADMIN Privileges — Old Node.js/Express Backend

> **Source**: `d:\ERP System\` (Node.js/Express + MySQL backend)
> **Purpose**: Documents every capability ROLE_ADMIN users had in the legacy system, to inform migration decisions, new Python backend scope, and admin UI design.
> **Companion doc**: See `EMPLOYEE_PRIVILEGES.md` for ROLE_EMPLOYEE coverage.

---

## Authentication Middleware Reference

| Middleware | Who can pass |
|---|---|
| `verifyToken` | Any user with a valid JWT |
| `withRoleAdmin` | ROLE_ADMIN only |
| `withRoleAdminOrManager` | ROLE_ADMIN or ROLE_MANAGER |
| `withRoleManager` | ROLE_MANAGER only |
| `withRoleEmployee` | ROLE_EMPLOYEE only |
| *(none)* | Anyone — no authentication required (see Security Gaps section) |

---

## Section 1: User Management

**Route file**: `routes/user.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `PUT` | `/users/:id` | Update any user's details (name, role, department, etc.) |
| `DELETE` | `/users/:id` | Delete a single user account |
| `DELETE` | `/users` | Delete **all** user accounts |
| `DELETE` | `/users/department/:id` | Delete all users belonging to a department |

### Admin + Manager operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List all users in the system |
| `GET` | `/users/nullend` | List active users (end date is NULL) |
| `GET` | `/users/notnull` | List terminated users (end date is set ) |
++++++
| `PUT` | `/users/updateEndDate/:id` | Set a user's termination date |
| `GET` | `/users/total` | Get total employee count |

### Token-only operations (any logged-in user)

| Method | Path | Description |
|---|---|---|
| `PUT` | `/users/changePassword/:id` | Change own password |

---

## Section 2: Role & Permission Management

**Route files**: `routes/role.routes.js`, `routes/permission.routes.js`, `routes/rolePermission.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/role` | List all system roles |
| `GET` | `/role/:id` | Get details of a specific role |
| `POST` | `/role` | Create a new role |
| `PUT` | `/role/:id` | Rename / update a role |
| `DELETE` | `/role/:id` | Soft-delete a role |
| `PATCH` | `/role/restore/:id` | Restore a soft-deleted role |
| `GET` | `/permission` | List all permissions |
| `GET` | `/permission/:id` | Get a specific permission |
| `POST` | `/permission` | Create a new permission |
| `PUT` | `/permission/:id` | Update a permission |
| `GET` | `/rolePermission` | List all role–permission mappings |
| `GET` | `/rolePermission/:id` | Get a specific role–permission record |
| `POST` | `/rolePermission` | Assign a permission to a role |
| `PUT` | `/rolePermission/:id` | Update a role–permission mapping |
| `DELETE` | `/rolePermission/delete` | Remove a permission from a role |
| `PATCH` | `/rolePermission/restore/:id` | Restore a removed permission |
| `GET` | `/rolePermission/rolePermission/:id` | Get all permissions for a given role ID |

---

## Section 3: Organization & Department Management

**Route files**: `routes/organization.routes.js`, `routes/department.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `PUT` | `/organizations/:id` | Update organization details |
| `DELETE` | `/organizations/:id` | Delete an organization |
| `DELETE` | `/organizations` | Delete all organizations |
| `POST` | `/departments` | Create a new department |
| `DELETE` | `/departments/:id` | Delete a department |
| `DELETE` | `/departments` | Delete all departments |

### Admin + Manager operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/departments` | List all departments |
| `PUT` | `/departments/:id` | Update a department |

---

## Section 4: Employee Profile Management

**Route file**: `routes/employee.route.js`, `routes/userPersonalInformation.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `POST` | `/personalInformations` | Create personal info record for a user |
| `GET` | `/personalInformations/user/:id` | View any user's personal info |
| `PUT` | `/personalInformations/:id` | Update any user's personal info |
| `DELETE` | `/personalInformations/:id` | Delete a personal info record |
| `DELETE` | `/personalInformations` | Delete all personal info records |

---

## Section 5: Financial Information & Salary Structure

**Route file**: `routes/userFinancialInformation.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `POST` | `/financialInformations` | Create a salary / financial profile for a user |
| `PUT` | `/financialInformations/:id` | Update salary structure (basic, HRA, allowances, bank details) |

### Admin + Manager operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/financialInformations` | List financial info for all employees |

---

## Section 6: Payroll & Salary Processing

**Route file**: `routes/salary.routes.js`, `routes/monthlySalary.routes.js`

> **Note**: These endpoints have no auth middleware in the old codebase (see Security Gaps). An admin was expected to use them but no role check was enforced.

| Method | Path | Description |
|---|---|---|
| `POST` | `/salary/add` | Add/update salary record for an employee |
| `GET` | `/salary/details/:empid/:year/:month` | View salary breakdown for a specific employee + period |
| `GET` | `/salary/salarylist/:year/:month` | View salary list for all employees for a given period |
| `GET` | `/salary/salary-slip/:empid/:year/:month` | Generate salary slip PDF/data |
| `POST` | `/salary/adjust` | Deduct advance payment and adjust net salary |
| `POST` | `/monthlySalary/generate` | **Bulk-generate** monthly salaries for all employees |
| `POST` | `/monthlySalary/change-status` | Mark monthly salaries as "Paid" |
| `GET` | `/monthlySalary/monthly-details/:year/:month` | View consolidated monthly salary details |
| `GET` | `/monthlySalary/list` | List all monthly salary records |
| `GET` | `/monthlySalary/csv/:year/:month` | **Export** monthly salary data as CSV |

---

## Section 7: Advance Payment Management

**Route file**: `routes/advancePayment.routes.js`

| Method | Path | Description |
|---|---|---|
| `POST` | `/advancePayment/add` | Record an advance payment to an employee |
| `GET` | `/advancePayment/list` | List all advance payments |
| `POST` | `/advancePayment/expense-list` | Get expenses eligible for advance deduction |

---

## Section 8: Payment Records

**Route file**: `routes/payment.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `POST` | `/payments` | Create a payment record |
| `GET` | `/payments/user/:id` | View payment history for a specific user |
| `DELETE` | `/payments/:id` | Delete a single payment |
| `DELETE` | `/payments` | Delete all payments |
| `DELETE` | `/payments/job/:id` | Delete all payments for a job |

### Admin + Manager operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/payments` | List all payment records |
| `GET` | `/payments/year/:id` | Filter payments by year |
| `GET` | `/payments/job/:id` | Filter payments by job |
| `PUT` | `/payments/:id` | Update a payment record |
| `GET` | `/payments/:id` | View a specific payment |

---

## Section 9: Fine Management

**Route file**: `routes/fine.route.js`

| Method | Path | Description |
|---|---|---|
| `POST` | `/fine/create` | Create a fine (deduction) for an employee |
| `GET` | `/fine/list` | List all fines |

---

## Section 10: Leave / Application Management

**Route file**: `routes/application.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `DELETE` | `/applications` | Delete all leave applications |
| `DELETE` | `/applications/user/:id` | Delete all leave records for a user |

### Admin + Manager operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/applications` | List all leave applications across the org |
| `PUT` | `/applications/:id` | **Approve or reject** a leave application |
| `DELETE` | `/applications/:id` | Delete a specific leave application |

---

## Section 11: Attendance Management

**Route file**: `routes/attendance.routes.js`

> **Note**: All attendance endpoints lacked proper auth middleware. The admin was the intended operator.

| Method | Path | Description |
|---|---|---|
| `POST` | `/attendance/add` | Manually add an attendance entry |
| `PUT` | `/attendance/update` | Update an attendance entry |
| `POST` | `/attendance/updateById` | Update attendance by record ID |
| `POST` | `/attendance/full` | Add complete attendance (including overtime) |
| `GET` | `/attendance/list/:empid/:year/:month` | View attendance log for any employee |
| `GET` | `/attendance/days-worked/:empid/:year/:month` | Get days worked for any employee |
| `GET` | `/attendance/today-summary` | Summary of who is in/out today |
| `POST` | `/attendance/attendanceByDateRange` | Filter attendance by date range across all employees |
| `POST` | `/attendance/attendanceByFilterEmp` | Filter attendance by employee and date |
| `POST` | `/attendance/cleanattendance` | **Bulk-clean** invalid / duplicate attendance records |
| `POST` | `/attendance/getAttendanceStatus` | Get current check-in/out status |

---

## Section 12: Expense Management (Company Level)

**Route files**: `routes/expense.routes.js`, `routes/expenseHeader.routes.js`, `routes/expenseDetails.routes.js`, `routes/expenseCategory.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `DELETE` | `/expenses` | Delete all company expenses |
| `DELETE` | `/expenses/:id` | Delete a specific expense |
| `DELETE` | `/expenses/department/:id` | Delete all expenses for a department |

### Admin + Manager operations

| Method | Path | Description |
|---|---|---|
| `POST` | `/expenses` | Create a company expense |
| `GET` | `/expenses` | List all company expenses |
| `PUT` | `/expenses/:id` | Update an expense |
| `GET` | `/expenses/:id` | View a specific expense |
| `GET` | `/expenses/department/:id` | Filter expenses by department |

---

## Section 13: Announcements

**Route file**: `routes/departmentAnnouncement.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/departmentAnnouncements/recent` | View most recent announcements across all departments |

### Admin + Manager operations

| Method | Path | Description |
|---|---|---|
| `POST` | `/departmentAnnouncements` | Create an announcement (company-wide or department-level) |
| `DELETE` | `/departmentAnnouncements/:id` | Delete an announcement |
| `DELETE` | `/departmentAnnouncements/department/:id` | Delete all announcements for a department |

---

## Section 14: Messaging

**Route file**: `routes/userMessage.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `DELETE` | `/messages` | Delete all messages in the system |
| `DELETE` | `/messages/:id` | Delete a specific message |
| `DELETE` | `/messages/user/:id` | Delete all messages for a user |

---

## Section 15: Job Management

**Route file**: `routes/job.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `POST` | `/jobs` | Create a job/position |
| `PUT` | `/jobs/:id` | Update a job |
| `DELETE` | `/jobs/:id` | Delete a job |
| `DELETE` | `/jobs` | Delete all jobs |
| `DELETE` | `/jobs/user/:id` | Delete all jobs for a user |

### Admin + Manager operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/jobs` | List all jobs |
| `GET` | `/jobs/user/:id` | Get jobs for a specific user |

---

## Section 16: Customer Management

**Route file**: `routes/customer.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/customer` | List all customers |
| `GET` | `/customer/:id` | View a customer |
| `POST` | `/customer` | Create a customer |
| `PUT` | `/customer/:id` | Update a customer |
| `DELETE` | `/customer` | Delete all customers |

---

## Section 17: Vendor Management

**Route file**: `routes/vendor.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `GET` | `/vendor` | List all vendors |
| `GET` | `/vendor/:id` | View a vendor |
| `POST` | `/vendor` | Create a vendor |

---

## Section 18: Holidays & Working Day Configuration

**Route files**: `routes/daysHoliday.routes.js`, `routes/daysWorking.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `POST` | `/daysHolidays` | Add a public holiday |
| `GET` | `/daysHolidays` | List all holidays |
| `DELETE` | `/daysHolidays/:id` | Remove a holiday |
| `DELETE` | `/daysHolidays` | Clear all holidays |
| `POST` | `/daysWorkings` | Configure a working day |
| `DELETE` | `/daysWorkings/:id` | Remove a working day config |
| `DELETE` | `/daysWorkings` | Clear all working day configs |

---

## Section 19: Personal Events (Admin Delete Power)

**Route file**: `routes/userPersonalEvent.routes.js`

### Admin-only operations

| Method | Path | Description |
|---|---|---|
| `DELETE` | `/personalEvents/user/:id` | Delete all personal events for any user |
| `DELETE` | `/personalEvents` | Delete all personal events in the system |

---

## Section 20: Document Management

**Route file**: `routes/document.routes.js`

> **Note**: Document endpoints had no auth middleware (see Security Gaps). Admin was the intended operator for these.

| Method | Path | Description |
|---|---|---|
| `POST` | `/document/upload/profile/:userId` | Upload profile picture for any user |
| `POST` | `/document/upload/id/:userId` | Upload ID document |
| `POST` | `/document/upload/educational/:userId` | Upload educational certificate |
| `POST` | `/document/upload/esicpf/:userId` | Upload ESI/PF document |
| `GET` | `/document/documents/:userId` | View all documents for a user |
| `GET` | `/document/documents/:userId/:type` | View documents by type |
| `DELETE` | `/document/documents/:userId/:documentId` | Delete a document |

---

## Section 21: Supply Chain & Procurement (Unguarded)

**Route files**: `routes/item.routes.js`, `routes/labour.routes.js`, `routes/consumableItem.routes.js`, `routes/consumableExpense.routes.js`, `routes/uom.routes.js`, `routes/purchaseOrder.routes.js`, `routes/workOrder.routes.js`, `routes/vendorWorkOrder.routes.js`, `routes/deliveryChallan.routes.js`, `routes/measurementBill.routes.js`

> All endpoints below had no auth middleware. This entire supply chain module was effectively public.

| Domain | Operations Available |
|---|---|
| Items | Full CRUD (`GET`, `POST`, `PUT`, `DELETE`) |
| Labour | Full CRUD |
| Consumable Items | Full CRUD |
| Consumable Expenses | Full CRUD |
| Units of Measure (UOM) | Full CRUD |
| Purchase Orders | Full CRUD + filter by customer/project |
| Work Orders | Full CRUD + filter by customer/project |
| Vendor Work Orders | Full CRUD |
| Delivery Challans | Full CRUD + view (PDF render) |
| Measurement Bills | Full CRUD + view (PDF render) |

---

## Section 22: Project Management (Unguarded)

**Route files**: `routes/project.routes.js`, `routes/employeeProject.routes.js`, `routes/restdays.routes.js`

| Method | Path | Description |
|---|---|---|
| Full CRUD | `/project`, `/project/:id` | Create, read, update, delete projects |
| `GET` | `/project/customer/:customerId` | Filter projects by customer |
| `POST` | `/employeeProject/assign` | Assign an employee to a project |
| `PUT` | `/employeeProject/remove` | Remove an employee from a project |
| `GET` | `/employeeProject/emp/:userId` | View project assignments for an employee |
| `POST` | `/employeeProject/employeerestday` | Set rest days for an employee on a project |
| `POST` | `/restdays/add` | Add a rest day for a project |
| `GET` | `/restdays/list/:projectId` | View rest days for a project |

---

## Section 23: Overtime Management (Unguarded)

**Route file**: `routes/overtime.routes.js`

| Method | Path | Description |
|---|---|---|
| `GET` | `/overtime/list/:year/:month` | View all overtime records for a period |
| `PUT` | `/overtime/update/:id` | Approve / update an overtime record |

---

## Section 24: Address Management (Unguarded)

**Route file**: `routes/address.routes.js`

| Method | Path | Description |
|---|---|---|
| `POST` | `/address/create` | Create an address (for employee, customer, vendor, etc.) |
| `GET` | `/address/:entityId/:type/:addressType` | Retrieve an address by entity |
| `PUT` | `/address/update/:id` | Update an address |

---

## Privilege Summary Table

| Feature Domain | Admin-Only | Admin+Manager | Notes |
|---|---|---|---|
| User Management | Update, Delete users | List, filter users | Several endpoints unguarded |
| Roles & Permissions | Full CRUD + restore | — | Role clone endpoint unguarded |
| Organizations | Update, Delete | — | Create endpoint unguarded |
| Departments | Create, Delete | List, Update | — |
| Employee Profiles | Full CRUD on personal info | — | Create/update endpoints unguarded |
| Financial Info / Salary Structure | Create, Update | List | — |
| Payroll Processing | Generate, approve, export | — | All endpoints unguarded |
| Advance Payments | Create, List | — | All endpoints unguarded |
| Payments | Create, Delete (bulk) | List, Update, View | — |
| Fines | Create, List | — | Unguarded |
| Leave Applications | Bulk delete | Approve/Reject, Delete | Several endpoints unguarded |
| Attendance | Manual add, edit, clean | — | All endpoints unguarded |
| Expenses (company) | Bulk delete | Create, List, Update | Expense details unguarded |
| Announcements | View recent | Create, Delete | — |
| Messaging | Bulk delete | — | — |
| Jobs / Positions | Full CRUD | List, View | — |
| Customers | Full CRUD | — | — |
| Vendors | Create, List, View | — | — |
| Holidays & Working Days | Full CRUD | — | — |
| Documents | Upload, View, Delete | — | All endpoints unguarded |
| Supply Chain & Procurement | Full CRUD (10+ modules) | — | All unguarded |
| Projects | Full CRUD | — | All unguarded |
| Employee–Project Assignment | Assign, Remove | — | All unguarded |
| Overtime | View, Approve | — | Unguarded |
| Address Management | Create, Update, View | — | Unguarded |

---

## Critical Security Gaps in the Old Backend

The following were accessible with **no authentication whatsoever** — any unauthenticated HTTP client could call them:

| # | Endpoint(s) | Risk |
|---|---|---|
| 1 | `POST /users` | Register new accounts without credentials |
| 2 | `POST /users/emp-password-update` | Reset any employee's password |
| 3 | `POST /role/cloneRole` | Clone any role with all its permissions (privilege escalation) |
| 4 | `GET /rolePermission/roleId/:role` | Enumerate all permissions for any role |
| 5 | All 14 `/attendance/*` endpoints | Read / write attendance for any employee |
| 6 | All 5 `/salary/*` endpoints | Read salary data + generate salary slips |
| 7 | All 5 `/monthlySalary/*` endpoints | Bulk generate + export payroll CSV |
| 8 | All 3 `/advancePayment/*` endpoints | Create and list advance payments |
| 9 | `POST /fine/create`, `GET /fine/list` | Create fines, enumerate all fines |
| 10 | All `/project/*` endpoints | Full CRUD on all projects |
| 11 | All `/employeeProject/*` endpoints | Assign / remove employees from projects |
| 12 | All document upload endpoints | Upload files for any user |
| 13 | 30+ supply-chain endpoints | Full CRUD on procurement data |
| 14 | All `/restdays/*` and `/overtime/*` | Modify work schedules and overtime |
| 15 | `POST /employee`, `PUT /employee/update/:userId` | Create / modify employee records |
| 16 | Multiple `/applications/*` endpoints | Read and modify leave applications |
| 17 | `POST /expenseHeader/add`, all `/expenseDetails/*` | Submit and manage expenses |

> **Migration recommendation**: The Python FastAPI backend (`snapm-solution-erp`) correctly gates sensitive operations behind `require_admin` and `require_admin_or_manager` decorators. All of the above gaps should remain closed in the new backend.

---

## Endpoint Count Summary

| Auth Level | Approximate Count |
|---|---|
| Admin-only (withRoleAdmin) | ~60 |
| Admin + Manager (withRoleAdminOrManager) | ~25 |
| Manager-only (withRoleManager) | ~8 |
| Token-only (any authenticated user) | ~20 |
| **Unguarded / public (no auth)** | **~100+** |
| **Total** | **~215** |

More than **50% of API surface was unauthenticated** in the old backend.

---

*Generated: 2026-06-29 | Source: old Node.js/Express backend route audit*
