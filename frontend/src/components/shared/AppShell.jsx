import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import AIChatbot from './AIChatbot';

const TITLES = {
  '/student/dashboard': 'Dashboard', '/student/jobs': 'Browse Jobs',
  '/student/applications': 'My Applications', '/student/resume-ai': 'Resume Analyser',
  '/student/mock-interview': 'Mock Interview', '/student/upgrade': 'Upgrade to Premium',
  '/student/profile': 'My Profile',
  '/recruiter/dashboard': 'Dashboard', '/recruiter/jobs': 'My Jobs',
  '/recruiter/applicants': 'Applicants', '/recruiter/post-job': 'Post a Job',
  '/recruiter/profile': 'Company Profile',
  '/admin/dashboard': 'Dashboard', '/admin/companies': 'Companies',
  '/admin/students': 'Students', '/admin/jobs': 'All Jobs',
  '/admin/reports': 'Placement Reports', '/admin/announcements': 'Announcements',
  '/competition': 'Competitions',
};

const COLLAPSED_KEY = 'hl_sidebar_collapsed';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [collapsed,   setCollapsed]         = useState(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === 'true'; } catch { return false; }
  });
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'HireLoop';

  // Persist collapse state
  useEffect(() => {
    try { localStorage.setItem(COLLAPSED_KEY, String(collapsed)); } catch {}
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const toggleCollapse = () => setCollapsed(c => !c);

  return (
    <div className={`app-shell${collapsed ? ' sidebar-is-collapsed' : ''}`}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
      />
      <div className="main-wrap">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(o => !o)} />
        <div className="page-content anim-in">
          <Outlet />
        </div>
        <footer className="app-footer">
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            © {new Date().getFullYear()} HireLoop · All rights reserved
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            Crafted with ♥ by <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Soumya, Udit, Vijjval & Vedant</span>
          </div>
        </footer>
      </div>
      <AIChatbot />
    </div>
  );
}
