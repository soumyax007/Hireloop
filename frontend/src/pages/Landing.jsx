import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NAV_LINKS = ['Opportunities', 'Recruiters', 'Success Stories', 'Resources'];

const STATS = [
  { val: '92%', label: 'Placement Rate' },
  { val: '250+', label: 'Recruiters' },
  { val: '₹24 LPA', label: 'Highest Package' },
  { val: '1500+', label: 'Offers Made' },
  { val: '40+', label: 'Countries' },
];

const COMPANIES = ['Google', 'Microsoft', 'Amazon', 'Deloitte', 'TCS', 'Infosys', 'Adobe', 'Accenture', 'IBM', 'EY', 'KPMG', 'Flipkart'];

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
        background: scrolled ? 'rgba(255,255,255,.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,0,0,.07)' : 'none',
        transition: 'all .3s ease',
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, background: '#1d1d1f', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1d1d1f', lineHeight: 1 }}>HireLoop</div>
            <div style={{ fontSize: 10, color: '#6e6e73', letterSpacing: '.04em', textTransform: 'uppercase', marginTop: 1 }}>Placement Portal</div>
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="lp-nav-links">
          {NAV_LINKS.map(l => (
            <a key={l} href="#" style={{ fontSize: 14, color: '#1d1d1f', textDecoration: 'none', fontWeight: 500, opacity: .7, transition: 'opacity .15s' }}
              onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = .7}>{l}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/login" style={{ padding: '8px 18px', border: '1.5px solid rgba(0,0,0,.15)', borderRadius: 8, fontSize: 14, fontWeight: 500, color: '#1d1d1f', textDecoration: 'none', transition: 'all .15s', background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='#1d1d1f'} onMouseLeave={e => e.currentTarget.style.borderColor='rgba(0,0,0,.15)'}>
            Login
          </Link>
          <Link to="/register" style={{ padding: '8px 20px', background: '#1d1d1f', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', textDecoration: 'none', transition: 'all .15s' }}
            onMouseEnter={e => e.currentTarget.style.background='#0071e3'} onMouseLeave={e => e.currentTarget.style.background='#1d1d1f'}>
            Student Sign Up
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '100px 80px 80px', background: 'linear-gradient(160deg, #f5f5f7 0%, #e8f0fd 60%, #f0e6ff 100%)', position: 'relative', overflow: 'hidden' }}>
        {/* bg decorations */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,113,227,.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '30%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(191,90,242,.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
          {/* Left */}
          <div style={{ animation: 'fadeUp .8s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,113,227,.08)', border: '1px solid rgba(0,113,227,.15)', borderRadius: 100, padding: '5px 14px', marginBottom: 24, fontSize: 12, fontWeight: 600, color: '#0071e3', letterSpacing: '.04em', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0071e3', display: 'inline-block' }} />
              Official Career &amp; Placement Platform
            </div>

            <h1 style={{ fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 800, lineHeight: 1.08, letterSpacing: '-2px', marginBottom: 20, color: '#1d1d1f' }}>
              Shape Your Future<br />
              <span style={{ color: '#0071e3' }}>with HireLoop</span>
            </h1>

            <p style={{ fontSize: 17, color: '#6e6e73', lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
              Connecting students with global opportunities, internships, and world-class recruiters — powered by AI.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/register" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#1d1d1f', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#fff', textDecoration: 'none', transition: 'all .2s', boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0071e3'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#1d1d1f'; e.currentTarget.style.transform = 'none'; }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#fff" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                Explore Jobs
              </Link>
              <Link to="/login" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: 'rgba(255,255,255,.8)', border: '1.5px solid rgba(0,0,0,.1)', borderRadius: 12, fontSize: 15, fontWeight: 600, color: '#1d1d1f', textDecoration: 'none', transition: 'all .2s', backdropFilter: 'blur(10px)' }}
                onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.8)'}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                Upload Resume
              </Link>
            </div>

            {/* Social proof */}
            <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex' }}>
                {['#0071e3','#30d158','#bf5af2','#f59e0b'].map((c, i) => (
                  <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i ? -8 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {['A','R','S','P'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>1,500+ students placed</div>
                <div style={{ fontSize: 12, color: '#6e6e73' }}>this academic year alone</div>
              </div>
            </div>
          </div>

          {/* Right — Visual card */}
          <div style={{ animation: 'fadeUp .8s .15s ease both', position: 'relative' }}>
            <div style={{ borderRadius: 24, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,.16)', background: '#fff', border: '1px solid rgba(0,0,0,.06)' }}>
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
        <div style={{ background: '#fff', borderTop: '1px solid #f0f0f5', borderBottom: '1px solid #f0f0f5', padding: '28px 80px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: '#1d1d1f', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 13, color: '#6e6e73', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Company logos ── */}
      <Section>
        <div style={{ padding: '48px 80px', background: '#fafafa' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#aeaeb2', letterSpacing: '.1em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 28 }}>Trusted by global industry leaders</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
              {COMPANIES.map(c => (
                <div key={c} style={{ padding: '8px 22px', background: '#fff', border: '1px solid #e8e8ed', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#6e6e73', letterSpacing: '-.01em' }}>{c}</div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ── Features ── */}
      <Section>
        <div style={{ padding: '80px 80px', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', color: '#1d1d1f', marginBottom: 12 }}>Why Choose HireLoop?</h2>
              <p style={{ fontSize: 16, color: '#6e6e73', maxWidth: 500, margin: '0 auto' }}>A robust placement ecosystem designed to accelerate your career trajectory.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
              {FEATURES.map((f, i) => (
                <div key={f.title} style={{ padding: '28px 24px', background: '#f5f5f7', borderRadius: 18, border: '1px solid transparent', transition: 'all .2s', cursor: 'default', animationDelay: `${i * 0.07}s` }}
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
        <div style={{ padding: '80px 80px', background: '#f5f5f7' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 36 }}>
              <div>
                <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: '#1d1d1f', marginBottom: 8 }}>Latest Openings</h2>
                <p style={{ fontSize: 15, color: '#6e6e73' }}>Exclusive opportunities curated for placement students.</p>
              </div>
              <Link to="/register" style={{ fontSize: 14, fontWeight: 600, color: '#0071e3', textDecoration: 'none' }}>View All Jobs →</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {JOBS.map(j => (
                <div key={j.title} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8ed', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18, transition: 'all .2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}>
                  <div style={{ width: 44, height: 44, background: '#f0f0f5', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#1d1d1f', flexShrink: 0 }}>{j.co}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
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
        <div style={{ padding: '80px 80px', background: '#fff' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-1px', color: '#1d1d1f', marginBottom: 8, textAlign: 'center' }}>Student Success Stories</h2>
            <p style={{ fontSize: 15, color: '#6e6e73', textAlign: 'center', marginBottom: 44 }}>Real students, real placements, real impact.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
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
        <div style={{ padding: '80px 80px', background: 'linear-gradient(135deg, #1d1d1f 0%, #0d2137 100%)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(0,113,227,.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 20 }}>Start Today — It's Free</div>
            <h2 style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>Your dream job is one application away.</h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', marginBottom: 36, lineHeight: 1.6 }}>Join 1,500+ students who found their placement through HireLoop this year.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" style={{ padding: '14px 32px', background: '#0071e3', borderRadius: 12, fontSize: 15, fontWeight: 700, color: '#fff', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#005bb5'} onMouseLeave={e => e.currentTarget.style.background = '#0071e3'}>
                Get Started Free
              </Link>
              <Link to="/login" style={{ padding: '14px 28px', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 12, fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.8)', textDecoration: 'none', transition: 'all .2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.4)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'}>
                Already have an account?
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Footer ── */}
      <footer style={{ background: '#111', color: 'rgba(255,255,255,.6)', padding: '52px 80px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#1d1d1f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#1d1d1f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>HireLoop</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 240 }}>The official career placement portal. Connecting students with opportunities that match their potential.</p>
            </div>
            {[
              { title: 'HireLoop', links: ['About Us', 'University Placements', 'Campus Team'] },
              { title: 'Students & Recruiters', links: ['Jobs & Internships', 'Student Profile', 'Hire Talent', 'Post Jobs'] },
              { title: 'Contact', links: ['Email Support', 'LinkedIn', 'Instagram'] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 16 }}>{col.title}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => <a key={l} href="#" style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', textDecoration: 'none', transition: 'color .15s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,.5)'}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: 12 }}>© {new Date().getFullYear()} HireLoop · All rights reserved</div>
            <div style={{ fontSize: 12 }}>
              Crafted with ♥ by <span style={{ color: 'rgba(255,255,255,.8)', fontWeight: 500 }}>Soumya, Udit, Vijjval &amp; Vedant</span>
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy Policy', 'Terms of Service'].map(l => <a key={l} href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', textDecoration: 'none' }}>{l}</a>)}
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: none; } }
        @media (max-width: 900px) {
          .lp-nav-links { display: none; }
        }
        @media (max-width: 768px) {
          section, div[style*="80px 80px"] { padding-left: 20px !important; padding-right: 20px !important; }
          div[style*="gridTemplateColumns: '1fr 1fr'"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: 'repeat(3, 1fr)'"] { grid-template-columns: 1fr !important; }
          div[style*="gridTemplateColumns: '2fr 1fr 1fr 1fr'"] { grid-template-columns: 1fr 1fr !important; }
          h1 { font-size: 36px !important; }
          h2 { font-size: 26px !important; }
        }
      `}</style>
    </div>
  );
}
