import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllPayments, getPaymentsByYear, updatePayment } from '../../api/paymentRecords';
import type { PaymentRecord } from '../../api/paymentRecords';

const STATUS_OPTIONS = ['Pending', 'Processing', 'Paid', 'Failed'];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Paid: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  Pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  Processing: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
  Failed: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
};

export default function PaymentRecords() {
  const qc = useQueryClient();
  const now = new Date();
  const [yearFilter, setYearFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [editingRecord, setEditingRecord] = useState<PaymentRecord | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [msg, setMsg] = useState('');

  const { data: allPayments = [], isLoading: loadingAll } = useQuery({
    queryKey: ['all-payments'],
    queryFn: getAllPayments,
    enabled: !yearFilter,
    retry: false,
  });

  const { data: yearPayments = [], isLoading: loadingYear } = useQuery({
    queryKey: ['payments-year', yearFilter],
    queryFn: () => getPaymentsByYear(Number(yearFilter)),
    enabled: !!yearFilter,
    retry: false,
  });

  const updateMut = useMutation({
    mutationFn: () => updatePayment(editingRecord!.id!, { status: editStatus, description: editDesc }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['all-payments'] });
      qc.invalidateQueries({ queryKey: ['payments-year'] });
      setMsg('Payment updated!');
      setEditingRecord(null);
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Update failed.'),
  });

  const openEdit = (r: PaymentRecord) => {
    setEditingRecord(r);
    setEditStatus(r.status ?? 'Pending');
    setEditDesc(r.description ?? '');
    setMsg('');
  };

  const raw = (yearFilter ? yearPayments : allPayments) as PaymentRecord[];
  const isLoading = yearFilter ? loadingYear : loadingAll;

  const counts: Record<string, number> = { Paid: 0, Pending: 0, Processing: 0, Failed: 0 };
  raw.forEach(r => { if (r.status && r.status in counts) counts[r.status]++; });

  const records = raw.filter(r => !statusFilter || r.status === statusFilter);
  const totalAmount = records.reduce((s, r) => s + (r.amount ?? 0), 0);
  const paidAmount = records.filter(r => r.status === 'Paid').reduce((s, r) => s + (r.amount ?? 0), 0);

  return (
    <div style={{ flex: 1 }}>
      <Header title="Payment Records" subtitle="View and update employee payment statuses" />
      <div style={{ padding: 28 }}>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
          {([['Paid', '#22c55e'], ['Pending', '#f59e0b'], ['Processing', '#3b82f6'], ['Failed', '#ef4444']] as const).map(([s, c]) => (
            <div key={s} onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
              style={{ background: '#FFFFFF', border: `1px solid ${statusFilter === s ? c : '#E5E7EB'}`, borderRadius: 10, padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.15s' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{s}</p>
              <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: c }}>{counts[s]}</p>
            </div>
          ))}
        </div>

        {/* Amount summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 22 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Total Amount (filtered)</p>
            <p style={{ margin: '5px 0 0', fontSize: 22, fontWeight: 800, color: '#111827' }}>₹{totalAmount.toLocaleString()}</p>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Paid Amount</p>
            <p style={{ margin: '5px 0 0', fontSize: 22, fontWeight: 800, color: '#16a34a' }}>₹{paidAmount.toLocaleString()}</p>
          </div>
        </div>

        {msg && (
          <div style={{ background: msg.includes('!') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('!') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('!') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 14 }}>{msg}</div>
        )}

        {/* Edit modal */}
        {editingRecord && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.3)', borderRadius: 12, padding: '22px 24px', marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>Update Payment #{editingRecord.id}</h3>
              <button onClick={() => setEditingRecord(null)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Status</label>
                <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Note / Description</label>
                <input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Add a note…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => updateMut.mutate()} disabled={updateMut.isPending}
                style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                {updateMut.isPending ? 'Saving…' : 'Update'}
              </button>
              <button onClick={() => setEditingRecord(null)}
                style={{ background: '#E5E7EB', color: '#6B7280', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }}>
            <option value="">All Years</option>
            {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          {statusFilter && (
            <button onClick={() => setStatusFilter('')}
              style={{ background: 'rgba(244,180,0,0.08)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 8, padding: '7px 14px', color: '#f4b400', fontSize: 12, cursor: 'pointer' }}>
              Clear: {statusFilter} ×
            </button>
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading…</p>
          ) : records.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No payment records found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    {['#', 'Employee ID', 'Job ID', 'Amount', 'Year', 'Date', 'Description', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => {
                    const sc = STATUS_STYLE[r.status ?? 'Pending'] ?? STATUS_STYLE.Pending;
                    return (
                      <tr key={r.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#9CA3AF' }}>{r.id}</td>
                        <td style={{ padding: '11px 14px', fontSize: 13, color: '#111827' }}>{r.userId ?? '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{r.jobId ?? '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: 14, color: '#f4b400', fontWeight: 800 }}>₹{Number(r.amount ?? 0).toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{r.year ?? '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{r.date ? new Date(r.date).toLocaleDateString() : '—'}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description ?? '—'}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 600, background: sc.bg, color: sc.color }}>{r.status ?? 'Pending'}</span>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          <button onClick={() => openEdit(r)}
                            style={{ padding: '4px 10px', background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 5, color: '#f4b400', fontSize: 11, cursor: 'pointer' }}>Edit</button>
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
