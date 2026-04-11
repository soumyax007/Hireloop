import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Users, ChevronRight, Plus, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LoadingCenter, StatusBadge, EmptyState } from '../../components/shared/UI';
import { fmtSalary, timeAgo } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', borderRadius: 'var(--r-md)', padding: '8px 12px', boxShadow: 'var(--sh-sm)', fontSize: 13 }}>
      <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>
      <div style={{ color: 'var(--accent)' }}>{payload[0].value} applicants</div>
    </div>
  );
  return null;
};

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

  // Chart data: top 6 jobs by applicants
  const chartData = jobs
    .filter(j => j.app_count > 0)
    .sort((a, b) => b.app_count - a.app_count)
    .slice(0, 6)
    .map(j => ({ name: j.title.length > 14 ? j.title.slice(0, 14) + '…' : j.title, apps: j.app_count || 0 }));

  const stats = [
    { label: 'Active Jobs', value: approved.length, icon: CheckCircle, bg: 'var(--green-bg)', color: 'var(--green-text)' },
    { label: 'Pending Review', value: pending.length, icon: Clock, bg: 'var(--yellow-bg)', color: 'var(--yellow-text)' },
    { label: 'Total Applicants', value: totalApps, icon: Users, bg: 'var(--accent-bg)', color: 'var(--accent)' },
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase, bg: 'var(--surface-2)', color: 'var(--text-2)' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Welcome back, {profile?.company_name || 'Recruiter'} 👋</h1>
          <p className="page-sub">
            {profile?.is_approved ? 'Manage your jobs and track applicants below.' : '⏳ Your company is pending placement cell approval.'}
          </p>
        </div>
        {profile?.is_approved && (
          <Link to="/recruiter/post-job" className="btn btn-primary" style={{ gap: 6 }}>
            <Plus size={15} /> Post New Job
          </Link>
        )}
      </div>

      {!profile?.is_approved && (
        <div className="alert alert-warning" style={{ marginBottom: 24 }}>
          🕐 <strong>Approval Pending.</strong> The placement cell is reviewing your registration. You'll be notified once approved.
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        {stats.map(s => (
          <div className="stat-card" key={s.label} style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="stat-icon" style={{ background: s.bg, marginBottom: 14 }}>
              <s.icon size={18} color={s.color} />
            </div>
            <div className="stat-val" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: jobs.length > 0 && chartData.length > 0 ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 20 }}>
        {/* Jobs list */}
        <div className="card card-p">
          <div className="section-header" style={{ marginBottom: 16 }}>
            <div className="section-title" style={{ fontSize: 15 }}>Your Postings</div>
            <Link to="/recruiter/jobs" className="btn btn-ghost btn-sm">See all <ChevronRight size={13} /></Link>
          </div>
          {jobs.length === 0 ? (
            <EmptyState icon="📋" title="No jobs yet" desc="Post your first job to start receiving applications." action={profile?.is_approved ? <Link to="/recruiter/post-job" className="btn btn-primary btn-sm"><Plus size={13} /> Post Job</Link> : null} />
          ) : (
            <div>
              {jobs.slice(0, 5).map((j, i) => (
                <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < Math.min(jobs.length, 5) - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{j.location || 'Remote'} · {timeAgo(j.created_at)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>{j.app_count || 0}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)' }}>apps</div>
                    </div>
                    <span className={`badge badge-${j.status}`}>{j.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <div className="card card-p">
            <div style={{ marginBottom: 16 }}>
              <div className="section-title" style={{ fontSize: 15 }}>Applicants by Job</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>Top {chartData.length} most applied</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)', radius: 6 }} />
                <Bar dataKey="apps" radius={[6, 6, 0, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={i === 0 ? 'var(--accent)' : 'var(--accent-bg)'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {profile?.is_approved && (
        <div className="card card-p">
          <div className="section-title" style={{ fontSize: 15, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to="/recruiter/post-job" className="btn btn-primary btn-sm"><Plus size={13} /> Post a Job</Link>
            <Link to="/recruiter/applicants" className="btn btn-secondary btn-sm"><Users size={13} /> View Applicants</Link>
            <Link to="/recruiter/jobs" className="btn btn-secondary btn-sm"><Briefcase size={13} /> Manage Jobs</Link>
          </div>
        </div>
      )}
    </div>
  );
}
