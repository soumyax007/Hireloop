import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

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

export default function ResetPassword() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [form, setForm] = useState({ newPassword: '', confirm: '' });
  const [show, setShow] = useState({ new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !email) setError('Invalid reset link. Please request a new one.');
  }, [token, email]);

  const submit = async e => {
    e.preventDefault();
    if (!form.newPassword || form.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.newPassword !== form.confirm) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password', { email, token, newPassword: form.newPassword });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => nav('/login'), 2500);
    } catch (e) { setError(e.error || 'Failed to reset password'); }
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
            <h1>Create a new<br /><em>password.</em></h1>
            <p>Choose a strong password that you haven't used before.</p>
          </div>
        </div>
      </div>

      <div className="hl-auth-right">
        <div className="hl-auth-card hl-visible">
          {!done ? (
            <>
              <h2 className="hl-auth-title">Set new password</h2>
              <p className="hl-auth-sub" style={{ marginBottom: 20 }}>For <strong>{email}</strong></p>

              {error && <div className="hl-auth-error" style={{ marginBottom: 16 }}>{error}</div>}

              <form onSubmit={submit} className="hl-auth-form">
                <div className="hl-form-group">
                  <label className="hl-label">New Password</label>
                  <div className="hl-input-wrap">
                    <Lock size={14} className="hl-input-icon" />
                    <input className="hl-input" type={show.new ? 'text' : 'password'} placeholder="Min 6 characters"
                      value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))} style={{ paddingRight: 42 }} autoFocus />
                    <button type="button" className="hl-eye-btn" onClick={() => setShow(s => ({ ...s, new: !s.new }))}>
                      {show.new ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div className="hl-form-group">
                  <label className="hl-label">Confirm Password</label>
                  <div className="hl-input-wrap">
                    <Lock size={14} className="hl-input-icon" />
                    <input className="hl-input" type={show.confirm ? 'text' : 'password'} placeholder="Repeat password"
                      value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} style={{ paddingRight: 42 }} />
                    <button type="button" className="hl-eye-btn" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))}>
                      {show.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                {form.newPassword && form.confirm && form.newPassword !== form.confirm && (
                  <div style={{ fontSize: 12, color: 'var(--red)', marginTop: -8 }}>Passwords do not match</div>
                )}
                <button type="submit" className="hl-btn-primary" disabled={loading || !token}>
                  {loading ? <><div className="hl-spinner" /> Resetting…</> : 'Reset Password'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div style={{ width: 56, height: 56, background: 'var(--green-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle size={28} color="var(--green)" />
              </div>
              <h2 className="hl-auth-title">Password reset!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Redirecting you to login…</p>
              <Link to="/login" className="hl-btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
