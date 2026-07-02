import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllLeaves, getLeavesByDepartment, updateLeaveStatus, deleteLeave } from '../../api/leave';
import { getAllDepartments } from '../../api/departments';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Approved: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  Rejected: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  Pending:  { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
};

function daysBetween(s: string, e: string) {
  if (!s || !e) return 0;
  return Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1;
}

export default function TeamLeaves() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('Pending');
  const [deptFilter, setDeptFilter] = useState('');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const { data: allLeaves = [], isLoading: loadingAll } = useQuery({
    queryKey: ['all-leaves'],
    queryFn: getAllLeaves,
    enabled: !deptFilter,
    retry: false,
  });

  const { data: deptLeaves = [], isLoading: loadingDept } = useQuery({
    queryKey: ['dept-leaves', deptFilter],
    queryFn: () => getLeavesByDepartment(Number(deptFilter)),
    enabled: !!deptFilter,
    retry: false,
  });

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getAllDepartments, retry: false });

  const approveMut = useMutation({
    mutationFn: (id: number) => updateLeaveStatus(id, { status: 'Approved' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-leaves'] }); qc.invalidateQueries({ queryKey: ['dept-leaves'] }); setMsg('Approved.'); },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });
  const rejectMut = useMutation({
    mutationFn: (id: number) => updateLeaveStatus(id, { status: 'Rejected' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-leaves'] }); qc.invalidateQueries({ queryKey: ['dept-leaves'] }); setMsg('Rejected.'); },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });
  const deleteMut = useMutation({
    mutationFn: deleteLeave,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-leaves'] }); qc.invalidateQueries({ queryKey: ['dept-leaves'] }); },
  });

  const raw = (deptFilter ? deptLeaves : allLeaves) as any[];
  const isLoading = deptFilter ? loadingDept : loadingAll;

  const counts = { Pending: 0, Approved: 0, Rejected: 0 };
  raw.forEach(l => { if (l.status in counts) counts[l.status as keyof typeof counts]++; });

  const records = raw.filter(l => {
    if (filter !== 'All' && l.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return String(l.user_id).includes(q) || (l.user?.fullname || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ flex: 1 }}>
      <Header title="Team Leave Requests" subtitle="Review and approve leave applications across your team" />
      <div style={{ padding: 28 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {([['Pending', '#f59e0b'], ['Approved', '#22c55e'], ['Rejected', '#ef4444']] as const).map(([s, c]) => (
            <div key={s} onClick={() => setFilter(s as any)}
              style={{ background: '#FFFFFF', border: `1px solid ${filter === s ? c : '#E5E7EB'}`, borderRadius: 10, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{s}</p>
              <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: c }}>{counts[s as keyof typeof counts]}</p>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '10px 16px', color: '#16a34a', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 3 }}>
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 13px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === f ? '#f4b400' : 'transparent', color: filter === f ? '#F9FAFB' : '#9ca3af' }}>{f}</button>
            ))}
          </div>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 12px', color: '#111827', fontSize: 13 }}>
            <option value="">All Departments</option>
            {(departments as any[]).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee…"
            style={{ flex: 1, minWidth: 160, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }} />
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              Leave Applications <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>({records.length})</span>
              {deptFilter && <span style={{ fontSize: 11, marginLeft: 8, color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: 4 }}>Dept filtered</span>}
            </span>
          </div>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading…</p>
          ) : records.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No applications found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    {['#', 'Employee', 'Start', 'End', 'Days', 'Period', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((l: any, i: number) => {
                    const sc = STATUS_STYLE[l.status] || STATUS_STYLE.Pending;
                    return (
                      <tr key={l.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#9CA3AF' }}>{l.id || i + 1}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{l.user?.fullname || `Employee #${l.user_id}`}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {l.user_id}</div>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#111827' }}>{l.start_date}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#111827' }}>{l.end_date}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: '#f4b400', fontWeight: 700 }}>{daysBetween(l.start_date, l.end_date)}d</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{l.year}/{String(l.month).padStart(2, '0')}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color, fontWeight: 600 }}>{l.status}</span>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: 5 }}>
                            {l.status === 'Pending' && (
                              <>
                                <button onClick={() => approveMut.mutate(l.id)} disabled={approveMut.isPending}
                                  style={{ padding: '4px 9px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 5, color: '#16a34a', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>✓</button>
                                <button onClick={() => rejectMut.mutate(l.id)} disabled={rejectMut.isPending}
                                  style={{ padding: '4px 9px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 5, color: '#dc2626', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>✗</button>
                              </>
                            )}
                            <button onClick={() => { if (confirm('Delete this record?')) deleteMut.mutate(l.id); }}
                              style={{ padding: '4px 8px', background: 'rgba(107,114,128,0.08)', border: '1px solid #E5E7EB', borderRadius: 5, color: '#9CA3AF', fontSize: 11, cursor: 'pointer' }}>×</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
