import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllLeaves } from '../../api/leave';
import { getAllAnnouncements } from '../../api/announcements';
import { getAllDepartments } from '../../api/departments';
import { getAllFinancialInfo } from '../../api/financialInfo';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: leaves = [] } = useQuery({ queryKey: ['all-leaves'], queryFn: getAllLeaves, retry: false });
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements', 'all'], queryFn: getAllAnnouncements, retry: false });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getAllDepartments, retry: false });
  const { data: financialInfo = [] } = useQuery({ queryKey: ['all-financial-info'], queryFn: getAllFinancialInfo, retry: false });

  const allLeaves = leaves as any[];
  const pendingLeaves = allLeaves.filter(l => l.status === 'Pending');
  const approvedLeaves = allLeaves.filter(l => l.status === 'Approved');
  const allAnn = (announcements as any[]).slice(0, 4);
  const deptList = departments as any[];
  const finList = financialInfo as any[];

  const totalSalaryBudget = finList.reduce((s, f) => s + (f.salaryGross ?? f.salary_gross ?? 0), 0);

  const statCards = [
    { label: 'Total Departments', value: deptList.length, color: '#3b82f6', icon: 'M2 7l10-5 10 5v15H2V7z', sub: 'Active departments' },
    { label: 'Pending Leaves', value: pendingLeaves.length, color: '#f59e0b', icon: 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0', sub: 'Awaiting approval' },
    { label: 'Approved Leaves', value: approvedLeaves.length, color: '#16a34a', icon: 'M20 6 9 17l-5-5', sub: 'This period' },
    { label: 'Monthly Salary Budget', value: `₹${(totalSalaryBudget / 100000).toFixed(1)}L`, color: '#f4b400', icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6', sub: 'Gross total' },
  ];

  return (
    <div style={{ flex: 1 }}>
      {/* Header */}
      <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #E5E7EB' }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827' }}>
          Welcome back, <span style={{ color: '#f4b400' }}>{user?.fullname?.split(' ')[0]}</span>
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#9CA3AF' }}>Manager Dashboard — oversee your team's operations</p>
      </div>

      <div style={{ padding: 28 }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {statCards.map(({ label, value, color, icon, sub }) => (
            <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={icon} />
                  </svg>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</p>
              <p style={{ margin: '4px 0 2px', fontSize: 26, fontWeight: 800, color }}>{value}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#9CA3AF' }}>{sub}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>

          {/* Pending leaves */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                Pending Leave Requests <span style={{ color: '#f59e0b', fontWeight: 800 }}>({pendingLeaves.length})</span>
              </span>
              <button onClick={() => navigate('/manager-leaves')}
                style={{ fontSize: 12, color: '#f4b400', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                View All →
              </button>
            </div>
            {pendingLeaves.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>
                <p style={{ fontSize: 13 }}>No pending leave requests.</p>
              </div>
            ) : (
              pendingLeaves.slice(0, 5).map((l: any, i: number) => (
                <div key={l.id || i} style={{ padding: '11px 18px', borderBottom: i < Math.min(pendingLeaves.length, 5) - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{l.user?.fullname || `Employee #${l.user_id}`}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{l.start_date} → {l.end_date}</div>
                  </div>
                  <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontWeight: 600 }}>Pending</span>
                </div>
              ))
            )}
            {pendingLeaves.length > 5 && (
              <div style={{ padding: '10px 18px', borderTop: '1px solid #F3F4F6', textAlign: 'center' }}>
                <button onClick={() => navigate('/manager-leaves')} style={{ fontSize: 12, color: '#f4b400', background: 'none', border: 'none', cursor: 'pointer' }}>
                  +{pendingLeaves.length - 5} more — View all
                </button>
              </div>
            )}
          </div>

          {/* Departments + Announcements */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Departments quick view */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Departments</span>
              </div>
              {deptList.length === 0 ? (
                <p style={{ padding: '20px 18px', color: '#9CA3AF', fontSize: 12 }}>No departments loaded.</p>
              ) : (
                deptList.slice(0, 4).map((d: any, i: number) => (
                  <div key={d.id} style={{ padding: '10px 18px', borderBottom: i < Math.min(deptList.length, 4) - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{d.name}</div>
                    <span style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {d.id}</span>
                  </div>
                ))
              )}
            </div>

            {/* Recent announcements */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Recent Announcements</span>
                <button onClick={() => navigate('/manager-announcements')} style={{ fontSize: 12, color: '#f4b400', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Post →</button>
              </div>
              {allAnn.length === 0 ? (
                <p style={{ padding: '20px 18px', color: '#9CA3AF', fontSize: 12 }}>No announcements yet.</p>
              ) : (
                allAnn.map((a: any, i: number) => (
                  <div key={a.id || i} style={{ padding: '10px 18px', borderBottom: i < allAnn.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ fontSize: 12, color: '#111827', fontWeight: 500 }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Leave breakdown bar */}
        {allLeaves.length > 0 && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px', marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Leave Status Overview</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{allLeaves.length} total requests</span>
            </div>
            <div style={{ display: 'flex', height: 10, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
              {[
                { status: 'Approved', color: '#16a34a' },
                { status: 'Pending', color: '#f59e0b' },
                { status: 'Rejected', color: '#dc2626' },
              ].map(({ status, color }) => {
                const count = allLeaves.filter(l => l.status === status).length;
                const pct = (count / allLeaves.length) * 100;
                return pct > 0 ? <div key={status} style={{ height: '100%', background: color, width: `${pct}%`, borderRadius: 3 }} /> : null;
              })}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
              {[['Approved', '#22c55e'], ['Pending', '#f59e0b'], ['Rejected', '#ef4444']].map(([s, c]) => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                  <span style={{ fontSize: 11, color: '#6B7280' }}>{s}: {allLeaves.filter(l => l.status === s).length}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
