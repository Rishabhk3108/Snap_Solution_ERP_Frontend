import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Admin / shared pages
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeDetail from './pages/employees/EmployeeDetail';
import Attendance from './pages/attendance/Attendance';
import Profile from './pages/profile/Profile';

// Admin-only pages
import LeaveApprovals from './pages/admin/LeaveApprovals';
import Payroll from './pages/admin/Payroll';
import AdvancePayments from './pages/admin/AdvancePayments';
import Fines from './pages/admin/Fines';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import RoleManagement from './pages/admin/RoleManagement';
import HolidayManagement from './pages/admin/HolidayManagement';
import JobManagement from './pages/admin/JobManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import VendorManagement from './pages/admin/VendorManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import AnnouncementManagement from './pages/admin/AnnouncementManagement';

// Manager pages
import TeamLeaves from './pages/manager/TeamLeaves';
import TeamExpenses from './pages/manager/TeamExpenses';
import FinancialOverview from './pages/manager/FinancialOverview';
import PaymentRecords from './pages/manager/PaymentRecords';
import ManagerProjects from './pages/manager/ManagerProjects';

// Employee self-service pages
import MyAttendance from './pages/employee/MyAttendance';
import MySalary from './pages/employee/MySalary';
import Leave from './pages/employee/Leave';
import MyExpenses from './pages/employee/MyExpenses';
import Announcements from './pages/employee/Announcements';
import Messages from './pages/employee/Messages';
import MyEvents from './pages/employee/MyEvents';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Admin / Manager shared routes */}
              <Route path="employees" element={<EmployeeList />} />
              <Route path="employees/:id" element={<EmployeeDetail />} />
              <Route path="attendance" element={<Attendance />} />

              {/* Admin-only HR operations */}
              <Route path="leave-approvals" element={<LeaveApprovals />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="advance-payments" element={<AdvancePayments />} />
              <Route path="fines" element={<Fines />} />

              {/* Admin-only organization */}
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="roles" element={<RoleManagement />} />
              <Route path="holidays" element={<HolidayManagement />} />
              <Route path="job-positions" element={<JobManagement />} />

              {/* Admin-only business */}
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="vendors" element={<VendorManagement />} />
              <Route path="projects" element={<ProjectManagement />} />
              <Route path="admin-announcements" element={<AnnouncementManagement />} />

              {/* Manager-specific routes */}
              <Route path="manager-leaves" element={<TeamLeaves />} />
              <Route path="manager-expenses" element={<TeamExpenses />} />
              <Route path="financial-overview" element={<FinancialOverview />} />
              <Route path="payment-records" element={<PaymentRecords />} />
              <Route path="manager-announcements" element={<AnnouncementManagement />} />
              <Route path="my-projects" element={<ManagerProjects />} />

              {/* Shared */}
              <Route path="profile" element={<Profile />} />

              {/* Employee self-service routes */}
              <Route path="my-attendance" element={<MyAttendance />} />
              <Route path="my-salary" element={<MySalary />} />
              <Route path="leave" element={<Leave />} />
              <Route path="expenses" element={<MyExpenses />} />
              <Route path="announcements" element={<Announcements />} />
              <Route path="messages" element={<Messages />} />
              <Route path="my-events" element={<MyEvents />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
