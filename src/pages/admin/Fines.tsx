import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { createFine, getFines } from '../../api/fines';
import { getActiveUsers } from '../../api/users';

const inputStyle = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, outline: 'none',
};

export default function Fines() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [empid, setEmpid] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const { data: fines = [], isLoading } = useQuery({
    queryKey: ['fines'],
    queryFn: getFines,
    retry: false,
  });

  const { data: activeUsers = [] } = useQuery({ queryKey: ['users', 'active'], queryFn: getActiveUsers, retry: false });

  const createMut = useMutation({
    mutationFn: () => createFine({ empid: Number(empid), amount: Number(amount), reason, date }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fines'] });
      setMsg('Fine recorded successfully!');
      setShowForm(false); setEmpid(''); setAmount(''); setReason('');
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed to create fine.'),
  });

  const records = (fines as any[]).filter(f =>
    !search || String(f.empid).includes(search) || (f.employee?.fullname || '').toLowerCase().includes(search.toLowerCase()) || (f.reason || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalFined = (fines as any[]).reduce((s, f) => s + (f.amount ?? 0), 0);

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Employee Fines"
        subtitle="Record salary deductions and fines"
        action={
          <button onClick={() => { setShowForm(true); setMsg(''); }}
            style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Add Fine
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 22 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Total Fines</p>
            <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>{(fines as any[]).length}</p>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontWeight: 500 }}>Total Deducted</p>
            <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: '#dc2626', fontFamily: "'Archivo', sans-serif" }}>₹{totalFined.toLocaleString()}</p>
          </div>
        </div>

        {msg && (
          <div style={{ background: msg.includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msg.includes('success') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('success') ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {showForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 14, padding: '22px 24px', marginBottom: 22, boxShadow: '0 2px 8px rgba(220,38,38,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>New Fine</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Employee *</label>
                  <select value={empid} onChange={e => setEmpid(e.target.value)} required style={inputStyle}>
                    <option value="">Select employee…</option>
                    {(activeUsers as any[]).map((u: any) => (
                      <option key={u.id} value={u.id}>{u.fullname} ({u.id})</option>
                    ))}
                  </select>
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
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Reason *</label>
                <input value={reason} onChange={e => setReason(e.target.value)} required placeholder="Reason for fine…" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={createMut.isPending}
                  style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {createMut.isPending ? 'Saving…' : 'Add Fine'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee or reason…"
            style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 14px', color: '#111827', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Loading…</p>
          ) : records.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No fines recorded.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['#', 'Employee', 'Amount', 'Date', 'Reason'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((f: any, i: number) => (
                  <tr key={f.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{f.id || i + 1}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{f.employee?.fullname || `Employee #${f.empid}`}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {f.empid}</div>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 14, color: '#dc2626', fontWeight: 800 }}>₹{Number(f.amount ?? 0).toLocaleString()}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{f.date}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#6B7280' }}>{f.reason || '—'}</td>
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
