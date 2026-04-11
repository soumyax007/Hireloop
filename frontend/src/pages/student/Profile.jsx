import { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Lock, User, Save, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BRANCHES = ['Computer Science','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Chemical Engineering','Mathematics','Physics','Biotechnology'];

export default function Profile() {
  const { user, profile, setProfile, refresh } = useAuth();
  const [tab, setTab] = useState('profile'); // profile | password
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
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

  const initials = (f, l) => ((f?.[0] || '') + (l?.[0] || '')).toUpperCase() || '?';

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-sub">Update your personal information and account settings</p>
      </div>

      {/* Avatar */}
      <div className="card card-p" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid var(--border-light)' }}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)' }}>{initials(form.firstName, form.lastName)}</span>}
          </div>
          <button
            onClick={() => fileRef.current.click()}
            style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <Camera size={13} color="#fff" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 17 }}>{form.firstName} {form.lastName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{user?.email}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Click the camera to update photo (max 2MB)</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: 3, gap: 3, marginBottom: 20 }}>
        {[['profile', <User size={14} />, 'Edit Profile'], ['password', <Lock size={14} />, 'Change Password']].map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, transition: 'all .15s', background: tab === t ? 'var(--surface)' : 'transparent', color: tab === t ? 'var(--text-1)' : 'var(--text-2)', boxShadow: tab === t ? 'var(--sh-xs)' : 'none' }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="card card-p">
          <div className="form-row">
            <div className="form-group">
              <label className="label">First name</label>
              <input className="input" value={form.firstName} onChange={set('firstName')} placeholder="Arjun" />
            </div>
            <div className="form-group">
              <label className="label">Last name</label>
              <input className="input" value={form.lastName} onChange={set('lastName')} placeholder="Mehta" />
            </div>
          </div>
          <div className="form-group">
            <label className="label">College / University</label>
            <input className="input" value={form.college} onChange={set('college')} placeholder="IIT Delhi" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Branch</label>
              <select className="input" value={form.branch} onChange={set('branch')}>
                {BRANCHES.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Graduation Year</label>
              <select className="input" value={form.batch} onChange={set('batch')}>
                {[2024,2025,2026,2027,2028].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">CGPA</label>
            <input className="input" type="number" step="0.01" min="0" max="10" placeholder="8.5" value={form.cgpa} onChange={set('cgpa')} />
          </div>
          <button className="btn btn-primary btn-full" onClick={saveProfile} disabled={loading} style={{ marginTop: 4 }}>
            {loading
              ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Saving…</>
              : saved
              ? <><CheckCircle size={15} /> Saved!</>
              : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="card card-p">
          <div className="form-group">
            <label className="label">Current Password</label>
            <input className="input" type="password" placeholder="Enter current password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">New Password</label>
            <input className="input" type="password" placeholder="Min 6 characters" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" placeholder="Repeat new password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} />
          </div>
          {pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword && (
            <div className="form-error" style={{ marginBottom: 12 }}>Passwords do not match</div>
          )}
          <button className="btn btn-primary btn-full" onClick={changePassword} disabled={loading || (pwForm.newPassword && pwForm.confirmPassword && pwForm.newPassword !== pwForm.confirmPassword)}>
            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Changing…</> : <><Lock size={15} /> Change Password</>}
          </button>
        </div>
      )}
    </div>
  );
}
