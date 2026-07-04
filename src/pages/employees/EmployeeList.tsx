import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { getActiveUsers, getAllUsers, getExitedUsers, deleteUser, createUser, activateUser, updateUser } from '../../api/users';
import { updatePersonalInfo } from '../../api/personalInfo';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
          <h3 style={{ margin: 0, color: '#111827', fontSize: 16, fontWeight: 700, fontFamily: "'Archivo', sans-serif" }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>{label}{required && ' *'}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 12px', color: '#111827', fontSize: 14, outline: 'none' }}
        onFocus={e => e.target.style.borderColor = '#f4b400'}
        onBlur={e => e.target.style.borderColor = '#E5E7EB'}
      />
    </div>
  );
}

export default function EmployeeList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isAdminOrManager = isAdmin || user?.role === 'ROLE_MANAGER';

  const [tab, setTab] = useState<'active' | 'all' | 'exited'>('active');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newEmp, setNewEmp] = useState({ fullname: '', username: '', password: '', jobTitle: '', role: 'ROLE_EMPLOYEE' });
  const [personalDetails, setPersonalDetails] = useState({ mobile: '', email: '', dob: '', gender: '', city: '', nomineeName: '', nomineeRelationship: '' });
  const [addError, setAddError] = useState('');

  const [editEmp, setEditEmp] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ fullname: '', jobTitle: '', role: 'ROLE_EMPLOYEE', active: 1, reportid: '' });
  const [editError, setEditError] = useState('');

  const openEdit = (u: User) => {
    setEditEmp(u);
    setEditForm({ fullname: u.fullname || '', jobTitle: u.jobTitle || '', role: u.role || 'ROLE_EMPLOYEE', active: (u.active as number) ?? 1, reportid: u.reportid || '' });
    setEditError('');
  };

  const { data: activeUsers = [], isLoading: loadingActive } = useQuery({
    queryKey: ['users', 'active'], queryFn: getActiveUsers, retry: false,
  });
  const { data: allUsers = [], isLoading: loadingAll } = useQuery({
    queryKey: ['users', 'all'], queryFn: getAllUsers, enabled: isAdminOrManager, retry: false,
  });
  const { data: exitedUsers = [], isLoading: loadingExited } = useQuery({
    queryKey: ['users', 'exited'], queryFn: getExitedUsers, enabled: isAdminOrManager, retry: false,
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  const activateMut = useMutation({
    mutationFn: activateUser,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); },
  });

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: async (data: any) => {
      const { mobile, email, dob, gender, city } = personalDetails;
      if ((mobile || email || dob || gender || city) && data?.id) {
        try {
          await updatePersonalInfo(data.id, {
            mobile: mobile || undefined,
            emailAddress: email || undefined,
            dateOfBirth: dob || undefined,
            gender: gender || undefined,
            city: city || undefined,
            nomineeName: personalDetails.nomineeName || undefined,
            nomineeRelationship: personalDetails.nomineeRelationship || undefined,
          });
        } catch {}
      }
      qc.invalidateQueries({ queryKey: ['users'] });
      setShowAdd(false);
      setNewEmp({ fullname: '', username: '', password: '', jobTitle: '', role: 'ROLE_EMPLOYEE' });
      setPersonalDetails({ mobile: '', email: '', dob: '', gender: '', city: '', nomineeName: '', nomineeRelationship: '' });
    },
    onError: (e: any) => setAddError(e.response?.data?.error || 'Failed to create employee'),
  });

  const editMut = useMutation({
    mutationFn: () => updateUser(editEmp!.id, {
      fullname: editForm.fullname,
      jobTitle: editForm.jobTitle,
      role: editForm.role,
      active: editForm.active,
      reportid: editForm.reportid || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setEditEmp(null); setEditError(''); },
    onError: (e: any) => setEditError(e.response?.data?.error || 'Failed to update employee'),
  });

  const rows: User[] = (tab === 'active' ? activeUsers : tab === 'exited' ? exitedUsers : allUsers).filter(u =>
    u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
    u.projectName?.toLowerCase().includes(search.toLowerCase())
  );

  const loading = tab === 'active' ? loadingActive : tab === 'exited' ? loadingExited : loadingAll;

  const roleColor = (role: string) => {
    if (role?.includes('ADMIN')) return { bg: 'rgba(239,68,68,0.08)', color: '#dc2626' };
    if (role?.includes('MANAGER')) return { bg: 'rgba(59,130,246,0.08)', color: '#2563eb' };
    return { bg: 'rgba(244,180,0,0.1)', color: '#d97706' };
  };

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Employees"
        subtitle={`${rows.length} ${tab === 'active' ? 'active' : tab === 'exited' ? 'exited' : 'total'} employees`}
        action={isAdmin ? (
          <button
            onClick={() => setShowAdd(true)}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            + Add Employee
          </button>
        ) : undefined}
      />

      <div style={{ padding: 28 }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdminOrManager && (
            <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 8, padding: 3, border: '1px solid #E5E7EB' }}>
              {(['active', 'all', 'exited'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    background: tab === t ? '#f4b400' : 'transparent',
                    color: tab === t ? '#1f1f1f' : '#6B7280',
                  }}
                >
                  {t === 'active' ? 'Active' : t === 'exited' ? 'Exited' : 'All'}
                </button>
              ))}
            </div>
          )}
          <input
            type="text"
            placeholder="Search by name, username, job title…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, minWidth: 200, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8,
              padding: '8px 14px', color: '#111827', fontSize: 14, outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
            onFocus={e => e.target.style.borderColor = '#f4b400'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>No employees found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['#', 'Employee', 'Username', 'Role', 'Job Title', 'Project', ...(tab === 'exited' ? ['Exit Date', 'Remark'] : []), 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((u, idx) => {
                    const rc = roleColor(u.role);
                    return (
                      <tr key={u.id} style={{ borderBottom: idx < rows.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer' }}
                        onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                        onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#9CA3AF' }}>{u.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(244,180,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#f4b400', flexShrink: 0 }}>
                              {u.fullname?.charAt(0)?.toUpperCase()}
                            </div>
                            <span style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>{u.fullname}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{u.username}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 12, padding: '3px 8px', borderRadius: 4, background: rc.bg, color: rc.color, fontWeight: 600 }}>
                            {u.role?.replace('ROLE_', '')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>{u.jobTitle || '—'}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13 }}>
                          {u.projectName
                            ? <span style={{ padding: '3px 8px', background: 'rgba(59,130,246,0.08)', color: '#2563eb', borderRadius: 4, fontSize: 12, fontWeight: 600 }}>{u.projectName}</span>
                            : <span style={{ color: '#9CA3AF' }}>—</span>
                          }
                        </td>
                        {tab === 'exited' && (
                          <>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: '#dc2626' }}>{u.endDate ?? '—'}</td>
                            <td style={{ padding: '12px 16px', fontSize: 12, color: '#6B7280' }}>{u.remark ?? '—'}</td>
                          </>
                        )}
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button
                              onClick={() => navigate(`/employees/${u.id}`)}
                              style={{ padding: '5px 10px', background: 'rgba(244,180,0,0.08)', border: '1px solid rgba(244,180,0,0.25)', borderRadius: 6, color: '#d97706', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                            >
                              View
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => openEdit(u)}
                                style={{ padding: '5px 10px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#6366f1', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                              >
                                Edit
                              </button>
                            )}
                            {isAdmin && !u.active && (
                              <button
                                onClick={() => activateMut.mutate(u.id)}
                                disabled={activateMut.isPending}
                                style={{ padding: '5px 10px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6, color: '#16a34a', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}
                              >
                                Activate
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => { if (confirm(`Remove ${u.fullname}?`)) deleteMut.mutate(u.id); }}
                                style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 12, cursor: 'pointer' }}
                              >
                                Remove
                              </button>
                            )}
                          </div>
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

      {editEmp && (
        <Modal title={`Edit Employee — ${editEmp.fullname}`} onClose={() => { setEditEmp(null); setEditError(''); }}>
          {editError && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{editError}</div>}
          <form onSubmit={e => { e.preventDefault(); setEditError(''); editMut.mutate(); }}>
            <InputField label="Full Name" value={editForm.fullname} onChange={v => setEditForm(p => ({ ...p, fullname: v }))} required />
            <InputField label="Job Title" value={editForm.jobTitle} onChange={v => setEditForm(p => ({ ...p, jobTitle: v }))} />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>Role</label>
              <select
                value={editForm.role}
                onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 12px', color: '#111827', fontSize: 14 }}
              >
                <option value="ROLE_EMPLOYEE">Employee</option>
                <option value="ROLE_MANAGER">Manager</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
            <InputField label="Reports To (User ID)" value={String(editForm.reportid)} onChange={v => setEditForm(p => ({ ...p, reportid: v }))} />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#6B7280', marginBottom: 8, fontWeight: 500 }}>Status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ label: 'Active', val: 1 }, { label: 'Inactive', val: 0 }].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setEditForm(p => ({ ...p, active: opt.val }))}
                    style={{
                      flex: 1, padding: '8px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      border: `1px solid ${editForm.active === opt.val ? (opt.val ? '#16a34a' : '#dc2626') : '#E5E7EB'}`,
                      background: editForm.active === opt.val ? (opt.val ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.08)') : '#FFFFFF',
                      color: editForm.active === opt.val ? (opt.val ? '#16a34a' : '#dc2626') : '#6B7280',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={editMut.isPending}
              style={{ width: '100%', background: '#6366f1', color: '#FFFFFF', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              {editMut.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </Modal>
      )}

      {showAdd && (
        <Modal title="Add New Employee" onClose={() => { setShowAdd(false); setAddError(''); setPersonalDetails({ mobile: '', email: '', dob: '', gender: '', city: '', nomineeName: '', nomineeRelationship: '' }); }}>
          {addError && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{addError}</div>}
          <form onSubmit={e => { e.preventDefault(); setAddError(''); createMut.mutate(newEmp); }}>
            <InputField label="Full Name" value={newEmp.fullname} onChange={v => setNewEmp(p => ({ ...p, fullname: v }))} required />
            <InputField label="Username" value={newEmp.username} onChange={v => setNewEmp(p => ({ ...p, username: v }))} required />
            <InputField label="Password" type="password" value={newEmp.password} onChange={v => setNewEmp(p => ({ ...p, password: v }))} />
            <InputField label="Job Title" value={newEmp.jobTitle} onChange={v => setNewEmp(p => ({ ...p, jobTitle: v }))} />
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>Role</label>
              <select
                value={newEmp.role}
                onChange={e => setNewEmp(p => ({ ...p, role: e.target.value }))}
                style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 12px', color: '#111827', fontSize: 14 }}
              >
                <option value="ROLE_EMPLOYEE">Employee</option>
                <option value="ROLE_MANAGER">Manager</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
            {/* Personal Details — optional, fills on behalf of employee */}
            <div style={{ margin: '8px 0 14px', padding: '14px 16px', background: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB' }}>
              <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Personal Details <span style={{ fontWeight: 400, textTransform: 'none', color: '#9CA3AF' }}>(optional — skip if employee will fill in app)</span>
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Mobile" value={personalDetails.mobile} onChange={v => setPersonalDetails(p => ({ ...p, mobile: v }))} />
                <InputField label="Personal Email" value={personalDetails.email} onChange={v => setPersonalDetails(p => ({ ...p, email: v }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Date of Birth (YYYY-MM-DD)" value={personalDetails.dob} onChange={v => setPersonalDetails(p => ({ ...p, dob: v }))} />
                <InputField label="City" value={personalDetails.city} onChange={v => setPersonalDetails(p => ({ ...p, city: v }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <InputField label="Nominee Name" value={personalDetails.nomineeName} onChange={v => setPersonalDetails(p => ({ ...p, nomineeName: v }))} />
                <InputField label="Nominee Relationship" value={personalDetails.nomineeRelationship} onChange={v => setPersonalDetails(p => ({ ...p, nomineeRelationship: v }))} />
              </div>
              <div style={{ marginBottom: 4 }}>
                <label style={{ display: 'block', fontSize: 13, color: '#6B7280', marginBottom: 6, fontWeight: 500 }}>Gender</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Male', 'Female', 'Other'].map(g => (
                    <button key={g} type="button" onClick={() => setPersonalDetails(p => ({ ...p, gender: p.gender === g ? '' : g }))}
                      style={{ flex: 1, padding: '7px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1px solid ${personalDetails.gender === g ? '#f4b400' : '#E5E7EB'}`, background: personalDetails.gender === g ? 'rgba(244,180,0,0.12)' : '#FFFFFF', color: personalDetails.gender === g ? '#111827' : '#6B7280' }}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={createMut.isPending}
              style={{ width: '100%', background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '10px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              {createMut.isPending ? 'Creating…' : 'Create Employee'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
