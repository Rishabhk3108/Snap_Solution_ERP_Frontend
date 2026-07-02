import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getMonthlySalaryDetails, generateMonthlySalary, markSalaryPaid, exportSalaryCsv } from '../../api/payroll';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Payroll() {
  const qc = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const { data: salaryList = [], isLoading } = useQuery({
    queryKey: ['payroll', year, month],
    queryFn: () => getMonthlySalaryDetails(year, month),
    retry: false,
  });

  const toast = (m: string, t: 'success' | 'error' = 'success') => { setMsg(m); setMsgType(t); setTimeout(() => setMsg(''), 4000); };

  const generateMut = useMutation({
    mutationFn: () => generateMonthlySalary({ year, month }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); toast('Monthly salaries generated successfully!'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to generate salaries.', 'error'),
  });

  const markPaidMut = useMutation({
    mutationFn: () => markSalaryPaid({ year, month }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payroll'] }); toast('Salaries marked as paid!'); },
    onError: (e: any) => toast(e.response?.data?.message || 'Failed to update status.', 'error'),
  });

  const handleExport = async () => {
    try {
      const blob = await exportSalaryCsv(year, month);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `salary_${year}_${String(month).padStart(2,'0')}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { toast('Export failed.', 'error'); }
  };

  const records = salaryList as any[];
  const totalNet = records.reduce((s, r) => s + (r.netSalary ?? r.net_salary ?? 0), 0);
  const paidCount = records.filter(r => r.status === 'Paid').length;

  return (
    <div style={{ flex: 1 }}>
      <Header title="Payroll" subtitle="Generate, review and disburse monthly salaries" />
      <div style={{ padding: 28 }}>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }}>
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }}>
            {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => generateMut.mutate()} disabled={generateMut.isPending}
              style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {generateMut.isPending ? 'Generating…' : 'Generate Salaries'}
            </button>
            <button onClick={() => { if (confirm('Mark all salaries as Paid for this period?')) markPaidMut.mutate(); }} disabled={markPaidMut.isPending || records.length === 0}
              style={{ background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Mark Paid
            </button>
            <button onClick={handleExport} disabled={records.length === 0}
              style={{ background: '#FFFFFF', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
              Export CSV
            </button>
          </div>
        </div>

        {msg && (
          <div style={{ background: msgType === 'success' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msgType === 'success' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msgType === 'success' ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Total Employees', value: records.length, color: '#111827' },
            { label: 'Total Payout', value: `₹${totalNet.toLocaleString()}`, color: '#f4b400' },
            { label: 'Paid / Pending', value: `${paidCount} / ${records.length - paidCount}`, color: '#16a34a' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{label}</p>
              <p style={{ margin: '5px 0 0', fontSize: 22, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '13px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              Salary List — {MONTHS[month - 1]} {year}
            </span>
          </div>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading…</p>
          ) : records.length === 0 ? (
            <div style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF' }}>
              <p style={{ fontSize: 14, marginBottom: 12 }}>No salary data for this period.</p>
              <button onClick={() => generateMut.mutate()}
                style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Generate Now
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    {['Emp ID', 'Employee', 'Basic', 'Allowances', 'Deductions', 'Net Salary', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((r: any, i: number) => (
                    <tr key={r.id || r.empid || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ padding: '11px 14px', fontSize: 12, color: '#9CA3AF' }}>{r.empid || r.userId}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{r.employee?.fullname || r.fullname || `Employee #${r.empid || r.userId}`}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: '#6B7280' }}>₹{Number(r.basicSalary ?? r.basic_salary ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: '#16a34a' }}>+₹{Number(r.totalAllowances ?? r.allowances ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, color: '#dc2626' }}>-₹{Number(r.totalDeductions ?? r.deductions ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '11px 14px', fontSize: 14, color: '#f4b400', fontWeight: 800 }}>₹{Number(r.netSalary ?? r.net_salary ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 4, fontWeight: 600, background: r.status === 'Paid' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', color: r.status === 'Paid' ? '#22c55e' : '#f59e0b' }}>
                          {r.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
