import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Download } from 'lucide-react';
import { LoadingCenter } from '../../components/shared/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/admin/report').then(setReport).catch(() => {}).finally(() => setLoading(false)); }, []);

  const exportCSV = () => {
    if (!report) return;
    const rows = [
      ['Company', 'Offers', 'Avg Package (LPA)'],
      ...report.byCompany.map(c => [c.company_name, c.offers, c.avg_pkg ? (c.avg_pkg/100000).toFixed(1) : 0]),
      [],
      ['Branch', 'Placed', 'Avg Package (LPA)', 'Max Package (LPA)'],
      ...report.byBranch.map(b => [b.branch, b.placed, b.avg_pkg ? (b.avg_pkg/100000).toFixed(1) : 0, b.max_pkg ? (b.max_pkg/100000).toFixed(1) : 0]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `hireloop_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Report downloaded!');
  };

  if (loading) return <LoadingCenter />;

  const o = report?.overview || {};

  return (
    <div>
      <div className="section-header">
        <div><h1 className="page-title">Placement Reports</h1><p className="page-sub">Season 2025 statistics</p></div>
        <button className="btn btn-secondary" onClick={exportCSV}><Download size={15} /> Export CSV</button>
      </div>

      {/* Overview KPIs */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {[
          { label: 'Total Students', v: o.totalStudents || 0 },
          { label: 'Students Placed', v: o.totalPlaced || 0 },
          { label: 'Placement Rate', v: `${o.placementRate || 0}%` },
          { label: 'Total Offers', v: o.totalOffers || 0 },
          { label: 'Avg Package', v: `₹${o.avgPackageLPA || 0}L` },
          { label: 'Max Package', v: `₹${o.maxPackageLPA || 0}L` },
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-val">{s.v}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 20, marginBottom: 24 }}>
        {/* By Company */}
        <div className="card card-p">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>By Company</div>
          {(report?.byCompany || []).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report.byCompany.slice(0, 8)} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="company_name" tick={{ fontSize: 10 }} tickFormatter={v => v.split(' ')[0]} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="offers" name="Offers" fill="var(--accent)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead><tr><th>Company</th><th>Offers</th><th>Avg Pkg (LPA)</th></tr></thead>
                  <tbody>{report.byCompany.map(c => (
                    <tr key={c.company_name}>
                      <td style={{ fontWeight: 500 }}>{c.company_name}</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{c.offers}</td>
                      <td>₹{c.avg_pkg ? (c.avg_pkg/100000).toFixed(1) : 0}L</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ) : <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)' }}>No data yet</div>}
        </div>

        {/* By Branch */}
        <div className="card card-p">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>By Branch</div>
          {(report?.byBranch || []).length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={report.byBranch} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                  <XAxis dataKey="branch" tick={{ fontSize: 10 }} tickFormatter={v => v.split(' ')[0]} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="placed" name="Placed" fill="var(--green)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="table-wrap" style={{ marginTop: 16 }}>
                <table>
                  <thead><tr><th>Branch</th><th>Placed</th><th>Avg Pkg</th><th>Max Pkg</th></tr></thead>
                  <tbody>{report.byBranch.map(b => (
                    <tr key={b.branch}>
                      <td style={{ fontSize: 13 }}>{b.branch}</td>
                      <td style={{ fontWeight: 700, color: 'var(--green-text)' }}>{b.placed}</td>
                      <td style={{ fontSize: 13 }}>₹{b.avg_pkg ? (b.avg_pkg/100000).toFixed(1) : 0}L</td>
                      <td style={{ fontSize: 13 }}>₹{b.max_pkg ? (b.max_pkg/100000).toFixed(1) : 0}L</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </>
          ) : <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)' }}>No data yet</div>}
        </div>
      </div>
    </div>
  );
}
