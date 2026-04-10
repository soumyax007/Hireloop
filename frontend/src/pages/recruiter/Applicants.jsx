import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Filter, ChevronDown, GraduationCap, Mail } from 'lucide-react';
import { LoadingCenter, StatusBadge, Modal, EmptyState } from '../../components/shared/UI';
import { parseArr } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['applied','shortlisted','interview_scheduled','offer','rejected'];
const STATUS_LABELS = { applied:'Applied', shortlisted:'Shortlist', interview_scheduled:'Schedule Interview', offer:'Extend Offer', rejected:'Reject' };
const STATUS_BTN = { shortlisted:'btn-secondary', interview_scheduled:'btn-secondary', offer:'btn-success', rejected:'btn-danger' };

export default function Applicants() {
  const loc = useLocation();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(loc.state?.jobId || '');
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ status: '', minCgpa: '', branch: '' });
  const [selected, setSelected] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: '', notes: '', interviewSlot: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api.get('/jobs/company/mine').then(j => {
      setJobs(j);
      if (!selectedJob && j.length > 0) setSelectedJob(j[0].id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedJob) return;
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.minCgpa) params.set('minCgpa', filters.minCgpa);
    if (filters.branch) params.set('branch', filters.branch);
    api.get(`/applications/job/${selectedJob}?${params}`).then(setApps).catch(() => {}).finally(() => setLoading(false));
  }, [selectedJob, filters]);

  const updateStatus = async () => {
    if (!statusForm.status || !statusModal) return;
    setUpdating(true);
    try {
      await api.patch(`/applications/${statusModal.id}/status`, statusForm);
      toast.success(`Status updated to ${statusForm.status}`);
      setStatusModal(null);
      setApps(prev => prev.map(a => a.id === statusModal.id ? { ...a, status: statusForm.status } : a));
    } catch (e) { toast.error(e.error || 'Update failed'); }
    finally { setUpdating(false); }
  };

  const openStatus = (app) => {
    setStatusModal(app);
    setStatusForm({ status: app.status, notes: app.notes || '', interviewSlot: app.interview_slot || '' });
  };

  const branches = [...new Set(apps.map(a => a.branch).filter(Boolean))];

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Applicants</h1>
          <p className="page-sub">{apps.length} candidates</p>
        </div>
      </div>

      {/* Job selector */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <label className="label" style={{ margin: 0, whiteSpace: 'nowrap' }}>Job:</label>
        <select className="input" style={{ maxWidth: 320 }} value={selectedJob} onChange={e => setSelectedJob(e.target.value)}>
          <option value="">Select a job…</option>
          {jobs.map(j => <option key={j.id} value={j.id}>{j.title} ({j.app_count || 0} apps)</option>)}
        </select>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={14} color="var(--text-3)" />
        <select className="input input-sm" style={{ width: 160 }} value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
        </select>
        <select className="input input-sm" style={{ width: 160 }} value={filters.branch} onChange={e => setFilters(f => ({ ...f, branch: e.target.value }))}>
          <option value="">All Branches</option>
          {branches.map(b => <option key={b}>{b}</option>)}
        </select>
        <input className="input input-sm" style={{ width: 120 }} type="number" placeholder="Min CGPA" step="0.1" min="0" max="10"
          value={filters.minCgpa} onChange={e => setFilters(f => ({ ...f, minCgpa: e.target.value }))} />
        {(filters.status || filters.branch || filters.minCgpa) && (
          <button className="btn btn-ghost btn-sm" onClick={() => setFilters({ status:'', minCgpa:'', branch:'' })}>✕ Clear filters</button>
        )}
      </div>

      {!selectedJob ? (
        <EmptyState icon="💼" title="Select a job" desc="Choose a job posting above to view its applicants." />
      ) : loading ? <LoadingCenter /> : apps.length === 0 ? (
        <EmptyState icon="👥" title="No applicants yet" desc="Applications will appear here once students apply to this job." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Candidate</th><th>Branch / Batch</th><th>CGPA</th>
                <th>ATS Score</th><th>Applied</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map(a => {
                const skills = parseArr(a.skills);
                return (
                  <tr key={a.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(a)}>
                    <td>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
                          {(a.first_name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{a.first_name} {a.last_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{a.branch}<br /><span style={{ fontSize: 11 }}>Batch {a.batch}</span></td>
                    <td>
                      <span style={{ fontWeight: 700, color: a.cgpa >= 8 ? 'var(--green-text)' : a.cgpa >= 7 ? 'var(--yellow-text)' : 'var(--red-text)' }}>
                        {a.cgpa}
                      </span>
                    </td>
                    <td>
                      {a.ats_score > 0 ? (
                        <span style={{ fontWeight: 600, color: a.ats_score >= 75 ? 'var(--green-text)' : a.ats_score >= 50 ? 'var(--yellow-text)' : 'var(--red-text)' }}>
                          {a.ats_score}%
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{new Date(a.applied_at).toLocaleDateString()}</td>
                    <td onClick={e => e.stopPropagation()}><StatusBadge status={a.status} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openStatus(a)}>Update →</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate detail modal */}
      <Modal open={!!selected && !statusModal} onClose={() => setSelected(null)} title="Candidate Profile" size="md">
        {selected && (() => {
          const skills = parseArr(selected.skills);
          return (
            <div>
              <div style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
                  {(selected.first_name?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 17 }}>{selected.first_name} {selected.last_name}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 6 }}>{selected.email}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span className="badge badge-blue">{selected.branch}</span>
                    <span className="badge badge-gray">Batch {selected.batch}</span>
                    {selected.is_premium ? <span className="badge badge-premium">⭐ Premium</span> : null}
                  </div>
                </div>
              </div>
              <div className="grid-2" style={{ marginBottom: 16 }}>
                {[['CGPA', selected.cgpa], ['ATS Score', selected.ats_score ? `${selected.ats_score}%` : '—'], ['Status', selected.status]].map(([l, v]) => (
                  <div key={l} style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>{l}</div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              {skills.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Skills</div>
                  <div className="tags-row">{skills.map(s => <span key={s} className="tag">{s}</span>)}</div>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10 }}>
                {selected.resume_url && <a href={selected.resume_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">📄 Resume</a>}
                {selected.linkedin_url && <a href={selected.linkedin_url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">LinkedIn ↗</a>}
                <button className="btn btn-primary btn-sm" onClick={() => { setSelected(null); openStatus(selected); }}>Update Status →</button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Status update modal */}
      <Modal open={!!statusModal} onClose={() => setStatusModal(null)} title="Update Application Status" size="sm"
        footer={<><button className="btn btn-secondary" onClick={() => setStatusModal(null)}>Cancel</button><button className="btn btn-primary" onClick={updateStatus} disabled={updating}>{updating ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : 'Update'}</button></>}>
        {statusModal && (
          <div>
            <div style={{ marginBottom: 16, fontWeight: 500 }}>{statusModal.first_name} {statusModal.last_name}</div>
            <div className="form-group">
              <label className="label">New Status</label>
              <select className="input" value={statusForm.status} onChange={e => setStatusForm(f => ({ ...f, status: e.target.value }))}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>)}
              </select>
            </div>
            {statusForm.status === 'interview_scheduled' && (
              <div className="form-group">
                <label className="label">Interview Slot</label>
                <input className="input" type="datetime-local" value={statusForm.interviewSlot} onChange={e => setStatusForm(f => ({ ...f, interviewSlot: e.target.value }))} />
              </div>
            )}
            <div className="form-group">
              <label className="label">Notes to candidate <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span></label>
              <textarea className="input" rows={3} placeholder="Add any notes or feedback…" value={statusForm.notes} onChange={e => setStatusForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
            <div className="alert alert-info" style={{ fontSize: 12 }}>
              📧 The student will be notified of this status change.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
