import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { getAllHolidays, createHoliday, deleteHoliday } from '../../api/holidays';

const HOLIDAY_TYPES = ['Public', 'Optional', 'Regional', 'Company'];

const inputStyle = {
  width: '100%', background: '#F9FAFB', border: '1px solid #E5E7EB',
  borderRadius: 7, padding: '9px 12px', color: '#111827', fontSize: 13, outline: 'none',
};

export default function HolidayManagement() {
  const qc = useQueryClient();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('Public');
  const [msg, setMsg] = useState('');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const { data: holidays = [], isLoading } = useQuery({
    queryKey: ['holidays'],
    queryFn: getAllHolidays,
    retry: false,
  });

  const createMut = useMutation({
    mutationFn: () => createHoliday({ name, date, type }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['holidays'] }); setMsg('Holiday added!'); setName(''); setDate(''); },
    onError: (e: any) => setMsg(e.response?.data?.message || 'Failed.'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteHoliday,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['holidays'] }),
  });

  const all = holidays as any[];
  const filtered = all.filter(h => new Date(h.date).getFullYear() === filterYear);
  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const TYPE_COLOR: Record<string, string> = { Public: '#16a34a', Optional: '#3b82f6', Regional: '#a855f7', Company: '#f4b400' };

  return (
    <div style={{ flex: 1 }}>
      <Header title="Holiday Management" subtitle="Configure public holidays and company leave calendar" />
      <div style={{ padding: 28 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 20 }}>
          {/* Add form */}
          <div>
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(244,180,0,0.35)', borderRadius: 14, padding: '22px 22px', boxShadow: '0 2px 8px rgba(244,180,0,0.08)' }}>
              <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Add Holiday</h3>
              <form onSubmit={e => { e.preventDefault(); createMut.mutate(); }}>
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Holiday Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Independence Day" style={{ ...inputStyle, marginBottom: 12 }}
                  onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Date *</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ ...inputStyle, marginBottom: 12 }}
                  onFocus={e => e.target.style.borderColor = '#f4b400'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
                <label style={{ display: 'block', fontSize: 12, color: '#6B7280', marginBottom: 5, fontWeight: 500 }}>Type</label>
                <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle, marginBottom: 18 }}>
                  {HOLIDAY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {msg && <div style={{ fontSize: 12, color: msg.includes('!') ? '#16a34a' : '#dc2626', marginBottom: 10 }}>{msg}</div>}
                <button type="submit" disabled={createMut.isPending}
                  style={{ width: '100%', background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  {createMut.isPending ? 'Adding…' : 'Add Holiday'}
                </button>
              </form>
            </div>

            {/* Quick stats */}
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {HOLIDAY_TYPES.map(t => {
                const c = TYPE_COLOR[t] || '#9CA3AF';
                const count = all.filter(h => h.type === t).length;
                return (
                  <div key={t} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, fontSize: 11, color: c, fontWeight: 600 }}>{t}</p>
                    <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 800, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>{count}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Holiday list */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif" }}>Holidays — {filterYear}</span>
              <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
                style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 7, padding: '6px 12px', color: '#374151', fontSize: 13 }}>
                {[new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              {isLoading ? (
                <p style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF' }}>Loading…</p>
              ) : sorted.length === 0 ? (
                <p style={{ padding: '44px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No holidays configured for {filterYear}.</p>
              ) : (
                sorted.map((h: any, i: number) => {
                  const d = new Date(h.date);
                  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                  const c = TYPE_COLOR[h.type] || '#9CA3AF';
                  return (
                    <div key={h.id} style={{ padding: '12px 18px', borderBottom: i < sorted.length - 1 ? '1px solid #F3F4F6' : 'none', display: 'flex', gap: 14, alignItems: 'center' }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = '#F9FAFB'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}>
                      <div style={{ width: 44, height: 44, borderRadius: 8, background: `${c}12`, border: `1px solid ${c}35`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 9, color: c, fontWeight: 700 }}>{MONTHS[d.getMonth()]}</span>
                        <span style={{ fontSize: 17, color: c, fontWeight: 800, lineHeight: 1 }}>{d.getDate()}</span>
                        <span style={{ fontSize: 9, color: c }}>{DAYS[d.getDay()]}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: '#111827', fontWeight: 600 }}>{h.name}</div>
                        <span style={{ fontSize: 11, padding: '1px 7px', borderRadius: 3, background: `${c}12`, color: c, fontWeight: 600, marginTop: 2, display: 'inline-block' }}>{h.type || 'Public'}</span>
                      </div>
                      <button onClick={() => { if (confirm(`Remove "${h.name}"?`)) deleteMut.mutate(h.id); }}
                        style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#dc2626', fontSize: 11, cursor: 'pointer' }}>Remove</button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
