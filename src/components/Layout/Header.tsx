import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  const { user } = useAuth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header style={{
      height: 68, background: '#FFFFFF', borderBottom: '1px solid #E5E7EB',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#111827', fontFamily: "'Archivo', sans-serif", letterSpacing: '-0.01em' }}>{title}</h1>
        {subtitle && <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF', marginTop: 2, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {action}
        <span style={{ fontSize: 12, color: '#6B7280', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{dateStr}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', background: 'rgba(244,180,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#f4b400',
            fontFamily: "'Archivo', sans-serif",
          }}>
            {user?.fullname?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
