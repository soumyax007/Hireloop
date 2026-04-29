import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const SAU_LOGO = 'data:image/png;base64,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';

const STATS = [
  { val: '92%', label: 'Placement Rate' },
  { val: '250+', label: 'Recruiters' },
  { val: '₹24 LPA', label: 'Highest Package' },
  { val: '1500+', label: 'Offers Made' },
  { val: '40+', label: 'Countries' },
];

const COMPANIES = ['Google','Microsoft','Amazon','Deloitte','TCS','Infosys','Adobe','Accenture','IBM','EY','KPMG','Flipkart'];

const FEATURES = [
  { icon: '✦', title: 'AI Resume Scoring', desc: 'Instant ATS analysis with actionable improvements to beat the bots.' },
  { icon: '◈', title: 'Smart Job Matching', desc: 'AI recommends roles based on your skills, CGPA and career goals.' },
  { icon: '◎', title: 'Mock Interviews', desc: 'Practice with AI interviewers and get per-answer scored feedback.' },
  { icon: '⬡', title: 'Live Competitions', desc: 'Coding contests and aptitude challenges with real prizes and rankings.' },
  { icon: '⟁', title: 'Direct Recruiter Access', desc: 'Companies post directly — no middlemen, no spam, just real offers.' },
  { icon: '◐', title: 'Placement Analytics', desc: 'Track your progress, applications, and campus-wide placement stats.' },
];

const JOBS = [
  { co: 'G', company: 'Google', title: 'Software Engineer Intern', loc: 'Bengaluru / Remote', type: 'Internship', pkg: '₹12 LPA', days: 2 },
  { co: 'D', company: 'Deloitte', title: 'Business Analyst', loc: 'New Delhi', type: 'Full time', pkg: '₹15 LPA', days: 3 },
  { co: 'M', company: 'Microsoft', title: 'Product Manager', loc: 'Hyderabad', type: 'Full time', pkg: '₹28 LPA', days: 5 },
];

const TESTIMONIALS = [
  { quote: 'HireLoop got me placed at Google in under 3 weeks. The AI resume scorer pinpointed exactly what was missing.', name: 'Priya S.', prog: 'M.Tech CSE \'25', color: '#0071e3' },
  { quote: 'The mock interview feature is genuinely scary good. It prepared me better than any coaching class did.', name: 'Rahul M.', prog: 'MA Economics \'24', color: '#30d158' },
  { quote: 'Got placed at Deloitte within days of registering. Direct recruiter access is an incredible feature.', name: 'Sneha R.', prog: 'MSc Biotechnology \'24', color: '#bf5af2' },
];

function useInView(options = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.15, ...options });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Section({ children, style }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'none' : 'translateY(28px)', transition: 'opacity .6s ease, transform .6s ease', ...style }}>
      {children}
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', -apple-system, sans-serif", color: '#1d1d1f', background: '#fff', overflowX: 'hidden' }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,.07)' : 'none',
        transition: 'all .3s ease',
        padding: '0 clamp(20px,4vw,48px)', height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* SAU Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none' }}>
          <img src={SAU_LOGO} alt="South Asian University" style={{ height: 48, width: 'auto', filter: scrolled ? 'none' : 'brightness(0) invert(1)', transition: 'filter .3s' }} className="sau-logo-nav" />
          <div className="sau-nav-divider" style={{ width: 1, height: 32, background: scrolled ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.3)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: scrolled ? '#1d1d1f' : '#fff', lineHeight: 1, letterSpacing: '-.2px' }}>HireLoop</div>
            <div style={{ fontSize: 10, color: scrolled ? '#6e6e73' : 'rgba(255,255,255,.65)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 2 }}>Placement Portal</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login" style={{
            padding: '8px 18px', border: `1.5px solid ${scrolled ? 'rgba(0,0,0,.15)' : 'rgba(255,255,255,.35)'}`,
            borderRadius: 8, fontSize: 14, fontWeight: 500, color: scrolled ? '#1d1d1f' : '#fff',
            textDecoration: 'none', transition: 'all .15s', background: 'transparent'
          }}>
            Sign In
          </Link>
          <Link to="/register" style={{
            padding: '8px 20px', background: '#0071e3',
            borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff',
            textDecoration: 'none', transition: 'all .15s'
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        padding: 'clamp(100px,12vw,140px) clamp(20px,5vw,80px) 80px',
        background: 'linear-gradient(160deg, #0d1f3c 0%, #0a2952 50%, #103070 100%)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: '20%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 60, alignItems: 'center' }}>
          {/* Left */}
          <div style={{ animation: 'fadeUp .8s ease both' }}>
            {/* SAU badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 100, padding: '6px 14px 6px 8px', marginBottom: 28 }}>
              <img src={SAU_LOGO} alt="SAU" style={{ height: 28, width: 'auto', filter: 'brightness(0) invert(1)' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.85)', letterSpacing: '.03em' }}>South Asian University · Official Placement Portal</span>
            </div>

            <h1 style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: 20, color: '#fff' }}>
              Shape Your Future<br />
              <span style={{ color: '#4da6ff' }}>with HireLoop</span>
            </h1>

            <p style={{ fontSize: 17, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
              Connecting SAU students with global opportunities, internships, and world-class recruiters — powered by AI.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                background: '#0071e3', borderRadius: 12, fontSize: 15, fontWeight: 600,
                color: '#fff', textDecoration: 'none', transition: 'all .2s', boxShadow: '0 4px 20px rgba(0,113,227,.4)'
              }}>
                Explore Jobs →
              </Link>
              <Link to="/login" style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px',
                background: 'rgba(255,255,255,.1)', border: '1.5px solid rgba(255,255,255,.2)',
                borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#fff',
                textDecoration: 'none', transition: 'all .2s', backdropFilter: 'blur(10px)'
              }}>
                Sign In
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 44, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex' }}>
                {['#0071e3','#30d158','#bf5af2','#f59e0b'].map((c, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,.2)', marginLeft: i ? -10 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {['A','R','S','P'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>1,500+ SAU students placed</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>this academic year alone</div>
              </div>
            </div>
          </div>

          {/* Right — Visual card */}
          <div style={{ animation: 'fadeUp .8s .15s ease both', position: 'relative' }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.4)', background: '#fff', border: '1px solid rgba(255,255,255,.1)' }}>
              <div style={{ background: 'linear-gradient(135deg, #1d1d1f 0%, #2d3a4a 100%)', padding: '28px 28px 20px', color: '#fff' }}>
                <div style={{ fontSize: 11, opacity: .5, marginBottom: 8, letterSpacing: '.08em', textTransform: 'uppercase' }}>Recently Placed</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[['Arjun K.','Software Engineer','Google','₹42 LPA'],['Priya S.','Business Analyst','Deloitte','₹18 LPA'],['Rahul M.','Product Manager','Microsoft','₹32 LPA']].map(([n,r,c,p]) => (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,.07)', borderRadius: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0071e3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{n[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{n}</div>
                        <div style={{ fontSize: 11, opacity: .6 }}>{r} · {c}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#30d158' }}>{p}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ padding: '16px 28px 24px' }}>
                <div style={{ fontSize: 12, color: '#6e6e73', marginBottom: 12 }}>Active Opportunities</div>
                {[['Software Engineer Intern','Google','₹12 LPA','2d'],['Business Analyst','Deloitte','₹15 LPA','3d']].map(([t,c,p,d]) => (
                  <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f5' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t}</div>
                      <div style={{ fontSize: 12, color: '#6e6e73' }}>{c} · {d} ago</div>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0071e3' }}>{p}</div>
                  </div>
                ))}
                <Link to="/register" style={{ display: 'block', marginTop: 16, textAlign: 'center', background: '#0071e3', color: '#fff', padding: '11px', borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                  Apply Now →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <Section>
        <div style={{ background: '#fff', borderTop: '1px solid #f0f0f5', borderBottom: '1px solid #f0f0f5', padding: 'clamp(20px,4vw,28px) clamp(20px,5vw,80px)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center', flex: '1 1 120px' }}>
                <div style={{ fontSize: 'clamp(24px,3.5vw,32px)', fontWeight: 800, letterSpacing: '-1px', color: '#1d1d1f', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: '#6e6e73', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Company logos ── */}
      <Section>
        <div style={{ padding: 'clamp(32px,5vw,48px) clamp(20px,5vw,80px)', background: '#fafafa' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#aeaeb2', letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 28 }}>Trusted by global industry leaders</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {COMPANIES.map(c => (
                <div key={c} style={{ padding: '8px 22px', background: '#fff', border: '1px solid #e8e8ed', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#6e6e73' }}>{c}</div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Features ── */}
      <Section>
        <div style={{ padding: 'clamp(48px,7vw,80px) clamp(20px,5vw,80px)', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <h2 style={{ fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800, letterSpacing: '-1.5px', color: '#1d1d1f', marginBottom: 12 }}>Why Choose HireLoop?</h2>
              <p style={{ fontSize: 16, color: '#6e6e73', maxWidth: 500, margin: '0 auto' }}>A robust placement ecosystem designed for South Asian University students.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
              {FEATURES.map((f) => (
                <div key={f.title} style={{ padding: '28px 24px', background: '#f5f5f7', borderRadius: 18, border: '1px solid transparent', transition: 'all .2s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e8e8ed'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f7'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ fontSize: 24, marginBottom: 16, color: '#0071e3' }}>{f.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#1d1d1f' }}>{f.title}</div>
                  <div style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Latest Jobs ── */}
      <Section>
        <div style={{ padding: 'clamp(48px,7vw,80px) clamp(20px,5vw,80px)', background: '#f5f5f7' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, letterSpacing: '-1px', color: '#1d1d1f', marginBottom: 8 }}>Latest Openings</h2>
                <p style={{ fontSize: 15, color: '#6e6e73' }}>Exclusive opportunities curated for SAU students.</p>
              </div>
              <Link to="/register" style={{ fontSize: 14, fontWeight: 600, color: '#0071e3', textDecoration: 'none' }}>View All Jobs →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {JOBS.map(j => (
                <div key={j.title} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', padding: 'clamp(14px,2.5vw,20px) clamp(16px,3vw,24px)', display: 'flex', alignItems: 'center', gap: 18, transition: 'all .2s', cursor: 'pointer', flexWrap: 'wrap' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 44, height: 44, background: '#f0f0f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#1d1d1f', flexShrink: 0 }}>{j.co}</div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#6e6e73' }}>POSTED {j.days}D AGO</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#0071e3' }}>{j.pkg}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#1d1d1f', marginBottom: 2 }}>{j.title}</div>
                    <div style={{ fontSize: 13, color: '#6e6e73' }}>{j.company} · 📍 {j.loc} · 💼 {j.type}</div>
                  </div>
                  <Link to="/register" style={{ padding: '9px 20px', border: '1.5px solid #d2d2d7', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#1d1d1f', textDecoration: 'none', whiteSpace: 'nowrap', transition: 'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1d1d1f'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#1d1d1f'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#1d1d1f'; e.currentTarget.style.borderColor = '#d2d2d7'; }}>
                    Apply Now
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Testimonials ── */}
      <Section>
        <div style={{ padding: 'clamp(48px,7vw,80px) clamp(20px,5vw,80px)', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, letterSpacing: '-1px', color: '#1d1d1f', marginBottom: 8, textAlign: 'center' }}>Student Success Stories</h2>
            <p style={{ fontSize: 15, color: '#6e6e73', textAlign: 'center', marginBottom: 44 }}>Real SAU students, real placements, real impact.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
              {TESTIMONIALS.map(t => (
                <div key={t.name} style={{ background: '#f5f5f7', borderRadius: 20, padding: '28px 24px', border: '1px solid transparent', transition: 'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e8e8ed'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#f5f5f7'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ fontSize: 24, marginBottom: 16 }}>⭐</div>
                  <p style={{ fontSize: 14, color: '#1d1d1f', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13 }}>{t.name[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: '#1d1d1f' }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: '#6e6e73' }}>{t.prog}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <Section>
        <div style={{ padding: 'clamp(48px,7vw,80px) clamp(20px,5vw,80px)', background: 'linear-gradient(135deg, #0d1f3c 0%, #0a2952 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,113,227,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>Start Today — It's Free</div>
            <h2 style={{ fontSize: 'clamp(28px,4.5vw,40px)', fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>Your dream job is one application away.</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', marginBottom: 36, lineHeight: 1.6 }}>Join 1,500+ SAU students who found their placement through HireLoop.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ padding: '14px 32px', background: '#0071e3', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none' }}>
                Get Started Free
              </Link>
              <Link to="/login" style={{ padding: '14px 28px', border: '1.5px solid rgba(255,255,255,.2)', borderRadius: 12, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.8)', textDecoration: 'none' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer style={{ background: '#0d1117', color: 'rgba(255,255,255,.55)', padding: 'clamp(36px,5vw,52px) clamp(20px,5vw,80px) 28px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Top: Logo + tagline + social links */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, marginBottom: 44, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <img src={SAU_LOGO} alt="South Asian University" style={{ height: 52, width: 'auto', filter: 'brightness(0) invert(1) opacity(0.9)' }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1 }}>HireLoop</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 3, letterSpacing: '.04em' }}>Placement Portal</div>
                </div>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,.45)' }}>
                South Asian University's official career placement portal — connecting students with global opportunities.
              </p>
              {/* Social Links */}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                {/* SAU Website */}
                <a href="https://sau.int/" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}
                  title="SAU Website">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </a>
                {/* Instagram */}
                <a href="https://www.instagram.com/southasianuniversity/" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}
                  title="Instagram">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                {/* LinkedIn */}
                <a href="https://www.linkedin.com/school/south-asian-university/" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}
                  title="LinkedIn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                </a>
                {/* YouTube */}
                <a href="https://www.youtube.com/user/southasianuniversity" target="_blank" rel="noopener noreferrer" style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; }}
                  title="YouTube">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" stroke="none" fill="currentColor"/></svg>
                </a>
              </div>
            </div>

            {/* Right: Quick links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40 }}>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 12, marginBottom: 14, letterSpacing: '.05em', textTransform: 'uppercase' }}>Portal</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['Jobs & Internships','Student Profile','Hire Talent','Post Jobs'].map(l => (
                    <Link key={l} to="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.45)'}>{l}</Link>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 12, marginBottom: 14, letterSpacing: '.05em', textTransform: 'uppercase' }}>University</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[['SAU Official Website','https://sau.int/'],['Instagram','https://www.instagram.com/southasianuniversity/'],['LinkedIn','https://www.linkedin.com/school/south-asian-university/'],['YouTube','https://www.youtube.com/user/southasianuniversity']].map(([l,u]) => (
                    <a key={l} href={u} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', textDecoration: 'none', transition: 'color .15s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.45)'}>{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>© {new Date().getFullYear()} South Asian University · HireLoop · All rights reserved</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>
              Crafted with ♥ by <span style={{ color: 'rgba(255,255,255,.6)', fontWeight: 500 }}>Soumya, Udit, Vijjval &amp; Vedant</span>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: none; } }
        @media (max-width: 640px) {
          .sau-logo-nav { height: 36px !important; }
          .sau-nav-divider { display: none; }
        }
        @media (min-width: 768px) {
          .sau-logo-nav { filter: brightness(0) invert(1) !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
