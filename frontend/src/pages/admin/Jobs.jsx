import { useState, useEffect } from 'react';
import { LoadingCenter, StatusBadge, EmptyState } from '../../components/shared/UI';
import { fmtSalary, fmtDate } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    const params = filter !== 'all' ? `?status=${filter}` : '';
    api.get(`/jobs/admin/all${params}`).then(setJobs).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/jobs/${id}`, { status });
      toast.success(`Job ${status}`);
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <div>
      <div className="section-header">
        <div><h1 className="page-title">All Jobs</h1><p className="page-sub">{jobs.length} total</p></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all','All'],['pending','Pending Approval'],['approved','Approved'],['closed','Closed']].map(([v,l]) => (
          <button key={v} className={`btn btn-sm ${filter===v?'btn-primary':'btn-secondary'}`} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      {jobs.length === 0 ? <EmptyState icon="💼" title="No jobs found" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Job</th><th>Company</th><th>Salary</th><th>Deadline</th><th>Apps</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id}>
                  <td><div style={{ fontWeight: 500 }}>{j.title}</div><div style={{ fontSize: 12, color: 'var(--text-2)' }}>{j.location || 'Remote'}</div></td>
                  <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{j.company_name}</td>
                  <td style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{fmtSalary(j.salary_min, j.salary_max)}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{fmtDate(j.application_deadline)}</td>
                  <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{j.app_count || 0}</td>
                  <td><StatusBadge status={j.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {j.status === 'pending' && <>
                        <button className="btn btn-success btn-sm" onClick={() => updateStatus(j.id, 'approved')}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateStatus(j.id, 'rejected')}>Reject</button>
                      </>}
                      {j.status === 'approved' && <button className="btn btn-secondary btn-sm" onClick={() => updateStatus(j.id, 'closed')}>Close</button>}
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
