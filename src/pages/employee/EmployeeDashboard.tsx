import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { getAttendanceList, getDaysWorked, getAttendanceStatus, addAttendance, updateAttendance } from '../../api/attendance';
import { getMyLeaves } from '../../api/leave';
import { getAllAnnouncements } from '../../api/announcements';
import { getFinancialInfoByUser } from '../../api/financialInfo';

function QuickCard({ label, value, sub, color = '#f4b400', onClick }: {
  label: string; value: string | number; sub?: string; color?: string; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px', cursor: onClick ? 'pointer' : 'default', transition: 'border-color 0.15s' }}
      onMouseEnter={e => onClick && ((e.currentTarget as HTMLDivElement).style.borderColor = color)}
      onMouseLeave={e => onClick && ((e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB')}
    >
      <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{label}</p>
      <p style={{ margin: '6px 0 2px', fontSize: 28, fontWeight: 800, color }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF' }}>{sub}</p>}
    </div>
  );
}

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Approved: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  Rejected: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  Pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
};

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  P:  { label: 'Present',     color: '#16a34a', bg: 'rgba(34,197,94,0.12)'  },
  H:  { label: 'Half Day',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  NC: { label: 'Checked In',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  A:  { label: 'Not Checked In', color: '#6B7280', bg: 'rgba(156,163,175,0.1)' },
  L:  { label: 'On Leave',    color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  R:  { label: 'Rest Day',    color: '#9CA3AF', bg: 'rgba(107,114,128,0.12)' },
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const [attMsg, setAttMsg] = useState('');

  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const { data: attStatus } = useQuery({
    queryKey: ['att-status', user?.id, today],
    queryFn: () => getAttendanceStatus(user!.id, today),
    enabled: !!user?.id, retry: false,
  });
  const { data: daysWorked } = useQuery({
    queryKey: ['daysWorked', user?.id, year, month],
    queryFn: () => getDaysWorked(user!.id, year, month),
    enabled: !!user?.id, retry: false,
  });
  const { data: attList = [] } = useQuery({
    queryKey: ['att-list', user?.id, year, month],
    queryFn: () => getAttendanceList(user!.id, year, month),
    enabled: !!user?.id, retry: false,
  });
  const { data: leaves = [] } = useQuery({
    queryKey: ['my-leaves', user?.id],
    queryFn: () => getMyLeaves(user!.id),
    enabled: !!user?.id, retry: false,
  });
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: getAllAnnouncements,
    retry: false,
  });
  const { data: financial } = useQuery({
    queryKey: ['financial', user?.id],
    queryFn: () => getFinancialInfoByUser(user!.id),
    enabled: !!user?.id, retry: false,
  });

  const checkInMut = useMutation({
    mutationFn: () => {
      const t = new Date();
      const timeStr = t.toTimeString().split(' ')[0];
      return addAttendance({ empid: user!.id, projectId: 1, date: today, startTime: timeStr, location: '', year, month });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['att-status'] });
      qc.invalidateQueries({ queryKey: ['att-list'] });
      qc.invalidateQueries({ queryKey: ['daysWorked'] });
      setAttMsg('Checked in successfully!');
      setTimeout(() => setAttMsg(''), 4000);
    },
    onError: (e: any) => {
      setAttMsg(e?.response?.data?.error || 'Check-in failed. Please try again.');
      setTimeout(() => setAttMsg(''), 4000);
    },
  });

  const checkOutMut = useMutation({
    mutationFn: () => {
      const t = new Date();
      const timeStr = t.toTimeString().split(' ')[0];
      return updateAttendance({ empid: user!.id, date: today, endTime: timeStr });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['att-status'] });
      qc.invalidateQueries({ queryKey: ['att-list'] });
      qc.invalidateQueries({ queryKey: ['daysWorked'] });
      setAttMsg('Checked out successfully!');
      setTimeout(() => setAttMsg(''), 4000);
    },
    onError: (e: any) => {
      setAttMsg(e?.response?.data?.error || 'Check-out failed. Please try again.');
      setTimeout(() => setAttMsg(''), 4000);
    },
  });

  const daysWorkedCount = typeof daysWorked === 'object' ? (daysWorked as any)?.daysWorked ?? 0 : daysWorked ?? 0;
  const pendingLeaves = (leaves as any[]).filter(l => l.status === 'Pending').length;
  const approvedLeaves = (leaves as any[]).filter(l => l.status === 'Approved').length;
  const currentStatus = (attStatus as any)?.status ?? 'A';
  const isCheckedIn = ['P', 'H', 'NC'].includes(currentStatus);
  const recentAttendance = (attList as any[]).slice(-5).reverse();

  return (
    <div style={{ flex: 1 }}>
      <Header title="My Dashboard" subtitle={`${greeting}, ${user?.fullname?.split(' ')[0]} 👋`} />

      <div style={{ padding: 28 }}>
        {/* Attendance Status Banner */}
        {(() => {
          const sl = STATUS_LABELS[currentStatus] ?? STATUS_LABELS.A;
          return (
            <div style={{ background: sl.bg, border: `1px solid ${sl.color}40`, borderRadius: 12, padding: '16px 22px', marginBottom: attMsg ? 10 : 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: sl.color, boxShadow: `0 0 8px ${sl.color}` }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>{sl.label}</span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{today}</span>
                  {currentStatus === 'NC' && <span style={{ fontSize: 12, color: '#3b82f6' }}>— Remember to check out!</span>}
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {currentStatus === 'A' && (
                    <button
                      onClick={() => checkInMut.mutate()}
                      disabled={checkInMut.isPending}
                      style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {checkInMut.isPending ? 'Checking in…' : '▶ Check In'}
                    </button>
                  )}
                  {currentStatus === 'NC' && (
                    <button
                      onClick={() => checkOutMut.mutate()}
                      disabled={checkOutMut.isPending}
                      style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {checkOutMut.isPending ? 'Checking out…' : '■ Check Out'}
                    </button>
                  )}
                  <button onClick={() => navigate('/my-attendance')}
                    style={{ background: 'transparent', color: sl.color, border: `1px solid ${sl.color}60`, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    View Attendance →
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
        {attMsg && (
          <div style={{ marginBottom: 22, padding: '10px 16px', borderRadius: 8, fontSize: 13,
            background: attMsg.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${attMsg.includes('success') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            color: attMsg.includes('success') ? '#22c55e' : '#ef4444' }}>
            {attMsg}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          <QuickCard label="Days Worked" value={daysWorkedCount} sub={`${now.toLocaleString('default', { month: 'long' })} ${year}`} onClick={() => navigate('/my-attendance')} />
          <QuickCard label="Pending Leaves" value={pendingLeaves} sub="Awaiting approval" color="#f59e0b" onClick={() => navigate('/leave')} />
          <QuickCard label="Approved Leaves" value={approvedLeaves} sub="This account" color="#22c55e" onClick={() => navigate('/leave')} />
          <QuickCard label="Net Salary" value={financial?.salaryNet ? `₹${financial.salaryNet.toLocaleString()}` : '—'} sub="Current month" onClick={() => navigate('/my-salary')} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Recent Attendance */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Recent Attendance</span>
              <button onClick={() => navigate('/my-attendance')} style={{ fontSize: 11, color: '#f4b400', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
            </div>
            {recentAttendance.length === 0 ? (
              <p style={{ padding: '20px 18px', color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>No attendance records yet.</p>
            ) : (
              recentAttendance.map((a: any, i: number) => (
                <div key={i} style={{ padding: '10px 18px', borderBottom: i < recentAttendance.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{a.date}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{(a.startTime ?? a.start_time) || '—'} → {(a.endTime ?? a.end_time) || 'Ongoing'}</div>
                  </div>
                  <span style={{ fontSize: 12, color: (a.endTime ?? a.end_time) ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                    {(a.numberOfHours ?? a.number_of_hours) != null ? `${a.numberOfHours ?? a.number_of_hours}h` : (a.endTime ?? a.end_time) ? '✓' : 'In'}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Leave Requests */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>My Leave Requests</span>
              <button onClick={() => navigate('/leave')} style={{ fontSize: 11, color: '#f4b400', background: 'none', border: 'none', cursor: 'pointer' }}>Apply leave →</button>
            </div>
            {(leaves as any[]).length === 0 ? (
              <p style={{ padding: '20px 18px', color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>No leave applications.</p>
            ) : (
              (leaves as any[]).slice(0, 5).map((l: any, i: number) => {
                const sc = STATUS_COLORS[l.status] || STATUS_COLORS.Pending;
                return (
                  <div key={i} style={{ padding: '10px 18px', borderBottom: i < 4 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#111827' }}>{l.start_date} → {l.end_date}</div>
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>
                        {l.start_date && l.end_date ? `${Math.ceil((new Date(l.end_date).getTime() - new Date(l.start_date).getTime()) / 86400000) + 1} day(s)` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color, fontWeight: 600 }}>{l.status}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Announcements */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', gridColumn: '1 / -1' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Recent Announcements</span>
              <button onClick={() => navigate('/announcements')} style={{ fontSize: 11, color: '#f4b400', background: 'none', border: 'none', cursor: 'pointer' }}>View all →</button>
            </div>
            {(announcements as any[]).length === 0 ? (
              <p style={{ padding: '20px 18px', color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>No announcements at the moment.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                {(announcements as any[]).slice(0, 4).map((a: any, i: number) => (
                  <div key={i} style={{ padding: '12px 18px', borderBottom: i < 2 ? '1px solid #F3F4F6' : 'none', borderRight: i % 2 === 0 ? '1px solid #F3F4F6' : 'none' }}>
                    <div style={{ fontSize: 13, color: '#111827', fontWeight: 600, marginBottom: 4 }}>{a.title || 'Announcement'}</div>
                    <div style={{ fontSize: 12, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.content || a.announcement || '—'}</div>
                    {a.createdAt && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{new Date(a.createdAt).toLocaleDateString()}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
