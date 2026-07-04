import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { getFinancialInfoByUser } from '../../api/financialInfo';
import { getSalarySlip } from '../../api/salary';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function Row({ label, value, highlight }: { label: string; value?: number | string | null; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
      <span style={{ fontSize: 13, color: '#6B7280' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: highlight ? 700 : 500, color: highlight ? '#f4b400' : '#111827' }}>
        {value != null && value !== '' ? `₹${Number(value).toLocaleString()}` : '—'}
      </span>
    </div>
  );
}

export default function MySalary() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: financialRaw } = useQuery({
    queryKey: ['financial', user?.id],
    queryFn: () => getFinancialInfoByUser(user!.id),
    enabled: !!user?.id, retry: false,
  });
  const financial = Array.isArray(financialRaw) ? financialRaw[0] : financialRaw;

  const { data: slip, isLoading: loadingSlip } = useQuery({
    queryKey: ['salary-slip', user?.id, year, month],
    queryFn: () => getSalarySlip(user!.id, year, month),
    enabled: !!user?.id, retry: false,
  });

  return (
    <div style={{ flex: 1 }}>
      <Header title="My Salary" subtitle="View your salary details and slip" />
      <div style={{ padding: 28 }}>

        {/* Summary cards from financial info */}
        {financial && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 26 }}>
            {[
              { label: 'Basic Salary', value: financial.salaryBasic, color: '#111827' },
              { label: 'Gross Salary', value: financial.salaryGross, color: '#111827' },
              { label: 'Net Salary', value: financial.salaryNet, color: '#f4b400' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 22px' }}>
                <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>{label}</p>
                <p style={{ margin: '6px 0 0', fontSize: 26, fontWeight: 800, color }}>
                  {value != null ? `₹${Number(value).toLocaleString()}` : '—'}
                </p>
                <p style={{ margin: '3px 0 0', fontSize: 11, color: '#9CA3AF' }}>Per month</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Earnings breakdown */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Earnings / Allowances</h3>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#9CA3AF' }}>From your financial profile</p>
            <Row label="Basic Salary" value={financial?.salaryBasic} />
            <Row label="House Rent Allowance" value={financial?.allowanceHouseRent} />
            <Row label="Medical Allowance" value={financial?.allowanceMedical} />
            <Row label="Special Allowance" value={financial?.allowanceSpecial} />
            <Row label="Fuel Allowance" value={financial?.allowanceFuel} />
            <Row label="Phone Bill" value={financial?.allowancePhoneBill} />
            <Row label="Other Allowance" value={financial?.allowanceOther} />
            <div style={{ padding: '12px 0 0' }}>
              <Row label="Total Allowances" value={financial?.allowanceTotal} highlight />
            </div>
          </div>

          {/* Deductions */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px' }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Deductions</h3>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#9CA3AF' }}>From your financial profile</p>
            <Row label="Provident Fund" value={financial?.deductionProvidentFund} />
            <Row label="Tax (TDS)" value={financial?.deductionTax} />
            <Row label="Other Deductions" value={financial?.deductionOther} />
            <div style={{ padding: '12px 0 0' }}>
              <Row label="Total Deductions" value={financial?.deductionTotal} highlight />
            </div>
            <div style={{ marginTop: 20, padding: '14px', background: 'rgba(244,180,0,0.08)', borderRadius: 8, border: '1px solid rgba(244,180,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>Net Pay</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#f4b400' }}>
                  {financial?.salaryNet != null ? `₹${Number(financial.salaryNet).toLocaleString()}` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {financial && (financial.bankName || financial.accountNumber) && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Bank Details</h3>
              {[
                { label: 'Bank Name', value: financial.bankName },
                { label: 'Account Name', value: financial.accountName },
                { label: 'Account Number', value: financial.accountNumber },
                { label: 'IBAN', value: financial.iban },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
                  <span style={{ fontSize: 13, color: '#111827' }}>{value || '—'}</span>
                </div>
              ))}
            </div>
          )}

          {/* Monthly Slip lookup */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 22px' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: '#111827' }}>Monthly Salary Slip</h3>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <select value={year} onChange={e => setYear(Number(e.target.value))}
                style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '8px 12px', color: '#111827', fontSize: 13 }}>
                {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={month} onChange={e => setMonth(Number(e.target.value))}
                style={{ flex: 1, background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '8px 12px', color: '#111827', fontSize: 13 }}>
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            {loadingSlip ? (
              <p style={{ color: '#6B7280', fontSize: 13 }}>Loading…</p>
            ) : slip && typeof slip === 'object' && Object.keys(slip).length > 0 ? (
              <div>
                {[
                  { label: 'Basic', value: (slip as any).basicSalary ?? (slip as any).salary_basic },
                  { label: 'Gross', value: (slip as any).grossSalary ?? (slip as any).salary_gross },
                  { label: 'Net Pay', value: (slip as any).netSalary ?? (slip as any).salary_net },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F3F4F6' }}>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{label}</span>
                    <span style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{value != null ? `₹${Number(value).toLocaleString()}` : '—'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#9CA3AF', fontSize: 13 }}>No salary slip available for {MONTHS[month - 1]} {year}.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
