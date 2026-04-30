import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, GraduationCap, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// ── SAU Logo SVG (octagonal pattern, matches real SAU logo) ──
const SAULogo = ({ color = '#fff', size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 8 L62 8 L78 22 L78 46 L62 62 L38 62 L22 46 L22 22 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M54 38 L78 38 L92 52 L92 76 L78 90 L54 90 L38 76 L38 52 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M22 38 L46 38 L62 52 L62 76 L46 90 L22 90 L8 76 L8 52 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M38 38 L62 38 L62 62 L38 62 Z" stroke={color} strokeWidth="3" fill={color === '#fff' ? 'rgba(255,255,255,0.15)' : 'rgba(30,58,95,0.1)'} strokeLinejoin="round"/>
  </svg>
);

const ROLES = [
  { key: 'student',   label: 'Student',   icon: GraduationCap, color: '#1e3a5f' },
  { key: 'recruiter', label: 'Recruiter', icon: Briefcase,      color: '#1e3a5f' },
  { key: 'admin',     label: 'Admin',     icon: ShieldCheck,    color: '#1e3a5f' },
];

const SAU_DOMAINS = ['sau.ac.in', 'sau.int', 'sa.ac.in'];
const isSAUEmail = email => {
  const domain = email.split('@')[1]?.toLowerCase();
  return SAU_DOMAINS.includes(domain);
};

const DEMO = {
  student:   { email: 'student@sau.int',      password: 'Student@123' },
  recruiter: { email: 'recruiter@sau.ac.in',   password: 'Recruiter@123' },
  admin:     { email: 'soumya@sau.ac.in',      password: 'Admin@SAU#2025' },
};

const FEATURES = [
  { icon: '◎', title: 'AI Resume Scoring', desc: 'Instant ATS analysis with actionable improvements' },
  { icon: '◈', title: 'Smart Job Matching', desc: 'Personalised roles based on your skills and goals' },
  { icon: '✦', title: 'Mock Interviews', desc: 'AI-graded practice with per-answer feedback' },
];

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function loadGoogleSDK() {
  return new Promise((resolve) => {
    if (window.google?.accounts) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

export default function Login() {
  const { login, setAuthData } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    loadGoogleSDK().then(() => setGoogleReady(true));
  }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const fillDemo = () => { setForm(DEMO[role]); setError(''); };
  const handleRoleChange = r => { setRole(r); setForm({ email: '', password: '' }); setError(''); };
  const ROUTES = { student: '/student/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' };

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    if (!isSAUEmail(form.email)) {
      setError('Only South Asian University email addresses are allowed (@sau.ac.in or @sau.int).');
      return;
    }
    setLoading(true); setError('');
    try {
      const d = await login(form.email, form.password);
      toast.success('Welcome back!');
      nav(ROUTES[d.user.role] || '/');
    } catch (e) { setError(e.error || 'Incorrect email or password.'); }
    finally { setLoading(false); }
  };

  const handleGoogle = useCallback(() => {
    if (!googleReady || !GOOGLE_CLIENT_ID) {
      toast.error('Google sign-in is not configured. Add VITE_GOOGLE_CLIENT_ID to your Vercel env vars.');
      return;
    }
    setGLoading(true); setError('');
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const data = await api.post('/auth/google', { token: response.credential, role });
          localStorage.setItem('hl_token', data.token);
          localStorage.setItem('hl_user', JSON.stringify(data.user));
          if (setAuthData) setAuthData(data);
          toast.success('Signed in with Google!');
          nav(ROUTES[data.user.role] || '/');
        } catch (e) { setError(e.error || 'Google sign-in failed.'); }
        finally { setGLoading(false); }
      },
      error_callback: () => { setGLoading(false); setError('Google sign-in was cancelled.'); },
    });
    window.google.accounts.id.prompt((n) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) setGLoading(false);
    });
  }, [googleReady, role, nav, setAuthData]);

  const activeRole = ROLES.find(r => r.key === role);

  return (
    <div className="hl-auth-root">
      {/* Left Panel */}
      <div className="hl-auth-left">
        <div className={`hl-auth-left-inner${mounted ? ' hl-visible' : ''}`}>
          {/* SAU Brand */}
          <div className="hl-auth-brand">
            <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,.12)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,.2)', flexShrink: 0 }}>
              <SAULogo color="#fff" size={32} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', lineHeight: 1.1 }}>HireLoop</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>South Asian University</div>
            </div>
          </div>
          <div className="hl-auth-headline">
            <h1>Your campus<br /><em>placement hub.</em></h1>
            <p>AI-powered tools to help you land your dream role — resume scoring, mock interviews, and real opportunities from top companies.</p>
          </div>
          <div className="hl-auth-features">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="hl-auth-feature" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <div className="hl-auth-feature-icon">{f.icon}</div>
                <div>
                  <div className="hl-auth-feature-title">{f.title}</div>
                  <div className="hl-auth-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="hl-auth-deco" aria-hidden>
            <div className="hl-deco-ring hl-deco-ring-1" />
            <div className="hl-deco-ring hl-deco-ring-2" />
            <div className="hl-deco-ring hl-deco-ring-3" />
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hl-auth-right">
        <div className={`hl-auth-card${mounted ? ' hl-visible' : ''}`}>
          {/* Mobile header */}
          <div className="hl-auth-mobile-logo">
            <div style={{ width: 32, height: 32, background: '#1e3a5f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SAULogo color="#fff" size={20} />
            </div>
            <span>HireLoop · SAU</span>
          </div>

          {/* SAU badge */}
          <div className="hl-sau-badge">
            <SAULogo color="#1e3a5f" size={18} />
            <div>
              <div className="hl-sau-badge-text">South Asian University</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>Official Placement Portal</div>
            </div>
          </div>

          <h2 className="hl-auth-title">Sign in</h2>
          <p className="hl-auth-sub">Welcome back. Select your role to continue.</p>

          {/* Role Tabs */}
          <div className="hl-role-tabs">
            {ROLES.map(r => (
              <button key={r.key} type="button"
                className={`hl-role-tab${role === r.key ? ' active' : ''}`}
                style={role === r.key ? { '--tab-color': r.color } : {}}
                onClick={() => handleRoleChange(r.key)}>
                <r.icon size={13} />{r.label}
              </button>
            ))}
          </div>

          {error && <div className="hl-auth-error">{error}</div>}

          <form onSubmit={submit} className="hl-auth-form">
            <div className="hl-form-group">
              <label className="hl-label">Email address</label>
              <div className="hl-input-wrap">
                <Mail size={14} className="hl-input-icon" />
                <input className="hl-input" type="email" placeholder="you@sau.ac.in" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
            </div>
            <div className="hl-form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label className="hl-label" style={{ margin: 0 }}>Password</label>
                <Link to="/forgot-password" className="hl-forgot">Forgot password?</Link>
              </div>
              <div className="hl-input-wrap">
                <Lock size={14} className="hl-input-icon" />
                <input className="hl-input" type={show ? 'text' : 'password'} placeholder="Enter your password"
                  value={form.password} onChange={set('password')} style={{ paddingRight: 42 }} />
                <button type="button" className="hl-eye-btn" onClick={() => setShow(s => !s)}>
                  {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button type="submit" className="hl-btn-primary" disabled={loading}>
              {loading ? <><div className="hl-spinner" /> Signing in…</> : <><span>Sign In</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <button type="button" className="hl-demo-btn" onClick={fillDemo}>
            Fill demo {activeRole?.label.toLowerCase()} credentials
          </button>

          <div className="hl-divider"><span>or continue with</span></div>

          <button type="button" className="hl-google-btn" onClick={handleGoogle} disabled={gLoading}>
            {gLoading
              ? <div className="hl-spinner" style={{ borderTopColor: '#4285F4', borderColor: '#e0e0e0' }} />
              : <svg width="17" height="17" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            }
            {gLoading ? 'Signing in…' : 'Continue with Google'}
          </button>

          <p className="hl-auth-footer">
            New to HireLoop? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
