import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { sendMessage, getMyMessages } from '../../api/messages';
import { getActiveUsers } from '../../api/users';

export default function Messages() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const [selected, setSelected] = useState<any | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [msg, setMsg] = useState('');

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: () => getMyMessages(user!.id),
    enabled: !!user?.id, retry: false,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users', 'active'],
    queryFn: getActiveUsers,
    retry: false,
  });

  const sendMut = useMutation({
    mutationFn: () => sendMessage({ senderId: user!.id, receiverId: Number(to), content, subject }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages'] });
      setMsg('Message sent!');
      setShowCompose(false);
      setTo(''); setSubject(''); setContent('');
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed to send message.'),
  });

  const inbox = messages as any[];

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Messages"
        subtitle="Your inbox and sent messages"
        action={
          <button onClick={() => { setShowCompose(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Compose
          </button>
        }
      />
      <div style={{ padding: 28 }}>

        {msg && (
          <div style={{ background: msg.includes('sent') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${msg.includes('sent') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 8, padding: '10px 16px', color: msg.includes('sent') ? '#22c55e' : '#ef4444', fontSize: 13, marginBottom: 16 }}>
            {msg}
          </div>
        )}

        {/* Compose form */}
        {showCompose && (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.3)', borderRadius: 12, padding: '22px 24px', marginBottom: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>New Message</h3>
              <button onClick={() => setShowCompose(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); sendMut.mutate(); }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9CA3AF', marginBottom: 5 }}>To *</label>
                <select value={to} onChange={e => setTo(e.target.value)} required
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }}>
                  <option value="">Select recipient…</option>
                  {(users as any[]).filter(u => u.id !== user?.id).map(u => (
                    <option key={u.id} value={u.id}>{u.fullname} ({u.role?.replace('ROLE_', '')})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9CA3AF', marginBottom: 5 }}>Subject</label>
                <input value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Message subject…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#9CA3AF', marginBottom: 5 }}>Message *</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} required rows={4}
                  placeholder="Write your message…"
                  style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={sendMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {sendMut.isPending ? 'Sending…' : 'Send Message'}
                </button>
                <button type="button" onClick={() => setShowCompose(false)}
                  style={{ background: '#E5E7EB', color: '#9CA3AF', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1.4fr' : '1fr', gap: 20 }}>
          {/* Inbox list */}
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                Inbox <span style={{ color: '#9CA3AF', fontWeight: 400 }}>({inbox.length})</span>
              </span>
            </div>
            {isLoading ? (
              <p style={{ padding: '28px', textAlign: 'center', color: '#9CA3AF' }}>Loading…</p>
            ) : inbox.length === 0 ? (
              <div style={{ padding: '44px 18px', textAlign: 'center', color: '#9CA3AF' }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>✉️</div>
                <p style={{ fontSize: 13 }}>No messages yet.</p>
              </div>
            ) : (
              inbox.map((m: any, i: number) => (
                <div key={m.id || i}
                  onClick={() => setSelected(m === selected ? null : m)}
                  style={{ padding: '13px 18px', borderBottom: i < inbox.length - 1 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', background: selected?.id === m.id ? 'rgba(244,180,0,0.07)' : 'transparent', borderLeft: selected?.id === m.id ? '2px solid #f4b400' : '2px solid transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{m.sender?.fullname || `User #${m.senderId}`}</span>
                    {m.createdAt && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{new Date(m.createdAt).toLocaleDateString()}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#f4b400', marginBottom: 2 }}>{m.subject || '(No subject)'}</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.content}</div>
                </div>
              ))
            )}
          </div>

          {/* Message detail */}
          {selected && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '22px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{selected.subject || '(No subject)'}</h3>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: 16, marginBottom: 16, fontSize: 12, color: '#9CA3AF' }}>
                <span>From: <span style={{ color: '#111827' }}>{selected.sender?.fullname || `User #${selected.senderId}`}</span></span>
                {selected.createdAt && <span>{new Date(selected.createdAt).toLocaleString()}</span>}
              </div>
              <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '16px 18px', fontSize: 14, color: '#111827', lineHeight: 1.7 }}>
                {selected.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
