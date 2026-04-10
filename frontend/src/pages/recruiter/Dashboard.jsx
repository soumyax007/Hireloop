import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, ChevronRight, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { LoadingCenter, StatusBadge, EmptyState } from '../../components/shared/UI';
import { fmtSalary, timeAgo, parseArr } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export default function RecruiterDashboard() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/company/mine').then(setJobs).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingCenter />;

  const approved = jobs.filter(j => j.status === 'approved');
  const pending = jobs.filter(j => j.status === 'pending');
  const totalApps = jobs.reduce((s, j) => s + (j.app_count || 0), 0);

  const statusColor = s => ({ approved: 'var(--green-text)', pending: 'var(--yellow-text)', rejected: 'var(--red-text)', closed: 'var(--text-2)' })[s] || 'var(--text-2)';

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Welcome, {profile?.company_name || 'Recruiter'} 👋</h1>
          <p className="page-sub">
            {profile?.is_approved
              ? 'Your company is approved — manage your job postings below.'
              : '⏳ Your company is pending placement cell approval.'}
          </p>
        </div>
        {profile?.is_approved && <Link to="/recruiter/post-job" className="btn btn-primary">+ Post New Job</Link>}
      </div>

      {!profile?.is_approved && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          🕐 <strong>Approval Pending.</strong> The placement cell is reviewing your company registration. You'll be notified once approved and can start posting jobs.
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Active Jobs', value: approved.length, icon: '✅', bg: 'var(--green-bg)', c: 'var(--green-text)' },
          { label: 'Pending Review', value: pending.length, icon: '⏳', bg: 'var(--yellow-bg)', c: 'var(--yellow-text)' },
          { label: 'Total Applicants', value: totalApps, icon: '👥', bg: 'var(--accent-bg)', c: 'var(--accent)' },
          { label: 'Total Jobs', value: jobs.length, icon: '📋', bg: 'var(--surface-2)', c: 'var(--text-2)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg, color: s.c, fontSize: 18 }}>{s.icon}</div>
            <div className="stat-val">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Jobs list */}
      <div className="card card-p">
        <div className="section-header">
          <div className="section-title">Your Job Postings</div>
          <Link to="/recruiter/jobs" className="btn btn-ghost btn-sm">Manage all <ChevronRight size={14} /></Link>
        </div>

        {jobs.length === 0 ? (
          <EmptyState icon="📋" title="No jobs posted yet" desc="Post your first job to start receiving applications from students."
            action={profile?.is_approved ? <Link to="/recruiter/post-job" className="btn btn-primary btn-sm">Post First Job</Link> : null} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {jobs.slice(0, 6).map(j => (
              <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{j.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>
                    {j.location || 'Remote'} · {fmtSalary(j.salary_min, j.salary_max)} · {timeAgo(j.created_at)}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{j.app_count || 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>apps</div>
                  </div>
                  <span className={`badge badge-${j.status}`}>{j.status}</span>
                  <Link to="/recruiter/applicants" state={{ jobId: j.id }} className="btn btn-secondary btn-sm">View →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
