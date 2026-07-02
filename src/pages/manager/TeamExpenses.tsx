import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllCompanyExpenses, getExpensesByYearAndDept, createCompanyExpense, updateCompanyExpense } from '../../api/companyExpenses';
import { getAllDepartments } from '../../api/departments';

export default function TeamExpenses() {
  const qc = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [deptFilter, setDeptFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [formDept, setFormDept] = useState('');
  const [msg, setMsg] = useState('');

  const { data: allExpenses = [], isLoading: loadingAll } = useQuery({
    queryKey: ['company-expenses'],
    queryFn: getAllCompanyExpenses,
    enabled: !deptFilter,
    retry: false,
  });

  const { data: filteredExpenses = [], isLoading: loadingFiltered } = useQuery({
    queryKey: ['company-expenses', year, deptFilter],
    queryFn: () => getExpensesByYearAndDept(year, Number(deptFilter)),
    enabled: !!deptFilter,
    retry: false,
  });

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getAllDepartments, retry: false });

  const saveMut = useMutation({
    mutationFn: () => editingId
      ? updateCompanyExpense(editingId, { title, amount: Number(amount), description, departmentId: Number(formDept) || undefined, year })
      : createCompanyExpense({ title, amount: Number(amount), description, departmentId: Number(formDept) || undefined, year }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-expenses'] });
      setMsg(editingId ? 'Expense updated!' : 'Expense created!');
      setShowForm(false); setEditingId(null); setTitle(''); setAmount(''); setDescription(''); setFormDept('');
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });

  const openEdit = (e: any) => {
    setEditingId(e.id); setTitle(e.title || ''); setAmount(String(e.amount ?? ''));
    setDescription(e.description || ''); setFormDept(String(e.departmentId || ''));
    setShowForm(true); setMsg('');
  };

  const records = (deptFilter ? filteredExpenses : allExpenses) as any[];
  const isLoading = deptFilter ? loadingFiltered : loadingAll;
  const deptList = departments as any[];

  const totalAmount = records.reduce((s, e) => s + (e.amount ?? 0), 0);
  const getDeptName = (id: number) => deptList.find(d => d.id === id)?.name || `Dept #${id}`;

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Team Expenses"
        subtitle="Create and track company-level department expenses"
        action={
          <button onClick={() => { setEditingId(null); setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + New Expense
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 22 }}>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Total Expenses {deptFilter ? `(Dept, ${year})` : ''}</p>
            <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: '#111827' }}>{records.length}</p>
          </div>
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>Total Amount</p>
            <p style={{ margin: '5px 0 0', fontSize: 26, fontWeight: 800, color: '#f4b400' }}>₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>

        {msg && (
          <div style={{ background: msg.includes('!') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('!') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('!') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {/* Form */}
        {showForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.3)', borderRadius: 12, padding: '22px 24px', marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{editingId ? 'Edit Expense' : 'New Expense'}</h3>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div style={{ gridColumn: '1/3' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Expense title"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Amount (₹) *</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Department</label>
                  <select value={formDept} onChange={e => setFormDept(e.target.value)}
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                    <option value="">Select dept…</option>
                    {deptList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Year</label>
                  <select value={year} onChange={e => setYear(Number(e.target.value))}
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                    {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saveMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {saveMut.isPending ? 'Saving…' : editingId ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }}
                  style={{ background: '#E5E7EB', color: '#6B7280', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }}>
            <option value="">All Departments</option>
            {deptList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          {deptFilter && (
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }}>
              {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading…</p>
          ) : records.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No expenses found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  {['ID', 'Title', 'Amount', 'Department', 'Year', 'Description', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((e: any, i: number) => (
                  <tr key={e.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#9CA3AF' }}>{e.id}</td>
                    <td style={{ padding: '11px 14px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{e.title || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 14, color: '#f4b400', fontWeight: 800 }}>₹{Number(e.amount ?? 0).toLocaleString()}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12 }}>
                      {e.departmentId ? <span style={{ padding: '3px 7px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: 4, fontSize: 11 }}>{getDeptName(e.departmentId)}</span> : <span style={{ color: '#9CA3AF' }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{e.year || '—'}</td>
                    <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.description || '—'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, fontWeight: 600, background: e.status === 'Approved' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: e.status === 'Approved' ? '#22c55e' : '#f59e0b' }}>
                        {e.status || 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={() => openEdit(e)} style={{ padding: '4px 10px', background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 5, color: '#f4b400', fontSize: 11, cursor: 'pointer' }}>Edit</button>
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
