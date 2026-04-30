import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => { try { return JSON.parse(localStorage.getItem('hl_user')); } catch { return null; } });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = localStorage.getItem('hl_token');
    if (!token) { setLoading(false); return; }

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
