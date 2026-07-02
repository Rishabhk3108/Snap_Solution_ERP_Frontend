import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '../../components/Layout/Header';
import { useAuth } from '../../contexts/AuthContext';
import { getAttendanceList, getDaysWorked } from '../../api/attendance';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function MyAttendance() {
  const { user } = useAuth();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: attList = [], isLoading } = useQuery({
    queryKey: ['att-list', user?.id, year, month],
    queryFn: () => getAttendanceList(user!.id, year, month),
    enabled: !!user?.id, retry: false,
  });
  const { data: daysWorked } = useQuery({
    queryKey: ['daysWorked', user?.id, year, month],
    queryFn: () => getDaysWorked(user!.id, year, month),
    enabled: !!user?.id, retry: false,
  });

  const records = attList as any[];
  const daysCount = typeof daysWorked === 'object' ? (daysWorked as any)?.daysWorked ?? 0 : daysWorked ?? 0;
  const totalHours = records.reduce((s, r) => s + (r.numberOfHours ?? r.number_of_hours ?? 0), 0);
  const totalOT = records.reduce((s, r) => s + (r.OtHours ?? r.ot_hours ?? 0), 0);

  return (
    <div style={{ flex: 1 }}>
      <Header title="My Attendance" subtitle="View your monthly attendance record" />
      <div style={{ padding: 28 }}>

        {/* Month selector */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 22, flexWrap: 'wrap' }}>
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }}>
            {[now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select value={month} onChange={e => setMonth(Number(e.target.value))}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 8, padding: '8px 14px', color: '#111827', fontSize: 13 }}>
            {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
          </select>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Days Worked', value: daysCount, color: '#f4b400' },
            { label: 'Total Records', value: records.length, color: '#111827' },
            { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, color: '#16a34a' },
            { label: 'Overtime Hours', value: `${totalOT}h`, color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 10, padding: '16px 18px' }}>
              <p style={{ margin: 0, fontSize: 11, color: '#6B7280', fontWeight: 500 }}>{label}</p>
              <p style={{ margin: '5px 0 0', fontSize: 24, fontWeight: 800, color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Attendance table */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>
              {MONTHS[month - 1]} {year}
              <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 400, marginLeft: 8 }}>— {records.length} records</span>
            </span>
          </div>

          {isLoading ? (
            <p style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>Loading…</p>
          ) : records.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: 14 }}>No attendance records for {MONTHS[month - 1]} {year}.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                    {['Date', 'Check In', 'Check Out', 'Hours', 'Overtime', 'Location', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((a: any, i: number) => (
                    <tr key={a.id || i} style={{ borderBottom: i < records.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: '#111827', fontWeight: 500 }}>{a.date}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: '#6B7280' }}>{(a.startTime ?? a.start_time)?.slice(0, 5) || '—'}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: (a.endTime ?? a.end_time) ? '#9ca3af' : '#f59e0b' }}>{(a.endTime ?? a.end_time)?.slice(0, 5) || 'Ongoing'}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: '#16a34a', fontWeight: 600 }}>
                        {(a.numberOfHours ?? a.number_of_hours) != null ? `${a.numberOfHours ?? a.number_of_hours}h` : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: ((a.OtHours ?? a.ot_hours) ?? 0) > 0 ? '#f4b400' : '#6b7280' }}>
                        {((a.OtHours ?? a.ot_hours) ?? 0) > 0 ? `+${a.OtHours ?? a.ot_hours}h` : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: '#6B7280' }}>{a.location || '—'}</td>
                      <td style={{ padding: '11px 16px' }}>
                        {(a.endTime ?? a.end_time)
                          ? <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>Complete</span>
                          : <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>Ongoing</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
