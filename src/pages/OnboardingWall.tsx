import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import client from '../api/client';

const STEPS = [
  { label: 'Account Approved', done: true },
  { label: 'Fill Personal Details', done: false },
  { label: 'Register Your Face', done: false },
  { label: 'Face Verification Test', done: false },
];

export default function OnboardingWall() {
  const { user, logout, completeOnboarding } = useAuth();
  const [checking, setChecking] = useState(false);
  const [errMsg, setErrMsg] = useState('');

  const handleRefresh = async () => {
    setChecking(true);
    setErrMsg('');
    try {
      const { data } = await client.get('/onboarding/status');
      if (data?.onboarding_complete) {
        completeOnboarding();
      } else {
        setErrMsg('Onboarding not complete yet. Finish all steps in the mobile app first.');
      }
    } catch {
      setErrMsg('Could not reach server. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F3F4F6',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>

      {/* Card */}
      <div style={{
        background: '#FFFFFF',
        borderRadius: 20,
        padding: '40px 36px',
        maxWidth: 460,
        width: '100%',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        border: '1px solid #E5E7EB',
      }}>

        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 56, height: 56, borderRadius: 16,
            background: '#f4b400', marginBottom: 14,
            fontSize: 24,
          }}>
            ⚡
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: '-0.4px' }}>
            Snap Solutions ERP
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: '#6B7280' }}>
            Welcome, {user?.fullname?.split(' ')[0]}! Your account is ready.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#F3F4F6', margin: '0 0 24px' }} />

        {/* Main message */}
        <div style={{
          background: 'rgba(244,180,0,0.08)',
          border: '1px solid rgba(244,180,0,0.3)',
          borderRadius: 12,
          padding: '16px 18px',
          marginBottom: 24,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 22, flexShrink: 0 }}>📱</span>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#111827' }}>
              Open the Snap Solutions mobile app
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
              Complete your onboarding on the app before accessing the web dashboard.
            </p>
          </div>
        </div>

        {/* Step list */}
        <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1 }}>
          Onboarding Steps
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step.done ? '#16a34a' : '#F3F4F6',
                border: step.done ? 'none' : '1px solid #E5E7EB',
                fontSize: 13, fontWeight: 700,
                color: step.done ? '#fff' : '#9CA3AF',
              }}>
                {step.done ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: 14, color: step.done ? '#111827' : '#6B7280',
                fontWeight: step.done ? 600 : 400,
                textDecoration: step.done ? 'line-through' : 'none',
              }}>
                {step.label}
              </span>
              {!step.done && i === 1 && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontWeight: 700,
                  color: '#f4b400', background: 'rgba(244,180,0,0.1)',
                  padding: '2px 8px', borderRadius: 99,
                }}>
                  Next
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Refresh note */}
        <div style={{
          background: '#F9FAFB', borderRadius: 10, padding: '12px 14px',
          display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24,
        }}>
          <span style={{ fontSize: 16 }}>🔄</span>
          <p style={{ margin: 0, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
            Once you finish in the app, <strong>refresh this page</strong> to access your dashboard.
          </p>
        </div>

        {errMsg && (
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#dc2626', textAlign: 'center' }}>{errMsg}</p>
        )}

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={checking}
          style={{
            width: '100%', padding: '12px', borderRadius: 10,
            background: '#f4b400', color: '#1f1f1f',
            border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            marginBottom: 10, opacity: checking ? 0.7 : 1,
          }}
        >
          {checking ? 'Checking…' : 'Refresh to Check Status'}
        </button>

        {/* Sign out */}
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '10px', borderRadius: 10,
            background: 'transparent', color: '#9CA3AF',
            border: '1px solid #E5E7EB', fontSize: 13, cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </div>

      {/* Footer */}
      <p style={{ marginTop: 20, fontSize: 12, color: '#9CA3AF' }}>
        Snap Solutions ERP · Onboarding Required
      </p>
    </div>
  );
}
