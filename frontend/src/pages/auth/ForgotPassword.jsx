import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../utils/api';

const SAULogo = () => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <g transform="translate(10,8) scale(0.85)">
      <path d="M50 15 L70 15 L85 30 L85 50 L70 65 L50 65 L35 50 L35 30 Z" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinejoin="round"/>
      <path d="M65 50 L85 50 L100 65 L100 85 L85 100 L65 100 L50 85 L50 65 Z" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinejoin="round"/>
      <path d="M35 50 L50 65 L50 85 L35 100 L15 100 L0 85 L0 65 L15 50 Z" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinejoin="round"/>
      <path d="M50 15 L65 30 L65 50 L50 65 L35 50 L35 30 Z" stroke="#fff" strokeWidth="2" fill="rgba(255,255,255,0.1)" strokeLinejoin="round"/>
    </g>
  </svg>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSent(true);
      if (res.resetUrl) setResetUrl(res.resetUrl); // demo only
    } catch (e) { setError(e.error || 'Something went wrong'); }
    finally { setLoading(false); }
  };

  return (
    <div className="hl-auth-root">
      <div className="hl-auth-left">
        <div className="hl-auth-left-inner hl-visible">
          <div className="hl-auth-brand">
            <div className="hl-auth-logomark" style={{ width: 44, height: 44, background: 'rgba(255,255,255,.15)', padding: 6 }}>
              <SAULogo />
            </div>
            <div>
              <div className="hl-auth-brandname">HireLoop</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)', letterSpacing: '.06em' }}>SOUTH ASIAN UNIVERSITY</div>
            </div>
          </div>
          <div className="hl-auth-headline">
            <h1>Reset your<br /><em>password.</em></h1>
            <p>Enter your registered email address and we will send you a password reset link.</p>
          </div>
          <div className="hl-auth-deco" aria-hidden>
            <div className="hl-deco-ring hl-deco-ring-1" />
            <div className="hl-deco-ring hl-deco-ring-2" />
          </div>
        </div>
      </div>

      <div className="hl-auth-right">
        <div className="hl-auth-card hl-visible">
          <div className="hl-auth-mobile-logo">
            <div className="hl-auth-logomark" style={{ width: 34, height: 34, borderRadius: 8, padding: 4 }}><SAULogo /></div>
            <span>HireLoop · SAU</span>
          </div>

          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--text-2)', fontWeight: 500, marginBottom: 20 }}>
            <ArrowLeft size={14} /> Back to login
          </Link>

          {!sent ? (
            <>
              <h2 className="hl-auth-title">Forgot password?</h2>
              <p className="hl-auth-sub">Enter your SAU email and we'll send a reset link.</p>

              {error && <div className="hl-auth-error">{error}</div>}

              <form onSubmit={submit} className="hl-auth-form">
                <div className="hl-form-group">
                  <label className="hl-label">Email address</label>
                  <div className="hl-input-wrap">
                    <Mail size={14} className="hl-input-icon" />
                    <input className="hl-input" type="email" placeholder="you@sau.ac.in" value={email} onChange={e => setEmail(e.target.value)} autoFocus />
                  </div>
                </div>
                <button type="submit" className="hl-btn-primary" disabled={loading}>
                  {loading ? <><div className="hl-spinner" /> Sending…</> : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 56, height: 56, background: 'var(--green-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={28} color="var(--green)" />
              </div>
              <h2 className="hl-auth-title">Check your email</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 20 }}>
                If <strong>{email}</strong> is registered, you will receive a password reset link shortly.
              </p>
              {resetUrl && (
                <div style={{ background: 'var(--accent-bg)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, textAlign: 'left' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.04em' }}>Demo Mode — Reset Link:</div>
                  <a href={resetUrl} style={{ fontSize: 12, color: 'var(--accent)', wordBreak: 'break-all' }}>{resetUrl}</a>
                </div>
              )}
              <Link to="/login" className="hl-btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
