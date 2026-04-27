import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Camera, Lock, User, Save, CheckCircle, ArrowLeft,
  GraduationCap, Calendar, Star, Mail, Trash2, Eye, EyeOff
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BRANCHES = ['Computer Science','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Chemical Engineering','Mathematics','Physics','Biotechnology'];

const FIELD_ICONS = {
  user:   { bg: '#e8f0fd', color: '#0071e3' },
  school: { bg: '#e6f9ed', color: '#1a7f37' },
  cal:    { bg: '#fef3c7', color: '#92400e' },
  star:   { bg: '#f5effe', color: '#6b21a8' },
  mail:   { bg: '#f5f5f7', color: '#6e6e73' },
  lock:   { bg: '#fff0ef', color: '#b91c1c' },
};

function FieldIcon({ type, icon: Icon }) {
  const s = FIELD_ICONS[type] || FIELD_ICONS.user;
  return (
    <div className="profile-field-icon" style={{ background: s.bg }}>
      <Icon size={16} color={s.color} />
    </div>
  );
}

export default function Profile() {
  const { user, profile, setProfile, refresh, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [deletingAccount, setDeletingAccount] = useState(false);
  const fileRef = useRef();

  const [form, setForm] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    college: profile?.college || '',
    branch: profile?.branch || 'Computer Science',
    batch: profile?.batch || 2025,
    cgpa: profile?.cgpa || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatar, setAvatar] = useState(profile?.avatar_url || '');

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    const reader = new FileReader();
    reader.onload = ev => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/update-profile', { ...form, avatarUrl: avatar });
      setProfile(res.profile);
      await refresh();
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      toast.success('Profile updated!');
    } catch (e) { toast.error(e.error || 'Update failed'); }
    finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) { toast.error('Fill all fields'); return; }
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Min 6 characters'); return; }
    setLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) { toast.error(e.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const deleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to permanently delete your account? This cannot be undone.');
    if (!confirmed) return;
    setDeletingAccount(true);
    try {
      await api.delete('/auth/account');
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (e) { toast.error(e.error || 'Deletion failed'); }
    finally { setDeletingAccount(false); }
  };

  const initials = (f, l) => ((f?.[0] || '') + (l?.[0] || '')).toUpperCase() || '?';
  const displayName = `${form.firstName} ${form.lastName}`.trim() || user?.email;

  const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Security', icon: Lock },
  ];

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20, fontFamily: 'var(--font)', padding: 0, fontWeight: 500 }}>
        <ArrowLeft size={15} /> Back
      </button>

      {/* Hero Card */}
      <div className="profile-hero" style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 18 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.15)', border: '3px solid rgba(255,255,255,.25)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatar
                ? <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>{initials(form.firstName, form.lastName)}</span>}
            </div>
            <button onClick={() => fileRef.current.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: '50%', background: '#0071e3', border: '2px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .15s' }}>
              <Camera size={12} color="#fff" />
            </button>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 19, fontWeight: 700, color: '#fff', letterSpacing: '-.4px', marginBottom: 3 }}>{displayName}</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', marginBottom: 6 }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {profile?.is_premium
                ? <span style={{ fontSize: 11, fontWeight: 600, background: '#f59e0b', color: '#fff', padding: '2px 8px', borderRadius: 100, display: 'flex', alignItems: 'center', gap: 4 }}><Star size={9} fill="#fff" /> Premium</span>
                : <span style={{ fontSize: 11, fontWeight: 500, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', padding: '2px 8px', borderRadius: 100 }}>Free Plan</span>}
              {form.branch && <span style={{ fontSize: 11, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)', padding: '2px 8px', borderRadius: 100 }}>{form.branch.split(' ')[0]}</span>}
            </div>
          </div>
        </div>

        {/* Segmented control */}
        <div className="profile-seg-control" style={{ marginTop: 24, marginBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.id} className={`profile-seg-btn${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <>
          <div className="profile-field">
            <div className="profile-field-row">
              <FieldIcon type="user" icon={User} />
              <div style={{ flex: 1 }}>
                <div className="profile-field-label">First Name</div>
                <input className="profile-field-input" value={form.firstName} onChange={set('firstName')} placeholder="Arjun" />
              </div>
            </div>
            <div className="profile-field-row">
              <FieldIcon type="user" icon={User} />
              <div style={{ flex: 1 }}>
                <div className="profile-field-label">Last Name</div>
                <input className="profile-field-input" value={form.lastName} onChange={set('lastName')} placeholder="Mehta" />
              </div>
            </div>
            <div className="profile-field-row">
              <FieldIcon type="mail" icon={Mail} />
              <div style={{ flex: 1 }}>
                <div className="profile-field-label">Email</div>
                <input className="profile-field-input" value={user?.email || ''} readOnly style={{ color: 'var(--text-3)' }} />
              </div>
            </div>
          </div>

          <div className="profile-field">
            <div className="profile-field-row">
              <FieldIcon type="school" icon={GraduationCap} />
              <div style={{ flex: 1 }}>
                <div className="profile-field-label">College / University</div>
                <input className="profile-field-input" value={form.college} onChange={set('college')} placeholder="IIT Delhi" />
              </div>
            </div>
            <div className="profile-field-row">
              <FieldIcon type="school" icon={GraduationCap} />
              <div style={{ flex: 1 }}>
                <div className="profile-field-label">Branch</div>
                <select className="profile-field-select" value={form.branch} onChange={set('branch')}>
                  {BRANCHES.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="profile-field-row">
              <FieldIcon type="cal" icon={Calendar} />
              <div style={{ flex: 1 }}>
                <div className="profile-field-label">Graduation Year</div>
                <select className="profile-field-select" value={form.batch} onChange={set('batch')}>
                  {[2024,2025,2026,2027,2028].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="profile-field-row">
              <FieldIcon type="star" icon={Star} />
              <div style={{ flex: 1 }}>
                <div className="profile-field-label">CGPA</div>
                <input className="profile-field-input" type="number" step="0.01" min="0" max="10" placeholder="8.5" value={form.cgpa} onChange={set('cgpa')} />
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-full" onClick={saveProfile} disabled={loading} style={{ marginBottom: 12 }}>
            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Saving…</>
              : saved ? <><CheckCircle size={15} /> Saved!</>
              : <><Save size={15} /> Save Changes</>}
          </button>
        </>
      )}

      {/* Security Tab */}
      {tab === 'password' && (
        <>
          <div className="profile-field">
            {[
              { key: 'currentPassword', label: 'Current Password', show: showPw.current, toggleKey: 'current' },
              { key: 'newPassword', label: 'New Password', show: showPw.new, toggleKey: 'new' },
              { key: 'confirmPassword', label: 'Confirm New Password', show: showPw.confirm, toggleKey: 'confirm' },
            ].map(({ key, label, show, toggleKey }) => (
              <div className="profile-field-row" key={key}>
                <FieldIcon type="lock" icon={Lock} />
                <div style={{ flex: 1 }}>
                  <div className="profile-field-label">{label}</div>
                  <input
                    className="profile-field-input"
                    type={show ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pwForm[key]}
                    onChange={e => setPwForm(f => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
                <button type="button" onClick={() => setShowPw(s => ({ ...s, [toggleKey]: !s[toggleKey] }))}
                  style={{ border: 'none', background: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center' }}>
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            ))}
          </div>

          {pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
            <div style={{ fontSize: 13, color: 'var(--red)', marginBottom: 12, paddingLeft: 4 }}>Passwords do not match</div>
          )}

          <button className="btn btn-primary btn-full" onClick={changePassword} disabled={loading || (pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword)} style={{ marginBottom: 24 }}>
            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Changing…</> : <><Lock size={15} /> Update Password</>}
          </button>

          {/* Danger zone */}
          <div style={{ background: '#fff0ef', border: '1px solid rgba(255,59,48,.15)', borderRadius: 'var(--r-lg)', padding: '16px 18px' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--red)', marginBottom: 4 }}>Danger Zone</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 14 }}>Permanently delete your account and all associated data. This action cannot be undone.</div>
            <button onClick={deleteAccount} disabled={deletingAccount}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--red)', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)', transition: 'opacity .15s' }}>
              {deletingAccount ? <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> : <Trash2 size={14} />}
              Delete My Account
            </button>
          </div>
        </>
      )}
    </div>
  );
}
