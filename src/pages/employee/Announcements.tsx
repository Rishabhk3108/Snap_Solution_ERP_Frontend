import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { getAllAnnouncements, getDeptAnnouncements } from '../../api/announcements';

export default function Announcements() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'dept'>('all');

  const { data: allAnn = [], isLoading: loadingAll } = useQuery({
    queryKey: ['announcements', 'all'],
    queryFn: getAllAnnouncements,
    retry: false,
  });

  const { data: deptAnn = [], isLoading: loadingDept } = useQuery({
    queryKey: ['announcements', 'dept', user?.departmentId],
    queryFn: () => getDeptAnnouncements(user!.departmentId!),
    enabled: !!user?.departmentId,
    retry: false,
  });

  const raw = tab === 'all' ? allAnn : deptAnn;
  const items = (raw as any[]).filter(a =>
    !search ||
    (a.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (a.content || a.announcement || '').toLowerCase().includes(search.toLowerCase())
  );
  const loading = tab === 'all' ? loadingAll : loadingDept;

  return (
    <div style={{ flex: 1 }}>
      <Header title="Announcements" subtitle="Company and department announcements" />
      <div style={{ padding: 28 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 22, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#FFFFFF', borderRadius: 8, padding: 3, border: '1px solid #E5E7EB' }}>
            {(['all', 'dept'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: tab === t ? '#f4b400' : 'transparent', color: tab === t ? '#1f1f1f' : '#9ca3af' }}>
                {t === 'all' ? 'All' : 'My Department'}
              </button>
            ))}
          </div>
          <input
            placeholder="Search announcements…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, minWidth: 200, background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#f4b400'}
            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
          />
        </div>

        {loading ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#9CA3AF' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📢</div>
            <p style={{ fontSize: 14 }}>No announcements found.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 14 }}>
            {items.map((a: any, i: number) => (
              <div key={a.id || i} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '20px 24px', transition: 'border-color 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(244,180,0,0.3)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{a.title || 'Announcement'}</h3>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {a.departmentId && (
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>Dept #{a.departmentId}</span>
                    )}
                    {a.createdAt && (
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    )}
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: 13, color: '#9CA3AF', lineHeight: 1.7 }}>
                  {a.content || a.announcement || 'No content.'}
                </p>
                {a.createdBy && (
                  <p style={{ margin: '10px 0 0', fontSize: 12, color: '#9CA3AF' }}>Posted by: {a.createdBy}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
