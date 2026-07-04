import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import {
  getAllProjects, getProject,
  createProject, updateProject, deleteProject,
  assignManager, removeManager,
  assignEmployeeToProject, removeEmployeeFromProject,
} from '../../api/projects';
import { getAllCustomers } from '../../api/customers';
import { getActiveUsers } from '../../api/users';

const STATUS_OPTS = ['Active', 'Completed', 'On Hold', 'Cancelled'];
const STATUS_COLOR: Record<string, string> = {
  Active: '#22c55e', Completed: '#3b82f6', 'On Hold': '#f59e0b', Cancelled: '#ef4444',
};

const inp: React.CSSProperties = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13,
};

export default function ProjectManagement() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('Active');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Detail panel
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<'managers' | 'employees'>('managers');
  const [addManagerId, setAddManagerId] = useState('');
  const [addEmployeeId, setAddEmployeeId] = useState('');
  const [detailMsg, setDetailMsg] = useState('');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'], queryFn: getAllProjects, retry: false,
  });
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'], queryFn: getAllCustomers, retry: false,
  });
  const { data: allUsers = [] } = useQuery({
    queryKey: ['users', 'active'], queryFn: getActiveUsers, retry: false,
  });
  const { data: selectedProject, isLoading: loadingDetail } = useQuery({
    queryKey: ['project', selectedId],
    queryFn: () => getProject(selectedId!),
    enabled: selectedId != null,
    retry: false,
  });

  const reset = () => {
    setName(''); setDescription(''); setCustomerId('');
    setStartDate(''); setEndDate(''); setStatus('Active'); setEditing(null);
  };

  const saveMut = useMutation({
    mutationFn: () => editing
      ? updateProject(editing.id, { name, description, customerId: Number(customerId) || undefined, startDate, endDate, status })
      : createProject({ name, description, customerId: Number(customerId) || undefined, startDate, endDate, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      if (selectedId) qc.invalidateQueries({ queryKey: ['project', selectedId] });
      setMsg(editing ? 'Project updated!' : 'Project created!');
      setShowForm(false); reset();
    },
    onError: (e: any) => setMsg(e.response?.data?.message || e.response?.data?.error || 'Failed.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setSelectedId(null);
    },
    onError: (e: any) => setMsg(e.response?.data?.error || 'Cannot delete project.'),
  });

  const assignMgrMut = useMutation({
    mutationFn: () => assignManager(selectedId!, Number(addManagerId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', selectedId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      setAddManagerId(''); setDetailMsg('Manager assigned!');
    },
    onError: (e: any) => setDetailMsg(e.response?.data?.error || 'Failed.'),
  });

  const removeMgrMut = useMutation({
    mutationFn: (managerId: number) => removeManager(selectedId!, managerId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', selectedId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      setDetailMsg('Manager removed.');
    },
    onError: (e: any) => setDetailMsg(e.response?.data?.error || 'Failed.'),
  });

  const assignEmpMut = useMutation({
    mutationFn: () => assignEmployeeToProject(selectedId!, Number(addEmployeeId)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', selectedId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      setAddEmployeeId(''); setDetailMsg('Employee assigned!');
    },
    onError: (e: any) => setDetailMsg(e.response?.data?.error || 'Failed.'),
  });

  const removeEmpMut = useMutation({
    mutationFn: (userId: number) => removeEmployeeFromProject(selectedId!, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project', selectedId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['users'] });
      setDetailMsg('Employee removed.');
    },
    onError: (e: any) => setDetailMsg(e.response?.data?.error || 'Failed.'),
  });

  const openEdit = (p: any) => {
    setEditing(p); setName(p.name || ''); setDescription(p.description || '');
    setCustomerId(String(p.customerId || '')); setStartDate(p.startDate || '');
    setEndDate(p.endDate || ''); setStatus(p.status || 'Active');
    setShowForm(true); setMsg('');
  };

  const openDetail = (id: number) => {
    setSelectedId(id); setDetailMsg(''); setAddManagerId(''); setAddEmployeeId('');
    setDetailTab('managers');
  };

  const custList = customers as any[];
  const userList = allUsers as any[];

  const records = (projects as any[]).filter(p => {
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (search) return (p.name || '').toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const getCustomerName = (id: number) => custList.find(c => c.id === id)?.name || `#${id}`;

  const managers = (selectedProject as any)?.managers || [];
  const employees = (selectedProject as any)?.employees || [];
  const assignedMgrIds = new Set(managers.map((m: any) => m.id));
  const assignedEmpIds = new Set(employees.map((e: any) => e.id));

  const availableManagers = userList.filter(
    (u: any) => (u.role === 'ROLE_MANAGER' || u.role === 'ROLE_ADMIN') && !assignedMgrIds.has(u.id),
  );
  const availableEmployees = userList.filter(
    (u: any) => !assignedEmpIds.has(u.id),
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header
        title="Projects"
        subtitle="Manage projects, assign managers and employees"
        action={
          <button onClick={() => { reset(); setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + New Project
          </button>
        }
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Left: project list */}
        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>

          {msg && (
            <div style={{
              background: msg.includes('!') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${msg.includes('!') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: 8, padding: '10px 16px',
              color: msg.includes('!') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16,
            }}>{msg}</div>
          )}

          {showForm && (
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.3)', borderRadius: 12, padding: '22px 24px', marginBottom: 22 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{editing ? 'Edit Project' : 'New Project'}</h3>
                <button onClick={() => { setShowForm(false); reset(); }} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); saveMut.mutate(); }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div style={{ gridColumn: '1/3' }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Project Name *</label>
                    <input value={name} onChange={e => setName(e.target.value)} required placeholder="Project name" style={inp} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} style={inp}>
                      {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Customer</label>
                    <select value={customerId} onChange={e => setCustomerId(e.target.value)} style={inp}>
                      <option value="">Select customer…</option>
                      {custList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>End Date</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inp} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                    placeholder="Project details…"
                    style={{ ...inp, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" disabled={saveMut.isPending}
                    style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    {saveMut.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={() => { setShowForm(false); reset(); }}
                    style={{ background: '#E5E7EB', color: '#6B7280', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <div style={{ display: 'flex', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: 3 }}>
              {['All', ...STATUS_OPTS].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  style={{ padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filterStatus === s ? '#f4b400' : 'transparent', color: filterStatus === s ? '#F9FAFB' : '#9ca3af' }}>{s}</button>
              ))}
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…"
              style={{ flex: 1, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }} />
          </div>

          {isLoading ? (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {records.length === 0 ? (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '44px 0', color: '#9CA3AF' }}>
                  No projects found.
                </div>
              ) : records.map((p: any) => {
                const sc = STATUS_COLOR[p.status] || '#9ca3af';
                const isSelected = selectedId === p.id;
                return (
                  <div key={p.id}
                    onClick={() => openDetail(p.id)}
                    style={{
                      background: '#FFFFFF', border: `1px solid ${isSelected ? '#f4b400' : '#E5E7EB'}`,
                      borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
                      transition: 'border-color 0.15s', boxShadow: isSelected ? '0 0 0 2px rgba(244,180,0,0.15)' : 'none',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', flex: 1, paddingRight: 8 }}>{p.name}</div>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${sc}18`, color: sc, fontWeight: 600, flexShrink: 0 }}>{p.status || 'Active'}</span>
                    </div>
                    {p.customerId && <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 6 }}>{getCustomerName(p.customerId)}</div>}
                    {p.description && (
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 8px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 14, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>Managers: <strong style={{ color: '#111827' }}>{p.managerCount ?? 0}</strong></span>
                      <span style={{ fontSize: 11, color: '#6B7280' }}>Employees: <strong style={{ color: '#111827' }}>{p.employeeCount ?? 0}</strong></span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }} onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(p)}
                        style={{ flex: 1, padding: '6px', background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 6, color: '#f4b400', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                      <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMut.mutate(p.id); }}
                        style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: detail panel */}
        {selectedId != null && (
          <div style={{ width: 380, borderLeft: '1px solid #E5E7EB', background: '#FAFAFA', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>
                {loadingDetail ? 'Loading…' : (selectedProject as any)?.name}
              </h3>
              <button onClick={() => setSelectedId(null)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>

            {detailMsg && (
              <div style={{ margin: '10px 20px 0', padding: '8px 14px', borderRadius: 7, fontSize: 12,
                background: detailMsg.includes('!') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                color: detailMsg.includes('!') ? '#22c55e' : '#ef4444',
              }}>{detailMsg}</div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB', margin: '14px 20px 0' }}>
              {(['managers', 'employees'] as const).map(t => (
                <button key={t} onClick={() => { setDetailTab(t); setDetailMsg(''); }}
                  style={{ padding: '8px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                    color: detailTab === t ? '#f4b400' : '#6B7280',
                    borderBottom: detailTab === t ? '2px solid #f4b400' : '2px solid transparent',
                    textTransform: 'capitalize',
                  }}>{t}</button>
              ))}
            </div>

            <div style={{ padding: 20, flex: 1 }}>

              {detailTab === 'managers' && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Add Manager</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={addManagerId} onChange={e => setAddManagerId(e.target.value)} style={{ ...inp, flex: 1 }}>
                        <option value="">Select manager…</option>
                        {availableManagers.map((u: any) => (
                          <option key={u.id} value={u.id}>{u.fullName || u.fullname} ({u.role === 'ROLE_ADMIN' ? 'Admin' : 'Manager'})</option>
                        ))}
                      </select>
                      <button onClick={() => { if (addManagerId) assignMgrMut.mutate(); }}
                        disabled={!addManagerId || assignMgrMut.isPending}
                        style={{ padding: '8px 14px', background: '#f4b400', border: 'none', borderRadius: 7, color: '#1f1f1f', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        Add
                      </button>
                    </div>
                  </div>

                  {managers.length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontSize: 13 }}>No managers assigned yet.</p>
                  ) : managers.map((m: any) => (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{m.fullName}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{m.jobTitle || '—'}</div>
                      </div>
                      <button onClick={() => removeMgrMut.mutate(m.id)}
                        style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </>
              )}

              {detailTab === 'employees' && (
                <>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 6 }}>Assign Employee</label>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={addEmployeeId} onChange={e => setAddEmployeeId(e.target.value)} style={{ ...inp, flex: 1 }}>
                        <option value="">Select employee…</option>
                        {availableEmployees.map((u: any) => (
                          <option key={u.id} value={u.id}>
                            {u.fullName || u.fullname}
                            {u.projectName ? ` (${u.projectName})` : ''}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => { if (addEmployeeId) assignEmpMut.mutate(); }}
                        disabled={!addEmployeeId || assignEmpMut.isPending}
                        style={{ padding: '8px 14px', background: '#f4b400', border: 'none', borderRadius: 7, color: '#1f1f1f', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        Add
                      </button>
                    </div>
                  </div>

                  {employees.length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontSize: 13 }}>No employees assigned yet.</p>
                  ) : employees.map((e: any) => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{e.fullName}</div>
                        <div style={{ fontSize: 11, color: '#6B7280' }}>{e.jobTitle || '—'}</div>
                      </div>
                      <button onClick={() => removeEmpMut.mutate(e.id)}
                        style={{ padding: '4px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>
                        Remove
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
