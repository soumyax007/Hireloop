import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ClipboardList, Brain, Mic, TrendingUp, Bell, ChevronRight, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingCenter, StatusBadge, EmptyState, ScoreRing } from '../../components/shared/UI';
import { fmtDate, timeAgo, fmtSalary, parseArr } from '../../utils/helpers';
import api from '../../utils/api';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/applications/mine'),
      api.get('/ai/recommendations'),
      api.get('/announcements'),
    ]).then(([a, j, ann]) => {
      setApps(a.slice(0, 5));
      setJobs(j.slice(0, 4));
      setAnnouncements(ann.slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingCenter />;

  const name = profile ? `${profile.first_name} ${profile.last_name}`.trim() : user?.email;
  const counts = {
    applied: apps.filter(a => a.status === 'applied').length,
    shortlisted: apps.filter(a => a.status === 'shortlisted').length,
    interview: apps.filter(a => a.status === 'interview_scheduled').length,
    offer: apps.filter(a => a.status === 'offer').length,
  };

  const annColors = { info: 'announce-info', success: 'announce-success', warning: 'announce-warning', urgent: 'announce-urgent' };

  return (
    <div>
      {/* Welcome header */}
      <div style={{ marginBottom: 28 }}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="page-title">Good morning, {(name || 'there').split(' ')[0]} 👋</h1>
            <p className="page-sub">Here's what's happening with your placement journey.</p>
          </div>
          {!profile?.is_premium && (
            <Link to="/student/upgrade" className="btn btn-secondary" style={{ border: '1.5px solid var(--yellow)', color: 'var(--yellow-text)', background: 'var(--yellow-bg)' }}>
              <Star size={14} /> Upgrade to Premium
            </Link>
          )}
          {profile?.is_premium && (
            <span className="badge badge-premium"><Star size={11} /> Premium Active</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Applied', value: apps.length, icon: '📤', color: 'var(--accent-bg)', iconColor: 'var(--accent)' },
          { label: 'Shortlisted', value: counts.shortlisted, icon: '⭐', color: 'var(--yellow-bg)', iconColor: 'var(--yellow-text)' },
          { label: 'Interviews', value: counts.interview, icon: '💬', color: 'var(--purple-bg)', iconColor: 'var(--purple-text)' },
          { label: 'Offers', value: counts.offer, icon: '🎉', color: 'var(--green-bg)', iconColor: 'var(--green-text)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.color, color: s.iconColor }}>{s.icon}</div>
            <div className="stat-val">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* Recent Applications */}
        <div className="card card-p">
          <div className="section-header">
            <div>
              <div className="section-title">Recent Applications</div>
              <div className="section-sub">{apps.length} total</div>
            </div>
            <Link to="/student/applications" className="btn btn-ghost btn-sm">View all <ChevronRight size={14}/></Link>
          </div>
          {apps.length === 0 ? (
            <EmptyState icon="📋" title="No applications yet" desc="Browse and apply to jobs to get started." action={<Link to="/student/jobs" className="btn btn-primary btn-sm">Browse Jobs</Link>} />
          ) : apps.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 1 }} className="truncate">{a.job_title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.company_name} • {timeAgo(a.applied_at)}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>

        {/* Announcements */}
        <div className="card card-p">
          <div className="section-header">
            <div>
              <div className="section-title">Announcements</div>
              <div className="section-sub">From placement cell</div>
            </div>
            <Bell size={16} color="var(--text-3)" />
          </div>
          {announcements.length === 0 ? (
            <EmptyState icon="📢" title="No announcements" desc="Check back later." />
          ) : announcements.map(a => (
            <div key={a.id} className="announce-card" style={{ padding: '12px 0', background: 'none', border: 'none', borderBottom: '1px solid var(--border-light)', borderRadius: 0, marginBottom: 0 }}>
              <div className={`announce-dot ${annColors[a.type] || 'announce-info'}`} />
              <div>
                <div style={{ fontWeight: 500, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {a.title}
                  {a.is_pinned ? <span className="badge badge-red" style={{ fontSize: 9 }}>Pinned</span> : null}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.5 }}>{a.content.slice(0, 100)}{a.content.length > 100 ? '…' : ''}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{timeAgo(a.created_at)} · {a.author}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Jobs */}
      <div className="card card-p">
        <div className="section-header">
          <div>
            <div className="section-title">Recommended for You</div>
            <div className="section-sub">Based on your skills and profile</div>
          </div>
          <Link to="/student/jobs" className="btn btn-ghost btn-sm">All jobs <ChevronRight size={14}/></Link>
        </div>
        {jobs.length === 0 ? (
          <EmptyState icon="🎯" title="No recommendations yet" desc="Complete your profile to get personalized job matches." action={<Link to="/student/jobs" className="btn btn-primary btn-sm">Browse Jobs</Link>} />
        ) : (
          <div className="grid-2" style={{ gap: 12 }}>
            {jobs.map(j => {
              const skills = parseArr(j.required_skills);
              return (
                <Link to="/student/jobs" key={j.id} className="job-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div className="job-card-top">
                    <div className="company-logo">{(j.company_name || 'C')[0]}</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="job-title truncate">{j.title}</div>
                      <div className="job-company">{j.company_name}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
                      <span className="badge badge-blue">{j.match_score}% match</span>
                    </div>
                  </div>
                  <div className="job-meta" style={{ marginBottom: 10 }}>
                    <span>📍 {j.location || 'Remote'}</span>
                    <span>💰 {fmtSalary(j.salary_min, j.salary_max)}</span>
                  </div>
                  <div className="tags-row">
                    {skills.slice(0,3).map(s => <span key={s} className="tag">{s}</span>)}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Quick Actions */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        {[
          { to: '/student/resume-ai', icon: '🧠', title: 'Analyse My Resume', desc: 'Get ATS score and actionable improvements', color: 'var(--accent-bg)', btn: 'Analyse Now' },
          { to: '/student/mock-interview', icon: '🎤', title: 'Practice Interview', desc: 'AI-powered mock interview with instant feedback', color: 'var(--purple-bg)', btn: 'Start Session' },
        ].map(c => (
          <Link key={c.to} to={c.to} style={{ textDecoration: 'none' }}>
            <div className="card card-p" style={{ background: c.color, border: 'none', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform=''}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>{c.desc}</div>
              <span className="btn btn-primary btn-sm">{c.btn} →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
