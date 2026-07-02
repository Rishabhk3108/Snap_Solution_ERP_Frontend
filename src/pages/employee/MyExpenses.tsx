import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { submitExpense, getMyExpenses, deleteExpense } from '../../api/expenses';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Approved: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a' },
  Rejected: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626' },
  Pending: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
  Submitted: { bg: 'rgba(59,130,246,0.1)', color: '#3b82f6' },
};

export default function MyExpenses() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ['my-expenses'],
    queryFn: getMyExpenses,
    retry: false,
  });

  const submitMut = useMutation({
    mutationFn: () => submitExpense({ empid: user!.id, title, totalAmount: Number(amount), date, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-expenses'] });
      setMsg('Expense submitted successfully!');
      setShowForm(false);
      setTitle(''); setAmount(''); setDescription('');
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed to submit expense.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-expenses'] }),
  });

  const records = expenses as any[];
  const totalPending = records.filter(e => e.status === 'Pending' || e.status === 'Submitted').reduce((s, e) => s + (e.totalAmount ?? 0), 0);
  const totalApproved = records.filter(e => e.status === 'Approved').reduce((s, e) => s + (e.totalAmount ?? 0), 0);

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="My Expenses"
        subtitle="Submit and track your expense claims"
        action={
          <button onClick={() => { setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + New Claim
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Total Claims', value: records.length, color: '#111827' },
            { label: 'Pending Amount', value: `₹${totalPending.toLocaleString()}`, color: '#f59e0b' },
            { label: 'Approved Amount', value: `₹${totalApproved.toLocaleString()}`, color: '#16a34a' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{label}</p>
              <p style={{ margin: '5px 0 0', fontSize: 24, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>

        {msg && (
          <div style={{ background: msg.includes('success') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('success') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('success') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16 }}>
            {msg}
          </div>
        )}

        {/* Submit form */}
        {showForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.3)', borderRadius: 12, padding: '22px 24px', marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>New Expense Claim</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); submitMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Travel reimbursement"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Amount (₹) *</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                  placeholder="Details about this expense…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={submitMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {submitMut.isPending ? 'Submitting…' : 'Submit Claim'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background: '#E5E7EB', color: '#6B7280', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Claims table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              Expense Claims <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>({records.length})</span>
            </span>
          </div>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading…</p>
          ) : records.length === 0 ? (
            <div style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>🧾</div>
              <p style={{ fontSize: 14 }}>No expense claims yet.</p>
              <button onClick={() => setShowForm(true)}
                style={{ marginTop: 12, background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Submit a Claim
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    {['#', 'Title', 'Amount', 'Date', 'Description', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((e: any, i: number) => {
                    const sc = STATUS_STYLE[e.status] || STATUS_STYLE.Submitted;
                    return (
                      <tr key={e.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{e.id || i + 1}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{e.title || '—'}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13, color: '#f4b400', fontWeight: 700 }}>
                          {e.totalAmount != null ? `₹${Number(e.totalAmount).toLocaleString()}` : '—'}
                        </td>
                        <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{e.date}</td>
                        <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description || '—'}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: sc.bg, color: sc.color, fontWeight: 600 }}>{e.status || 'Submitted'}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>
                          {(!e.status || e.status === 'Pending' || e.status === 'Submitted') && (
                            <button onClick={() => { if (confirm('Delete this claim?')) deleteMut.mutate(e.id); }}
                              style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 11, cursor: 'pointer' }}>
                              Delete
                            </button>
                          )}
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
