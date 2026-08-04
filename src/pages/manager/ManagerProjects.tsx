import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getMyProjects } from '../../api/projects';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_COLOR: Record<string, string> = {
  Active: '#22c55e', Completed: '#3b82f6', 'On Hold': '#f59e0b', Cancelled: '#ef4444',
};

export default function ManagerProjects() {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['my-projects'], queryFn: getMyProjects, retry: false,
  });

  const list = projects as any[];
  const selected = list.find(p => p.id === selectedId) || null;
  const team = ((selected?.employees || []) as any[]).filter(e => e.id !== user?.id);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <Header title="Projects" subtitle="Projects assigned to you and their teams" />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: project list */}
        <div style={{ flex: 1, padding: 28, overflowY: 'auto' }}>
          {isLoading ? (
            <p style={{ color: '#6B7280', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '44px 0', color: '#9CA3AF' }}>
              No projects assigned to you yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
              {list.map((p: any) => {
                const sc = STATUS_COLOR[p.status] || '#9ca3af';
                const isSelected = selectedId === p.id;
                const teamCount = ((p.employees || []) as any[]).filter(e => e.id !== user?.id).length;
                return (
                  <div key={p.id}
                    onClick={() => setSelectedId(p.id)}
                    style={{
                      background: '#FFFFFF', border: `1px solid ${isSelected ? '#f4b400' : '#E5E7EB'}`,
                      borderRadius: 12, padding: '18px 20px', cursor: 'pointer',
                      transition: 'border-color 0.15s', boxShadow: isSelected ? '0 0 0 2px rgba(244,180,0,0.15)' : 'none',
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', flex: 1, paddingRight: 8 }}>{p.name}</div>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${sc}18`, color: sc, fontWeight: 600, flexShrink: 0 }}>{p.status || 'Active'}</span>
                    </div>
                    {p.description && (
                      <p style={{ fontSize: 12, color: '#6B7280', margin: '0 0 8px', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{p.description}</p>
                    )}
                    <div style={{ fontSize: 11, color: '#6B7280' }}>
                      Team members: <strong style={{ color: '#111827' }}>{teamCount}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: team roster for selected project */}
        {selected && (
          <div style={{ width: 380, borderLeft: '1px solid #E5E7EB', background: '#FAFAFA', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <div style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.name}</h3>
              <button onClick={() => setSelectedId(null)}
                style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                Team ({team.length})
              </div>

              {team.length === 0 ? (
                <p style={{ color: '#9CA3AF', fontSize: 13 }}>No employees assigned to this project yet.</p>
              ) : team.map((e: any) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 2 }}>ID: {e.id}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{e.fullName}</div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{e.jobTitle || '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
