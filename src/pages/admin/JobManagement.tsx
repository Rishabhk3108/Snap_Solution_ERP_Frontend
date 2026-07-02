import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllJobs, createJob, updateJob, deleteJob } from '../../api/jobs';
import { getAllDepartments } from '../../api/departments';

const inputStyle = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, outline: 'none',
};

export default function JobManagement() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deptId, setDeptId] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const { data: jobs = [], isLoading } = useQuery({ queryKey: ['jobs'], queryFn: getAllJobs, retry: false });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getAllDepartments, retry: false });

  const reset = () => { setTitle(''); setDescription(''); setDeptId(''); setEditing(null); };

  const saveMut = useMutation({
    mutationFn: () => editing
      ? updateJob(editing.id, { title, description, departmentId: Number(deptId) || undefined })
      : createJob({ title, description, departmentId: Number(deptId) || undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jobs'] });
      setMsg(editing ? 'Job updated!' : 'Job created!');
      setShowForm(false); reset();
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  });

  const openEdit = (j: any) => {
    setEditing(j); setTitle(j.title || ''); setDescription(j.description || '');
    setDeptId(String(j.departmentId || '')); setShowForm(true); setMsg('');
  };

  const allJobs = jobs as any[];
  const deptList = departments as any[];
  const records = allJobs.filter(j => !search || (j.title || '').toLowerCase().includes(search.toLowerCase()));
  const getDeptName = (id: number) => deptList.find(d => d.id === id)?.name || `Dept #${id}`;

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Job Positions"
        subtitle="Manage company job titles and positions"
        action={
          <button onClick={() => { reset(); setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + New Position
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        {msg && (
          <div style={{ background: msg.includes('!') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${msg.includes('!') ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('!') ? '#16a34a' : '#dc2626', fontSize: 13, marginBottom: 16 }}>{msg}</div>
        )}

        {showForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.35)', borderRadius: 14, padding: '22px 24px', marginBottom: 22, boxShadow: '0 2px 8px rgba(244,180,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>{editing ? 'Edit Position' : 'New Position'}</h3>
              <button onClick={() => { setShowForm(false); reset(); }} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div style={{ gridColumn: '1/3' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Job Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Senior Developer" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Department</label>
                  <select value={deptId} onChange={e => setDeptId(e.target.value)} style={inputStyle}>
                    <option value="">Select dept…</option>
                    {deptList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Job responsibilities…"
                  style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saveMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {saveMut.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); reset(); }}
                  style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search job titles…"
            style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 14px', color: '#111827', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Positions <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 400 }}>({records.length})</span></span>
          </div>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Loading…</p>
          ) : records.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No job positions found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['ID', 'Title', 'Department', 'Description', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map((j: any, i: number) => (
                  <tr key={j.id} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{j.id}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#111827', fontWeight: 600 }}>{j.title}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12 }}>
                      {j.departmentId
                        ? <span style={{ padding: '3px 8px', background: 'rgba(59,130,246,0.08)', color: '#3b82f6', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{getDeptName(j.departmentId)}</span>
                        : <span style={{ color: '#9CA3AF' }}>—</span>}
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.description || '—'}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(j)} style={{ padding: '4px 10px', background: 'rgba(244,180,0,0.08)', border: '1px solid rgba(244,180,0,0.25)', borderRadius: 5, color: '#d97706', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                        <button onClick={() => { if (confirm(`Delete "${j.title}"?`)) deleteMut.mutate(j.id); }} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, color: '#dc2626', fontSize: 11, cursor: 'pointer' }}>×</button>
                      </div>
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
