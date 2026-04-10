import { useState, useEffect, useRef } from 'react';
import { Menu, Bell, X, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { timeAgo } from '../../utils/helpers';
import api from '../../utils/api';

export default function Topbar({ title, onMenuClick }) {
  const { user } = useAuth();
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
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAll = async () => {
    await api.patch('/notifications/read-all');
    setUnread(0); setNotifs(n => n.map(x => ({ ...x, is_read: 1 })));
  };

  const typeIcon = t => ({ success: '✅', warning: '⚠️', info: 'ℹ️' })[t] || '🔔';

  return (
    <div className="topbar">
      <button className="topbar-hamburger btn-ghost btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={20} />
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-light)' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>Notifications</span>
                {unread > 0 && (
                  <button className="btn-text" onClick={markAll} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                {notifs.length === 0 ? (
                  <div style={{ padding: '28px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
                    No notifications yet
                  </div>
                ) : notifs.slice(0, 12).map(n => (
                  <div key={n.id} className={`notif-item${!n.is_read ? ' unread' : ''}`}>
                    <div className="notif-title">{typeIcon(n.type)} {n.title}</div>
                    <div className="notif-msg">{n.message}</div>
                    <div className="notif-time">{timeAgo(n.created_at)}</div>
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
