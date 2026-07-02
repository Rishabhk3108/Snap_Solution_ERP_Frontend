import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllAnnouncements, createAnnouncement, deleteAnnouncement } from '../../api/announcements';
import { getAllDepartments } from '../../api/departments';

export default function AnnouncementManagement() {
  const qc = useQueryClient();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [deptId, setDeptId] = useState('');
  const [msg, setMsg] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['announcements', 'all'],
    queryFn: getAllAnnouncements,
    retry: false,
  });
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: getAllDepartments, retry: false });

  const createMut = useMutation({
    mutationFn: () => createAnnouncement({ title, content, departmentId: deptId ? Number(deptId) : undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['announcements'] });
      setMsg('Announcement posted!');
      setShowForm(false); setTitle(''); setContent(''); setDeptId('');
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed to post.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });

  const all = (announcements as any[]).filter(a =>
    !search || (a.title || '').toLowerCase().includes(search.toLowerCase()) || (a.content || a.announcement || '').toLowerCase().includes(search.toLowerCase())
  );
  const deptList = departments as any[];
  const getDeptName = (id: number) => deptList.find(d => d.id === id)?.name || `Dept #${id}`;

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Announcements"
        subtitle="Post and manage company-wide and department announcements"
        action={
          <button onClick={() => { setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Post Announcement
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
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>New Announcement</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Announcement title"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Target</label>
                  <select value={deptId} onChange={e => setDeptId(e.target.value)}
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                    <option value="">Company-wide</option>
                    {deptList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Content *</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4}
                  placeholder="Write the announcement content…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={createMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {createMut.isPending ? 'Posting…' : 'Post Announcement'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background: '#E5E7EB', color: '#6B7280', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements…"
            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 14px', color: '#111827', fontSize: 13 }} />
        </div>

        {isLoading ? (
          <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
        ) : all.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            <p style={{ fontSize: 14, marginBottom: 12 }}>No announcements yet.</p>
            <button onClick={() => setShowForm(true)} style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Post First Announcement</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {all.map((a: any, i: number) => (
              <div key={a.id || i} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 22px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(244,180,0,0.3)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>{a.title || 'Announcement'}</h3>
                      {a.departmentId ? (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>{getDeptName(a.departmentId)}</span>
                      ) : (
                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(244,180,0,0.1)', color: '#f4b400' }}>Company-wide</span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{a.content || a.announcement}</p>
                    <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: '#9CA3AF' }}>
                      {a.createdAt && <span>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      {a.createdBy && <span>By: {a.createdBy}</span>}
                    </div>
                  </div>
                  <button onClick={() => { if (confirm('Delete this announcement?')) deleteMut.mutate(a.id); }}
                    style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
