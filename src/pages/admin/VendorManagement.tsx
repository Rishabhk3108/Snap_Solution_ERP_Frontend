import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllVendors, createVendor } from '../../api/vendors';

const inputStyle = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, outline: 'none',
};

export default function VendorManagement() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

  const { data: vendors = [], isLoading } = useQuery({ queryKey: ['vendors'], queryFn: getAllVendors, retry: false });

  const createMut = useMutation({
    mutationFn: () => createVendor({ name, email, phone, address }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendors'] });
      setMsg('Vendor created!');
      setShowForm(false); setName(''); setEmail(''); setPhone(''); setAddress('');
    },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });

  const list = (vendors as any[]).filter(v =>
    !search || (v.name || '').toLowerCase().includes(search.toLowerCase()) || (v.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ flex: 1 }}>
      <Header
        title="Vendors"
        subtitle="Manage supplier and vendor records"
        action={
          <button onClick={() => { setShowForm(true); setMsg(''); }}
            style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
            + Add Vendor
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
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>New Vendor</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontSize: 20 }}>×</button>
            </div>
            <form onSubmit={e => { e.preventDefault(); createMut.mutate(); }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Vendor Name *</label>
                  <input value={name} onChange={e => setName(e.target.value)} required placeholder="Vendor / Supplier name" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Email</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="vendor@example.com" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Phone</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 00000 00000" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Address</label>
                  <input value={address} onChange={e => setAddress(e.target.value)} placeholder="City, State" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={createMut.isPending}
                  style={{ background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {createMut.isPending ? 'Creating…' : 'Create Vendor'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 20px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div style={{ marginBottom: 14 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…"
            style={{ width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 8, padding: '9px 14px', color: '#111827', fontSize: 13, outline: 'none' }}
            onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Vendors <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 400 }}>({list.length})</span></span>
          </div>
          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Loading…</p>
          ) : list.length === 0 ? (
            <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No vendors found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                  {['ID', 'Name', 'Email', 'Phone', 'Address'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((v: any, i: number) => (
                  <tr key={v.id} style={{ borderBottom: i < list.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#9CA3AF' }}>{v.id}</td>
                    <td style={{ padding: '11px 16px', fontSize: 13, color: '#111827', fontWeight: 600 }}>{v.name}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{v.email || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{v.phone || '—'}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{v.address || '—'}</td>
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
