import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LoadingCenter, StatusBadge, EmptyState } from '../../components/shared/UI';
import { fmtSalary, fmtDate, parseArr } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.get('/jobs/company/mine').then(setJobs).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const closeJob = async id => {
    if (!confirm('Close this job? No more applications will be accepted.')) return;
    try {
      await api.patch(`/jobs/${id}`, { status: 'closed' });
      toast.success('Job closed'); load();
    } catch { toast.error('Failed to close job'); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">My Jobs</h1>
          <p className="page-sub">{jobs.length} total postings</p>
        </div>
        <Link to="/recruiter/post-job" className="btn btn-primary">+ Post New Job</Link>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon="📋" title="No jobs yet" desc="Post your first job to start recruiting talent."
          action={<Link to="/recruiter/post-job" className="btn btn-primary btn-sm">Post Job</Link>} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job Title</th><th>Location</th><th>Salary</th><th>Deadline</th>
                <th>Applicants</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{j.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{j.job_type} · Min CGPA: {j.min_cgpa || 'Any'}</div>
                  </td>
                  <td style={{ color: 'var(--text-2)' }}>{j.location || '—'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{fmtSalary(j.salary_min, j.salary_max)}</td>
                  <td style={{ color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{fmtDate(j.application_deadline)}</td>
                  <td>
                    <Link to="/recruiter/applicants" state={{ jobId: j.id }} style={{ fontWeight: 700, color: 'var(--accent)', fontSize: 16 }}>
                      {j.app_count || 0}
                    </Link>
                  </td>
                  <td><StatusBadge status={j.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to="/recruiter/applicants" state={{ jobId: j.id }} className="btn btn-secondary btn-sm">View Apps</Link>
                      {j.status === 'approved' && (
                        <button className="btn btn-danger btn-sm" onClick={() => closeJob(j.id)}>Close</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
