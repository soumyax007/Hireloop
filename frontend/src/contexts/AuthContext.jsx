import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const Ctx = createContext(null);

// ── Demo credentials (hardcoded for offline/demo mode) ──────────────────────
const DEMO_USERS = {
  'student@sau.int': {
    password: 'Student@123',
    token: 'demo_student_token',
    user: { id: 'demo_student_1', email: 'student@sau.int', role: 'student' },
    profile: { firstName: 'Demo', lastName: 'Student', college: 'South Asian University', branch: 'Computer Science', batch: 2025, cgpa: 8.5, isPremium: false },
  },
  'admin@sau.int': {
    password: 'Admin@SAU#2025',
    token: 'demo_admin_token',
    user: { id: 'demo_admin_1', email: 'admin@sau.int', role: 'admin' },
    profile: { firstName: 'Placement', lastName: 'Cell', institution: 'South Asian University' },
  },
};

function isDemoToken(token) { return token?.startsWith('demo_'); }

function demoMeResponse(token) {
  const entry = Object.values(DEMO_USERS).find(u => u.token === token);
  return entry ? { user: entry.user, profile: entry.profile } : null;
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem('hl_user')); } catch { return null; } });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('hl_token');
    if (!token) { setLoading(false); return; }

    // Demo mode shortcut
    if (isDemoToken(token)) {
      const d = demoMeResponse(token);
      if (d) { setUser(d.user); setProfile(d.profile); }
      else { localStorage.removeItem('hl_token'); localStorage.removeItem('hl_user'); setUser(null); }
      setLoading(false);
      return;
    }

    try {
      const d = await api.get('/auth/me');
      setUser(d.user); setProfile(d.profile);
      localStorage.setItem('hl_user', JSON.stringify(d.user));
    } catch {
      localStorage.removeItem('hl_token');
      localStorage.removeItem('hl_user');
      setUser(null);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    // Try demo first
    const demo = DEMO_USERS[email.toLowerCase()];
    if (demo && demo.password === password) {
      localStorage.setItem('hl_token', demo.token);
      localStorage.setItem('hl_user', JSON.stringify(demo.user));
      setUser(demo.user); setProfile(demo.profile);
      return { token: demo.token, user: demo.user, profile: demo.profile };
    }

    // Real API
    const d = await api.post('/auth/login', { email, password });
    localStorage.setItem('hl_token', d.token);
    localStorage.setItem('hl_user', JSON.stringify(d.user));
    setUser(d.user); setProfile(d.profile);
    return d;
  };

  const register = async payload => {
    const d = await api.post('/auth/register', payload);
    localStorage.setItem('hl_token', d.token);
    localStorage.setItem('hl_user', JSON.stringify(d.user));
    setUser(d.user); setProfile(d.profile);
    return d;
  };

  const setAuthData = (data) => {
    localStorage.setItem('hl_token', data.token);
    localStorage.setItem('hl_user', JSON.stringify(data.user));
    setUser(data.user);
    setProfile(data.profile || null);
  };

  const logout = () => {
    localStorage.removeItem('hl_token');
    localStorage.removeItem('hl_user');
    setUser(null); setProfile(null);
    window.location.href = '/login';
  };

  return (
    <Ctx.Provider value={{ user, profile, setProfile, loading, login, register, logout, refresh, setAuthData }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
};
