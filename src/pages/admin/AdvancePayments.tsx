import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { addAdvancePayment, getAdvancePayments } from '../../api/advancePayments';

const inputStyle = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, outline: 'none',
};

export default function AdvancePayments() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [empid, setEmpid] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const { data: advances = [], isLoading } = useQuery({
    queryKey: ['advance-payments'],
    queryFn: getAdvancePayments,
    retry: false,
  });

  const addMut = useMutation({
    mutationFn: () => addAdvancePayment({ empid: Number(empid), amount: Number(amount), date, note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['advance-payments'] });
      setMsg('Advance payment recorded successfully!');
      setShowForm(false); setEmpid(''); setAmount(''); setNote('');
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed to record advance.'),
  });

  const records = (advances as any[]).filter(a =>
    !search || String(a.empid).includes(search) || (a.employee?.fullname || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalAdvanced = (advances as any[]).reduce((s, a) => s + (a.amount ?? 0), 0);

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Advance Payments"
        subtitle="Record and track salary advances given to employees"
        action={
          <button onClick={() => { setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Record Advance
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 22 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Total Records</p>
            <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>{(advances as any[]).length}</p>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Total Advanced</p>
            <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: '#f4b400', fontFamily: "'Archivo', sans-serif" }}>₹{totalAdvanced.toLocaleString()}</p>
          </div>
        </div>

        {msg && (
          <div style={{ background: msg.includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msg.includes('success') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('success') ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {showForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.35)', borderRadius: 14, padding: '22px 24px', marginBottom: 22, boxShadow: '0 2px 8px rgba(244,180,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Record Advance Payment</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); addMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Employee ID *</label>
                  <input value={empid} onChange={e => setEmpid(e.target.value)} required placeholder="Employee ID" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Amount (₹) *</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="0" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Note (optional)</label>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="Reason for advance…" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={addMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {addMut.isPending ? 'Recording…' : 'Record Payment'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee ID or name…"
            style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 14px', color: '#111827', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Loading…</p>
          ) : records.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No advance payments found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['#', 'Employee', 'Amount', 'Date', 'Note', 'Status'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((a: any, i: number) => (
                  <tr key={a.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{a.id || i + 1}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{a.employee?.fullname || `Employee #${a.empid}`}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {a.empid}</div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 14, color: '#f4b400', fontWeight: 800 }}>₹{Number(a.amount ?? 0).toLocaleString()}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{a.date}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{a.note || '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 600, background: a.adjusted ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)', color: a.adjusted ? '#16a34a' : '#d97706' }}>
                        {a.adjusted ? 'Adjusted' : 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
