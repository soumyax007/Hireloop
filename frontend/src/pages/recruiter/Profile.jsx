import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Lock, Building2, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function RecruiterProfile() {
  const { profile, setProfile, refresh } = useAuth();
  const [tab, setTab] = useState('company');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    companyName: profile?.company_name || '',
    industry: profile?.industry || '',
    description: profile?.description || '',
    website: profile?.website || '',
    headquarters: profile?.headquarters || '',
    companySize: profile?.company_size || '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await api.put('/auth/update-profile', form);
      setProfile(res.profile);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success('Company profile updated!');
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

  return (
    <div style={{ maxWidth: 620, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Company Profile</h1>
        <p className="page-sub">Update your company information and account settings</p>
      </div>

      {/* Status banner */}
      <div className={`alert ${profile?.is_approved ? 'alert-success' : 'alert-warning'}`} style={{ marginBottom: 20 }}>
        {profile?.is_approved ? '✅ Your company is approved and can post jobs.' : '⏳ Company approval pending from placement cell.'}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 'var(--r-md)', padding: 3, gap: 3, marginBottom: 20 }}>
        {[['company', <Building2 size={14} />, 'Company Info'], ['password', <Lock size={14} />, 'Change Password']].map(([t, icon, label]) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 12px', borderRadius: 'var(--r-sm)', border: 'none', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, fontWeight: 500, transition: 'all .15s', background: tab === t ? 'var(--surface)' : 'transparent', color: tab === t ? 'var(--text-1)' : 'var(--text-2)', boxShadow: tab === t ? 'var(--sh-xs)' : 'none' }}>
            {icon}{label}
          </button>
        ))}
      </div>

      {tab === 'company' && (
        <div className="card card-p">
          <div className="form-group">
            <label className="label">Company Name</label>
            <input className="input" value={form.companyName} onChange={set('companyName')} placeholder="Acme Corp" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Industry</label>
              <select className="input" value={form.industry} onChange={set('industry')}>
                {['Technology','Finance & Banking','E-Commerce','AI Startup','Consulting','Healthcare','Manufacturing','Other'].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Company Size</label>
              <select className="input" value={form.companySize} onChange={set('companySize')}>
                <option value="">Select size</option>
                {['1-10','11-50','51-200','201-500','500-1000','1000+'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="label">Headquarters</label>
            <input className="input" placeholder="Bengaluru, India" value={form.headquarters} onChange={set('headquarters')} />
          </div>
          <div className="form-group">
            <label className="label">Website</label>
            <input className="input" type="url" placeholder="https://company.com" value={form.website} onChange={set('website')} />
          </div>
          <div className="form-group">
            <label className="label">Company Description</label>
            <textarea className="input" rows={4} placeholder="Tell students about your company…" value={form.description} onChange={set('description')} />
          </div>
          <button className="btn btn-primary btn-full" onClick={saveProfile} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Saving…</>
              : saved ? <><CheckCircle size={15} /> Saved!</>
              : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      )}

      {tab === 'password' && (
        <div className="card card-p">
          <div className="form-group">
            <label className="label">Current Password</label>
            <input className="input" type="password" placeholder="Current password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
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
          <button className="btn btn-primary btn-full" onClick={changePassword} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Changing…</> : <><Lock size={15} /> Change Password</>}
          </button>
        </div>
      )}
    </div>
  );
}
