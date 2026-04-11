import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import AppShell from './components/shared/AppShell';

// Auth
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student
import StudentDashboard from './pages/student/Dashboard';
import StudentJobs from './pages/student/Jobs';
import Applications from './pages/student/Applications';
import ResumeAI from './pages/student/ResumeAI';
import MockInterview from './pages/student/MockInterview';
import Upgrade from './pages/student/Upgrade';
import Profile from './pages/student/Profile';

// Recruiter
import RecruiterDashboard from './pages/recruiter/Dashboard';
import RecruiterJobs from './pages/recruiter/Jobs';
import Applicants from './pages/recruiter/Applicants';
import PostJob from './pages/recruiter/PostJob';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminCompanies from './pages/admin/Companies';
import AdminStudents from './pages/admin/Students';
import AdminJobs from './pages/admin/Jobs';
import Reports from './pages/admin/Reports';
import Announcements from './pages/admin/Announcements';

// ─── Guard components ─────────────────────────────────────────────────────────

function RequireAuth({ allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: 'var(--font)', color: 'var(--text-2)', flexDirection: 'column' }}>
      <div className="spinner spinner-lg" />
      <span style={{ fontSize: 14 }}>Loading HireLoop…</span>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const defaultRoutes = { student: '/student/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={defaultRoutes[user.role] || '/login'} replace />;
  }
  return <Outlet />;
}

function RedirectIfAuth() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    const routes = { student: '/student/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={routes[user.role] || '/login'} replace />;
  }
  return <Outlet />;
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'var(--font)', fontSize: 14, borderRadius: 10, boxShadow: 'var(--sh-md)' },
            success: { iconTheme: { primary: 'var(--green)', secondary: '#fff' } },
            error: { iconTheme: { primary: 'var(--red)', secondary: '#fff' } },
          }}
        />
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth pages — redirect if already logged in */}
          <Route element={<RedirectIfAuth />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Student routes */}
          <Route element={<RequireAuth allowedRoles={['student']} />}>
            <Route element={<AppShell />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/jobs" element={<StudentJobs />} />
              <Route path="/student/applications" element={<Applications />} />
              <Route path="/student/resume-ai" element={<ResumeAI />} />
              <Route path="/student/mock-interview" element={<MockInterview />} />
              <Route path="/student/upgrade" element={<Upgrade />} />
              <Route path="/student/profile" element={<Profile />} />
            </Route>
          </Route>

          {/* Recruiter routes */}
          <Route element={<RequireAuth allowedRoles={['recruiter']} />}>
            <Route element={<AppShell />}>
              <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
              <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
              <Route path="/recruiter/applicants" element={<Applicants />} />
              <Route path="/recruiter/post-job" element={<PostJob />} />
            </Route>
          </Route>

          {/* Admin routes */}
          <Route element={<RequireAuth allowedRoles={['admin']} />}>
            <Route element={<AppShell />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/companies" element={<AdminCompanies />} />
              <Route path="/admin/students" element={<AdminStudents />} />
              <Route path="/admin/jobs" element={<AdminJobs />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/announcements" element={<Announcements />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font)', gap: 12 }}>
              <div style={{ fontSize: 48 }}>🔍</div>
              <h1 style={{ fontWeight: 700, fontSize: 22 }}>Page Not Found</h1>
              <p style={{ color: 'var(--text-2)' }}>The page you're looking for doesn't exist.</p>
              <a href="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>← Go to Login</a>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
