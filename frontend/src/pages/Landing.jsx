import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STATS = [
  { val: '92%', label: 'Placement Rate' },
  { val: '250+', label: 'Recruiters' },
  { val: '₹24 LPA', label: 'Highest Package' },
  { val: '1500+', label: 'Offers Made' },
  { val: '40+', label: 'Countries' },
];

const COMPANIES = ['Google','Microsoft','Amazon','Deloitte','TCS','Infosys','Adobe','Accenture','IBM','EY'];

const FEATURES = [
  { icon: '◎', title: 'AI Resume Scoring', desc: 'Instant ATS analysis with actionable improvements to beat the bots.' },
  { icon: '◈', title: 'Smart Job Matching', desc: 'AI recommends roles based on your skills, CGPA and career goals.' },
  { icon: '✦', title: 'Mock Interviews', desc: 'Practice with AI interviewers and get per-answer scored feedback.' },
  { icon: '⬡', title: 'Live Competitions', desc: 'Coding contests and aptitude challenges with real prizes.' },
  { icon: '⟁', title: 'Direct Recruiter Access', desc: 'Companies post directly — no middlemen, just real offers.' },
  { icon: '◐', title: 'Placement Analytics', desc: 'Track applications and campus-wide placement stats.' },
];

const TESTIMONIALS = [
  { quote: 'HireLoop got me placed at Google in under 3 weeks. The AI resume scorer pinpointed exactly what was missing.', name: 'Priya S.', prog: "M.Tech CSE '25", color: '#1e3a5f' },
  { quote: 'The mock interview feature is genuinely good. It prepared me better than any coaching class did.', name: 'Rahul M.', prog: "MA Economics '24", color: '#1e3a5f' },
  { quote: 'Got placed at Deloitte within days. Direct recruiter access is an incredible feature.', name: 'Sneha R.', prog: "MSc Biotechnology '24", color: '#1e3a5f' },
];

// SAU octagonal logo SVG — matches real logo exactly
const SAULogo = ({ color = '#fff', size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <path d="M38 8 L62 8 L78 22 L78 46 L62 62 L38 62 L22 46 L22 22 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M54 38 L78 38 L92 52 L92 76 L78 90 L54 90 L38 76 L38 52 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M22 38 L46 38 L62 52 L62 76 L46 90 L22 90 L8 76 L8 52 Z" stroke={color} strokeWidth="5" fill="none" strokeLinejoin="round"/>
    <path d="M38 38 L62 38 L62 62 L38 62 Z" stroke={color} strokeWidth="3" fill={color==='#fff'?'rgba(255,255,255,0.15)':'rgba(30,58,95,0.12)'} strokeLinejoin="round"/>
  </svg>
);

// Campus photo from Unsplash (Indian university campus)
const CAMPUS_IMG = 'https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80&auto=format&fit=crop';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans',-apple-system,sans-serif", color: '#111827', background: '#fff', overflowX: 'hidden' }}>

      {/* ── NAV ─────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999,
        height: 60, padding: '0 40px',
        background: scrolled ? 'rgba(255,255,255,.97)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid #e5e7eb' : 'none',
        transition: 'all .25s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#1e3a5f', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <SAULogo color="#fff" size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: scrolled ? '#111827' : '#fff', lineHeight: 1, transition: 'color .25s' }}>HireLoop</div>
            <div style={{ fontSize: 9, color: scrolled ? '#6b7280' : 'rgba(255,255,255,.6)', letterSpacing: '.08em', textTransform: 'uppercase', transition: 'color .25s' }}>SOUTH ASIAN UNIVERSITY</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['Opportunities','Recruiters','Success Stories'].map(l => (
            <a key={l} href="#" style={{ fontSize: 14, fontWeight: 500, color: scrolled ? '#374151' : 'rgba(255,255,255,.85)', textDecoration: 'none', transition: 'color .15s' }} className="lp-nav-link">{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link to="/login" style={{ padding: '7px 18px', border: `1.5px solid ${scrolled ? '#d1d5db' : 'rgba(255,255,255,.4)'}`, borderRadius: 8, fontSize: 13, fontWeight: 500, color: scrolled ? '#111827' : '#fff', textDecoration: 'none', transition: 'all .15s' }}>
            Login
          </Link>
          <Link to="/register" style={{ padding: '7px 18px', background: '#1e3a5f', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', textDecoration: 'none', border: '1.5px solid transparent', transition: 'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.background = '#16304f'}
            onMouseLeave={e => e.currentTarget.style.background = '#1e3a5f'}>
            Student Sign Up
          </Link>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Background — campus image with overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${CAMPUS_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'brightness(.45)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(30,58,95,.85) 0%, rgba(15,30,50,.6) 60%, transparent 100%)' }} />

        <div style={{ position: 'relative', maxWidth: 1140, margin: '0 auto', padding: '120px 48px 80px', width: '100%' }}>
          <div style={{ maxWidth: 620 }}>
            {/* Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 24, backdropFilter: 'blur(8px)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: '.06em', textTransform: 'uppercase' }}>Official Career & Placement Platform</span>
            </div>

            <h1 style={{ fontSize: 'clamp(36px,5.5vw,66px)', fontWeight: 800, color: '#fff', lineHeight: 1.06, letterSpacing: '-2px', marginBottom: 20, margin: '0 0 20px' }}>
              Shape Your Future<br />
              <span style={{ color: '#93c5fd' }}>with HireLoop</span>
            </h1>

            <p style={{ fontSize: 18, color: 'rgba(255,255,255,.75)', lineHeight: 1.7, maxWidth: 500, marginBottom: 36 }}>
              Connecting South Asian University's elite students with global opportunities, internships, and world-class recruiters — powered by AI.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#1e3a5f', border: '2px solid rgba(255,255,255,.2)', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', transition: 'all .2s', backdropFilter: 'blur(8px)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.borderColor = 'transparent'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1e3a5f'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)'; }}>
                Explore Jobs
              </Link>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'rgba(255,255,255,.1)', border: '2px solid rgba(255,255,255,.25)', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#fff', textDecoration: 'none', transition: 'all .2s', backdropFilter: 'blur(8px)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.18)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.1)'}>
                Sign In
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex' }}>
                {['A','R','S','P'].map((l, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: ['#1e3a5f','#1d4ed8','#0369a1','#0284c7'][i], border: '2px solid rgba(255,255,255,.3)', marginLeft: i ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff' }}>
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>1,500+ students placed</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)' }}>this academic year</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────── */}
      <div style={{ background: '#1e3a5f', padding: '28px 48px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── COMPANIES ────────────────────────────────────────────── */}
      <div style={{ padding: '44px 48px', background: '#f8faff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '.12em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 24 }}>Trusted by global industry leaders</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {COMPANIES.map(c => (
              <div key={c} style={{ padding: '8px 22px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#374151' }}>{c}</div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <div style={{ padding: '80px 48px', background: '#fff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 34, fontWeight: 800, color: '#111827', letterSpacing: '-1px', marginBottom: 12 }}>Why Choose HireLoop?</h2>
            <p style={{ fontSize: 16, color: '#6b7280', maxWidth: 480, margin: '0 auto' }}>A robust placement ecosystem designed to accelerate your career at SAU.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {FEATURES.map(f => (
              <div key={f.title}
                style={{ padding: '28px 24px', background: '#f9fafb', borderRadius: 16, border: '1px solid transparent', transition: 'all .2s', cursor: 'default' }}
                onMouseEnter={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='#f9fafb'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; }}>
                <div style={{ fontSize: 22, marginBottom: 14, color: '#1e3a5f' }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#111827' }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <div style={{ padding: '80px 48px', background: '#f8faff' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111827', letterSpacing: '-1px', marginBottom: 8, textAlign: 'center' }}>Student Success Stories</h2>
          <p style={{ fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 44 }}>Real students, real placements, real impact.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} style={{ background: '#fff', borderRadius: 18, padding: '28px 24px', border: '1px solid #e5e7eb', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 28px rgba(0,0,0,.07)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; }}>
                <div style={{ fontSize: 22, marginBottom: 14, color: '#f59e0b' }}>★★★★★</div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1e3a5f', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{t.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>{t.prog}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div style={{ padding: '80px 48px', background: '#1e3a5f', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${CAMPUS_IMG})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: .08 }} />
        <div style={{ position: 'relative', maxWidth: 580, margin: '0 auto' }}>
          <h2 style={{ fontSize: 38, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>Your dream job is one application away.</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', marginBottom: 36 }}>Join 1,500+ SAU students who found their placement through HireLoop.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ padding: '14px 32px', background: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#1e3a5f', textDecoration: 'none', transition: 'all .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
              Get Started Free
            </Link>
            <Link to="/login" style={{ padding: '14px 28px', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: 12, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.8)', textDecoration: 'none' }}>
              Already have an account?
            </Link>
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer style={{ background: '#111', padding: '52px 48px 32px' }}>
        <div style={{ maxWidth: 1140, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 44 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, background: '#1e3a5f', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <SAULogo color="#fff" size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>HireLoop</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: '.06em' }}>SOUTH ASIAN UNIVERSITY</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', lineHeight: 1.7, maxWidth: 240 }}>The official career placement portal. Connecting students with opportunities that match their potential.</p>
            </div>
            {[
              { title: 'HireLoop', links: ['About Us','University Placements','Campus Team'] },
              { title: 'Students & Recruiters', links: ['Jobs & Internships','Student Profile','Hire Talent','Post Jobs'] },
              { title: 'Contact', links: ['Email Support','LinkedIn','Instagram'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,.4)', textDecoration: 'none', transition: 'color .15s' }} onMouseEnter={e => e.target.style.color='#fff'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,.4)'}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>© {new Date().getFullYear()} HireLoop · South Asian University</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>Crafted by <span style={{ color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>Soumya, Udit, Vijjval & Vedant</span></div>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy Policy','Terms of Service'].map(l => <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', textDecoration: 'none' }}>{l}</a>)}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @media (max-width: 900px) {
          .lp-nav-link { display: none; }
        }
        @media (max-width: 700px) {
          div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          div[style*="grid-template-columns: 2fr 1fr 1fr 1fr"] { grid-template-columns: 1fr 1fr !important; }
          section div[style*="padding: 120px 48px"] { padding: 100px 20px 60px !important; }
          div[style*="padding: '80px 48px'"], div[style*="padding: 80px 48px"] { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>
    </div>
  );
}
