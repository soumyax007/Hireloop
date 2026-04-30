import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BRANCHES = ['Computer Science','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Chemical Engineering','Mathematics','Physics','Biotechnology'];

const ROLES = [
  { id: 'student',   title: 'Student',   desc: 'Looking for placement opportunities', color: '#1e3a5f' },
  { id: 'recruiter', title: 'Recruiter', desc: 'Hiring talent from top colleges',      color: '#1e3a5f' },
  { id: 'admin',     title: 'Admin',     desc: 'Placement cell coordinator',           color: '#1e3a5f' },
];

// SAU octagonal logo SVG
const SAULogo = ({ color = '#fff', size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 8 L62 8 L78 22 L78 46 L62 62 L38 62 L22 46 L22 22 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M54 38 L78 38 L92 52 L92 76 L78 90 L54 90 L38 76 L38 52 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M22 38 L46 38 L62 52 L62 76 L46 90 L22 90 L8 76 L8 52 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M38 38 L62 38 L62 62 L38 62 Z" stroke={color} strokeWidth="3" fill={color === '#fff' ? 'rgba(255,255,255,0.15)' : 'rgba(30,58,95,0.1)'} strokeLinejoin="round"/>
  </svg>
);

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [error, setError] = useState('');
  const [mounted] = useState(true);
  const [form, setForm] = useState({
    email: '', password: '',
    firstName: '', lastName: '', college: 'South Asian University', branch: 'Computer Science', batch: 2025, cgpa: '',
    companyName: '', industry: 'Technology',
    name: '', institution: 'South Asian University',
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const SAU_DOMAINS = ['sau.ac.in', 'sau.int', 'sa.ac.in'];
  const isSAUEmail = email => SAU_DOMAINS.includes(email.split('@')[1]?.toLowerCase());

  const goToDetails = async () => {
    if (!form.email) { setError('Email is required'); return; }
    if (!validateEmail(form.email)) { setError('Please enter a valid email address'); return; }
    if (!isSAUEmail(form.email)) {
      setError('Only South Asian University email addresses are allowed. Please use your @sau.ac.in or @sau.int email.');
      return;
    }
    if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setValidatingEmail(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '/api') + '/auth/validate-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!data.valid) { setError(data.error || 'Please use a real email address'); return; }
    } catch {}
    finally { setValidatingEmail(false); }
    setStep(3);
  };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const d = await register({ email: form.email, password: form.password, role, ...form });
      toast.success('Welcome to HireLoop!');
      const routes = { student: '/student/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' };
      nav(routes[d.user.role]);
    } catch (e) { setError(e.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const pwStrength = p => p.length >= 10 ? 4 : p.length >= 8 ? 3 : p.length >= 6 ? 2 : p.length > 0 ? 1 : 0;
  const pwColor = s => s >= 3 ? 'var(--green)' : s === 2 ? '#f59e0b' : 'var(--red)';

  return (
    <div className="hl-auth-root">
      {/* Left Panel */}
      <div className="hl-auth-left">
        <div className={`hl-auth-left-inner${mounted ? ' hl-visible' : ''}`}>
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
            <h1>Join 1,500+<br /><em>placed students.</em></h1>
            <p>Get AI-powered resume analysis, mock interview practice, and direct access to top recruiters — all in one place.</p>
          </div>
          <div className="hl-auth-features">
            {[
              { icon: '◎', title: '92% Placement Rate', desc: 'Industry-leading placement outcomes for SAU students' },
              { icon: '◈', title: '250+ Recruiters', desc: 'Google, Microsoft, Deloitte, TCS and many more' },
              { icon: '✦', title: '₹24 LPA Highest Package', desc: 'Top offers secured through the portal' },
            ].map((f, i) => (
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
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hl-auth-right">
        <div className="hl-auth-card hl-visible" style={{ maxWidth: step === 3 ? 460 : 420 }}>
          {/* Mobile header */}
          <div className="hl-auth-mobile-logo">
            <div style={{ width: 32, height: 32, background: '#1e3a5f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SAULogo color="#fff" size={20} />
            </div>
            <span>HireLoop · SAU</span>
          </div>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= step ? '#1e3a5f' : 'var(--border-light)', transition: 'background .3s' }} />
            ))}
          </div>

          {/* Step 1 — Role */}
          {step === 1 && (
            <>
              <div className="hl-sau-badge" style={{ marginBottom: 20 }}>
                <SAULogo color="#1e3a5f" size={18} />
                <div>
                  <div className="hl-sau-badge-text">South Asian University</div>
                  <div style={{ fontSize: 10, color: '#6b7280' }}>Official Placement Portal</div>
                </div>
              </div>
              <h2 className="hl-auth-title">Create account</h2>
              <p className="hl-auth-sub">Choose how you'll use HireLoop</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => { setRole(r.id); setStep(2); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', border: `1.5px solid ${role === r.id ? '#1e3a5f' : 'var(--border-light)'}`, borderRadius: 12, background: role === r.id ? 'rgba(30,58,95,.06)' : 'var(--surface)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'var(--font)' }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>{r.title[0]}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)', marginBottom: 2 }}>{r.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.desc}</div>
                    </div>
                    <ArrowRight size={16} color="var(--text-3)" />
                  </button>
                ))}
              </div>
              <p className="hl-auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
            </>
          )}

          {/* Step 2 — Credentials */}
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, fontFamily: 'var(--font)', padding: 0 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 12px', background: 'rgba(30,58,95,.06)', borderRadius: 10 }}>
                <div style={{ width: 32, height: 32, background: '#1e3a5f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>{ROLES.find(r => r.id === role)?.title[0]}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ROLES.find(r => r.id === role)?.title}</div>
                  <button onClick={() => setStep(1)} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}>Change</button>
                </div>
              </div>
              <h2 className="hl-auth-title">Your credentials</h2>
              <p className="hl-auth-sub">We'll use this to secure your account</p>
              {error && <div className="hl-auth-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="hl-auth-form">
                <div className="hl-form-group">
                  <label className="hl-label">Email address</label>
                  <div className="hl-input-wrap">
                    <input className="hl-input" style={{ paddingLeft: 12 }} type="email" placeholder="you@sau.ac.in" value={form.email} onChange={set('email')} autoFocus />
                  </div>
                </div>
                <div className="hl-form-group">
                  <label className="hl-label">Password</label>
                  <div className="hl-input-wrap">
                    <input className="hl-input" style={{ paddingLeft: 12, paddingRight: 42 }} type={showPw ? 'text' : 'password'} placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} />
                    <button type="button" className="hl-eye-btn" onClick={() => setShowPw(s => !s)}>
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {form.password && (
                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                      {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: pwStrength(form.password) >= i ? pwColor(pwStrength(form.password)) : 'var(--border-light)' }} />)}
                    </div>
                  )}
                </div>
                <button className="hl-btn-primary" onClick={goToDetails} disabled={validatingEmail}>
                  {validatingEmail ? <><div className="hl-spinner" /> Verifying email…</> : <>Continue <ArrowRight size={16} /></>}
                </button>
              </div>
            </>
          )}

          {/* Step 3 — Details */}
          {step === 3 && (
            <>
              <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, fontFamily: 'var(--font)', padding: 0 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <h2 className="hl-auth-title">Almost there!</h2>
              <p className="hl-auth-sub">A few more details to complete your profile</p>
              {error && <div className="hl-auth-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="hl-auth-form">

                {role === 'student' && <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="hl-form-group">
                      <label className="hl-label">First name</label>
                      <div className="hl-input-wrap"><input className="hl-input" style={{ paddingLeft: 12 }} placeholder="Arjun" value={form.firstName} onChange={set('firstName')} autoFocus /></div>
                    </div>
                    <div className="hl-form-group">
                      <label className="hl-label">Last name</label>
                      <div className="hl-input-wrap"><input className="hl-input" style={{ paddingLeft: 12 }} placeholder="Mehta" value={form.lastName} onChange={set('lastName')} /></div>
                    </div>
                  </div>
                  <div className="hl-form-group">
                    <label className="hl-label">College</label>
                    <div className="hl-input-wrap"><input className="hl-input" style={{ paddingLeft: 12 }} placeholder="South Asian University" value={form.college} onChange={set('college')} /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="hl-form-group">
                      <label className="hl-label">Branch</label>
                      <div className="hl-input-wrap"><select className="hl-input" style={{ paddingLeft: 12 }} value={form.branch} onChange={set('branch')}>{BRANCHES.map(b => <option key={b}>{b}</option>)}</select></div>
                    </div>
                    <div className="hl-form-group">
                      <label className="hl-label">Grad Year</label>
                      <div className="hl-input-wrap"><select className="hl-input" style={{ paddingLeft: 12 }} value={form.batch} onChange={set('batch')}>{[2024,2025,2026,2027,2028].map(y => <option key={y}>{y}</option>)}</select></div>
                    </div>
                  </div>
                  <div className="hl-form-group">
                    <label className="hl-label">CGPA <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optional)</span></label>
                    <div className="hl-input-wrap"><input className="hl-input" style={{ paddingLeft: 12 }} type="number" step="0.01" min="0" max="10" placeholder="8.5" value={form.cgpa} onChange={set('cgpa')} /></div>
                  </div>
                </>}

                {role === 'recruiter' && <>
                  <div className="hl-form-group">
                    <label className="hl-label">Company name</label>
                    <div className="hl-input-wrap"><input className="hl-input" style={{ paddingLeft: 12 }} placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} autoFocus /></div>
                  </div>
                  <div className="hl-form-group">
                    <label className="hl-label">Industry</label>
                    <div className="hl-input-wrap"><select className="hl-input" style={{ paddingLeft: 12 }} value={form.industry} onChange={set('industry')}>{['Technology','Finance & Banking','E-Commerce','AI Startup','Consulting','Healthcare','Manufacturing','Other'].map(i => <option key={i}>{i}</option>)}</select></div>
                  </div>
                  <div style={{ background: 'var(--accent-bg)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--accent-dark)' }}>
                    Your company will be reviewed by the placement cell before you can post jobs.
                  </div>
                </>}

                {role === 'admin' && <>
                  <div className="hl-form-group">
                    <label className="hl-label">Your name</label>
                    <div className="hl-input-wrap"><input className="hl-input" style={{ paddingLeft: 12 }} placeholder="Dr. Priya Sharma" value={form.name} onChange={set('name')} autoFocus /></div>
                  </div>
                  <div className="hl-form-group">
                    <label className="hl-label">Institution</label>
                    <div className="hl-input-wrap"><input className="hl-input" style={{ paddingLeft: 12 }} placeholder="South Asian University" value={form.institution} onChange={set('institution')} /></div>
                  </div>
                </>}

                <button className="hl-btn-primary" onClick={submit} disabled={loading}>
                  {loading ? <><div className="hl-spinner" /> Creating account…</> : <>Create Account <ArrowRight size={16} /></>}
                </button>
                <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
                  By creating an account, you agree to HireLoop's Terms of Service and Privacy Policy.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
