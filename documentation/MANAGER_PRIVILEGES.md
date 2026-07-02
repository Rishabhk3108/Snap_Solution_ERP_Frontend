# ROLE_MANAGER Privileges — Old Node.js/Express Backend

> **Source**: `d:\ERP System\snap-solution-erp-anuruddha-dev\Backend\`
> **Purpose**: Documents every capability ROLE_MANAGER users had in the legacy system.
> **Companion docs**: See `ADMIN_PRIVILEGES.md` and `EMPLOYEE_PRIVILEGES.md`.

---

## Middleware Definitions

```js
// withRoleManager — manager-only
exports.withRoleManager = (req, res, next) => {
  User.findOne({ where: { id: authData.user.id } }).then(user => {
    if (user?.role === "ROLE_MANAGER") next();
    else res.status(401).send({ message: "Access denied: Role can't access this api" });
  });
};

// withRoleAdminOrManager — admin OR manager
exports.withRoleAdminOrManager = (req, res, next) => {
  User.findOne({ where: { id: authData.user.id } }).then(user => {
    if (user?.role === "ROLE_ADMIN" || user?.role === "ROLE_MANAGER") next();
    else res.status(401).send({ message: "Access denied: Role can't access this api" });
  });
};
```

Both middlewares hit the database on every request to re-verify the role (not just the JWT claim).

---

## Section 1: User Management

**Route file**: `routes/user.routes.js`

### Manager-exclusive

| Method | Path | Description |
|---|---|---|
| `GET` | `/users/total/department/:id` | Get total employee count for a specific department |

### Shared with Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List all users in the system |
| `GET` | `/users/nullend` | List active employees (null end date) |
| `GET` | `/users/notnull` | List terminated employees (end date set) |
| `PUT` | `/users/updateEndDate/:id` | Update an employee's end/termination date |
| `GET` | `/users/total` | Get total employee count (org-wide) |

---

## Section 2: Department Management

**Route file**: `routes/department.routes.js`

### Shared with Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/departments` | List all departments |
| `PUT` | `/departments/:id` | Update a department's details |

> **Note**: A manager can update departments but **cannot create or delete them** — those are admin-only.

---

## Section 3: Leave / Application Management

**Route file**: `routes/application.routes.js`

### Manager-exclusive

| Method | Path | Description |
|---|---|---|
| `GET` | `/applications/department/:id` | View all leave applications for a specific department |
| `GET` | `/applications/recent/department/:id` | View recent leave applications for a specific department |

### Shared with Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/applications` | View all leave applications across the org |
| `PUT` | `/applications/:id` | **Approve or reject** a leave application |
| `DELETE` | `/applications/:id` | Delete a leave application |

---

## Section 4: Expense Management (Company Level)

**Route file**: `routes/expense.routes.js`

### Manager-exclusive

| Method | Path | Description |
|---|---|---|
| `GET` | `/expenses/year/:id/department/:id2` | View expenses filtered by year AND department |

### Shared with Admin

| Method | Path | Description |
|---|---|---|
| `POST` | `/expenses` | Create a company expense |
| `GET` | `/expenses` | List all company expenses |
| `GET` | `/expenses/:id` | View a specific expense |
| `PUT` | `/expenses/:id` | Update an expense |
| `GET` | `/expenses/department/:id` | Filter expenses by department |

---

## Section 5: Financial Information

**Route file**: `routes/userFinancialInformation.routes.js`

### Shared with Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/financialInformations` | View all employees' salary and financial info |

> **Note**: A manager can **read** financial info but **cannot create or update** salary structures — those are admin-only.

---

## Section 6: Payment Records

**Route file**: `routes/payment.routes.js`

### Shared with Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/payments` | List all payment records |
| `GET` | `/payments/year/:id` | Filter payments by year |
| `GET` | `/payments/job/:id` | Filter payments by job |
| `GET` | `/payments/:id` | View a specific payment |
| `PUT` | `/payments/:id` | Update a payment record |

> **Note**: A manager can **read and update** payments but **cannot create or delete** them — those are admin-only.

---

## Section 7: Job Management

**Route file**: `routes/job.routes.js`

### Shared with Admin

| Method | Path | Description |
|---|---|---|
| `GET` | `/jobs` | List all job positions |
| `GET` | `/jobs/user/:id` | View job assignments for a specific user |

> **Note**: A manager can **view** jobs but **cannot create, update, or delete** them — those are admin-only.

---

## Section 8: Announcements

**Route file**: `routes/departmentAnnouncement.routes.js`

### Shared with Admin

| Method | Path | Description |
|---|---|---|
| `POST` | `/departmentAnnouncements` | Create an announcement (company-wide or department) |
| `DELETE` | `/departmentAnnouncements/:id` | Delete an announcement |
| `DELETE` | `/departmentAnnouncements/department/:id` | Delete all announcements for a department |

---

## Complete Privilege Summary

### Manager-Exclusive Endpoints (ROLE_MANAGER only — admin cannot use these)

| # | Method | Path | Description |
|---|---|---|---|
| 1 | `GET` | `/users/total/department/:id` | Employee count for a specific department |
| 2 | `GET` | `/expenses/year/:id/department/:id2` | Expenses filtered by year + department |
| 3 | `GET` | `/applications/department/:id` | Leave applications for a department |
| 4 | `GET` | `/applications/recent/department/:id` | Recent leave applications for a department |

> Only 4 endpoints are manager-exclusive. In practice these are **narrower, department-scoped views** of data that the admin can already see org-wide.

### Shared with Admin (withRoleAdminOrManager)

| Domain | Manager Can Do |
|---|---|
| Users | List all, filter active/terminated, update end dates, get total count |
| Departments | List all, update (cannot create or delete) |
| Leave Applications | View all, approve/reject, delete |
| Expenses | Create, view, update (cannot delete) |
| Financial Info | Read-only view of all salary records |
| Payments | View and update (cannot create or delete) |
| Jobs | View only (cannot create, update, or delete) |
| Announcements | Create and delete |

### What a Manager CANNOT Do (Admin-only)

| Capability | Admin | Manager |
|---|---|---|
| Delete users / bulk delete by department | ✅ | ❌ |
| Create / delete roles and permissions | ✅ | ❌ |
| Assign permissions to roles | ✅ | ❌ |
| Create / delete organizations | ✅ | ❌ |
| Create / delete departments | ✅ | ❌ |
| Create / update salary structures (financial info) | ✅ | ❌ |
| Generate monthly payroll | ✅ | ❌ |
| Mark salaries as paid / export CSV | ✅ | ❌ |
| Record advance payments | ✅ | ❌ |
| Create fines | ✅ | ❌ |
| Create / delete payments | ✅ | ❌ |
| Create / update / delete job positions | ✅ | ❌ |
| Manage customers and vendors | ✅ | ❌ |
| Configure holidays and working days | ✅ | ❌ |
| Delete personal events (any user) | ✅ | ❌ |
| Delete all messages | ✅ | ❌ |
| Full CRUD on projects and project assignment | ✅ | ❌ |
| Manage supply chain / procurement | ✅ | ❌ |
| Document uploads | ✅ | ❌ |

---

## Endpoint Count

| Category | Count |
|---|---|
| Manager-exclusive (`withRoleManager`) | **4** |
| Shared with Admin (`withRoleAdminOrManager`) | **~25** |
| Total manager-accessible (protected) | **~29** |

The manager role has access to roughly **14% of the protected API surface** compared to the admin role (~85 protected endpoints).

---

*Generated: 2026-06-29 | Source: old Node.js/Express backend route audit*
