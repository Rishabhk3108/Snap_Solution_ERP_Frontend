import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import {
  getAttendanceByDateRange,
  getAttendanceByFilterEmp,
  addFullAttendance,
  getTodaySummary,
  updateAttendanceById,
} from '../../api/attendance';
import { getActiveUsers } from '../../api/users';
import { useAuth } from '../../contexts/AuthContext';

function formatTime(t?: string) {
  if (!t) return '—';
  return t.length > 5 ? t.slice(0, 5) : t;
}

function calcHours(start?: string, end?: string): string {
  if (!start || !end) return '—';
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return '—';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

const inputStyle = {
  background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7,
  padding: '8px 12px', color: '#111827', fontSize: 13, outline: 'none',
};

export default function Attendance() {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'ROLE_ADMIN' || user?.role === 'ROLE_MANAGER';

  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = `${today.slice(0, 7)}-01`;

  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [empFilter, setEmpFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editRecord, setEditRecord] = useState<any | null>(null);
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editMsg, setEditMsg] = useState('');

  const [newAtt, setNewAtt] = useState({
    empid: '', projectId: '1', date: today,
    startTime: '09:00', endTime: '18:00', location: 'Office',
  });
  const [addMsg, setAddMsg] = useState('');

  const { data: todaySummary } = useQuery({ queryKey: ['attendance', 'today-summary'], queryFn: getTodaySummary, retry: 1 });
  const { data: activeUsers = [] } = useQuery({ queryKey: ['users', 'active'], queryFn: getActiveUsers, retry: 1 });

  const filterQuery = useQuery({
    queryKey: ['attendance', 'filter', startDate, endDate, empFilter],
    queryFn: () => empFilter
      ? getAttendanceByFilterEmp({ startDate, endDate, empid: empFilter })
      : getAttendanceByDateRange({ startDate, endDate }),
    enabled: !!(startDate && endDate),
  });

  const editMut = useMutation({
    mutationFn: () => updateAttendanceById(editRecord!.id, editStart || undefined, editEnd || undefined),
    onSuccess: () => {
      setEditMsg('Updated successfully!');
      filterQuery.refetch();
      setTimeout(() => { setEditRecord(null); setEditMsg(''); }, 900);
    },
    onError: (e: any) => setEditMsg(e.response?.data?.error || 'Failed to update record'),
  });

  const addMut = useMutation({
    mutationFn: () => addFullAttendance({
      empid: Number(newAtt.empid),
      projectId: Number(newAtt.projectId),
      date: newAtt.date,
      startTime: newAtt.startTime,
      endTime: newAtt.endTime,
      location: newAtt.location,
    }),
    onSuccess: () => {
      setAddMsg('Attendance added successfully!');
      setShowAdd(false);
      filterQuery.refetch();
    },
    onError: (e: any) => setAddMsg(e.response?.data?.error || 'Failed to add attendance'),
  });

  const records: any[] = Array.isArray(filterQuery.data) ? filterQuery.data : [];
  const empMap = Object.fromEntries((activeUsers as any[]).map((u: any) => [u.id, u.fullname]));

  const presentPct = todaySummary?.total > 0
    ? Math.round((todaySummary.present / todaySummary.total) * 100)
    : 0;

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Attendance"
        subtitle="Track and manage employee attendance"
        action={isAdminOrManager ? (
          <button
            onClick={() => { setShowAdd(true); setAddMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            + Add Record
          </button>
        ) : undefined}
      />

      <div style={{ padding: 28 }}>
        {/* Today summary */}
        {todaySummary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
            {[
              { label: "Today's Present", val: todaySummary.present, color: '#16a34a' },
              { label: "Today's Absent", val: todaySummary.absent, color: '#dc2626' },
              { label: 'Total Employees', val: todaySummary.total, color: '#111827' },
              { label: 'Attendance Rate', val: `${presentPct}%`, color: '#f4b400' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{label}</p>
                <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color, fontFamily: "'Archivo', sans-serif" }}>{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
            </div>
            {isAdminOrManager && (
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>Employee</label>
                <select value={empFilter} onChange={e => setEmpFilter(e.target.value)} style={{ ...inputStyle, minWidth: 220 }}>
                  <option value="">All Employees</option>
                  {(activeUsers as any[]).map((u: any) => <option key={u.id} value={String(u.id)}>{u.fullname} ({u.id})</option>)}
                </select>
              </div>
            )}
            <button
              onClick={() => filterQuery.refetch()}
              style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 7, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end' }}
            >
              Apply
            </button>
          </div>
        </div>

        {addMsg && (
          <div style={{ background: addMsg.includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${addMsg.includes('success') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 8, padding: '10px 16px', color: addMsg.includes('success') ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 16 }}>
            {addMsg}
          </div>
        )}

        {/* Records table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>
              Attendance Records <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({records.length})</span>
            </span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              {filterQuery.isFetching && <span style={{ fontSize: 12, color: '#9CA3AF' }}>Loading…</span>}
              {records.length > 0 && (
                <button
                  onClick={() => {
                    const headers = ['ID', 'Employee', 'Emp ID', 'Date', 'Start Time', 'End Time', 'Hours', 'OT Hours', 'Location', 'Status'];
                    const rows = records.map((a: any) => [
                      a.id ?? '', empMap[a.empid] ?? '', a.empid ?? '', a.date ?? '',
                      a.startTime ?? a.start_time ?? '',
                      a.endTime ?? a.end_time ?? '',
                      a.numberOfHours ?? a.number_of_hours ?? calcHours(a.startTime ?? a.start_time, a.endTime ?? a.end_time),
                      a.ot_hours ?? 0,
                      a.location ?? '',
                      (a.endTime ?? a.end_time) ? 'Complete' : 'Ongoing',
                    ]);
                    const csv = [headers, ...rows].map(r => r.map(String).join(',')).join('\n');
                    const blob = new Blob([csv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url; a.download = `attendance_${startDate}_${endDate}.csv`; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 14px', fontSize: 12, color: '#374151', cursor: 'pointer', fontWeight: 600 }}
                >
                  ↓ Export CSV
                </button>
              )}
            </div>
          </div>

          {records.length === 0 && !filterQuery.isFetching ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No attendance records found for selected filters.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['#', 'Employee', 'Date', 'Start', 'End', 'Hours', 'OT', 'Location', 'Status', ...(isAdminOrManager ? [''] : [])].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((a: any, i: number) => (
                    <tr key={a.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                      onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                      onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                      <td style={{ padding: '10px 14px', fontSize: 12, color: '#9CA3AF' }}>{a.id}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{empMap[a.empid] ?? `Employee #${a.empid}`}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {a.empid}</div>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{a.date}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>{formatTime(a.startTime ?? a.start_time)}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: (a.endTime ?? a.end_time) ? '#6B7280' : '#d97706' }}>{formatTime(a.endTime ?? a.end_time)}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#16a34a', fontWeight: 500 }}>{a.numberOfHours ?? a.number_of_hours ?? calcHours(a.startTime ?? a.start_time, a.endTime ?? a.end_time)}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: (a.ot_hours ?? 0) > 0 ? '#f4b400' : '#9CA3AF' }}>{a.ot_hours ?? 0}h</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, color: '#6B7280' }}>{a.location || '—'}</td>
                      <td style={{ padding: '10px 14px' }}>
                        {(a.endTime ?? a.end_time)
                          ? <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.08)', color: '#16a34a', fontWeight: 600 }}>Complete</span>
                          : <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.08)', color: '#d97706', fontWeight: 600 }}>Ongoing</span>
                        }
                      </td>
                      {isAdminOrManager && (
                        <td style={{ padding: '10px 14px' }}>
                          <button
                            onClick={() => {
                              setEditRecord(a);
                              setEditStart((a.startTime ?? a.start_time ?? '').slice(0, 5));
                              setEditEnd((a.endTime ?? a.end_time ?? '').slice(0, 5));
                              setEditMsg('');
                            }}
                            style={{ padding: '4px 10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#4f46e5', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                          >
                            Edit
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Attendance Modal */}
      {editRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: 16, fontWeight: 700, fontFamily: "'Archivo', sans-serif" }}>Edit Attendance Record</h3>
              <button onClick={() => setEditRecord(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 14px', marginBottom: 18 }}>
                <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
                  <span style={{ color: '#111827', fontWeight: 600 }}>{empMap[editRecord.empid] ?? `Employee #${editRecord.empid}`}</span>
                  <span style={{ color: '#9CA3AF' }}> (ID: {editRecord.empid})</span>
                  {' · '}Date <span style={{ color: '#111827', fontWeight: 600 }}>{editRecord.date}</span>
                </p>
              </div>
              {editMsg && (
                <div style={{ background: editMsg.includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${editMsg.includes('success') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 8, padding: '9px 14px', color: editMsg.includes('success') ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 14 }}>
                  {editMsg}
                </div>
              )}
              <form onSubmit={e => { e.preventDefault(); setEditMsg(''); editMut.mutate(); }}>
                {[
                  { label: 'Start Time', value: editStart, onChange: setEditStart },
                  { label: 'End Time', value: editEnd, onChange: setEditEnd },
                ].map(({ label, value, onChange }) => (
                  <div key={label} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>{label}</label>
                    <input
                      type="time"
                      value={value}
                      onChange={e => onChange(e.target.value)}
                      style={{ width: '100%', ...inputStyle }}
                      onFocus={e => e.target.style.borderColor = '#4f46e5'}
                      onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                    />
                  </div>
                ))}
                <button type="submit" disabled={editMut.isPending}
                  style={{ width: '100%', background: '#4f46e5', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 6 }}>
                  {editMut.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Attendance Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', borderBottom: '1px solid #E5E7EB' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: 16, fontWeight: 700, fontFamily: "'Archivo', sans-serif" }}>Add Attendance Record</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              <form onSubmit={e => { e.preventDefault(); addMut.mutate(); }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Employee *</label>
                  <select value={newAtt.empid} onChange={e => setNewAtt(p => ({ ...p, empid: e.target.value }))} required
                    style={{ width: '100%', ...inputStyle }}>
                    <option value="">Select employee…</option>
                    {(activeUsers as any[]).map((u: any) => <option key={u.id} value={u.id}>{u.fullname} ({u.id})</option>)}
                  </select>
                </div>
                {[
                  { label: 'Date', key: 'date', type: 'date' },
                  { label: 'Start Time', key: 'startTime', type: 'time' },
                  { label: 'End Time', key: 'endTime', type: 'time' },
                  { label: 'Project ID', key: 'projectId', type: 'number' },
                  { label: 'Location', key: 'location', type: 'text' },
                ].map(({ label, key, type }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>{label}</label>
                    <input
                      type={type}
                      value={(newAtt as any)[key]}
                      onChange={e => setNewAtt(p => ({ ...p, [key]: e.target.value }))}
                      required
                      style={{ width: '100%', ...inputStyle }}
                    />
                  </div>
                ))}
                <button type="submit" disabled={addMut.isPending}
                  style={{ width: '100%', background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 6 }}>
                  {addMut.isPending ? 'Saving…' : 'Save Record'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
