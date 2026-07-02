import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllProjects, createProject, updateProject, deleteProject } from '../../api/projects';
import { getAllCustomers } from '../../api/customers';

const STATUS_OPTS = ['Active', 'Completed', 'On Hold', 'Cancelled'];
const STATUS_COLOR: Record<string, string> = { Active: '#22c55e', Completed: '#3b82f6', 'On Hold': '#f59e0b', Cancelled: '#ef4444' };

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

  const { data: projects = [], isLoading } = useQuery({ queryKey: ['projects'], queryFn: getAllProjects, retry: false });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: getAllCustomers, retry: false });

  const reset = () => { setName(''); setDescription(''); setCustomerId(''); setStartDate(''); setEndDate(''); setStatus('Active'); setEditing(null); };

  const saveMut = useMutation({
    mutationFn: () => editing
      ? updateProject(editing.id, { name, description, customerId: Number(customerId) || undefined, startDate, endDate, status })
      : createProject({ name, description, customerId: Number(customerId) || undefined, startDate, endDate, status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      setMsg(editing ? 'Project updated!' : 'Project created!');
      setShowForm(false); reset();
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });

  const openEdit = (p: any) => {
    setEditing(p); setName(p.name || ''); setDescription(p.description || '');
    setCustomerId(String(p.customerId || '')); setStartDate(p.startDate || '');
    setEndDate(p.endDate || ''); setStatus(p.status || 'Active');
    setShowForm(true); setMsg('');
  };

  const all = projects as any[];
  const custList = customers as any[];
  const records = all.filter(p => {
    if (filterStatus !== 'All' && p.status !== filterStatus) return false;
    if (search) return (p.name || '').toLowerCase().includes(search.toLowerCase());
    return true;
  });

  const getCustomerName = (id: number) => custList.find(c => c.id === id)?.name || `Customer #${id}`;

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Projects"
        subtitle="Manage all company projects"
        action={
          <button onClick={() => { reset(); setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + New Project
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        {msg && (
          <div style={{ background: msg.includes('!') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('!') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('!') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16 }}>{msg}</div>
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
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="Project name"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)}
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Customer</label>
                  <select value={customerId} onChange={e => setCustomerId(e.target.value)}
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                    <option value="">Select customer…</option>
                    {custList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Start Date</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>End Date</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  placeholder="Project details…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, resize: 'vertical' }} />
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {records.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '44px 0', color: '#9CA3AF' }}>
                <p>No projects found.</p>
              </div>
            ) : records.map((p: any) => {
              const sc = STATUS_COLOR[p.status] || '#9ca3af';
              return (
                <div key={p.id} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${sc}50`}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', flex: 1, paddingRight: 8 }}>{p.name}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${sc}18`, color: sc, fontWeight: 600, flexShrink: 0 }}>{p.status || 'Active'}</span>
                  </div>
                  {p.customerId && <div style={{ fontSize: 12, color: '#3b82f6', marginBottom: 6 }}>{getCustomerName(p.customerId)}</div>}
                  {p.description && <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 10px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</p>}
                  {(p.startDate || p.endDate) && (
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 12 }}>
                      {p.startDate && `${p.startDate}`}{p.startDate && p.endDate && ' → '}{p.endDate && `${p.endDate}`}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openEdit(p)} style={{ flex: 1, padding: '6px', background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 6, color: '#f4b400', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => { if (confirm(`Delete "${p.name}"?`)) deleteMut.mutate(p.id); }} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
