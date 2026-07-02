import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from '../../api/departments';

const inputStyle = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, outline: 'none',
};

export default function DepartmentManagement() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ['departments'],
    queryFn: getAllDepartments,
    retry: false,
  });

  const reset = () => { setName(''); setDescription(''); setEditing(null); };

  const saveMut = useMutation({
    mutationFn: () => editing
      ? updateDepartment(editing.id, { name, description })
      : createDepartment({ name, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] });
      setMsg(editing ? 'Department updated!' : 'Department created!');
      setShowForm(false); reset();
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Save failed.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
    onError: (e: any) => setMsg(e.response?.data?.message || 'Delete failed.'),
  });

  const openEdit = (d: any) => {
    setEditing(d); setName(d.name || ''); setDescription(d.description || '');
    setShowForm(true); setMsg('');
  };

  const depts = departments as any[];

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Departments"
        subtitle="Manage company departments and organizational structure"
        action={
          <button onClick={() => { reset(); setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + New Department
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
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>{editing ? 'Edit Department' : 'New Department'}</h3>
              <button onClick={() => { setShowForm(false); reset(); }} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Department Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Engineering" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Description</label>
                  <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description…" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
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

        {isLoading ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {depts.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '44px 0', color: '#9CA3AF' }}>
                <p style={{ fontSize: 14 }}>No departments yet.</p>
                <button onClick={() => setShowForm(true)} style={{ marginTop: 12, background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Create First Department</button>
              </div>
            ) : depts.map((d: any) => (
              <div key={d.id} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', transition: 'border-color 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(244,180,0,0.4)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(244,180,0,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(244,180,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f4b400" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>{d.name}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>ID: {d.id}</div>
                  </div>
                </div>
                {d.description && <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 12px' }}>{d.description}</p>}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button onClick={() => openEdit(d)} style={{ flex: 1, padding: '6px', background: 'rgba(244,180,0,0.08)', border: '1px solid rgba(244,180,0,0.25)', borderRadius: 6, color: '#d97706', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                  <button onClick={() => { if (confirm(`Delete "${d.name}"?`)) deleteMut.mutate(d.id); }} style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 12, cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
