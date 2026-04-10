import { X } from 'lucide-react';
import { clsx, statusLabel } from '../../utils/helpers';

export function Spinner({ size = 'sm', className = '' }) {
  return <div className={clsx(`spinner spinner-${size}`, className)} />;
}

export function LoadingCenter({ text = 'Loading...' }) {
  return (
    <div className="loading-center">
      <div className="spinner spinner-lg" />
      <span>{text}</span>
    </div>
  );
}

export function Modal({ open, onClose, title, children, size = 'md', footer }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal modal-${size} anim-scale`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}><X size={15} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{statusLabel(status)}</span>;
}

export function Alert({ type = 'info', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

export function EmptyState({ icon, title, desc, action }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon || '📭'}</div>
      <h3>{title}</h3>
      {desc && <p>{desc}</p>}
      {action}
    </div>
  );
}

export function ScoreRing({ score, size = 90 }) {
  const color = score >= 75 ? 'var(--green)' : score >= 50 ? 'var(--yellow)' : 'var(--red)';
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border-light)" strokeWidth="8" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={circ - dash} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(0,0,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color }}>{score}</span>
        <span style={{ fontSize: 10, color: 'var(--text-3)' }}>/100</span>
      </div>
    </div>
  );
}

export function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const c = color || (pct >= 75 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)');
  return (
    <div className="progress-bar">
      <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
    </div>
  );
}

export function Tag({ label, onRemove }) {
  return (
    <span className="tag">
      {label}
      {onRemove && <button onClick={onRemove} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-3)', lineHeight: 1, padding: 0 }}>×</button>}
    </span>
  );
}

export function TagInput({ tags = [], onChange, placeholder = 'Add skill...' }) {
  const [val, setVal] = useState('');
  const add = () => {
    const t = val.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setVal('');
  };
  return (
    <div>
      <div className="tags-row" style={{ marginBottom: 8 }}>
        {tags.map(t => <Tag key={t} label={t} onRemove={() => onChange(tags.filter(x => x !== t))} />)}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="input input-sm" value={val} onChange={e => setVal(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder={placeholder} />
        <button type="button" className="btn btn-secondary btn-sm" onClick={add}>Add</button>
      </div>
    </div>
  );
}

// useState import needed for TagInput
import { useState } from 'react';
