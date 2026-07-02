import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { applyLeave, getMyLeaves } from '../../api/leave';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Approved: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  Rejected: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  Pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
};

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
}

export default function Leave() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'LWP'>('Casual Leave');
  const [reason, setReason] = useState('');
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ['my-leaves', user?.id],
    queryFn: () => getMyLeaves(user!.id),
    enabled: !!user?.id, retry: false,
  });

  const applyMut = useMutation({
    mutationFn: () => applyLeave({
      user_id: user!.id,
      start_date: startDate,
      end_date: endDate,
      year: new Date(startDate).getFullYear(),
      month: new Date(startDate).getMonth() + 1,
      type: leaveType,
      reason,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-leaves'] });
      setMsg('Leave application submitted successfully!');
      setShowForm(false);
      setStartDate(''); setEndDate(''); setLeaveType('Casual Leave'); setReason('');
    },
    onError: (e: any) => setMsg(e.response?.data?.message || e.response?.data?.error || 'Failed to submit leave application.'),
  });

  const currentYear = new Date().getFullYear();
  const records = (leaves as any[]).filter(l => filter === 'All' || l.status === filter);
  const pending = (leaves as any[]).filter(l => l.status === 'Pending').length;
  const approved = (leaves as any[]).filter(l => l.status === 'Approved').length;
  const rejected = (leaves as any[]).filter(l => l.status === 'Rejected').length;

  const CASUAL_ENTITLEMENT = 12;
  const SICK_ENTITLEMENT = 7;
  const usedCasual = (leaves as any[]).filter(l => l.status === 'Approved' && l.type === 'Casual Leave' && l.year === currentYear)
    .reduce((s, l) => s + daysBetween(l.start_date, l.end_date), 0);
  const usedSick = (leaves as any[]).filter(l => l.status === 'Approved' && l.type === 'Sick Leave' && l.year === currentYear)
    .reduce((s, l) => s + daysBetween(l.start_date, l.end_date), 0);
  const usedLwp = (leaves as any[]).filter(l => l.status === 'Approved' && l.type === 'LWP' && l.year === currentYear)
    .reduce((s, l) => s + daysBetween(l.start_date, l.end_date), 0);

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Leave Management"
        subtitle="Apply for leave and track your requests"
        action={
          <button onClick={() => { setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Apply Leave
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Pending', count: pending, color: '#f59e0b' },
            { label: 'Approved', count: approved, color: '#16a34a' },
            { label: 'Rejected', count: rejected, color: '#dc2626' },
          ].map(({ label, count, color }) => (
            <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px', cursor: 'pointer' }}
              onClick={() => setFilter(label as any)}>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{label} Applications</p>
              <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color }}>{count}</p>
            </div>
          ))}
        </div>

        {/* Leave Balance for current year */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 22px', marginBottom: 22 }}>
          <p style={{ margin: '0 0 14px', fontSize: 13, fontWeight: 700, color: '#111827' }}>Leave Balance — {currentYear}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {[
              { type: 'Casual Leave', used: usedCasual, max: CASUAL_ENTITLEMENT, color: '#3b82f6' },
              { type: 'Sick Leave', used: usedSick, max: SICK_ENTITLEMENT, color: '#a855f7' },
              { type: 'LWP', used: usedLwp, max: null, color: '#f59e0b' },
            ].map(({ type, used, max, color }) => {
              const remaining = max != null ? Math.max(0, max - used) : null;
              const pct = max != null ? Math.min(100, Math.round((used / max) * 100)) : 0;
              return (
                <div key={type} style={{ background: '#F9FAFB', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 500 }}>{type}</span>
                    {remaining != null ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{remaining} left</span>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 700, color }}>{used} used</span>
                    )}
                  </div>
                  {max != null && (
                    <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct >= 100 ? '#dc2626' : color, borderRadius: 3, transition: 'width 0.3s' }} />
                    </div>
                  )}
                  <div style={{ marginTop: 5, fontSize: 11, color: '#9CA3AF' }}>
                    {max != null ? `${used} used of ${max} days` : 'No entitlement limit'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {msg && (
          <div style={{ background: msg.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('success') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('success') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16 }}>
            {msg}
          </div>
        )}

        {/* Apply Leave Form */}
        {showForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.3)', borderRadius: 12, padding: '22px 24px', marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>New Leave Application</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); applyMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Start Date *</label>
                  <input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={e => { setStartDate(e.target.value); if (endDate && endDate < e.target.value) setEndDate(''); }} required
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>End Date *</label>
                  <input type="date" value={endDate} min={startDate || new Date().toISOString().split('T')[0]} onChange={e => setEndDate(e.target.value)} required
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Leave Type *</label>
                <select value={leaveType} onChange={e => setLeaveType(e.target.value as 'Casual Leave' | 'Sick Leave' | 'LWP')}
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="LWP">LWP (Leave Without Pay)</option>
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Reason (optional)</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  placeholder="Briefly describe your reason for leave…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, resize: 'vertical' }} />
              </div>
              {startDate && endDate && (
                <p style={{ fontSize: 13, color: '#f4b400', marginBottom: 12 }}>
                  Duration: <strong>{daysBetween(startDate, endDate)} day(s)</strong>
                </p>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={applyMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {applyMut.isPending ? 'Submitting…' : 'Submit Application'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background: '#E5E7EB', color: '#6B7280', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 9, padding: 3, width: 'fit-content' }}>
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filter === f ? '#f4b400' : 'transparent', color: filter === f ? '#F9FAFB' : '#9ca3af' }}>
              {f}
            </button>
          ))}
        </div>

        {/* Leave history table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading…</p>
          ) : records.length === 0 ? (
            <div style={{ padding: '44px', textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>No {filter === 'All' ? '' : filter.toLowerCase()} leave applications found.</p>
              <button onClick={() => setShowForm(true)}
                style={{ marginTop: 12, background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Apply for Leave
              </button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['#', 'Start Date', 'End Date', 'Duration', 'Applied Year/Month', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '11px 16px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((l: any, i: number) => {
                  const sc = STATUS_STYLE[l.status] || STATUS_STYLE.Pending;
                  return (
                    <tr key={l.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{l.id || i + 1}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: '#111827' }}>{String(l.start_date).slice(0, 10)}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: '#111827' }}>{String(l.end_date).slice(0, 10)}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: '#f4b400', fontWeight: 600 }}>{daysBetween(l.start_date, l.end_date)} day(s)</td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{l.year}/{String(l.month).padStart(2, '0')}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, background: sc.bg, color: sc.color, fontWeight: 600 }}>{l.status}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
