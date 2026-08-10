import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { login as apiLogin } from '../api/auth';
import client from '../api/client';

type Tab = 'login' | 'register';

export default function Login() {
  const [tab, setTab] = useState<Tab>('login');

  // Login state with all the details
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Register state
  const [regFullname, setRegFullname] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const data = await apiLogin(username, password);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setLoginError(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    if (regPassword && regPassword !== regConfirm) {
      setRegError('Passwords do not match.');
      return;
    }
    setRegLoading(true);
    try {
      const { data } = await client.post('/register', {
        username: regFullname.toLowerCase().replace(/\s+/g, '.'),
        password: regPassword || undefined,
        fullname: regFullname,
      });
      setRegSuccess(
        `Account created! Your login username is: ${data.username ?? data.id}. ` +
        `An admin must activate your account before you can sign in.`
      );
      setRegFullname('');
      setRegPassword('');
      setRegConfirm('');
    } catch (err: any) {
      setRegError(err.response?.data?.message || err.response?.data?.error || 'Registration failed.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#1f1f1f', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <svg width="68" height="68" viewBox="0 0 72 72" fill="none" style={{ display: 'block', margin: '0 auto 14px' }}>
            <circle cx="36" cy="36" r="36" fill="#2a2a2a" />
            <circle cx="36" cy="36" r="22" fill="none" stroke="#f4b400" strokeWidth="5" />
            <rect x="33.5" y="20" width="5" height="18" rx="2" fill="#f4b400" transform="rotate(12 36 29)" />
          </svg>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#f4b400', letterSpacing: 4 }}>SNAP</div>
          <div style={{ fontSize: 10, color: '#9ca3af', letterSpacing: 4, marginTop: 3, textTransform: 'uppercase' }}>ERP · Delivering Perfection</div>
        </div>

        {/* Card */}
        <div style={{ background: '#2a2a2a', borderRadius: 16, border: '1px solid #383838', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #383838' }}>
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setLoginError(''); setRegError(''); setRegSuccess(''); }}
                style={{
                  flex: 1, padding: '14px 0', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  background: tab === t ? '#2a2a2a' : '#222',
                  color: tab === t ? '#f4b400' : '#6b7280',
                  borderBottom: tab === t ? '2px solid #f4b400' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <div style={{ padding: 28 }}>
            {tab === 'login' ? (
              <>
                <p style={{ margin: '0 0 24px', color: '#9ca3af', fontSize: 13 }}>
                  Enter your credentials to access the ERP system.
                </p>

                {loginError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, color: '#ef4444', fontSize: 13 }}>
                    {loginError}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <Field label="Username" value={username} onChange={setUsername} autoFocus />
                  <Field label="Password" value={password} onChange={setPassword} type="password" />
                  <SubmitBtn loading={loginLoading} label="Sign In" loadingLabel="Signing in…" />
                </form>

                <p style={{ marginTop: 20, fontSize: 12, color: '#6b7280', textAlign: 'center', lineHeight: 1.6 }}>
                  Your username is your numeric employee ID.<br />
                  Contact your admin if you don't know it.
                </p>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 24px', color: '#9ca3af', fontSize: 13 }}>
                  Create a new account. An admin must activate it before you can sign in.
                </p>

                {regError && (
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, color: '#ef4444', fontSize: 13 }}>
                    {regError}
                  </div>
                )}

                {regSuccess && (
                  <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: '12px 14px', marginBottom: 18, color: '#22c55e', fontSize: 13, lineHeight: 1.6 }}>
                    ✓ {regSuccess}
                  </div>
                )}

                {!regSuccess && (
                  <form onSubmit={handleRegister}>
                    <Field label="Full Name" value={regFullname} onChange={setRegFullname} required autoFocus />
                    <Field label="Password" value={regPassword} onChange={setRegPassword} type="password" />
                    <Field label="Confirm Password" value={regConfirm} onChange={setRegConfirm} type="password" />
                    <SubmitBtn loading={regLoading} label="Create Account" loadingLabel="Creating…" />
                  </form>
                )}

                {regSuccess && (
                  <button
                    onClick={() => { setTab('login'); setRegSuccess(''); }}
                    style={{ width: '100%', background: '#f4b400', color: '#1f1f1f', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
                  >
                    Go to Sign In
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#4b5563', fontSize: 12, marginTop: 20 }}>
          Snap Solutions © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required, autoFocus }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; autoFocus?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', color: '#9ca3af', fontSize: 13, marginBottom: 6, fontWeight: 500 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        autoFocus={autoFocus}
        style={{
          width: '100%', background: '#1f1f1f', border: '1px solid #383838', borderRadius: 8,
          padding: '10px 14px', color: '#e5e7eb', fontSize: 14, outline: 'none',
        }}
        onFocus={e => e.target.style.borderColor = '#f4b400'}
        onBlur={e => e.target.style.borderColor = '#383838'}
      />
    </div>
  );
}

function SubmitBtn({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%', background: loading ? '#555' : '#f4b400', color: loading ? '#999' : '#1f1f1f',
        border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 15, fontWeight: 700,
        cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8, transition: 'background 0.15s',
      }}
    >
      {loading ? loadingLabel : label}
    </button>
  );
}
