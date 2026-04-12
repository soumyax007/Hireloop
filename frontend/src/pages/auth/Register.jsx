import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BRANCHES = ['Computer Science','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Chemical Engineering','Mathematics','Physics','Biotechnology'];

const ROLES = [
  { id: 'student', emoji: '🎓', title: 'Student', desc: 'Looking for placement opportunities' },
  { id: 'recruiter', emoji: '🏢', title: 'Recruiter', desc: 'Hiring talent from top colleges' },
  { id: 'admin', emoji: '🛡️', title: 'Admin', desc: 'Placement cell coordinator' },
];

const Logo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(1); // 1: role, 2: credentials, 3: details
  const [role, setRole] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    email: '', password: '',
    firstName: '', lastName: '', college: 'IIT Delhi', branch: 'Computer Science', batch: 2025, cgpa: '',
    companyName: '', industry: 'Technology',
    name: '', institution: '',
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const [validatingEmail, setValidatingEmail] = useState(false);

  const validateEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const goToDetails = async () => {
    if (!form.email) { setError('Email is required'); return; }
    if (!validateEmail(form.email)) { setError('Please enter a valid email address'); return; }
    if (!form.password || form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError('');
    setValidatingEmail(true);
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || '/api') + '/auth/validate-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!data.valid) { setError(data.error || 'Please use a real email address'); return; }
    } catch {
      // If validation fails due to network, allow proceeding
    } finally { setValidatingEmail(false); }
    setStep(3);
  };

  const submit = async () => {
    setLoading(true); setError('');
    try {
      const d = await register({ email: form.email, password: form.password, role, ...form });
      toast.success('Welcome to HireLoop! 🎉');
      const routes = { student: '/student/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' };
      nav(routes[d.user.role]);
    } catch (e) { setError(e.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f5f7' }}>
      {/* Left panel */}
      <div style={{ flex: 1, display: 'none', background: 'var(--text-1)', padding: '60px', flexDirection: 'column', justifyContent: 'center' }} className="auth-left">
        <div style={{ maxWidth: 360, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Logo /></div>
            <span style={{ fontSize: 18, fontWeight: 700 }}>HireLoop</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 38, fontWeight: 400, lineHeight: 1.15, marginBottom: 16 }}>Your career<br /><em>starts here.</em></h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, marginBottom: 40 }}>Join thousands of students and recruiters on India's smartest placement platform.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {['AI-powered resume analysis', 'Live mock interviews with feedback', 'Direct recruiter connections', 'Real-time application tracking'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14 }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(48,209,88,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Check size={12} color="#30d158" strokeWidth={3} />
                </div>
                <span style={{ color: 'rgba(255,255,255,.75)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Logo mobile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 36 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--text-1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Logo /></div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>HireLoop</span>
          </div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: s <= step ? 'var(--accent)' : 'var(--border-light)', transition: 'background .3s' }} />
            ))}
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div className="anim-in">
              <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.5px', marginBottom: 6 }}>Create account</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 28 }}>Choose how you'll use HireLoop</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {ROLES.map(r => (
                  <button key={r.id} onClick={() => { setRole(r.id); setStep(2); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', border: `1.5px solid ${role === r.id ? 'var(--accent)' : 'var(--border-light)'}`, borderRadius: 'var(--r-lg)', background: role === r.id ? 'var(--accent-bg)' : 'var(--surface)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', fontFamily: 'var(--font)' }}>
                    <span style={{ fontSize: 26 }}>{r.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-1)', marginBottom: 2 }}>{r.title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{r.desc}</div>
                    </div>
                    <ArrowRight size={16} color="var(--text-3)" />
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
                Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>Sign in</Link>
              </div>
            </div>
          )}

          {/* Step 2: Email & Password */}
          {step === 2 && (
            <div className="anim-in">
              <button onClick={() => setStep(1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, fontFamily: 'var(--font)', padding: 0 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, padding: '12px 14px', background: 'var(--bg)', borderRadius: 'var(--r-md)' }}>
                <span style={{ fontSize: 20 }}>{ROLES.find(r => r.id === role)?.emoji}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{ROLES.find(r => r.id === role)?.title}</div>
                  <button onClick={() => setStep(1)} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--font)' }}>Change</button>
                </div>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.4px', marginBottom: 6 }}>Your credentials</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>We'll use this to secure your account</p>
              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
              <div className="form-group">
                <label className="label">Email address</label>
                <input className="input" type="email" placeholder="you@college.edu" value={form.email} onChange={set('email')} autoFocus />
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>Enter a valid email — we verify it during sign-up</div>
              </div>
              <div className="form-group">
                <label className="label">Password</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPw ? 'text' : 'password'} placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} style={{ paddingRight: 42 }} />
                  <button type="button" onClick={() => setShowPw(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: form.password.length >= i * 2 ? (form.password.length < 6 ? 'var(--red)' : form.password.length < 10 ? 'var(--yellow)' : 'var(--green)') : 'var(--border-light)' }} />)}
                  </div>
                )}
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={goToDetails} disabled={validatingEmail} style={{ marginTop: 8 }}>
                {validatingEmail ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Verifying email…</> : <>Continue <ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          {/* Step 3: Role-specific details */}
          {step === 3 && (
            <div className="anim-in">
              <button onClick={() => setStep(2)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-2)', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, fontFamily: 'var(--font)', padding: 0 }}>
                <ArrowLeft size={14} /> Back
              </button>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.4px', marginBottom: 6 }}>Almost there!</h2>
              <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>A few more details to set up your profile</p>
              {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

              {role === 'student' && <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">First name</label>
                    <input className="input" placeholder="Arjun" value={form.firstName} onChange={set('firstName')} autoFocus />
                  </div>
                  <div className="form-group">
                    <label className="label">Last name</label>
                    <input className="input" placeholder="Mehta" value={form.lastName} onChange={set('lastName')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">College / University</label>
                  <input className="input" placeholder="IIT Delhi" value={form.college} onChange={set('college')} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Branch</label>
                    <select className="input" value={form.branch} onChange={set('branch')}>
                      {BRANCHES.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Grad Year</label>
                    <select className="input" value={form.batch} onChange={set('batch')}>
                      {[2024,2025,2026,2027,2028].map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">CGPA <span style={{ fontWeight: 400, color: 'var(--text-3)' }}>(optional)</span></label>
                  <input className="input" type="number" step="0.01" min="0" max="10" placeholder="8.5" value={form.cgpa} onChange={set('cgpa')} />
                </div>
              </>}

              {role === 'recruiter' && <>
                <div className="form-group">
                  <label className="label">Company name</label>
                  <input className="input" placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} autoFocus required />
                </div>
                <div className="form-group">
                  <label className="label">Industry</label>
                  <select className="input" value={form.industry} onChange={set('industry')}>
                    {['Technology','Finance & Banking','E-Commerce','AI Startup','Consulting','Healthcare','Manufacturing','Other'].map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <div className="alert alert-info" style={{ fontSize: 13, marginBottom: 8 }}>
                  Your company will be reviewed by the placement cell before you can post jobs.
                </div>
              </>}

              {role === 'admin' && <>
                <div className="form-group">
                  <label className="label">Your name</label>
                  <input className="input" placeholder="Dr. Priya Sharma" value={form.name} onChange={set('name')} autoFocus required />
                </div>
                <div className="form-group">
                  <label className="label">Institution</label>
                  <input className="input" placeholder="IIT Delhi Placement Cell" value={form.institution} onChange={set('institution')} />
                </div>
              </>}

              <button className="btn btn-primary btn-full btn-lg" onClick={submit} disabled={loading} style={{ marginTop: 8 }}>
                {loading
                  ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Creating account…</>
                  : <>Create Account <ArrowRight size={16} /></>}
              </button>

              <p style={{ fontSize: 12, color: 'var(--text-3)', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
                By creating an account, you agree to HireLoop's Terms of Service and Privacy Policy.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
