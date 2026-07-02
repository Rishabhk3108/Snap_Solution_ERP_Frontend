import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import ManagerDashboard from './manager/ManagerDashboard';
import EmployeeDashboard from './employee/EmployeeDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'ROLE_ADMIN') return <AdminDashboard />;
  if (user?.role === 'ROLE_MANAGER') return <ManagerDashboard />;
  return <EmployeeDashboard />;
}
