import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllCustomers, createCustomer, updateCustomer } from '../../api/customers';

export default function CustomerManagement() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const { data: customers = [], isLoading } = useQuery({ queryKey: ['customers'], queryFn: getAllCustomers, retry: false });

  const reset = () => { setName(''); setEmail(''); setPhone(''); setAddress(''); setEditing(null); };

  const saveMut = useMutation({
    mutationFn: () => editing
      ? updateCustomer(editing.id, { name, email, phone, address })
      : createCustomer({ name, email, phone, address }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      setMsg(editing ? 'Customer updated!' : 'Customer created!');
      setShowForm(false); reset();
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });

  const openEdit = (c: any) => {
    setEditing(c); setName(c.name || ''); setEmail(c.email || '');
    setPhone(c.phone || ''); setAddress(c.address || ''); setShowForm(true); setMsg('');
  };

  const list = (customers as any[]).filter(c =>
    !search || (c.name || '').toLowerCase().includes(search.toLowerCase()) || (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Customers"
        subtitle="Manage client and customer records"
        action={
          <button onClick={() => { reset(); setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Add Customer
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
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827' }}>{editing ? 'Edit Customer' : 'New Customer'}</h3>
              <button onClick={() => { setShowForm(false); reset(); }} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="Company / Customer name"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@company.com"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 00000 00000"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5 }}>Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="City, State"
                    style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13 }} />
                </div>
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

        <div style={{ marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
            style={{ width: '100%', background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 14px', color: '#111827', fontSize: 13 }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {isLoading ? <p style={{ color: '#6B7280' }}>Loading…</p> : list.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '44px 0', color: '#9CA3AF' }}>
              <p>No customers found.</p>
              <button onClick={() => setShowForm(true)} style={{ marginTop: 12, background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Add Customer</button>
            </div>
          ) : list.map((c: any) => (
            <div key={c.id} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '18px 20px', transition: 'border-color 0.15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(244,180,0,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = '#E5E7EB'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#3b82f6' }}>
                  {(c.name || '?').charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>ID: {c.id}</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6 }}>{c.name}</div>
              {c.email && <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 3 }}>{c.email}</div>}
              {c.phone && <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 3 }}>{c.phone}</div>}
              {c.address && <div style={{ fontSize: 12, color: '#9CA3AF' }}>{c.address}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button onClick={() => openEdit(c)} style={{ flex: 1, padding: '6px', background: 'rgba(244,180,0,0.1)', border: '1px solid rgba(244,180,0,0.2)', borderRadius: 6, color: '#f4b400', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
