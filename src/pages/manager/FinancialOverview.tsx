import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllFinancialInfo } from '../../api/financialInfo';
import { getAllDepartments } from '../../api/departments';

export default function FinancialOverview() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const { data: financialInfo = [], isLoading } = useQuery({
    queryKey: ['all-financial-info'],
    queryFn: getAllFinancialInfo,
    retry: false,
  });

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
    retry: false,
  });

  const deptList = departments as any[];
  const records = (financialInfo as any[]).filter(f => {
    if (deptFilter && String(f.departmentId ?? f.department_id ?? '') !== deptFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return String(f.userId ?? f.user_id ?? '').includes(q) || (f.user?.fullname || '').toLowerCase().includes(q);
    }
    return true;
  });

  const totalGross = records.reduce((s, f) => s + (f.salaryGross ?? f.salary_gross ?? 0), 0);
  const totalNet = records.reduce((s, f) => s + (f.salaryNet ?? f.salary_net ?? 0), 0);
  const avgSalary = records.length > 0 ? totalGross / records.length : 0;

  return (
    <div style={{ flex: 1 }}>
      <Header title="Financial Overview" subtitle="Read-only view of employee salary and financial information" />
      <div style={{ padding: 28 }}>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 22 }}>
          {[
            { label: 'Employees', value: records.length, color: '#3b82f6' },
            { label: 'Total Gross', value: `₹${(totalGross / 1000).toFixed(0)}K`, color: '#f4b400' },
            { label: 'Total Net', value: `₹${(totalNet / 1000).toFixed(0)}K`, color: '#16a34a' },
            { label: 'Avg Gross', value: `₹${(avgSalary / 1000).toFixed(1)}K`, color: '#a78bfa' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 20px' }}>
              <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{label}</p>
              <p style={{ margin: '5px 0 0', fontSize: 24, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }}>
            <option value="">All Departments</option>
            {deptList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee…"
            style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }} />
        </div>

        {/* Read-only notice */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, padding: '8px 14px', marginBottom: 16 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
          <span style={{ fontSize: 12, color: '#60a5fa' }}>This is a read-only view. To update salary records, contact an administrator.</span>
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading…</p>
          ) : records.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No financial records found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    {['#', 'Employee', 'Department', 'Gross Salary', 'Net Salary', 'Tax', 'Insurance', 'Bank'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((f: any, i: number) => {
                    const gross = f.salaryGross ?? f.salary_gross ?? 0;
                    const net = f.salaryNet ?? f.salary_net ?? 0;
                    const tax = f.tax ?? 0;
                    const insurance = f.insurance ?? 0;
                    const deptName = deptList.find(d => d.id === (f.departmentId ?? f.department_id))?.name;
                    return (
                      <tr key={f.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#9CA3AF' }}>{i + 1}</td>
                        <td style={{ padding: '11px 14px' }}>
                          <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{f.user?.fullname || `Employee #${f.userId ?? f.user_id}`}</div>
                          <div style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {f.userId ?? f.user_id}</div>
                        </td>
                        <td style={{ padding: '11px 14px' }}>
                          {deptName ? <span style={{ fontSize: 11, padding: '3px 7px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: 4 }}>{deptName}</span>
                            : <span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ padding: '11px 14px', fontSize: 14, color: '#f4b400', fontWeight: 800 }}>₹{Number(gross).toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', fontSize: 14, color: '#16a34a', fontWeight: 700 }}>₹{Number(net).toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>₹{Number(tax).toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>₹{Number(insurance).toLocaleString()}</td>
                        <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280' }}>{f.bankName ?? f.bank_name ?? '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #E5E7EB', background: '#F9FAFB' }}>
                    <td colSpan={3} style={{ padding: '11px 14px', fontSize: 12, color: '#6B7280', fontWeight: 600 }}>TOTALS</td>
                    <td style={{ padding: '11px 14px', fontSize: 14, color: '#f4b400', fontWeight: 800 }}>₹{totalGross.toLocaleString()}</td>
                    <td style={{ padding: '11px 14px', fontSize: 14, color: '#16a34a', fontWeight: 700 }}>₹{totalNet.toLocaleString()}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
