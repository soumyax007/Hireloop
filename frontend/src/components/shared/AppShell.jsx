import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const TITLES = {
  '/student/dashboard': 'Dashboard', '/student/jobs': 'Browse Jobs',
  '/student/applications': 'My Applications', '/student/resume-ai': 'Resume Analyser',
  '/student/mock-interview': 'Mock Interview', '/student/upgrade': 'Upgrade to Premium',
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
      </div>
    </div>
  );
}
