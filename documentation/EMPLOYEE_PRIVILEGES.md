# ROLE_EMPLOYEE Privileges — Old Node.js Backend

> Source: `snap-solution-erp-anuruddha-dev/Backend`  
> Auth middleware: `withAuth.js` — `verifyToken` (any logged-in user) | `withRoleAdminOrManager` | `withRoleAdmin`

---

## What a Normal Employee CAN Do

### 1. Own Profile & Account
| Action | Endpoint |
|--------|----------|
| View any user's basic profile | `GET /api/users/:id` |
| View users in their department | `GET /api/users/department/:id` |
| **Change own password** | `PUT /api/users/changePassword/:id` |
| View own financial info (salary, bank, allowances) | `GET /api/financialInformations/user/:id` |
| View a specific financial info record | `GET /api/financialInformations/:id` |

---

### 2. Leave & Applications
| Action | Endpoint |
|--------|----------|
| **Submit a leave application** | `POST /api/applications/` |
| View own leave applications | `GET /api/applications/user/:id` |
| View recent own leave applications | `GET /api/applications/recent/user/:id` |
| View a single application (any) | `GET /api/applications/:id` |

> ❌ Cannot approve/reject leaves — that is MANAGER+ only.

---

### 3. Personal Calendar / Events
| Action | Endpoint |
|--------|----------|
| **Create a personal event** | `POST /api/personalEvents/` |
| View own personal events | `GET /api/personalEvents/user/:id` |
| View a single personal event | `GET /api/personalEvents/:id` |
| **Update own personal event** | `PUT /api/personalEvents/:id` |
| **Delete own personal event** | `DELETE /api/personalEvents/:id` |

---

### 4. Announcements (Read-only)
| Action | Endpoint |
|--------|----------|
| View all announcements | `GET /api/departmentAnnouncements/` |
| View department announcements | `GET /api/departmentAnnouncements/department/:id` |
| View recent department announcements | `GET /api/departmentAnnouncements/recent/department/:id` |
| View a single announcement | `GET /api/departmentAnnouncements/:id` |

> ❌ Cannot create or delete announcements — that is MANAGER+ only.

---

### 5. Messaging
| Action | Endpoint |
|--------|----------|
| **Send a message** | `POST /api/messages/` |
| View own messages | `GET /api/messages/user/:id` |
| View a single message | `GET /api/messages/:id` |

> ❌ Cannot delete messages — that is ADMIN only.

---

### 6. Expenses (Own)
| Action | Endpoint |
|--------|----------|
| **Submit an expense header** | `POST /api/expenseHeader/add` |
| View own expense headers | `GET /api/expenseHeader/list` (filtered to own empid by server) |
| Count own pending expenses | `GET /api/expenseHeader/pending-expense-count` |
| Delete own expense header | `DELETE /api/expenseHeader/:id` |
| View year-wise expenses | `GET /api/expenses/year/:id` |

> ❌ Cannot approve or view all expenses — that is MANAGER+ only.

---

### 7. Company Reference Data (Read-only)
| Action | Endpoint |
|--------|----------|
| View a specific department | `GET /api/departments/:id` |
| View a specific holiday | `GET /api/daysHolidays/:id` |
| View all working days | `GET /api/daysWorkings/` |
| View a specific working day | `GET /api/daysWorkings/:id` |
| View a specific job listing | `GET /api/jobs/:id` |
| View organisation details | `GET /api/organizations/:id` |

---

### 8. Biometric / Face Attendance
| Action | Endpoint |
|--------|----------|
| **Mark attendance IN** (face scan) | `POST /api/face/in` |
| **Mark attendance OUT** (face scan) | `POST /api/face/out` |

---

## What a Normal Employee CANNOT Do

| Area | Blocked From |
|------|-------------|
| **User Management** | View all users, activate/deactivate accounts, update roles, delete users |
| **Personal Info** | View or edit personal information records (admin only) |
| **Department** | View all departments, create/update/delete departments |
| **Announcements** | Create or delete announcements |
| **Leave Management** | Approve, reject, or delete anyone's leave application |
| **Expenses** | Create global expenses, approve expense claims |
| **Salary / Payroll** | Generate salaries, change salary status, export salary CSV |
| **Fines** | Create or view fine records |
| **Overtime** | Modify overtime records |
| **Advance Payments** | Create or manage advance payment records |
| **Projects** | Assign/remove employees from projects |
| **Documents** | Upload or delete documents for other employees |
| **Customers / Vendors** | Any access — admin only |
| **Payments / Invoices** | Any access — admin only |
| **Inventory / Supply Chain** | Purchase orders, work orders, delivery challans, items, labour |
| **Roles & Permissions** | Any access — admin only |
| **Measurement Bills** | Any access — public but not a user-facing feature |

---

## ⚠️ Security Note — What Was Actually Public (No Auth at All)

The old backend had **no authentication** on many endpoints. This means even an unauthenticated user (no token) could technically access these — not an employee privilege, just an existing gap:

| Module | Status |
|--------|--------|
| All attendance endpoints | Public — no token needed |
| All salary/payroll endpoints | Public — no token needed |
| All document upload/delete endpoints | Public — no token needed |
| All project & assignment endpoints | Public — no token needed |
| All inventory/supply-chain endpoints | Public — no token needed |
| Fines, overtime, advance payments | Public — no token needed |
| Employee & user creation | Public — no token needed |

> These are **NOT employee privileges** — they were security gaps. The new Python backend (and the React frontend we're building) should enforce proper role checks on all of these.

---

## Summary for Frontend Feature Planning

When building the ROLE_EMPLOYEE view in the new frontend, these are the **legitimate features** to expose:

1. **Dashboard** — own attendance status for today, own upcoming leaves
2. **My Profile** — view own details, change password
3. **My Salary** — view own financial info / salary slip (read-only)
4. **Leave** — apply for leave, view own leave history and status
5. **Calendar** — create and manage personal events
6. **Announcements** — read department announcements
7. **Messages** — send and read messages
8. **Expenses** — submit and track own expense claims
9. **Attendance** — view own monthly attendance log
10. **Company Info** — view department info, holidays, working days
