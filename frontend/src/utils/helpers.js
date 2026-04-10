export const fmtSalary = (min, max, currency = 'INR') => {
  if (!min && !max) return 'Salary not disclosed';
  const fmt = n => {
    if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
    return `₹${(n / 1000).toFixed(0)}K`;
  };
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (max) return `Up to ${fmt(max)}`;
  return `${fmt(min)}+`;
};

export const fmtDate = d => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const timeAgo = d => {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return fmtDate(d);
};

export const initials = (first = '', last = '') => `${first[0] || ''}${last[0] || ''}`.toUpperCase() || '?';

export const atsColor = score => score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low';

export const statusLabel = s => ({
  applied: 'Applied', shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview', offer: 'Offer', rejected: 'Rejected'
})[s] || s;

export const parseArr = val => {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
};

export const clsx = (...args) => args.filter(Boolean).join(' ');
