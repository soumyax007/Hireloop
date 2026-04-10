import { useState, useEffect } from 'react';
import { Trash2, Pin, Plus } from 'lucide-react';
import { LoadingCenter, Modal, EmptyState } from '../../components/shared/UI';
import { timeAgo } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_STYLES = {
  info: { bg: 'var(--accent-bg)', border: 'rgba(0,113,227,.2)', dot: 'var(--accent)' },
  success: { bg: 'var(--green-bg)', border: 'rgba(48,209,88,.2)', dot: 'var(--green)' },
  warning: { bg: 'var(--yellow-bg)', border: 'rgba(245,158,11,.2)', dot: 'var(--yellow)' },
  urgent: { bg: 'var(--red-bg)', border: 'rgba(255,59,48,.2)', dot: 'var(--red)' },
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', type: 'info', targetRole: 'all', isPinned: false });
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/announcements').then(setAnnouncements).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const save = async e => {
    e.preventDefault();
    if (!form.title || !form.content) { toast.error('Title and content required'); return; }
    setSaving(true);
    try {
      await api.post('/admin/announcements', form);
      toast.success('Announcement posted!');
      setShowModal(false);
      setForm({ title:'', content:'', type:'info', targetRole:'all', isPinned:false });
      load();
    } catch (e) { toast.error(e.error || 'Failed to post'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!confirm('Delete this announcement?')) return;
    try { await api.delete(`/admin/announcements/${id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  if (loading) return <LoadingCenter />;

  return (
    <div>
      <div className="section-header">
        <div><h1 className="page-title">Announcements</h1><p className="page-sub">Post notices to students and recruiters</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> New Announcement</button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState icon="📢" title="No announcements yet" desc="Post your first announcement to students and recruiters."
          action={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>Post Now</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {announcements.map(a => {
            const style = TYPE_STYLES[a.type] || TYPE_STYLES.info;
            return (
              <div key={a.id} style={{ display: 'flex', gap: 14, padding: 18, background: style.bg, border: `1px solid ${style.border}`, borderRadius: 'var(--r-lg)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: style.dot, flexShrink: 0, marginTop: 5 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{a.title}</span>
                    {a.is_pinned ? <span className="badge badge-red" style={{ fontSize: 9 }}><Pin size={8} style={{ display: 'inline' }} /> Pinned</span> : null}
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{a.target_role}</span>
                    <span className="badge badge-gray" style={{ fontSize: 10 }}>{a.type}</span>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-1)', lineHeight: 1.6, marginBottom: 8 }}>{a.content}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>By {a.author} · {timeAgo(a.created_at)}</div>
                </div>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => del(a.id)} style={{ flexShrink: 0, color: 'var(--red)' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Announcement" size="sm"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button className="btn btn-primary" form="ann-form" type="submit" disabled={saving}>{saving ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : 'Post'}</button></>}>
        <form id="ann-form" onSubmit={save}>
          <div className="form-group">
            <label className="label">Title *</label>
            <input className="input" placeholder="Announcement title…" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label">Content *</label>
            <textarea className="input" rows={4} placeholder="Write your announcement here…" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['info','success','warning','urgent'].map(t => <option key={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Visible to</label>
              <select className="input" value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}>
                {['all','student','recruiter'].map(r => <option key={r} style={{ textTransform: 'capitalize' }}>{r}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" id="pinned" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} />
            <label htmlFor="pinned" className="label" style={{ margin: 0 }}>Pin to top</label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
