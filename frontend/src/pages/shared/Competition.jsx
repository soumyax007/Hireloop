import { useState, useEffect } from 'react';
import { Trophy, Clock, Users, Plus, CheckCircle, Calendar } from 'lucide-react';
import { LoadingCenter, EmptyState, Modal } from '../../components/shared/UI';
import { useAuth } from '../../contexts/AuthContext';
import { fmtDate } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_COLORS = {
  coding: { bg: 'var(--accent-bg)', color: 'var(--accent)', label: 'Coding' },
  aptitude: { bg: 'var(--yellow-bg)', color: 'var(--yellow-text)', label: 'Aptitude' },
  case_study: { bg: 'var(--purple-bg)', color: 'var(--purple-text)', label: 'Case Study' },
  hackathon: { bg: 'var(--green-bg)', color: 'var(--green-text)', label: 'Hackathon' },
};

export default function Competition() {
  const { user } = useAuth();
  const [comps, setComps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', type: 'coding', startTime: '', endTime: '', prize: '', maxParticipants: '', rules: '' });

  const load = () => api.get('/competitions').then(setComps).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const register = async (id) => {
    setRegistering(id);
    try {
      await api.post(`/competitions/${id}/register`);
      toast.success('Registered successfully!');
      load();
    } catch (e) { toast.error(e.error || 'Failed to register'); }
    finally { setRegistering(''); }
  };

  const createComp = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/competitions', { ...form, maxParticipants: parseInt(form.maxParticipants) || 0 });
      toast.success('Competition created!');
      setShowCreate(false);
      setForm({ title: '', description: '', type: 'coding', startTime: '', endTime: '', prize: '', maxParticipants: '', rules: '' });
      load();
    } catch (e) { toast.error(e.error || 'Failed'); }
    finally { setSaving(false); }
  };

  const deleteComp = async (id) => {
    if (!confirm('Delete this competition?')) return;
    await api.delete(`/competitions/${id}`);
    toast.success('Deleted');
    load();
  };

  const approveComp = async (id) => {
    await api.patch(`/competitions/${id}/approve`);
    toast.success('Approved!');
    load();
  };

  const getStatus = (c) => {
    if (c.status === 'pending') return { label: 'Pending Approval', color: 'var(--yellow-text)', bg: 'var(--yellow-bg)' };
    const now = new Date();
    if (c.start_time && new Date(c.start_time) > now) return { label: 'Upcoming', color: 'var(--accent)', bg: 'var(--accent-bg)' };
    if (c.end_time && new Date(c.end_time) < now) return { label: 'Ended', color: 'var(--text-2)', bg: 'var(--surface-2)' };
    return { label: 'Live Now', color: 'var(--green-text)', bg: 'var(--green-bg)' };
  };

  if (loading) return <LoadingCenter />;

  return (
    <div>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Competitions</h1>
          <p className="page-sub">Compete, learn, and win — open to all HireLoop members</p>
        </div>
        {['admin', 'recruiter'].includes(user?.role) && (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> Create Competition
          </button>
        )}
      </div>

      {comps.length === 0 ? (
        <EmptyState icon="🏆" title="No competitions yet"
          desc="Check back soon for upcoming competitions and challenges."
          action={['admin', 'recruiter'].includes(user?.role) ? <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={13} /> Create First</button> : null}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {comps.map(c => {
            const tc = TYPE_COLORS[c.type] || TYPE_COLORS.coding;
            const status = getStatus(c);
            const isFull = c.max_participants > 0 && c.participant_count >= c.max_participants;
            return (
              <div key={c.id} className="card card-p" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-full)', background: tc.bg, color: tc.color }}>{tc.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-full)', background: status.bg, color: status.color }}>{status.label}</span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{c.title}</h3>
                  </div>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>🏆</div>
                </div>

                {/* Description */}
                {c.description && <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.5 }}>{c.description}</p>}

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c.start_time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                      <Calendar size={13} /> {fmtDate(c.start_time)} {c.end_time ? `— ${fmtDate(c.end_time)}` : ''}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
                    <Users size={13} /> {c.participant_count} registered{c.max_participants > 0 ? ` / ${c.max_participants} max` : ''}
                  </div>
                  {c.prize && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--yellow-text)', background: 'var(--yellow-bg)', padding: '4px 10px', borderRadius: 'var(--r-full)', display: 'inline-flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                      🎁 {c.prize}
                    </div>
                  )}
                </div>

                {/* Rules */}
                {c.rules && (
                  <div style={{ fontSize: 12, color: 'var(--text-2)', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: '8px 10px', lineHeight: 1.5 }}>
                    <strong>Rules:</strong> {c.rules}
                  </div>
                )}

                {/* Action */}
                <div style={{ marginTop: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
                  {user?.role === 'student' && (
                    c.is_registered ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--green-text)', fontWeight: 600 }}>
                        <CheckCircle size={15} /> Registered
                      </div>
                    ) : isFull ? (
                      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Competition full</span>
                    ) : status.label === 'Ended' ? (
                      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Competition ended</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => register(c.id)} disabled={registering === c.id}>
                        {registering === c.id ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : 'Register Now'}
                      </button>
                    )
                  )}
                  {user?.role !== 'student' && (
                    <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
                      {c.participant_count} participant{c.participant_count !== 1 ? 's' : ''}
                    </span>
                  )}
                  {['admin', 'recruiter'].includes(user?.role) && (
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                      {user?.role === 'admin' && c.status === 'pending' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => approveComp(c.id)}>Approve</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => deleteComp(c.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Competition" size="md"
        footer={<><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="btn btn-primary" form="comp-form" type="submit" disabled={saving}>{saving ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : 'Create'}</button></>}>
        <form id="comp-form" onSubmit={createComp}>
          <div className="form-group">
            <label className="label">Title *</label>
            <input className="input" placeholder="Hackathon 2025" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Description</label>
            <textarea className="input" rows={3} placeholder="What is this competition about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['coding','aptitude','case_study','hackathon'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Max Participants <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(0 = unlimited)</span></label>
              <input className="input" type="number" min="0" placeholder="0" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Start Date & Time</label>
              <input className="input" type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">End Date & Time</label>
              <input className="input" type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="label">Prize / Reward</label>
            <input className="input" placeholder="₹10,000 cash + internship offer" value={form.prize} onChange={e => setForm(f => ({ ...f, prize: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Rules</label>
            <textarea className="input" rows={2} placeholder="Competition rules and guidelines…" value={form.rules} onChange={e => setForm(f => ({ ...f, rules: e.target.value }))} />
          </div>
        </form>
      </Modal>
    </div>
  );
}
