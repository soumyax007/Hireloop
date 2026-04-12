import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { initials } from '../../utils/helpers';
import {
  LayoutDashboard, Briefcase, Brain, Mic, Star,
  Building2, Users, BarChart3, Megaphone, LogOut,
  Zap, ClipboardList, UserCircle, Trophy, Settings,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

const HireLogo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const STUDENT_NAV = [
  { section: 'Overview', items: [{ to: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  { section: 'Placement', items: [
    { to: '/student/jobs',         icon: Briefcase,     label: 'Browse Jobs' },
    { to: '/student/applications', icon: ClipboardList, label: 'My Applications' },
  ]},
  { section: 'AI Tools', items: [
    { to: '/student/resume-ai',      icon: Brain, label: 'Resume Analyser' },
    { to: '/student/mock-interview', icon: Mic,   label: 'Mock Interview' },
  ]},
  { section: 'Compete', items: [
    { to: '/competition', icon: Trophy, label: 'Competitions' },
  ]},
  { section: 'Account', items: [
    { to: '/student/upgrade', icon: Star,       label: 'Upgrade' },
    { to: '/student/profile', icon: UserCircle, label: 'My Profile' },
  ]},
];

const RECRUITER_NAV = [
  { section: 'Overview', items: [{ to: '/recruiter/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  { section: 'Hiring', items: [
    { to: '/recruiter/jobs',       icon: Briefcase, label: 'My Jobs' },
    { to: '/recruiter/applicants', icon: Users,     label: 'Applicants' },
    { to: '/recruiter/post-job',   icon: Zap,       label: 'Post New Job' },
  ]},
  { section: 'Compete', items: [{ to: '/competition', icon: Trophy, label: 'Competitions' }] },
  { section: 'Account', items: [{ to: '/recruiter/profile', icon: Settings, label: 'Company Profile' }] },
];

const ADMIN_NAV = [
  { section: 'Overview', items: [{ to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
  { section: 'Management', items: [
    { to: '/admin/companies', icon: Building2, label: 'Companies' },
    { to: '/admin/students',  icon: Users,     label: 'Students' },
    { to: '/admin/jobs',      icon: Briefcase, label: 'All Jobs' },
  ]},
  { section: 'Insights', items: [
    { to: '/admin/reports',       icon: BarChart3, label: 'Reports' },
    { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' },
  ]},
  { section: 'Compete', items: [{ to: '/competition', icon: Trophy, label: 'Competitions' }] },
];

function NavGroups({ groups, collapsed }) {
  return groups.map(g => (
    <div className="sb-section" key={g.section}>
      {!collapsed && <div className="sb-section-label">{g.section}</div>}
      {g.items.map(item => (
        <NavLink
          key={item.to}
          to={item.to}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) => `sb-nav-item${isActive ? ' active' : ''}${collapsed ? ' collapsed' : ''}`}
        >
          <item.icon size={16} className="nav-icon" />
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}
    </div>
  ));
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapse }) {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const dashboardRoute = { student: '/student/dashboard', recruiter: '/recruiter/dashboard', admin: '/admin/dashboard' }[role] || '/';

  const getName = () => {
    if (role === 'student')   return `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || user?.email;
    if (role === 'recruiter') return profile?.company_name || user?.email;
    return profile?.name || user?.email;
  };

  const getRoleLabel = () => ({ student: 'Student', recruiter: 'Recruiter', admin: 'Admin' })[role] || '';
  const navGroups = role === 'student' ? STUDENT_NAV : role === 'recruiter' ? RECRUITER_NAV : ADMIN_NAV;

  return (
    <>
      <div className={`sidebar-overlay${open ? ' open' : ''}`} onClick={onClose} />
      <nav className={`sidebar${open ? ' open' : ''}${collapsed ? ' sidebar-collapsed' : ''}`}>

        {/* Logo */}
        <Link to={dashboardRoute} className={`sb-logo${collapsed ? ' sb-logo-collapsed' : ''}`} onClick={onClose}>
          <div className="sb-logo-mark"><HireLogo /></div>
          {!collapsed && (
            <div>
              <div className="sb-logo-text">HireLoop</div>
              <div className="sb-logo-sub">{getRoleLabel()} Portal</div>
            </div>
          )}
        </Link>

        {/* Desktop collapse toggle */}
        <button
          className="sb-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 8 }}>
          <NavGroups groups={navGroups} collapsed={collapsed} />
        </div>

        {/* User footer */}
        <div className={`sb-user${collapsed ? ' sb-user-collapsed' : ''}`}>
          <div
            className="sb-user-ava"
            title={getName()}
            style={{ cursor: 'pointer', flexShrink: 0 }}
            onClick={() => {
              if (role === 'student') navigate('/student/profile');
              else if (role === 'recruiter') navigate('/recruiter/profile');
              onClose();
            }}
          >
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials(profile?.first_name || profile?.company_name || profile?.name || '', profile?.last_name || '')}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <div className="sb-user-name">{getName()}</div>
              <div className="sb-user-role">{getRoleLabel()}</div>
            </div>
          )}
          <button className={`sb-logout${collapsed ? ' sb-logout-collapsed' : ''}`} onClick={logout} title="Logout">
            <LogOut size={15} />
          </button>
        </div>
      </nav>
    </>
  );
}
