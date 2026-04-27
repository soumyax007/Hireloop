import { useState, useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { timeAgo } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

export default function Topbar({ title, onMenuClick, sidebarOpen }) {
  const { user } = useAuth();
  const nav = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const load = async () => {
    try {
      const d = await api.get('/notifications');
      setNotifs(d.notifications || []);
      setUnread(d.unreadCount || 0);
    } catch {}
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setUnread(0); setNotifs(n => n.map(x => ({ ...x, is_read: 1 })));
  };

  const dismiss = async (e, id) => {
    e.stopPropagation();
    await api.delete(`/notifications/${id}`);
    setNotifs(n => n.filter(x => x.id !== id));
    setUnread(c => Math.max(0, c - 1));
  };

  const handleClick = async (notif) => {
    // Mark as read
    if (!notif.is_read) {
      await api.patch(`/notifications/${notif.id}/read`);
      setNotifs(n => n.map(x => x.id === notif.id ? { ...x, is_read: 1 } : x));
      setUnread(c => Math.max(0, c - 1));
    }
    setOpen(false);

    // Navigate based on link
    if (notif.link) {
      try {
        const meta = JSON.parse(notif.metadata || '{}');
        if (notif.link.includes('/recruiter/applicants') && meta.jobId) {
          nav(`/recruiter/applicants?jobId=${meta.jobId}`);
        } else if (notif.link.includes('/student/applications')) {
          nav('/student/applications');
        } else if (notif.link.includes('/student/jobs') && meta.jobId) {
          nav(`/student/jobs?jobId=${meta.jobId}`);
        } else {
          nav(notif.link);
        }
      } catch { nav(notif.link); }
    }
  };

  const typeIcon = t => ({ success: '✅', warning: '⚠️', info: 'ℹ️', urgent: '🚨' })[t] || '🔔';

  return (
    <div className="topbar">
      <button className={`topbar-hamburger${sidebarOpen ? ' is-open' : ''}`} onClick={onMenuClick} aria-label="Toggle menu">
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>
      <span className="topbar-title">{title}</span>
      <div className="topbar-actions">
        <div ref={ref} style={{ position: 'relative' }}>
          <button className="topbar-notif-btn" onClick={() => setOpen(o => !o)} aria-label="Notifications">
            <Bell size={17} />
            {unread > 0 && <span className="notif-dot" />}
          </button>

          {open && (
            <div className="notif-dropdown anim-scale">
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  Notifications {unread > 0 && <span style={{ background: 'var(--red)', color: '#fff', fontSize: 10, borderRadius: 10, padding: '1px 6px', marginLeft: 4 }}>{unread}</span>}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {unread > 0 && (
                    <button className="btn-text" onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                      <CheckCheck size={13} /> Mark all read
                    </button>
                  )}
                  <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* List */}
              <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>🔔</div>
                    No notifications yet
                  </div>
                ) : notifs.slice(0, 15).map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      display: 'flex', gap: 10, padding: '11px 14px',
                      borderBottom: '1px solid var(--border-light)',
                      background: !n.is_read ? 'var(--accent-bg)' : 'var(--surface)',
                      cursor: n.link ? 'pointer' : 'default',
                      transition: 'background .1s',
                      alignItems: 'flex-start'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = !n.is_read ? '#ddeefa' : 'var(--surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = !n.is_read ? 'var(--accent-bg)' : 'var(--surface)'}
                  >
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{typeIcon(n.type)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: !n.is_read ? 600 : 500, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.4, marginBottom: 3 }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {timeAgo(n.created_at)}
                        {n.link && <span style={{ color: 'var(--accent)', fontSize: 11 }}>· Tap to view →</span>}
                      </div>
                    </div>
                    <button
                      onClick={e => dismiss(e, n.id)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2, flexShrink: 0, display: 'flex', alignItems: 'center' }}
                      title="Dismiss"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
