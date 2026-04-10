import { useState, useEffect } from 'react';
import { MapPin, Calendar, TrendingUp } from 'lucide-react';
import { LoadingCenter, StatusBadge, EmptyState } from '../../components/shared/UI';
import { fmtSalary, fmtDate, timeAgo } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const STEPS = ['applied','shortlisted','interview_scheduled','offer'];
const STEP_LABELS = { applied:'Applied', shortlisted:'Shortlisted', interview_scheduled:'Interview', offer:'Offer' };

function StatusPipeline({ current }) {
  const idx = STEPS.indexOf(current);
  if (current === 'rejected') return <span className="badge badge-rejected">Rejected</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {STEPS.map((s, i) => {
        const done = i <= idx;
        const active = i === idx;
        return (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: active ? 28 : 20, height: 20, borderRadius: 10,
              background: done ? 'var(--accent)' : 'var(--border-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .3s', fontSize: 10, color: done ? '#fff' : 'var(--text-3)',
              fontWeight: 600
            }}>{done ? (active ? '●' : '✓') : ''}</div>
            {i < STEPS.length - 1 && <div style={{ width: 16, height: 2, background: done && i < idx ? 'var(--accent)' : 'var(--border-light)', borderRadius: 1 }} />}
          </div>
        );
      })}
    </div>
  );
}

export default function Applications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/applications/mine').then(setApps).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const STATUS_TABS = ['all', 'applied', 'shortlisted', 'interview_scheduled', 'offer', 'rejected'];
  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter);

  if (loading) return <LoadingCenter />;

  const counts = STATUS_TABS.reduce((acc, s) => ({ ...acc, [s]: s === 'all' ? apps.length : apps.filter(a => a.status === s).length }), {});

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-sub">{apps.length} total applications</p>
        </div>
        <Link to="/student/jobs" className="btn btn-primary btn-sm">+ Apply to Jobs</Link>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Applied', val: counts.applied, c: 'var(--text-2)' },
          { label: 'Shortlisted', val: counts.shortlisted, c: 'var(--accent)' },
          { label: 'Interviews', val: counts.interview_scheduled, c: 'var(--yellow-text)' },
          { label: 'Offers', val: counts.offer, c: 'var(--green-text)' },
          { label: 'Rejected', val: counts.rejected, c: 'var(--red-text)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 18, color: s.c }}>{s.val}</span>
            <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(s => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(s)}>
            {s === 'all' ? 'All' : STEP_LABELS[s] || s} {counts[s] > 0 && `(${counts[s]})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title={filter === 'all' ? 'No applications yet' : `No ${filter} applications`} desc="Apply to jobs to track your placement journey." action={<Link to="/student/jobs" className="btn btn-primary btn-sm">Browse Jobs</Link>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(a => (
            <div key={a.id} className="card card-p">
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="company-logo" style={{ width: 44, height: 44 }}>{(a.company_name||'C')[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>{a.job_title}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 2 }}>{a.company_name} · {a.industry}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--text-2)', margin: '8px 0' }}>
                    {a.location && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><MapPin size={11}/> {a.location}</span>}
                    <span>💰 {fmtSalary(a.salary_min, a.salary_max)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={11}/> Applied {timeAgo(a.applied_at)}</span>
                    {a.ats_score > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><TrendingUp size={11}/> ATS: {a.ats_score}%</span>}
                  </div>

                  <StatusPipeline current={a.status} />

                  {a.interview_slot && (
                    <div className="alert alert-info" style={{ marginTop: 10, fontSize: 12, padding: '8px 12px' }}>
                      📅 Interview scheduled: <strong>{a.interview_slot}</strong>
                    </div>
                  )}
                  {a.notes && (
                    <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-2)', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: 'var(--r-md)' }}>
                      💬 {a.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
