import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ChevronRight, RotateCcw, Trophy, Star, AlertCircle } from 'lucide-react';
import { ScoreRing, LoadingCenter, Alert } from '../../components/shared/UI';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_CLASS = { technical: 'q-tech', behavioral: 'q-behav', situational: 'q-sit', motivation: 'q-motiv', general: 'q-tech' };
const TYPE_LABEL = { technical: 'Technical', behavioral: 'Behavioral', situational: 'Situational', motivation: 'Motivation', general: 'General' };
const DIFF_COLOR = { easy: 'var(--green-text)', medium: 'var(--yellow-text)', hard: 'var(--red-text)' };

export default function MockInterview() {
  const [stage, setStage] = useState('setup'); // setup | interview | result
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [difficulty, setDifficulty] = useState('medium');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluations, setEvaluations] = useState([]);
  const [lastEval, setLastEval] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evalLoading, setEvalLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessLoading] = useState(true);
  const textareaRef = useRef(null);

  useEffect(() => {
    api.get('/ai/interview-sessions').then(setSessions).catch(() => {}).finally(() => setSessLoading(false));
  }, []);

  const start = async () => {
    if (!jobRole.trim()) { toast.error('Please enter a job role'); return; }
    setLoading(true);
    try {
      const d = await api.post('/ai/interview/start', { jobRole, difficulty });
      setSessionId(d.sessionId);
      setQuestions(d.questions);
      setCurrent(0); setEvaluations([]); setLastEval(null); setAnswer('');
      setStage('interview');
    } catch (e) { toast.error(e.error || 'Failed to start. Check API key.'); }
    finally { setLoading(false); }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) { toast.error('Please write your answer'); return; }
    const q = questions[current];
    setEvalLoading(true); setLastEval(null);
    try {
      const ev = await api.post('/ai/interview/evaluate', {
        sessionId, questionId: q.id, question: q.question,
        answer, questionType: q.type,
      });
      const newEvals = [...evaluations, { ...ev, question: q.question, answer, type: q.type }];
      setEvaluations(newEvals);
      setLastEval(ev);

      if (current + 1 >= questions.length) {
        // Finish session
        setTimeout(async () => {
          setLoading(true);
          try {
            const s = await api.post('/ai/interview/finish', { sessionId });
            setSummary(s);
            setStage('result');
            setSessions(prev => [{ id: sessionId, job_role: jobRole, overall_score: s.overall_score, status: 'completed', created_at: new Date().toISOString() }, ...prev]);
          } catch (e) { toast.error('Failed to get summary'); }
          finally { setLoading(false); }
        }, 1800);
      }
    } catch (e) { toast.error(e.error || 'Evaluation failed'); }
    finally { setEvalLoading(false); }
  };

  const next = () => {
    setCurrent(c => c + 1);
    setAnswer('');
    setLastEval(null);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const reset = () => { setStage('setup'); setQuestions([]); setEvaluations([]); setSummary(null); setLastEval(null); setAnswer(''); };

  const gradeColor = g => g?.startsWith('A') ? 'var(--green-text)' : g?.startsWith('B') ? 'var(--accent)' : 'var(--yellow-text)';
  const scoreColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';

  /* ── Setup ── */
  if (stage === 'setup') return (
    <div>
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div>
          <h1 className="page-title">AI Mock Interview</h1>
          <p className="page-sub">Practice with NVIDIA Llama — get scored feedback on every answer</p>
        </div>
      </div>
      <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Config */}
        <div className="card card-p">
          <div style={{ fontSize: 32, marginBottom: 16, textAlign: 'center' }}>🎤</div>
          <h2 style={{ fontWeight: 600, fontSize: 17, marginBottom: 4, textAlign: 'center' }}>Configure Your Session</h2>
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 24, textAlign: 'center' }}>5 role-specific questions · Real-time AI evaluation</p>

          <div className="form-group">
            <label className="label">Target Role</label>
            <input className="input" value={jobRole} onChange={e => setJobRole(e.target.value)}
              placeholder="e.g. Software Engineer, Data Analyst, Product Manager…" />
          </div>
          <div className="form-group">
            <label className="label">Difficulty Level</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['easy','medium','hard'].map(d => (
                <button key={d} type="button"
                  className={`btn btn-sm flex-1 ${difficulty === d ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setDifficulty(d)}
                  style={{ textTransform: 'capitalize', color: difficulty === d ? '#fff' : DIFF_COLOR[d] }}>
                  {d === 'easy' ? '🟢' : d === 'medium' ? '🟡' : '🔴'} {d}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--r-md)', padding: 14, marginBottom: 20 }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>What to expect:</div>
            {['2 Technical questions specific to your role', '1 Behavioral (STAR format)', '1 Problem-solving / situational', '1 Motivation & culture fit', 'Live score + feedback after each answer'].map(t => (
              <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
                <span style={{ color: 'var(--green)' }}>✓</span>{t}
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-full btn-lg" onClick={start} disabled={loading}>
            {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Generating questions…</> : <><Mic size={16} /> Start Interview</>}
          </button>
        </div>

        {/* Past sessions */}
        <div className="card card-p">
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Past Sessions</div>
          {sessionsLoading ? <LoadingCenter text="Loading sessions…" /> :
            sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-2)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
                <div style={{ fontSize: 14 }}>No sessions yet. Start your first interview!</div>
              </div>
            ) : sessions.map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{s.job_role}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{new Date(s.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {s.overall_score > 0 && <span style={{ fontWeight: 700, fontSize: 15, color: scoreColor(s.overall_score) }}>{s.overall_score}</span>}
                  <span className={`badge ${s.status === 'completed' ? 'badge-green' : 'badge-gray'}`}>{s.status}</span>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );

  /* ── Interview ── */
  if (stage === 'interview') {
    const q = questions[current];
    if (!q) return <LoadingCenter text="Loading question…" />;
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{jobRole} Interview</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-2)' }}>Q{current + 1}/{questions.length}</span>
            <button className="btn btn-ghost btn-sm" onClick={reset}><RotateCcw size={14} /> Restart</button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="progress-dots" style={{ marginBottom: 24 }}>
          {questions.map((_, i) => (
            <div key={i} className={`progress-dot ${i < current ? 'done' : i === current ? 'current' : ''}`} />
          ))}
        </div>

        {/* Question card */}
        <div className="question-card" style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className={`q-type-badge ${TYPE_CLASS[q.type] || 'q-tech'}`}>{TYPE_LABEL[q.type] || q.type}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: DIFF_COLOR[q.difficulty?.toLowerCase()] || 'var(--text-2)' }}>
              {q.difficulty?.toUpperCase() || 'MEDIUM'}
            </span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.6, color: 'var(--text-1)' }}>{q.question}</p>
          {q.tip && <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 10, fontStyle: 'italic' }}>💡 Tip: {q.tip}</p>}
        </div>

        {/* Previous eval feedback */}
        {lastEval && (
          <div style={{
            background: lastEval.score >= 7 ? 'var(--green-bg)' : lastEval.score >= 5 ? 'var(--yellow-bg)' : 'var(--red-bg)',
            border: `1px solid ${lastEval.score >= 7 ? 'rgba(48,209,88,.2)' : lastEval.score >= 5 ? 'rgba(245,158,11,.2)' : 'rgba(255,59,48,.2)'}`,
            borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 16
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>Score: {lastEval.score}/10</span>
              {current + 1 < questions.length && (
                <button className="btn btn-primary btn-sm" onClick={next}>Next Question <ChevronRight size={14} /></button>
              )}
            </div>
            <p style={{ fontSize: 13, marginBottom: 8 }}>{lastEval.feedback}</p>
            {lastEval.strengths?.length > 0 && <div style={{ fontSize: 12, color: 'var(--green-text)' }}>✓ {lastEval.strengths.join(' · ')}</div>}
            {lastEval.improvements?.length > 0 && <div style={{ fontSize: 12, color: 'var(--red-text)', marginTop: 4 }}>↗ {lastEval.improvements.join(' · ')}</div>}
          </div>
        )}

        {/* Answer input — only show if not evaluated yet */}
        {!lastEval && (
          <>
            <label className="label">Your Answer</label>
            <textarea ref={textareaRef} className="input" rows={8}
              placeholder="Write your answer here. For behavioral questions, use the STAR format (Situation → Task → Action → Result)…"
              value={answer} onChange={e => setAnswer(e.target.value)}
              style={{ marginBottom: 16, resize: 'vertical' }}
            />
            <button className="btn btn-primary btn-full btn-lg" onClick={submitAnswer} disabled={evalLoading || !answer.trim()}>
              {evalLoading
                ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Evaluating with AI…</>
                : current + 1 >= questions.length
                  ? <><Trophy size={16} /> Submit & See Results</>
                  : <>Submit Answer <ChevronRight size={16} /></>}
            </button>
          </>
        )}

        {/* Loading overlay for finish */}
        {loading && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontWeight: 600 }}>Generating your full report…</div>
          </div>
        )}
      </div>
    );
  }

  /* ── Result ── */
  if (stage === 'result' && summary) return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {summary.overall_score >= 85 ? '🏆' : summary.overall_score >= 70 ? '🎯' : '💪'}
        </div>
        <h1 style={{ fontWeight: 700, fontSize: 26, marginBottom: 4 }}>Interview Complete!</h1>
        <p style={{ color: 'var(--text-2)' }}>{jobRole} — {difficulty} difficulty</p>
      </div>

      {/* Score card */}
      <div className="card card-p" style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <ScoreRing score={summary.overall_score || 0} size={120} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>Performance</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: gradeColor(summary.grade), marginBottom: 4 }}>Grade {summary.grade}</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>{summary.performance_level}</div>
            {summary.readiness_percentage && (
              <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>
                🎯 {summary.readiness_percentage}% ready for this role
              </div>
            )}
          </div>
        </div>
        {summary.summary && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', fontSize: 14, lineHeight: 1.7, textAlign: 'left' }}>
            {summary.summary}
          </div>
        )}
      </div>

      <div className="grid-2" style={{ marginBottom: 20, gap: 16 }}>
        {/* Strengths */}
        <div className="card card-p">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--green-text)' }}>✅ Top Strengths</div>
          {(summary.top_strengths || []).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--green)' }}>✓</span>{s}
            </div>
          ))}
        </div>
        {/* Improvements */}
        <div className="card card-p">
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12, color: 'var(--yellow-text)' }}>↗ Priority Improvements</div>
          {(summary.priority_improvements || []).map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: 'var(--yellow)' }}>→</span>{s}
            </div>
          ))}
        </div>
      </div>

      {/* Per-question scores */}
      <div className="card card-p" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>Question-by-Question Breakdown</div>
        {evaluations.map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < evaluations.length - 1 ? '1px solid var(--border-light)' : 'none' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-full)', background: ev.score >= 7 ? 'var(--green-bg)' : ev.score >= 5 ? 'var(--yellow-bg)' : 'var(--red-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: ev.score >= 7 ? 'var(--green-text)' : ev.score >= 5 ? 'var(--yellow-text)' : 'var(--red-text)', flexShrink: 0 }}>
              {ev.score}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 3 }}>Q{i + 1}: {ev.question}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{ev.feedback}</div>
              {ev.ideal_answer_hint && <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4 }}>💡 {ev.ideal_answer_hint}</div>}
            </div>
          </div>
        ))}
      </div>

      {(summary.recommended_resources || []).length > 0 && (
        <div className="card card-p" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>📚 Recommended Resources</div>
          <div className="tags-row">
            {summary.recommended_resources.map(r => <span key={r} className="tag" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{r}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-primary" onClick={reset}><RotateCcw size={14} /> Try Again</button>
        <button className="btn btn-secondary" onClick={() => {
          const txt = `HireLoop Mock Interview Report\nRole: ${jobRole}\nScore: ${summary.overall_score}/100 (Grade ${summary.grade})\n\n${summary.summary}`;
          navigator.clipboard.writeText(txt); toast.success('Report copied!');
        }}>📋 Copy Report</button>
      </div>
    </div>
  );

  return <LoadingCenter text="Loading…" />;
}
