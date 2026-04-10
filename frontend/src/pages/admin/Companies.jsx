import { useState, useEffect } from 'react';
import { LoadingCenter, EmptyState } from '../../components/shared/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = () => {
    const params = filter !== 'all' ? `?approved=${filter === 'approved' ? 1 : 0}` : '';
    api.get(`/admin/companies${params}`).then(setCompanies).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { setLoading(true); load(); }, [filter]);

  const approve = async (id, val) => {
    try {
      await api.patch(`/admin/companies/${id}/approve`, { approved: val });
      toast.success(val ? 'Company approved ✅' : 'Company rejected');
      load();
    } catch { toast.error('Action failed'); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <div>
      <div className="section-header">
        <div><h1 className="page-title">Companies</h1><p className="page-sub">{companies.length} registered</p></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all','All'],['pending','Pending'],['approved','Approved']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm ${filter === v ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(v)}>{l}</button>
        ))}
      </div>

      {companies.length === 0 ? <EmptyState icon="🏢" title="No companies" desc="Company registrations will appear here." /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Company</th><th>Industry</th><th>Jobs Posted</th><th>Website</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {companies.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{c.company_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{c.email}</div>
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{c.industry || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{c.job_count || 0}</td>
                  <td>
                    {c.website ? <a href={c.website} target="_blank" rel="noreferrer" style={{ fontSize: 12 }}>Visit ↗</a> : '—'}
                  </td>
                  <td>
                    <span className={`badge ${c.is_approved ? 'badge-approved' : 'badge-pending'}`}>
                      {c.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!c.is_approved && <button className="btn btn-success btn-sm" onClick={() => approve(c.id, true)}>✓ Approve</button>}
                      {c.is_approved && <button className="btn btn-danger btn-sm" onClick={() => approve(c.id, false)}>Revoke</button>}
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
