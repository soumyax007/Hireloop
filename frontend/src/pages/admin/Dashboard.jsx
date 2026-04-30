import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { LoadingCenter, EmptyState } from '../../components/shared/UI';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const PIE_COLORS = ['#0071e3', '#30d158', '#f59e0b', '#ff3b30', '#bf5af2'];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [report, setReport] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/applications/stats/overview'),
      api.get('/admin/report'),
      api.get('/announcements'),
    ]).then(([s, r, a]) => { setStats(s); setReport(r); setAnnouncements(a); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingCenter />;

  const statusData = (stats?.byStatus || []).map(s => ({ name: s.status, value: s.count }));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 className="page-title">Placement Dashboard</h1>
        <p className="page-sub">{profile?.institution || 'Placement Cell'} — Season 2025</p>
      </div>

      {/* KPI Stats */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Students', value: stats?.totalStudents || 0, icon: '🎓', bg: 'var(--accent-bg)', c: 'var(--accent)' },
          { label: 'Students Placed', value: stats?.placed || 0, icon: '✅', bg: 'var(--green-bg)', c: 'var(--green-text)' },
          { label: 'Active Companies', value: stats?.totalCompanies || 0, icon: '🏢', bg: 'var(--purple-bg)', c: 'var(--purple-text)' },
          { label: 'Active Jobs', value: stats?.activeJobs || 0, icon: '💼', bg: 'var(--yellow-bg)', c: 'var(--yellow-text)' },
          { label: 'Placement Rate', value: `${report?.overview?.placementRate || 0}%`, icon: '📈', bg: 'var(--green-bg)', c: 'var(--green-text)' },
          { label: 'Avg Package', value: `${stats?.avgPackageLPA || 0}L`, icon: '💰', bg: 'var(--surface-2)', c: 'var(--text-1)' },
          { label: 'Max Package', value: `${stats?.maxPackageLPA || 0}L`, icon: '🚀', bg: 'var(--surface-2)', c: 'var(--text-1)' },
          { label: 'Pending Cos', value: stats?.pendingCompanies || 0, icon: '⏳', bg: 'var(--yellow-bg)', c: 'var(--yellow-text)' },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg, color: s.c, fontSize: 18 }}>{s.icon}</div>
            <div className="stat-val" style={{ fontSize: 22 }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Pending approval alert */}
      {stats?.pendingCompanies > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          ⚠️ <strong>{stats.pendingCompanies} company registration{stats.pendingCompanies > 1 ? 's' : ''} pending approval.</strong>
          {' '}<Link to="/admin/companies" style={{ fontWeight: 600 }}>Review now →</Link>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 24, gap: 20 }}>
        {/* Application status pie chart */}
        <div className="card card-p">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Application Status</div>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} style={{ outline: 'none' }}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: 'var(--sh-md)', fontSize: 13, padding: '8px 12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>No data yet</div>}
        </div>

        {/* Branch placement chart */}
        <div className="card card-p">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Placements by Branch</div>
          {(report?.byBranch || []).length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={report.byBranch.slice(0, 6)} margin={{ left: -25, bottom: -5, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-light)" />
                <XAxis dataKey="branch" tick={{ fontSize: 11, fill: 'var(--text-2)' }} tickFormatter={v => v.split(' ')[0]} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-2)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v, n) => [v, n === 'placed' ? 'Placed' : n]} cursor={{ fill: 'var(--surface-2)' }} contentStyle={{ borderRadius: 10, border: 'none', boxShadow: 'var(--sh-md)', fontSize: 13 }} />
                <Bar dataKey="placed" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>No data yet</div>}
        </div>
      </div>

      {/* Top placing companies */}
      <div className="card card-p" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Top Recruiting Companies</div>
          <Link to="/admin/reports" className="btn btn-ghost btn-sm">Full Report →</Link>
        </div>
        {(report?.byCompany || []).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-3)', fontSize: 14 }}>No placements recorded yet</div>
        ) : report.byCompany.slice(0, 5).map((c, i) => (
          <div key={c.company_name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none' }}>
            <div style={{ width: 28, height: 28, borderRadius: 'var(--r-sm)', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: 'var(--accent)' }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{c.company_name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Avg ₹{c.avg_pkg ? (c.avg_pkg / 100000).toFixed(1) : 0}L</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{c.offers}</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>offers</div>
          </div>
        ))}
      </div>

      {/* Recent Announcements */}
      <div className="card card-p">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Recent Announcements</div>
          <Link to="/admin/announcements" className="btn btn-primary btn-sm">+ Post New</Link>
        </div>
        {announcements.slice(0, 3).map(a => (
          <div key={a.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-light)', fontSize: 13 }}>
            <div style={{ fontWeight: 500 }}>{a.title} {a.is_pinned ? <span className="badge badge-red" style={{ fontSize: 9 }}>Pinned</span> : null}</div>
            <div style={{ color: 'var(--text-2)', fontSize: 12, marginTop: 2 }}>{a.content.slice(0, 80)}…</div>
          </div>
        ))}
        {announcements.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 13 }}>No announcements yet.</div>}
      </div>
    </div>
  );
}
