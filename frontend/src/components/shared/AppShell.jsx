import { useState } from 'react';
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
  '/admin/dashboard': 'Dashboard', '/admin/companies': 'Companies',
  '/admin/students': 'Students', '/admin/jobs': 'All Jobs',
  '/admin/reports': 'Placement Reports', '/admin/announcements': 'Announcements',
};

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const title = TITLES[pathname] || 'HireLoop';

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-wrap">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(o => !o)} />
        <div className="page-content anim-in">
          <Outlet />
        </div>
        {/* Footer */}
        <footer style={{ padding: '20px 28px', borderTop: '1px solid var(--border-light)', marginTop: 'auto', background: 'var(--surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              © {new Date().getFullYear()} HireLoop · All rights reserved
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
              Crafted with ♥ by <span style={{ color: 'var(--text-2)', fontWeight: 500 }}>Soumya, Udit, Vijjval & Vedant</span>
            </div>
          </div>
        </footer>
      </div>
      <AIChatbot />
    </div>
  );
}
