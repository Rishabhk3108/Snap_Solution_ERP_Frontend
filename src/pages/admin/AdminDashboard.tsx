import { useQuery } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getTotalUsers, getActiveUsers } from '../../api/users';
import { getTodaySummary, getIncompleteCheckouts } from '../../api/attendance';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function StatCard({ label, value, sub, accent = false, icon }: {
  label: string; value: string | number; sub?: string; accent?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: accent ? '1px solid rgba(244,180,0,0.4)' : '1px solid #E5E7EB',
      borderRadius: 14, padding: '20px 22px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{label}</p>
          <p style={{ margin: '6px 0 0', fontSize: 30, fontWeight: 800, color: accent ? '#f4b400' : '#111827', fontFamily: "'Archivo', sans-serif" }}>{value}</p>
          {sub && <p style={{ margin: '3px 0 0', fontSize: 12, color: '#9CA3AF' }}>{sub}</p>}
        </div>
        {icon && <div style={{ width: 42, height: 42, borderRadius: 10, background: accent ? 'rgba(244,180,0,0.1)' : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent ? '#f4b400' : '#6B7280' }}>{icon}</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdminOrManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const { data: totalData } = useQuery({ queryKey: ['users', 'total'], queryFn: getTotalUsers, enabled: isAdminOrManager, retry: false });
  const { data: activeUsers } = useQuery({ queryKey: ['users', 'active'], queryFn: getActiveUsers, enabled: isAdminOrManager, retry: false });
  const { data: todaySummary } = useQuery({ queryKey: ['attendance', 'today-summary'], queryFn: getTodaySummary, retry: false });
  const { data: incompleteList = [] } = useQuery({ queryKey: ['attendance', 'incomplete-today'], queryFn: getIncompleteCheckouts, enabled: isAdminOrManager, retry: false });

  const totalCount = totalData?.total ?? totalData?.count ?? (activeUsers?.length ?? 0);
  const presentToday = todaySummary?.present ?? 0;
  const absentToday = todaySummary?.absent ?? 0;
  const totalForAttendance = todaySummary?.total ?? totalCount;
  const presentPct = totalForAttendance > 0 ? Math.round((presentToday / totalForAttendance) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ flex: 1 }}>
      <Header title="Dashboard" subtitle={`${greeting}, ${user?.fullname?.split(' ')[0] ?? 'Admin'}`} />
      <div style={{ padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 28 }}>
          <StatCard label="Total Employees" value={totalCount || '—'} sub="Registered in system" accent
            icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
          <StatCard label="Active Employees" value={activeUsers?.length ?? '—'} sub="Currently employed"
            icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>} />
          <StatCard label="Present Today" value={presentToday} sub={`${presentPct}% attendance rate`}
            icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>} />
          <StatCard label="Absent Today" value={absentToday} sub="Not checked in"
            icon={<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>} />
        </div>

        {totalForAttendance > 0 && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '18px 22px', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Today's Attendance</span>
              <span style={{ fontSize: 13, color: '#f4b400', fontWeight: 700 }}>{presentPct}%</span>
            </div>
            <div style={{ height: 7, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${presentPct}%`, background: '#f4b400', borderRadius: 4, transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
              <span style={{ fontSize: 12, color: '#22c55e' }}>● Present: {presentToday}</span>
              <span style={{ fontSize: 12, color: '#ef4444' }}>● Absent: {absentToday}</span>
              <span style={{ fontSize: 12, color: '#9CA3AF' }}>Total: {totalForAttendance}</span>
            </div>
          </div>
        )}

        {(incompleteList as any[]).length > 0 && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 14, overflow: 'hidden', marginBottom: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px', borderBottom: '1px solid #F3F4F6', background: 'rgba(245,158,11,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15 }}>⚠️</span>
                <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#92400e', fontFamily: "'Archivo', sans-serif" }}>
                  Incomplete Check-outs Today ({(incompleteList as any[]).length})
                </h3>
              </div>
              <button onClick={() => navigate('/attendance')} style={{ fontSize: 12, color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Manage →</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '14px 22px' }}>
              {(incompleteList as any[]).map((r: any) => (
                <div key={r.empid} style={{ background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '6px 12px' }}>
                  <span style={{ fontSize: 13, color: '#92400e', fontWeight: 600 }}>{r.fullname}</span>
                  <span style={{ fontSize: 11, color: '#a16207', marginLeft: 8 }}>in {r.start_time?.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 22px', borderBottom: '1px solid #E5E7EB' }}>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Recent Employees</h3>
            <button onClick={() => navigate('/employees')} style={{ fontSize: 12, color: '#f4b400', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>View all →</button>
          </div>
          {activeUsers && activeUsers.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    {['ID', 'Name', 'Role', 'Job Title', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeUsers.slice(0, 8).map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < 7 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}
                      onClick={() => navigate(`/employees/${u.id}`)}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#9CA3AF' }}>#{u.id}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(244,180,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#f4b400' }}>{u.fullname?.charAt(0)}</div>
                          <span style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{u.fullname}</span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(244,180,0,0.1)', color: '#d97706', fontWeight: 600 }}>{u.role?.replace('ROLE_', '')}</span></td>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#6B7280' }}>{u.jobTitle || '—'}</td>
                      <td style={{ padding: '10px 14px' }}><span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#16a34a', fontWeight: 600 }}>Active</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center', padding: '28px 0' }}>{activeUsers === undefined ? 'Loading…' : 'No employees found.'}</p>
          )}
        </div>
      </div>
    </div>
  );
}
