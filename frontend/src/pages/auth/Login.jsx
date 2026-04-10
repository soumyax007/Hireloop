import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const fillDemo = role => {
    const creds = {
      student: { email: 'demo@student.iitd.ac.in', password: 'Student@123' },
      recruiter: { email: 'hr@google.com', password: 'Recruiter@123' },
      admin: { email: 'admin@hireloop.io', password: 'Admin@123' },
    };
    setForm(creds[role]);
  };

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const d = await login(form.email, form.password);
      toast.success(`Welcome back!`);
      const routes = { student: '/student/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' };
      nav(routes[d.user.role] || '/');
    } catch (e) { setError(e.error || 'Login failed. Check your credentials.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      {/* Left panel — hidden on mobile */}
      <div className="auth-left">
        <div style={{ maxWidth: 380, color: '#fff' }}>
          <div style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
              <div className="sb-logo-mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>HireLoop</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 36, fontWeight: 400, lineHeight: 1.2, marginBottom: 16 }}>
              Your campus<br /><em>placement hub.</em>
            </h1>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.65)', lineHeight: 1.6 }}>
              AI-powered resume analysis, mock interviews, and real job opportunities — all in one place.
            </p>
          </div>
          {[
            { icon: '🤖', title: 'AI Resume Scoring', desc: 'Get ATS score & actionable feedback instantly' },
            { icon: '🎯', title: 'Smart Job Match', desc: 'Personalized recommendations based on your profile' },
            { icon: '💬', title: 'Mock Interviews', desc: 'Practice with AI, get graded feedback per answer' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
              <div style={{ fontSize: 22, marginTop: 2 }}>{f.icon}</div>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 2 }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)' }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          {/* Mobile logo */}
          <div className="auth-logo">
            <div className="auth-logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontWeight: 700, fontSize: 17 }}>HireLoop</span>
          </div>

          <h2 className="auth-title">Sign in</h2>
          <p className="auth-sub">Welcome back. Enter your credentials to continue.</p>

          {/* Demo quick-fill */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
            {['student','recruiter','admin'].map(r => (
              <button key={r} type="button" onClick={() => fillDemo(r)} className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: 12, textTransform: 'capitalize' }}>
                Demo {r}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="label">Email address</label>
              <div className="input-with-icon">
                <Mail size={15} className="input-icon" />
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} autoComplete="email" />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input className="input" type={show ? 'text' : 'password'} placeholder="Enter password" value={form.password} onChange={set('password')} style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: 'var(--text-3)', cursor: 'pointer' }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Signing in…</> : <><span>Sign In</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="auth-divider"><span>New to HireLoop?</span></div>
          <Link to="/register" className="btn btn-secondary btn-full" style={{ textAlign: 'center' }}>Create an account</Link>
        </div>
      </div>
    </div>
  );
}
