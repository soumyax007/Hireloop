import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const ROLE_GREETINGS = {
  student: "Hi! I'm your HireLoop assistant 👋 I can help you find jobs, improve your profile, prep for interviews, or navigate the portal. What do you need?",
  recruiter: "Hi! I'm your HireLoop assistant 👋 I can help you post jobs quickly, manage applicants, or navigate the portal. How can I help?",
  admin: "Hi! I'm your HireLoop assistant 👋 I can help you prioritize approvals, sort notifications, and manage the platform efficiently. What do you need?",
};

export default function AIChatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    if (open && msgs.length === 0) {
      setMsgs([{ role: 'assistant', content: ROLE_GREETINGS[user?.role] || ROLE_GREETINGS.student }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const userMsg = { role: 'user', content: text };
    setMsgs(m => [...m, userMsg]);
    setLoading(true);
    try {
      const history = msgs.slice(-8);
      const { reply } = await api.post('/ai/chat', { message: text, history });
      setMsgs(m => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMsgs(m => [...m, { role: 'assistant', content: "Sorry, I'm having trouble right now. Please try again." }]);
    } finally { setLoading(false); }
  };

  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  return (
    <>
      {/* Chat Panel */}
      {open && (
        <div style={{ position: 'fixed', bottom: 84, right: 20, width: 340, height: 480, background: 'var(--surface)', borderRadius: 'var(--r-xl)', boxShadow: 'var(--sh-lg)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', zIndex: 1000, overflow: 'hidden', animation: 'scaleIn .2s var(--ease-out)' }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--text-1)', borderRadius: 'var(--r-xl) var(--r-xl) 0 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={16} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>HireLoop AI</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Always here to help</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px' }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: m.role === 'user' ? 'var(--accent)' : 'var(--bg)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {m.role === 'user' ? <User size={13} color="#fff" /> : <Bot size={13} color="var(--text-2)" />}
                </div>
                <div style={{ maxWidth: '80%', background: m.role === 'user' ? 'var(--accent)' : 'var(--bg)', color: m.role === 'user' ? '#fff' : 'var(--text-1)', borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', padding: '9px 13px', fontSize: 13, lineHeight: 1.5, border: m.role === 'user' ? 'none' : '1px solid var(--border-light)' }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'flex-end' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--bg)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={13} color="var(--text-2)" />
                </div>
                <div style={{ background: 'var(--bg)', border: '1px solid var(--border-light)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-3)', animation: `bounce .9s ${i*0.2}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask anything…"
              rows={1}
              style={{ flex: 1, resize: 'none', border: '1.5px solid var(--border)', borderRadius: 'var(--r-md)', padding: '8px 11px', fontSize: 13, fontFamily: 'var(--font)', outline: 'none', lineHeight: 1.4, maxHeight: 80, overflowY: 'auto', background: 'var(--surface)', color: 'var(--text-1)' }}
            />
            <button onClick={send} disabled={!input.trim() || loading}
              style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: input.trim() && !loading ? 'var(--accent)' : 'var(--border-light)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', transition: 'background .15s', flexShrink: 0 }}>
              <Send size={15} color={input.trim() && !loading ? '#fff' : 'var(--text-3)'} />
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ position: 'fixed', bottom: 20, right: 20, width: 52, height: 52, borderRadius: '50%', background: 'var(--text-1)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--sh-lg)', zIndex: 1000, transition: 'all .2s var(--ease)', transform: open ? 'rotate(0deg)' : 'rotate(0deg)' }}
        title="HireLoop AI Assistant"
      >
        {open ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
      </button>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
      `}</style>
    </>
  );
}
