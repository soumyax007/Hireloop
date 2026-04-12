import { useState, useEffect } from 'react';
import { Trash2, Pin, Plus, ChevronDown } from 'lucide-react';
import { LoadingCenter, Modal, EmptyState } from '../../components/shared/UI';
import { timeAgo } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_STYLES = {
  info:    { bg: 'var(--accent-bg)',  border: 'rgba(0,113,227,.15)',  dot: 'var(--accent)',    label: 'Info' },
  success: { bg: 'var(--green-bg)',   border: 'rgba(48,209,88,.15)',  dot: 'var(--green)',     label: 'Success' },
  warning: { bg: 'var(--yellow-bg)', border: 'rgba(245,158,11,.15)', dot: 'var(--yellow)',    label: 'Warning' },
  urgent:  { bg: 'var(--red-bg)',    border: 'rgba(255,59,48,.15)',  dot: 'var(--red)',       label: 'Urgent' },
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
      setForm({ title: '', content: '', type: 'info', targetRole: 'all', isPinned: false });
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

  // Sort: pinned first, then by date; urgent first among same pin status
  const sorted = [...announcements].sort((a, b) => {
    if (b.is_pinned !== a.is_pinned) return b.is_pinned - a.is_pinned;
    const urgency = { urgent: 0, warning: 1, info: 2, success: 3 };
    if (urgency[a.type] !== urgency[b.type]) return urgency[a.type] - urgency[b.type];
    return new Date(b.created_at) - new Date(a.created_at);
  });

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">Announcements</h1>
          <p className="page-sub">Post notices to students and recruiters · Sorted by priority</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={15} /> New</button>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon="📢" title="No announcements yet"
          desc="Post your first announcement to students and recruiters."
          action={<button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>Post Now</button>} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(a => {
            const s = TYPE_STYLES[a.type] || TYPE_STYLES.info;
            return (
              <div key={a.id} style={{ display: 'flex', gap: 12, padding: '14px 16px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 'var(--r-lg)', alignItems: 'flex-start' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0, marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
                    {a.is_pinned && <span style={{ fontSize: 10, fontWeight: 700, background: 'var(--red)', color: '#fff', padding: '1px 7px', borderRadius: 'var(--r-full)', display: 'flex', alignItems: 'center', gap: 3 }}><Pin size={8} /> Pinned</span>}
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 'var(--r-full)', background: 'rgba(0,0,0,.06)', color: 'var(--text-2)' }}>{s.label}</span>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', padding: '1px 7px', borderRadius: 'var(--r-full)', background: 'rgba(0,0,0,.04)' }}>→ {a.target_role}</span>
                  </div>
                  {/* Summary only — no full content */}
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{a.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
                    {a.content.length > 100 ? a.content.slice(0, 100) + '…' : a.content}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>By {a.author} · {timeAgo(a.created_at)}</div>
                </div>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => del(a.id)} title="Delete" style={{ flexShrink: 0, color: 'var(--red-text)' }}>
                  <Trash2 size={14} />
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
            <textarea className="input" rows={4} placeholder="Write your announcement…" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {['info','success','warning','urgent'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Visible to</label>
              <select className="input" value={form.targetRole} onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}>
                {['all','student','recruiter'].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input type="checkbox" checked={form.isPinned} onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))} />
            Pin to top
          </label>
        </form>
      </Modal>
    </div>
  );
}
