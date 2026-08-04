import type { ReactElement } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const I = (paths: string[]) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {paths.map((d, i) => <path key={i} d={d} />)}
  </svg>
);

const icons = {
  dashboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  users:     () => I(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"]),
  clock:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  user:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  calendar:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  dollar:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  bell:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  mail:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  receipt:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  star:      () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  logout:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  check:     () => I(["M20 6 9 17l-5-5"]),
  payroll:   () => I(["M2 9h20M2 15h20", "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"]),
  advance:   () => I(["M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"]),
  fine:      () => I(["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]),
  building:  () => I(["M2 7l10-5 10 5v15H2V7z", "M9 22V12h6v10"]),
  shield:    () => I(["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"]),
  holiday:   () => I(["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"]),
  briefcase: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
  customer:  () => I(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2", "M23 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75", "M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"]),
  vendor:    () => I(["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"]),
  project:   () => I(["M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"]),
  megaphone: () => I(["M3 11l19-9-9 19-2-8-8-2z"]),
};

interface NavGroup { heading: string; items: { to: string; label: string; icon: () => ReactElement }[] }

const ADMIN_NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    ],
  },
  {
    heading: 'HR Operations',
    items: [
      { to: '/employees', label: 'Employees', icon: icons.users },
      { to: '/attendance', label: 'Attendance', icon: icons.clock },
      { to: '/leave-approvals', label: 'Leave Approvals', icon: icons.check },
      { to: '/payroll', label: 'Payroll', icon: icons.payroll },
      { to: '/advance-payments', label: 'Advance Payments', icon: icons.advance },
      { to: '/fines', label: 'Fines', icon: icons.fine },
    ],
  },
  {
    heading: 'Organization',
    items: [
      { to: '/departments', label: 'Departments', icon: icons.building },
      { to: '/roles', label: 'Roles & Permissions', icon: icons.shield },
      { to: '/holidays', label: 'Holidays', icon: icons.holiday },
      { to: '/job-positions', label: 'Job Positions', icon: icons.briefcase },
    ],
  },
  {
    heading: 'Business',
    items: [
      { to: '/customers', label: 'Customers', icon: icons.customer },
      { to: '/vendors', label: 'Vendors', icon: icons.vendor },
      { to: '/projects', label: 'Projects', icon: icons.project },
      { to: '/admin-announcements', label: 'Announcements', icon: icons.megaphone },
    ],
  },
  {
    heading: 'Account',
    items: [
      { to: '/profile', label: 'My Profile', icon: icons.user },
    ],
  },
];

const MANAGER_NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: icons.dashboard },
    ],
  },
  {
    heading: 'HR Operations',
    items: [
      { to: '/employees', label: 'Employees', icon: icons.users },
      { to: '/attendance', label: 'Attendance', icon: icons.clock },
      { to: '/manager-leaves', label: 'Team Leaves', icon: icons.check },
      { to: '/manager-expenses', label: 'Team Expenses', icon: icons.receipt },
      { to: '/financial-overview', label: 'Financial Overview', icon: icons.dollar },
      { to: '/payment-records', label: 'Payments', icon: icons.payroll },
    ],
  },
  {
    heading: 'Business',
    items: [
      { to: '/my-projects', label: 'Projects', icon: icons.project },
    ],
  },
  {
    heading: 'Organization',
    items: [
      { to: '/departments', label: 'Departments', icon: icons.building },
      { to: '/job-positions', label: 'Job Positions', icon: icons.briefcase },
      { to: '/manager-announcements', label: 'Announcements', icon: icons.megaphone },
    ],
  },
  {
    heading: 'Account',
    items: [
      { to: '/profile', label: 'My Profile', icon: icons.user },
    ],
  },
];

const EMPLOYEE_NAV: NavGroup[] = [
  {
    heading: 'Overview',
    items: [{ to: '/dashboard', label: 'Dashboard', icon: icons.dashboard }],
  },
  {
    heading: 'Work',
    items: [
      { to: '/my-attendance', label: 'My Attendance', icon: icons.clock },
      { to: '/my-salary', label: 'My Salary', icon: icons.dollar },
    ],
  },
  {
    heading: 'Connect',
    items: [
      { to: '/announcements', label: 'Announcements', icon: icons.bell },
      { to: '/messages', label: 'Messages', icon: icons.mail },
      { to: '/my-events', label: 'My Events', icon: icons.star },
    ],
  },
  {
    heading: 'Account',
    items: [{ to: '/profile', label: 'My Profile', icon: icons.user }],
  },
];

function NavItem({ to, label, icon: IconComp }: { to: string; label: string; icon: () => ReactElement }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px',
        borderRadius: 9, marginBottom: 2, textDecoration: 'none',
        fontSize: 13.5, fontWeight: 500, fontFamily: "'Plus Jakarta Sans', sans-serif",
        color: isActive ? '#F4B400' : '#374151',
        background: isActive ? 'rgba(244,180,0,0.08)' : 'transparent',
        borderLeft: isActive ? '3px solid #F4B400' : '3px solid transparent',
        transition: 'all 0.15s',
      })}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        if (!el.classList.contains('active')) {
          el.style.background = '#F3F4F6';
          el.style.color = '#111827';
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement;
        if (!el.classList.contains('active')) {
          el.style.background = '';
          el.style.color = '';
        }
      }}
    >
      <IconComp />
      {label}
    </NavLink>
  );
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navGroups =
    user?.role === 'ROLE_ADMIN' ? ADMIN_NAV :
    user?.role === 'ROLE_MANAGER' ? MANAGER_NAV :
    EMPLOYEE_NAV;

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleBadgeStyle = user?.role === 'ROLE_ADMIN'
    ? { color: '#3b82f6', background: 'rgba(59,130,246,0.08)' }
    : user?.role === 'ROLE_MANAGER'
    ? { color: '#7c3aed', background: 'rgba(124,58,237,0.08)' }
    : { color: '#f4b400', background: 'rgba(244,180,0,0.08)' };

  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: '#FFFFFF',
      borderRight: '1px solid #E5E7EB',
      display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(244,180,0,0.1)', border: '1.5px solid rgba(244,180,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="#f4b400" strokeWidth="2.5"/>
              <rect x="11" y="7" width="2.5" height="9" rx="1.25" fill="#f4b400" transform="rotate(8 12 12)"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#f4b400', letterSpacing: 3, fontFamily: "'Archivo', sans-serif" }}>SNAP</div>
            <div style={{ fontSize: 8, color: '#9CA3AF', letterSpacing: 2, textTransform: 'uppercase', marginTop: -1, fontFamily: "'Archivo', sans-serif" }}>ERP System</div>
          </div>
        </div>
      </div>

      {/* Role badge */}
      <div style={{ padding: '8px 14px 4px', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: "'Archivo', sans-serif", padding: '3px 7px', borderRadius: 4, ...roleBadgeStyle }}>
          {user?.role?.replace('ROLE_', '')}
        </span>
      </div>

      {/* Nav groups */}
      <nav style={{ flex: 1, padding: '6px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
        {navGroups.map(group => (
          <div key={group.heading} style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#9CA3AF', letterSpacing: 1.5, textTransform: 'uppercase', padding: '6px 10px 4px', fontFamily: "'Archivo', sans-serif" }}>
              {group.heading}
            </div>
            {group.items.map(item => <NavItem key={item.to} {...item} />)}
          </div>
        ))}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '10px 8px', borderTop: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8, background: '#F9FAFB', marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(244,180,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#f4b400', flexShrink: 0 }}>
            {user?.fullname?.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.fullname}</div>
            <div style={{ fontSize: 10, color: '#9CA3AF' }}>ID: {user?.id}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'transparent', border: 'none', borderRadius: 7, color: '#9CA3AF', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          onMouseEnter={e => { (e.currentTarget).style.background = 'rgba(239,68,68,0.07)'; (e.currentTarget).style.color = '#ef4444'; }}
          onMouseLeave={e => { (e.currentTarget).style.background = 'transparent'; (e.currentTarget).style.color = '#9CA3AF'; }}
        >
          {icons.logout()}
          Sign Out
        </button>
      </div>
    </aside>
  );
}
