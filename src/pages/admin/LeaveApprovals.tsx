import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllLeaves, updateLeaveStatus, deleteLeave } from '../../api/leave';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Approved: { bg: 'rgba(34,197,94,0.08)', color: '#16a34a' },
  Rejected: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626' },
  Pending:  { bg: 'rgba(245,158,11,0.08)', color: '#d97706' },
};

function daysBetween(s: string, e: string) {
  if (!s || !e) return 0;
  return Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1;
}

export default function LeaveApprovals() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['all-leaves'],
    queryFn: getAllLeaves,
    retry: false,
  });

  const approveMut = useMutation({
    mutationFn: (id: number) => updateLeaveStatus(id, { status: 'Approved' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-leaves'] }); setMsg('Leave approved.'); },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Action failed.'),
  });

  const rejectMut = useMutation({
    mutationFn: (id: number) => updateLeaveStatus(id, { status: 'Rejected' }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['all-leaves'] }); setMsg('Leave rejected.'); },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Action failed.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteLeave,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['all-leaves'] }),
  });

  const all = leaves as any[];
  const counts = { Pending: 0, Approved: 0, Rejected: 0 };
  all.forEach(l => { if (l.status in counts) counts[l.status as keyof typeof counts]++; });

  const records = all.filter(l => {
    if (filter !== 'All' && l.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return String(l.user_id).includes(q) || (l.user?.fullname || '').toLowerCase().includes(q);
    }
    return true;
  });

  const statColors: Record<string, string> = { Pending: '#d97706', Approved: '#16a34a', Rejected: '#dc2626' };

  return (
    <div style={{ flex: 1 }}>
      <Header title="Leave Approvals" subtitle="Review and manage all employee leave applications" />
      <div style={{ padding: 28 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {(['Pending', 'Approved', 'Rejected'] as const).map(s => (
            <div key={s} onClick={() => setFilter(s)} style={{
              background: '#FFFFFF',
              border: `1px solid ${filter === s ? statColors[s] : '#E5E7EB'}`,
              borderRadius: 12, padding: '16px 20px', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{s}</p>
              <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: statColors[s], fontFamily: "'Archivo', sans-serif" }}>{counts[s]}</p>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '10px 16px', color: '#16a34a', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 8, padding: 3 }}>
            {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === f ? '#f4b400' : 'transparent', color: filter === f ? '#1f1f1f' : '#6B7280' }}>
                {f}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee…"
            style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#f4b400'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '13px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Applications <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 400 }}>({records.length})</span></span>
          </div>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Loading…</p>
          ) : records.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No applications found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['#', 'Employee', 'Start Date', 'End Date', 'Duration', 'Month/Year', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((l: any, i: number) => {
                    const sc = STATUS_STYLE[l.status] || STATUS_STYLE.Pending;
                    return (
                      <tr key={l.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#9CA3AF' }}>{l.id || i + 1}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{l.user?.fullname || `Employee #${l.user_id}`}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {l.user_id}</div>
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }}>{l.start_date}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: '#374151' }}>{l.end_date}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: '#f4b400', fontWeight: 600 }}>{daysBetween(l.start_date, l.end_date)}d</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{l.year}/{String(l.month).padStart(2, '0')}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, background: sc.bg, color: sc.color, fontWeight: 600 }}>{l.status}</span>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {l.status === 'Pending' && (
                              <>
                                <button onClick={() => approveMut.mutate(l.id)} disabled={approveMut.isPending}
                                  style={{ padding: '4px 10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 5, color: '#16a34a', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                                <button onClick={() => rejectMut.mutate(l.id)} disabled={rejectMut.isPending}
                                  style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, color: '#dc2626', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Reject</button>
                              </>
                            )}
                            <button onClick={() => { if (confirm('Delete this leave record?')) deleteMut.mutate(l.id); }}
                              style={{ padding: '4px 8px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 5, color: '#9CA3AF', fontSize: 11, cursor: 'pointer' }}>×</button>
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
