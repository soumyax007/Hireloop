import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Building2, GraduationCap, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BRANCHES = ['Computer Science','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Chemical Engineering','Mathematics','Physics','Biotechnology'];

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ email:'', password:'', firstName:'', lastName:'', college:'IIT Delhi', branch:'Computer Science', batch:2025, cgpa:'', companyName:'', industry:'Technology', name:'', institution:'' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Email and password required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const payload = { email: form.email, password: form.password, role, ...form };
      const d = await register(payload);
      toast.success('Account created!');
      const routes = { student: '/student/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' };
      nav(routes[d.user.role]);
    } catch (e) { setError(e.error || 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div style={{ maxWidth: 360, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
            <div className="sb-logo-mark"><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <span style={{ fontSize: 18, fontWeight: 700 }}>HireLoop</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-d)', fontSize: 34, fontWeight: 400, lineHeight: 1.2, marginBottom: 14 }}>Join the placement<br /><em>revolution.</em></h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.6)', lineHeight: 1.7 }}>50+ companies, AI-powered tools, and a community of 10,000+ students.</p>
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {['Get AI-powered resume feedback', 'Practice with mock interviews', 'Track applications in real-time', 'Receive smart job recommendations'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(48,209,88,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#30d158" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
                </div>
                <span style={{ color: 'rgba(255,255,255,.8)' }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card" style={{ maxWidth: 460 }}>
          <div className="auth-logo">
            <div className="auth-logo-mark"><svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
            <span style={{ fontWeight: 700, fontSize: 16 }}>HireLoop</span>
          </div>
          <h2 className="auth-title">Create account</h2>

          {/* Role tabs */}
          <div className="role-tabs">
            {[['student','Student'],['recruiter','Recruiter'],['admin','Admin']].map(([v,l]) => (
              <button key={v} type="button" className={`role-tab${role===v?' active':''}`} onClick={() => setRole(v)}>{l}</button>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit}>
            {/* Common fields */}
            <div className="form-group">
              <label className="label">Email address</label>
              <div className="input-with-icon">
                <Mail size={15} className="input-icon" />
                <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>
            <div className="form-group">
              <label className="label">Password</label>
              <div className="input-with-icon" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon" />
                <input className="input" type={show?'text':'password'} placeholder="Min 6 characters" value={form.password} onChange={set('password')} style={{ paddingRight: 40 }} required />
                <button type="button" onClick={()=>setShow(s=>!s)} style={{ position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',border:'none',background:'none',color:'var(--text-3)',cursor:'pointer' }}>{show?<EyeOff size={14}/>:<Eye size={14}/>}</button>
              </div>
            </div>

            {/* Student fields */}
            {role === 'student' && <>
              <div className="form-row">
                <div className="form-group">
                  <label className="label">First name</label>
                  <input className="input" placeholder="Arjun" value={form.firstName} onChange={set('firstName')} required />
                </div>
                <div className="form-group">
                  <label className="label">Last name</label>
                  <input className="input" placeholder="Mehta" value={form.lastName} onChange={set('lastName')} required />
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
                  <label className="label">Graduation year</label>
                  <select className="input" value={form.batch} onChange={set('batch')}>
                    {[2024,2025,2026,2027,2028].map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label">CGPA</label>
                <input className="input" type="number" step="0.01" min="0" max="10" placeholder="8.5" value={form.cgpa} onChange={set('cgpa')} />
              </div>
            </>}

            {/* Recruiter fields */}
            {role === 'recruiter' && <>
              <div className="form-group">
                <label className="label">Company name</label>
                <div className="input-with-icon">
                  <Building2 size={15} className="input-icon" />
                  <input className="input" placeholder="Acme Corp" value={form.companyName} onChange={set('companyName')} required />
                </div>
              </div>
              <div className="form-group">
                <label className="label">Industry</label>
                <select className="input" value={form.industry} onChange={set('industry')}>
                  {['Technology','Finance & Banking','E-Commerce','AI Startup','Consulting','Healthcare','Manufacturing','Other'].map(i=><option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="alert alert-info" style={{ fontSize: 13 }}>
                Your company will be reviewed by the placement cell before you can post jobs.
              </div>
            </>}

            {/* Admin fields */}
            {role === 'admin' && <>
              <div className="form-group">
                <label className="label">Your name</label>
                <input className="input" placeholder="Dr. Priya Sharma" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="label">Institution</label>
                <input className="input" placeholder="IIT Delhi Placement Cell" value={form.institution} onChange={set('institution')} />
              </div>
            </>}

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor:'#fff' }}/> Creating…</> : <><span>Create Account</span><ArrowRight size={16}/></>}
            </button>
          </form>

          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link to="/login" className="btn btn-secondary btn-full" style={{ textAlign:'center' }}>Sign in instead</Link>
        </div>
      </div>
    </div>
  );
}
