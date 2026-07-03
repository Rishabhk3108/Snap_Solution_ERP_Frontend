import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getUser, changePassword, adminResetPassword } from '../../api/users';
import { getPersonalInfoByUser, updatePersonalInfo } from '../../api/personalInfo';
import { getFinancialInfoByUser, updateFinancialInfo } from '../../api/financialInfo';
import { getAttendanceList, getDaysWorked } from '../../api/attendance';
import { useAuth } from '../../contexts/AuthContext';

type Tab = 'overview' | 'personal' | 'financial' | 'attendance';

const inputSt = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 7, padding: '8px 12px', color: '#111827', fontSize: 13, outline: 'none',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#111827', borderBottom: '1px solid #E5E7EB', paddingBottom: 12, fontFamily: "'Archivo', sans-serif" }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 14, color: value ? '#111827' : '#9CA3AF' }}>{value || '—'}</div>
    </div>
  );
}

function EditableField({ label, value, onSave }: { label: string; value?: string | null; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value || '');
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2, fontWeight: 500 }}>{label}</div>
      {editing ? (
        <div style={{ display: 'flex', gap: 6 }}>
          <input value={val} onChange={e => setVal(e.target.value)} style={{ flex: 1, ...inputSt }} />
          <button onClick={() => { onSave(val); setEditing(false); }} style={{ padding: '6px 10px', background: '#f4b400', border: 'none', borderRadius: 6, color: '#1f1f1f', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Save</button>
          <button onClick={() => setEditing(false)} style={{ padding: '6px 10px', background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 6, color: '#6B7280', cursor: 'pointer', fontSize: 13 }}>×</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, color: val ? '#111827' : '#9CA3AF' }}>{val || '—'}</span>
          <button onClick={() => setEditing(true)} style={{ padding: '2px 8px', background: 'rgba(244,180,0,0.08)', border: '1px solid rgba(244,180,0,0.25)', borderRadius: 4, color: '#d97706', fontSize: 11, cursor: 'pointer' }}>Edit</button>
        </div>
      )}
    </div>
  );
}

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const qc = useQueryClient();
  const empId = Number(id);

  const [tab, setTab] = useState<Tab>('overview');
  const now = new Date();
  const [attYear, setAttYear] = useState(now.getFullYear());
  const [attMonth, setAttMonth] = useState(now.getMonth() + 1);

  const [personalForm, setPersonalForm] = useState({
    dateOfBirth: '', gender: '', maritalStatus: '', fatherName: '',
    idNumber: '', emailAddress: '', mobile: '', phone: '',
    address: '', city: '', state: '', country: '',
  });
  const [personalSaveMsg, setPersonalSaveMsg] = useState('');
  const [personalEditing, setPersonalEditing] = useState(false);

  const isAdmin = authUser?.role === 'ROLE_ADMIN';

  const { data: emp, isLoading: loadingEmp } = useQuery({ queryKey: ['user', empId], queryFn: () => getUser(empId) });
  const { data: personal } = useQuery({ queryKey: ['personal', empId], queryFn: () => getPersonalInfoByUser(empId), retry: false });
  const { data: financial } = useQuery({ queryKey: ['financial', empId], queryFn: () => getFinancialInfoByUser(empId), retry: false, enabled: isAdmin });
  const { data: attendance } = useQuery({ queryKey: ['attendance', 'list', empId, attYear, attMonth], queryFn: () => getAttendanceList(empId, attYear, attMonth), enabled: tab === 'attendance' });
  const { data: daysWorked } = useQuery({ queryKey: ['daysWorked', empId, attYear, attMonth], queryFn: () => getDaysWorked(empId, attYear, attMonth), enabled: tab === 'attendance' });

  useEffect(() => {
    if (personal) {
      setPersonalForm({
        dateOfBirth: personal.dateOfBirth?.split('T')[0] ?? '',
        gender: personal.gender ?? '',
        maritalStatus: personal.maritalStatus ?? '',
        fatherName: personal.fatherName ?? '',
        idNumber: personal.idNumber ?? '',
        emailAddress: personal.emailAddress ?? '',
        mobile: personal.mobile ?? '',
        phone: personal.phone ?? '',
        address: personal.address ?? '',
        city: personal.city ?? '',
        state: personal.state ?? '',
        country: personal.country ?? '',
      });
    }
  }, [personal]);

  const updatePersonalMut = useMutation({
    mutationFn: (payload: any) => updatePersonalInfo(empId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['personal', empId] });
      setPersonalSaveMsg('Personal information saved successfully!');
      setPersonalEditing(false);
      setTimeout(() => setPersonalSaveMsg(''), 3000);
    },
    onError: () => setPersonalSaveMsg('Failed to save. Please try again.'),
  });

  const updateFinancialMut = useMutation({
    mutationFn: (payload: any) => updateFinancialInfo(empId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['financial', empId] }),
  });

  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  const changePassMut = useMutation({
    mutationFn: () => changePassword(empId, oldPass, newPass),
    onSuccess: () => { setPassMsg('Password changed successfully!'); setOldPass(''); setNewPass(''); },
    onError: (e: any) => setPassMsg(e.response?.data?.error || 'Failed to change password'),
  });

  const [resetPass, setResetPass] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetMsg, setResetMsg] = useState('');

  const resetPassMut = useMutation({
    mutationFn: () => adminResetPassword(empId, resetPass),
    onSuccess: () => { setResetMsg('Password reset successfully!'); setResetPass(''); setResetConfirm(''); setTimeout(() => setResetMsg(''), 3000); },
    onError: (e: any) => setResetMsg(e.response?.data?.error || 'Failed to reset password'),
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'personal', label: 'Personal Info' },
    ...(isAdmin ? [{ key: 'financial' as Tab, label: 'Financial' }] : []),
    { key: 'attendance', label: 'Attendance' },
  ];

  if (loadingEmp) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#9CA3AF' }}>Loading…</span>
    </div>
  );

  if (!emp) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#dc2626' }}>Employee not found</span>
    </div>
  );

  return (
    <div style={{ flex: 1 }}>
      <Header
        title={emp.fullname}
        subtitle={emp.jobTitle || emp.role?.replace('ROLE_', '')}
        action={
          <button onClick={() => navigate(-1)} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '7px 14px', color: '#374151', fontSize: 13, cursor: 'pointer' }}>
            ← Back
          </button>
        }
      />

      <div style={{ padding: 28 }}>
        {/* Profile banner */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(244,180,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#f4b400', flexShrink: 0 }}>
            {emp.fullname?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>{emp.fullname}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 14, color: '#6B7280' }}>{emp.jobTitle || '—'} · @{emp.username}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, background: 'rgba(244,180,0,0.08)', color: '#d97706', fontWeight: 600 }}>{emp.role?.replace('ROLE_', '')}</span>
              <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, background: emp.active ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', color: emp.active ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{emp.active ? 'Active' : 'Inactive'}</span>
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 13, color: '#9CA3AF' }}>
            <div>ID: <span style={{ color: '#6B7280', fontWeight: 600 }}>#{emp.id}</span></div>
            {emp.startDate && <div style={{ marginTop: 4 }}>Since: <span style={{ color: '#6B7280' }}>{emp.startDate?.split('T')[0]}</span></div>}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 10, padding: 4 }}>
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: tab === t.key ? '#f4b400' : 'transparent',
                color: tab === t.key ? '#1f1f1f' : '#6B7280',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Section title="Basic Information">
              <Field label="Full Name" value={emp.fullname} />
              <Field label="Username" value={emp.username} />
              <Field label="Job Title" value={emp.jobTitle} />
              <Field label="Role" value={emp.role?.replace('ROLE_', '')} />
              <Field label="Department ID" value={emp.departmentId} />
              <Field label="Reports To" value={emp.reportid} />
            </Section>
            <Section title="Employment Details">
              <Field label="Start Date" value={emp.startDate?.split('T')[0]} />
              <Field label="End Date" value={emp.endDate?.split('T')[0]} />
              <Field label="Remark" value={emp.remark} />
              <Field label="Status" value={emp.active ? 'Active' : 'Inactive'} />
            </Section>
            {authUser?.id === empId && (
              <Section title="Change Password">
                {passMsg && (
                  <div style={{ background: passMsg.includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${passMsg.includes('success') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 8, padding: '8px 12px', color: passMsg.includes('success') ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 12 }}>
                    {passMsg}
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>Current Password</label>
                  <input type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} style={inputSt} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>New Password</label>
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} style={inputSt} />
                </div>
                <button onClick={() => changePassMut.mutate()} disabled={!oldPass || !newPass}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  Update Password
                </button>
              </Section>
            )}
            {isAdmin && authUser?.id !== empId && (
              <Section title="Reset Password">
                <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6B7280' }}>
                  Set a new password for <strong>{emp.fullname}</strong> without requiring their current password.
                </p>
                {resetMsg && (
                  <div style={{ background: resetMsg.includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${resetMsg.includes('success') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 8, padding: '8px 12px', color: resetMsg.includes('success') ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 12 }}>
                    {resetMsg}
                  </div>
                )}
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>New Password</label>
                  <input type="password" value={resetPass} onChange={e => setResetPass(e.target.value)} style={inputSt}
                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 4, fontWeight: 500 }}>Confirm Password</label>
                  <input type="password" value={resetConfirm} onChange={e => setResetConfirm(e.target.value)} style={{ ...inputSt, borderColor: resetConfirm && resetConfirm !== resetPass ? '#dc2626' : '#E5E7EB' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = resetConfirm && resetConfirm !== resetPass ? '#dc2626' : '#E5E7EB'} />
                  {resetConfirm && resetConfirm !== resetPass && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, color: '#dc2626' }}>Passwords do not match</p>
                  )}
                </div>
                <button
                  onClick={() => { setResetMsg(''); resetPassMut.mutate(); }}
                  disabled={!resetPass || resetPass !== resetConfirm || resetPassMut.isPending}
                  style={{ background: '#6366f1', color: '#FFFFFF', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (!resetPass || resetPass !== resetConfirm) ? 0.5 : 1 }}
                >
                  {resetPassMut.isPending ? 'Resetting…' : 'Reset Password'}
                </button>
              </Section>
            )}
          </div>
        )}

        {tab === 'personal' && (
          !personal ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading personal information…</div>
          ) : (
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '24px 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB', paddingBottom: 12, marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Personal Information</h3>
                {!personalEditing && (
                  <button onClick={() => setPersonalEditing(true)}
                    style={{ background: 'rgba(244,180,0,0.08)', border: '1px solid rgba(244,180,0,0.3)', borderRadius: 7, padding: '6px 16px', color: '#d97706', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Edit
                  </button>
                )}
              </div>

              {personalSaveMsg && (
                <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 8, fontSize: 13,
                  background: personalSaveMsg.includes('success') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${personalSaveMsg.includes('success') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
                  color: personalSaveMsg.includes('success') ? '#16a34a' : '#dc2626' }}>
                  {personalSaveMsg}
                </div>
              )}

              {!personalEditing ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 28px' }}>
                  {([
                    { key: 'dateOfBirth', label: 'Date of Birth' },
                    { key: 'gender', label: 'Gender' },
                    { key: 'maritalStatus', label: 'Marital Status' },
                    { key: 'fatherName', label: "Father's Name" },
                    { key: 'idNumber', label: 'ID Number' },
                    { key: 'emailAddress', label: 'Email Address' },
                    { key: 'mobile', label: 'Mobile' },
                    { key: 'phone', label: 'Phone' },
                    { key: 'address', label: 'Address' },
                    { key: 'city', label: 'City' },
                    { key: 'state', label: 'State' },
                    { key: 'country', label: 'Country' },
                  ]).map(({ key, label }) => (
                    <div key={key}>
                      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 3, fontWeight: 500 }}>{label}</div>
                      <div style={{ fontSize: 14, color: (personalForm as any)[key] ? '#111827' : '#9CA3AF' }}>
                        {(personalForm as any)[key] || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 28px' }}>
                    {([
                      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
                      { key: 'gender', label: 'Gender', type: 'select', options: ['', 'Male', 'Female', 'Other'] },
                      { key: 'maritalStatus', label: 'Marital Status', type: 'select', options: ['', 'Single', 'Married', 'Divorced', 'Widowed'] },
                      { key: 'fatherName', label: "Father's Name", type: 'text' },
                      { key: 'idNumber', label: 'ID Number', type: 'text' },
                      { key: 'emailAddress', label: 'Email Address', type: 'email' },
                      { key: 'mobile', label: 'Mobile', type: 'text' },
                      { key: 'phone', label: 'Phone', type: 'text' },
                      { key: 'address', label: 'Address', type: 'text' },
                      { key: 'city', label: 'City', type: 'text' },
                      { key: 'state', label: 'State', type: 'text' },
                      { key: 'country', label: 'Country', type: 'text' },
                    ] as any[]).map(({ key, label, type, options }) => (
                      <div key={key}>
                        <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>{label}</label>
                        {type === 'select' ? (
                          <select value={(personalForm as any)[key]} onChange={e => setPersonalForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ ...inputSt }}>
                            {options.map((o: string) => <option key={o} value={o}>{o || '— Select —'}</option>)}
                          </select>
                        ) : (
                          <input type={type} value={(personalForm as any)[key]} onChange={e => setPersonalForm(f => ({ ...f, [key]: e.target.value }))}
                            style={{ ...inputSt }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button onClick={() => { setPersonalEditing(false); setPersonalSaveMsg(''); }}
                      style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, padding: '10px 20px', fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                    <button onClick={() => updatePersonalMut.mutate(personalForm)} disabled={updatePersonalMut.isPending}
                      style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '10px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                      {updatePersonalMut.isPending ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        )}

        {tab === 'financial' && isAdmin && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <Section title="Salary Details">
              <Field label="Employment Type" value={financial?.employmentType} />
              <EditableField label="Basic Salary" value={financial?.salaryBasic?.toString()} onSave={v => updateFinancialMut.mutate({ salaryBasic: Number(v) })} />
              <EditableField label="Gross Salary" value={financial?.salaryGross?.toString()} onSave={v => updateFinancialMut.mutate({ salaryGross: Number(v) })} />
              <EditableField label="Net Salary" value={financial?.salaryNet?.toString()} onSave={v => updateFinancialMut.mutate({ salaryNet: Number(v) })} />
            </Section>
            <Section title="Allowances">
              <Field label="House Rent" value={financial?.allowanceHouseRent} />
              <Field label="Medical" value={financial?.allowanceMedical} />
              <Field label="Special" value={financial?.allowanceSpecial} />
              <Field label="Fuel" value={financial?.allowanceFuel} />
              <Field label="Phone Bill" value={financial?.allowancePhoneBill} />
              <Field label="Other" value={financial?.allowanceOther} />
              <Field label="Total Allowance" value={financial?.allowanceTotal} />
            </Section>
            <Section title="Deductions">
              <Field label="Provident Fund" value={financial?.deductionProvidentFund} />
              <Field label="Tax" value={financial?.deductionTax} />
              <Field label="Other" value={financial?.deductionOther} />
              <Field label="Total Deduction" value={financial?.deductionTotal} />
            </Section>
            <Section title="Bank Details">
              <Field label="Bank Name" value={financial?.bankName} />
              <Field label="Account Name" value={financial?.accountName} />
              <Field label="Account Number" value={financial?.accountNumber} />
              <Field label="IBAN" value={financial?.iban} />
              <Field label="OT Status" value={financial?.otStatus} />
              <Field label="ESIC Status" value={financial?.esicStatus} />
            </Section>
          </div>
        )}

        {tab === 'attendance' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
              <select value={attYear} onChange={e => setAttYear(Number(e.target.value))}
                style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', color: '#111827', fontSize: 14 }}>
                {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select value={attMonth} onChange={e => setAttMonth(Number(e.target.value))}
                style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 12px', color: '#111827', fontSize: 14 }}>
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                  <option key={i + 1} value={i + 1}>{m}</option>
                ))}
              </select>
              {daysWorked !== undefined && (
                <span style={{ fontSize: 14, color: '#f4b400', fontWeight: 600 }}>
                  Days Worked: {typeof daysWorked === 'object' ? daysWorked?.daysWorked ?? JSON.stringify(daysWorked) : daysWorked}
                </span>
              )}
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {!attendance ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading attendance…</div>
              ) : (attendance as any[]).length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No attendance records for this period.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                        {['Date', 'Start Time', 'End Time', 'Hours', 'OT Hours', 'Location'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(attendance as any[]).map((a: any, i: number) => (
                        <tr key={a.id || i} style={{ borderBottom: i < (attendance as any[]).length - 1 ? '1px solid #F3F4F6' : 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                          onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: '#374151' }}>{a.date}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: '#6B7280' }}>{(a.startTime ?? a.start_time) || '—'}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: '#6B7280' }}>{(a.endTime ?? a.end_time) || <span style={{ color: '#d97706' }}>Ongoing</span>}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: '#16a34a', fontWeight: 500 }}>{(a.numberOfHours ?? a.number_of_hours) ?? '—'}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: (a.OtHours ?? a.ot_hours) > 0 ? '#f4b400' : '#9CA3AF' }}>{(a.OtHours ?? a.ot_hours) ?? 0}</td>
                          <td style={{ padding: '10px 16px', fontSize: 13, color: '#6B7280' }}>{a.location || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
