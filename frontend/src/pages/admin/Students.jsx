import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { LoadingCenter, EmptyState } from '../../components/shared/UI';
import { parseArr } from '../../utils/helpers';
import api from '../../utils/api';

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { api.get('/admin/students').then(setStudents).catch(() => {}).finally(() => setLoading(false)); }, []);

  const filtered = students.filter(s =>
    !search || `${s.first_name} ${s.last_name} ${s.branch} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingCenter />;

  return (
    <div>
      <div className="section-header">
        <div><h1 className="page-title">Students</h1><p className="page-sub">{students.length} registered</p></div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="badge badge-green">{students.filter(s => s.offers > 0).length} placed</span>
          <span className="badge badge-premium">{students.filter(s => s.is_premium).length} premium</span>
        </div>
      </div>

      <div className="input-with-icon" style={{ marginBottom: 20, maxWidth: 400 }}>
        <Search size={15} className="input-icon" />
        <input className="input" placeholder="Search by name, branch, email…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {filtered.length === 0 ? <EmptyState icon="🎓" title="No students found" /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Branch</th><th>Batch</th><th>CGPA</th><th>Applications</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const skills = parseArr(s.skills);
                return (
                  <tr key={s.id}>
                    <td>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12, flexShrink: 0 }}>
                          {(s.first_name?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: 14 }}>{s.first_name} {s.last_name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-2)' }}>{s.branch}</td>
                    <td style={{ fontSize: 13 }}>{s.batch}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: s.cgpa >= 8 ? 'var(--green-text)' : s.cgpa >= 7 ? 'var(--yellow-text)' : 'var(--red-text)' }}>
                        {s.cgpa}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{s.app_count || 0} apps</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {s.offers > 0 && <span className="badge badge-green">Offer ✓</span>}
                          {s.is_premium ? <span className="badge badge-premium">⭐</span> : null}
                          {s.offers === 0 && !s.is_premium && <span className="badge badge-gray">Active</span>}
                        </div>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ color: 'var(--red-text)', padding: 4 }}
                          title="Delete Account"
                          onClick={async () => {
                            if (!window.confirm(`Are you sure you want to delete ${s.first_name}'s account? This action cannot be undone.`)) return;
                            try {
                              await api.delete(`/auth/users/${s.user_id}`);
                              setStudents(prev => prev.filter(st => st.id !== s.id));
                              toast.success('Account deleted successfully');
                            } catch (e) {
                              toast.error(e.error || 'Failed to delete account');
                            }
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
