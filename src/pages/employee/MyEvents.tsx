import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { createEvent, getMyEvents, updateEvent, deleteEvent } from '../../api/personalEvents';

const EVENT_TYPES = ['Personal', 'Meeting', 'Birthday', 'Anniversary', 'Holiday', 'Other'];
const TYPE_COLORS: Record<string, string> = {
  Personal: '#f4b400', Meeting: '#3b82f6', Birthday: '#ec4899',
  Anniversary: '#a855f7', Holiday: '#22c55e', Other: '#9ca3af',
};

export default function MyEvents() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Personal');
  const [description, setDescription] = useState('');
  const [msg, setMsg] = useState('');
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['my-events', user?.id],
    queryFn: () => getMyEvents(user!.id),
    enabled: !!user?.id, retry: false,
  });

  const resetForm = () => { setTitle(''); setDate(''); setType('Personal'); setDescription(''); setEditing(null); };

  const saveMut = useMutation({
    mutationFn: () => editing
      ? updateEvent(editing.id, { title, date, type, description })
      : createEvent({ userId: user!.id, title, date, type, description }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-events'] });
      setMsg(editing ? 'Event updated!' : 'Event created!');
      setShowForm(false); resetForm();
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed to save event.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-events'] }),
  });

  const openEdit = (ev: any) => {
    setEditing(ev); setTitle(ev.title || ''); setDate(ev.date || '');
    setType(ev.type || 'Personal'); setDescription(ev.description || '');
    setShowForm(true); setMsg('');
  };

  const allEvents = events as any[];
  const upcomingEvents = allEvents
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const pastEvents = allEvents
    .filter(e => new Date(e.date) < new Date())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthEvents = allEvents.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="My Events"
        subtitle="Manage your personal calendar events"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Add Event
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        {msg && (
          <div style={{ background: msg.includes('!') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('!') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('!') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16 }}>
            {msg}
          </div>
        )}

        {/* Event form */}
        {showForm && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.3)', borderRadius: 12, padding: '22px 24px', marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{editing ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={() => { setShowForm(false); resetForm(); }} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div style={{ gridColumn: '1 / 3' }}>
                  <label style={{ display: 'block', fontSize: 12, color: '#9CA3AF', marginBottom: 5 }}>Event Title *</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Team meeting"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9CA3AF', marginBottom: 5 }}>Type</label>
                  <select value={type} onChange={e => setType(e.target.value)}
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                    {EVENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#9CA3AF', marginBottom: 5 }}>Date *</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9CA3AF', marginBottom: 5 }}>Notes (optional)</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2}
                  placeholder="Any notes about this event…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saveMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {saveMut.isPending ? 'Saving…' : editing ? 'Update Event' : 'Create Event'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); resetForm(); }}
                  style={{ background: '#E5E7EB', color: '#9CA3AF', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <p style={{ color: '#9CA3AF', textAlign: 'center', padding: '40px 0' }}>Loading…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Upcoming */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Upcoming <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({upcomingEvents.length})</span></span>
              </div>
              {upcomingEvents.length === 0 ? (
                <p style={{ padding: '28px 18px', color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>No upcoming events.</p>
              ) : (
                upcomingEvents.map((ev: any, i: number) => {
                  const color = TYPE_COLORS[ev.type] || TYPE_COLORS.Other;
                  const d = new Date(ev.date);
                  return (
                    <div key={ev.id || i} style={{ padding: '12px 18px', borderBottom: i < upcomingEvents.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 10, color, fontWeight: 700, lineHeight: 1 }}>{MONTHS[d.getMonth()]}</span>
                        <span style={{ fontSize: 16, color, fontWeight: 800, lineHeight: 1 }}>{d.getDate()}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{ev.title}</div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                          <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 3, background: `${color}18`, color }}>{ev.type || 'Personal'}</span>
                          {ev.description && <span style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.description}</span>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => openEdit(ev)} style={{ padding: '4px 8px', background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 5, color: '#f4b400', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => { if (confirm('Delete event?')) deleteMut.mutate(ev.id); }} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>×</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Past */}
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>Browse by Month</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={viewMonth} onChange={e => setViewMonth(Number(e.target.value))}
                    style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', color: '#111827', fontSize: 12 }}>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select value={viewYear} onChange={e => setViewYear(Number(e.target.value))}
                    style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', color: '#111827', fontSize: 12 }}>
                    {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              {monthEvents.length === 0 ? (
                <p style={{ padding: '28px 18px', color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>No events in {MONTHS[viewMonth]} {viewYear}.</p>
              ) : (
                monthEvents.map((ev: any, i: number) => {
                  const color = TYPE_COLORS[ev.type] || TYPE_COLORS.Other;
                  return (
                    <div key={ev.id || i} style={{ padding: '11px 18px', borderBottom: i < monthEvents.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, color: '#111827', fontWeight: 500 }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{ev.date} · <span style={{ color }}>{ev.type || 'Personal'}</span></div>
                      </div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => openEdit(ev)} style={{ padding: '4px 8px', background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 5, color: '#f4b400', fontSize: 11, cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => { if (confirm('Delete event?')) deleteMut.mutate(ev.id); }} style={{ padding: '4px 8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, color: '#ef4444', fontSize: 11, cursor: 'pointer' }}>×</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Past events list */}
            {pastEvents.length > 0 && (
              <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', gridColumn: '1 / -1' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#9CA3AF' }}>Past Events</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {pastEvents.slice(0, 6).map((ev: any, i: number) => {
                    const color = TYPE_COLORS[ev.type] || TYPE_COLORS.Other;
                    return (
                      <div key={ev.id || i} style={{ padding: '12px 18px', borderBottom: i < 3 ? '1px solid #F3F4F6' : 'none', borderRight: i % 3 < 2 ? '1px solid #F3F4F6' : 'none', opacity: 0.7 }}>
                        <div style={{ fontSize: 12, color: '#111827', fontWeight: 500 }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{ev.date} · <span style={{ color }}>{ev.type || 'Personal'}</span></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
