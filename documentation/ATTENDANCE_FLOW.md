# Attendance Flow — Snap Solutions ERP

> **Source files**: Node.js backend (`snap-solution-erp-anuruddha-dev/Backend`), Python FastAPI backend (`snapm-solution-erp`), React frontend (`snap_solution_erp_frontend/src`)
> **Database**: Supabase PostgreSQL — `attendance` table (schema in `attendance_schema.sql`)
> **Auth note**: Attendance routes carry **no role guards** in either backend — any authenticated user can call any endpoint. Role restrictions are enforced only at the UI layer.

---

## 1. Data Model

```
attendance
├── id               SERIAL PK
├── empid            INTEGER  → FK employees.id
├── project_id       INTEGER  → FK projects.id
├── date             DATE
├── start_time       TIME                   (null until check-in)
├── end_time         TIME                   (null until check-out)
├── number_of_hours  REAL                   (calculated on check-out)
├── ot_hours         INTEGER  DEFAULT 0     (calculated with OT logic)
├── location         VARCHAR(255)
├── year             INTEGER
└── month            INTEGER
```

A record is created at **check-in** (start_time set, end_time = null).  
It is completed at **check-out** (end_time set, number_of_hours calculated).

---

## 2. Attendance Status Codes

Used by `POST /api/attendance/getAttendanceStatus` — returns one status code per employee per date:

| Code | Meaning | Condition |
|------|---------|-----------|
| `L` | On Leave | Approved leave application covers this date |
| `R` | Rest Day | Entry exists in `restdays` table for this employee+date |
| `P` | Present | Clock-out recorded, total hours ≥ 5 |
| `H` | Half-Day | Clock-out recorded, total hours < 5 |
| `NC` | No Checkout | Checked in but 0 total hours (no end_time) |
| `A` | Absent | No attendance record at all |

Priority order when checking: Leave → Rest Day → Hours present → Absent.

---

## 3. OT (Overtime) Calculation

Applied in two endpoints: `POST /full` and `POST /updatepass`.

```
OT rules:
  If ot_status = 'Yes' (from user_financial_info) AND hours_worked > ot_working_hours:
    extra_minutes = (hours_worked - ot_working_hours) × 60
    if extra_minutes ≤ 90  →  ot_hours = 1
    if extra_minutes > 90  →  ot_hours = ceil(extra_minutes / 60)
  Else:
    ot_hours = 0
    number_of_hours = min(actual_hours, ot_working_hours)
```

`ot_working_hours` defaults to 8 hours per day (configurable per employee in `user_financial_info`).

---

## 4. API Endpoints

All routes mount under `/api/attendance/`.

| Method | Path | Used by | Description |
|--------|------|---------|-------------|
| `POST` | `/add` | Admin/Manager (UI) | Add check-in only (start_time, no end_time) |
| `PUT` | `/update` | Any | Add check-out by empid + date |
| `GET` | `/list/:empid/:year/:month` | Employee (own), Admin/Manager | Monthly attendance list with project names |
| `GET` | `/days-worked/:empid/:year/:month` | Employee (own), Admin/Manager | Count of unique days worked |
| `GET` | `/project/:projectId/date/:date` | Admin/Manager | All records for a project on a date |
| `GET` | `/reportee/:projectId/:date/:empid` | Manager | Manager's reportees + own record |
| `POST` | `/attendanceByDateRange` | Admin/Manager (UI) | All records in date range, optional project filter |
| `POST` | `/attendanceByFilterEmp` | Admin/Manager (UI) | Records in date range for one or all employees |
| `POST` | `/full` | Admin/Manager (UI) | Add complete record (start + end + OT calc) |
| `POST` | `/updateById` | Internal/Admin | Update start/end by record ID |
| `POST` | `/updatepass` | Desktop app | Update with password verification + OT calc |
| `GET` | `/attendanceForDesktop` | Desktop app | Current month incomplete records (no end_time) |
| `POST` | `/cleanattendance` | Admin | Delete today's attendance for rest-day employees |
| `POST` | `/getAttendanceStatus` | Dashboards | Status code for one employee on one date |
| `GET` | `/today-summary` | Admin Dashboard | Present count per project today |

---

## 5. ROLE_EMPLOYEE — Attendance Flow

### Where in UI
- **Page**: `/my-attendance` → `src/pages/employee/MyAttendance.tsx`
- **Also visible on**: Employee Dashboard (quick attendance stats + recent records)

### What an employee sees
- **Month/Year selector** — browse any month
- **4 summary cards**: Days Worked, Total Records, Total Hours, Overtime Hours
- **Monthly table** — one row per attendance record:
  - Date, Check In time, Check Out time (or "Ongoing"), Hours, OT, Location, Status badge (Complete / Ongoing)

### API calls made
| API Function | Endpoint | Purpose |
|---|---|---|
| `getAttendanceList(userId, year, month)` | `GET /list/:empid/:year/:month` | Fetch month's records |
| `getDaysWorked(userId, year, month)` | `GET /days-worked/:empid/:year/:month` | Unique days count |

### What an employee CANNOT do
- ❌ Cannot check themselves in or out (no UI for it — must be done via the desktop app or admin)
- ❌ Cannot view other employees' attendance
- ❌ Cannot filter by date range
- ❌ Cannot add, edit, or delete any attendance record

---

## 6. ROLE_MANAGER — Attendance Flow

### Where in UI
- **Page**: `/attendance` → `src/pages/attendance/Attendance.tsx` (shared with admin)
- **Also visible on**: Manager Dashboard (pending leave count, leave breakdown)

### What a manager sees
- **Today's summary cards**: Present Today, Absent Today, Total Employees, Attendance Rate
- **Date range filter** (Start Date → End Date)
- **Employee dropdown** — select individual employee or "All Employees"
- **Attendance table**: ID, Employee ID, Date, Start Time, End Time, Hours, OT, Location, Status badge
- **"+ Add Record" button** — opens modal to manually add a full attendance entry

### What a manager can do
| Action | Endpoint |
|--------|----------|
| View all attendance in a date range | `POST /attendanceByDateRange` |
| Filter by specific employee | `POST /attendanceByFilterEmp` |
| View today's present/absent summary | `GET /today-summary` |
| Manually add a complete attendance record | `POST /full` |

### What a manager CANNOT do (UI restriction)
- ❌ Cannot delete attendance records
- ❌ Cannot edit existing records inline (no edit button in UI)
- ❌ Cannot view reportee-specific attendance via `GET /reportee/:projectId/:date/:empid` (endpoint exists but no UI built for it)
- ❌ No "Clean Invalid Attendance" button (admin-style maintenance operation)

### Manager-exclusive endpoint (backend only, no UI)
`GET /reportee/:projectId/:date/:empid` — returns attendance for all employees whose `reportid` matches the manager's empid, plus the manager's own record. This is available for integration but not wired in the current UI.

---

## 7. ROLE_ADMIN — Attendance Flow

### Where in UI
- **Page**: `/attendance` → same shared `Attendance.tsx` (identical to manager view + same add capability)
- **Also visible on**: Admin Dashboard → "Present Today" / "Absent Today" stat cards + attendance rate progress bar

### What admin sees and does
Identical to manager UI — the `isAdminOrManager` flag in the page grants the same filter and add capabilities.

| Action | Endpoint |
|--------|----------|
| View attendance by date range | `POST /attendanceByDateRange` |
| Filter by employee | `POST /attendanceByFilterEmp` |
| View today's summary | `GET /today-summary` |
| Add a full attendance record | `POST /full` |
| View per-project summary on dashboard | `GET /today-summary` |

### Admin-exclusive capabilities (backend exists, no dedicated UI page)
| Endpoint | Description |
|----------|-------------|
| `POST /updateById` | Edit any record's start/end times by record ID |
| `POST /updatepass` | Update attendance with password-auth + OT recalculation |
| `GET /attendanceForDesktop` | Fetch all records with missing end_time (for the desktop companion app) |
| `POST /cleanattendance` | Delete today's attendance records for employees who are on a rest day |
| `POST /getAttendanceStatus` | Query P/H/A/L/R/NC status — used in dashboards |
| `GET /project/:id/date/:date` | View all employees' attendance for a project on a date |

---

## 8. Cross-Role Comparison

| Feature | Employee | Manager | Admin |
|---------|----------|---------|-------|
| View own monthly records | ✅ `/my-attendance` | ✅ (via `/attendance` filter) | ✅ |
| View all employees' records | ❌ | ✅ | ✅ |
| Filter by employee | ❌ | ✅ | ✅ |
| Filter by date range | ❌ | ✅ | ✅ |
| Add attendance record | ❌ | ✅ | ✅ |
| Edit attendance by ID | ❌ | ❌ UI | ✅ API only |
| Delete / clean records | ❌ | ❌ | ✅ API only |
| View today's org summary | ❌ | ✅ (limited) | ✅ |
| View status codes (P/H/A/L/R/NC) | ✅ (own, on dashboard) | ✅ | ✅ |
| Desktop app checkout flow | ✅ | ✅ | ✅ |

---

## 9. Check-In / Check-Out Flow (Two-Step Pattern)

```
Step 1 — Check-In:
  POST /api/attendance/add
  Body: { empid, projectId, date, startTime, location, year, month }
  Result: Record created, end_time = null, number_of_hours = null

Step 2 — Check-Out:
  PUT /api/attendance/update
  Body: { empid, date, endTime }
  Result: end_time set, number_of_hours = (end - start) in hours
```

Or via single call (used when admin/manager adds retrospectively):
```
POST /api/attendance/full
Body: { empid, projectId, date, startTime, endTime, location }
Result: Complete record created with OT calculation applied
```

---

## 10. Frontend API Client (`src/api/attendance.ts`)

Full list of exported functions and their mapped endpoints:

```typescript
addAttendance(payload)           → POST /attendance/add
updateAttendance(payload)        → PUT  /attendance/update
getAttendanceList(id, yr, mo)    → GET  /attendance/list/:id/:yr/:mo
getDaysWorked(id, yr, mo)        → GET  /attendance/days-worked/:id/:yr/:mo
getAttendanceByDateRange(body)   → POST /attendance/attendanceByDateRange
getAttendanceByFilterEmp(body)   → POST /attendance/attendanceByFilterEmp
getTodaySummary()                → GET  /attendance/today-summary
getAttendanceStatus(id, date)    → POST /attendance/getAttendanceStatus
updateAttendanceById(id, s?, e?) → POST /attendance/updateById
getAttendanceForProject(pid, dt) → GET  /attendance/project/:id/date/:dt
addFullAttendance(payload)       → POST /attendance/full
```

---

## 11. Dashboard Integration

### Employee Dashboard (`EmployeeDashboard.tsx`)
- Attendance status banner for today (calls `getAttendanceStatus`)
- "Days Worked" quick card (calls `getDaysWorked` for current month)
- Recent Attendance section — last 5 records (calls `getAttendanceList`)

### Admin Dashboard (`AdminDashboard.tsx`)
- "Present Today" stat card
- "Absent Today" stat card
- Attendance rate progress bar
- All sourced from `getTodaySummary()`

### Manager Dashboard (`ManagerDashboard.tsx`)
- Does not directly display attendance stats
- Shows pending leave count (related to attendance management)
- Leave status breakdown bar (Approved / Pending / Rejected)

---

## 12. Security Gap

> ⚠️ **Both backends expose all attendance endpoints with no authentication or role guards.**
> Any request with any valid (or even invalid) JWT can read or write attendance data.
> Role-based restrictions exist only in the React UI (via `isAdminOrManager` checks).
> This should be addressed in a future backend iteration by wrapping attendance routes in `require_token` middleware and adding `require_admin_or_manager` guards on write endpoints.

Affected write endpoints that should be admin/manager-only:
- `POST /attendance/add`
- `POST /attendance/full`
- `PUT /attendance/update`
- `POST /attendance/updateById`
- `POST /attendance/updatepass`
- `POST /attendance/cleanattendance`
