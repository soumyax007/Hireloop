import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 45000 });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('hl_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  r => r.data,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hl_token');
      localStorage.removeItem('hl_user');
      if (!window.location.pathname.includes('/login')) window.location.href = '/login';
    }
    return Promise.reject(err.response?.data || { error: err.message });
  }
);

export default api;
