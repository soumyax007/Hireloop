import { useState } from 'react';
import { Upload, Brain, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { ScoreRing, ProgressBar, LoadingCenter, Alert } from '../../components/shared/UI';
import { parseArr } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ResumeAI() {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [genCL, setGenCL] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [tab, setTab] = useState('analyse');

  const analyse = async () => {
    if (!resumeText.trim() || resumeText.trim().length < 50) { toast.error('Please paste your resume text (min 50 chars)'); return; }
    setLoading(true); setResult(null);
    try {
      const d = await api.post('/ai/analyse-resume', { resumeText, jobDescription: jobDesc });
      setResult(d);
      toast.success('Analysis complete!');
    } catch (e) { toast.error(e.error || 'Analysis failed. Check your API key.'); }
    finally { setLoading(false); }
  };

  const genCoverLetter = async () => {
    if (!resumeText || !jobDesc) { toast.error('Both resume and job description needed for cover letter'); return; }
    setGenCL(true);
    try {
      const d = await api.post('/ai/cover-letter', { resumeText, jobDescription: jobDesc, companyName: 'the company', jobTitle: 'this position' });
      setCoverLetter(d.coverLetter);
      setTab('cover');
      toast.success('Cover letter generated! ✨');
    } catch (e) { toast.error('Generation failed'); }
    finally { setGenCL(false); }
  };

  const atsColor = s => s >= 75 ? 'var(--green)' : s >= 50 ? 'var(--yellow)' : 'var(--red)';
  const atsBg = s => s >= 75 ? 'var(--green-bg)' : s >= 50 ? 'var(--yellow-bg)' : 'var(--red-bg)';

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="page-title">AI Resume Analyser</h1>
          <p className="page-sub">Powered by NVIDIA Llama — get ATS score, keyword gaps, and improvement tips</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, background:'var(--bg)', padding:3, borderRadius:'var(--r-md)', width:'fit-content' }}>
        {[['analyse','🧠 Analyse'],['cover','📝 Cover Letter']].map(([v,l]) => (
          <button key={v} className={`btn btn-sm ${tab===v?'btn-primary':'btn-ghost'}`} onClick={() => setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === 'analyse' && (
        <div className="grid-2" style={{ gap: 20, alignItems: 'start' }}>
          {/* Input panel */}
          <div>
            <div className="card card-p" style={{ marginBottom: 16 }}>
              <label className="label">📄 Paste Your Resume</label>
              <textarea className="input" rows={12} placeholder="Paste your full resume text here…&#10;&#10;Include: Work Experience, Skills, Education, Projects, etc." value={resumeText} onChange={e => setResumeText(e.target.value)} style={{ fontFamily: 'monospace', fontSize: 13 }} />
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-3)' }}>{resumeText.length} characters</div>
            </div>
            <div className="card card-p" style={{ marginBottom: 16 }}>
              <label className="label">🎯 Job Description <span style={{ color:'var(--text-3)',fontWeight:400 }}>(optional — for match score)</span></label>
              <textarea className="input" rows={6} placeholder="Paste the job description to get a match score and targeted keyword analysis…" value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary btn-full" onClick={analyse} disabled={loading}>
                {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor:'#fff' }}/> Analysing with AI…</> : <><Brain size={16}/> Analyse Resume</>}
              </button>
              {jobDesc && (
                <button className="btn btn-secondary" onClick={genCoverLetter} disabled={genCL}>
                  {genCL ? <div className="spinner spinner-sm"/> : <Zap size={16}/>}
                </button>
              )}
            </div>
          </div>

          {/* Results panel */}
          <div>
            {!result && !loading && (
              <div className="card" style={{ padding: 40, textAlign:'center', color:'var(--text-2)' }}>
                <Brain size={40} color="var(--border)" style={{ margin:'0 auto 12px' }}/>
                <div style={{ fontWeight:600, marginBottom:6 }}>Ready to analyse</div>
                <div style={{ fontSize:13 }}>Paste your resume and click Analyse to get your ATS score, keyword gaps, and personalized improvements.</div>
              </div>
            )}
            {loading && (
              <div className="card" style={{ padding:40, textAlign:'center' }}>
                <div className="spinner spinner-lg" style={{ margin:'0 auto 16px' }}/>
                <div style={{ fontWeight:600, marginBottom:6 }}>Analysing with NVIDIA Llama…</div>
                <div style={{ fontSize:13, color:'var(--text-2)' }}>This may take 10–20 seconds</div>
              </div>
            )}
            {result && (
              <div>
                {/* Score cards */}
                <div className="card card-p" style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
                    <div style={{ textAlign:'center' }}>
                      <ScoreRing score={result.ats_score || 0} size={100}/>
                      <div style={{ fontSize:12, color:'var(--text-2)', marginTop:6 }}>ATS Score</div>
                    </div>
                    {result.match_percentage > 0 && (
                      <div style={{ textAlign:'center' }}>
                        <ScoreRing score={result.match_percentage} size={80}/>
                        <div style={{ fontSize:12, color:'var(--text-2)', marginTop:6 }}>Job Match</div>
                      </div>
                    )}
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ fontWeight:600, fontSize:14, marginBottom:8 }}>Section Scores</div>
                      {Object.entries(result.section_scores || {}).map(([k,v]) => (
                        <div key={k} style={{ marginBottom:8 }}>
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:3 }}>
                            <span style={{ textTransform:'capitalize', color:'var(--text-2)' }}>{k}</span>
                            <span style={{ fontWeight:500 }}>{v}%</span>
                          </div>
                          <ProgressBar value={v} />
                        </div>
                      ))}
                    </div>
                  </div>
                  {result.overall_feedback && (
                    <div style={{ marginTop:12, padding:'10px 14px', background:'var(--surface-2)', borderRadius:'var(--r-md)', fontSize:13, color:'var(--text-1)', lineHeight:1.6 }}>
                      💡 {result.overall_feedback}
                    </div>
                  )}
                </div>

                {/* Strengths */}
                {(result.strengths || []).length > 0 && (
                  <div className="card card-p" style={{ marginBottom:14 }}>
                    <div style={{ fontWeight:600, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                      <CheckCircle size={16} color="var(--green)"/> Strengths
                    </div>
                    {(result.strengths || []).map((s,i) => (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:6, fontSize:13 }}>
                        <span style={{ color:'var(--green)', marginTop:1 }}>✓</span> {s}
                      </div>
                    ))}
                  </div>
                )}

                {/* Missing Keywords */}
                {(result.missing_keywords || []).length > 0 && (
                  <div className="card card-p" style={{ marginBottom:14 }}>
                    <div style={{ fontWeight:600, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
                      <AlertCircle size={16} color="var(--yellow)"/> Missing Keywords
                    </div>
                    <div className="tags-row">
                      {(result.missing_keywords || []).map(k => (
                        <span key={k} className="tag" style={{ background:'var(--red-bg)', color:'var(--red-text)', border:'1px solid rgba(255,59,48,.2)' }}>+ {k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggestions */}
                {(result.suggestions || []).length > 0 && (
                  <div className="card card-p">
                    <div style={{ fontWeight:600, marginBottom:10 }}>💡 Improvement Suggestions</div>
                    {(result.suggestions || []).slice(0, showMore ? undefined : 3).map((s,i) => (
                      <div key={i} style={{ marginBottom:12, padding:'10px 12px', borderRadius:'var(--r-md)', background:'var(--surface-2)', fontSize:13 }}>
                        <div style={{ fontWeight:600, color:'var(--accent)', marginBottom:3 }}>{typeof s === 'object' ? s.category : `Tip ${i+1}`}</div>
                        {typeof s === 'object' ? (
                          <>
                            <div style={{ color:'var(--red-text)', marginBottom:3 }}>Issue: {s.issue}</div>
                            <div style={{ color:'var(--green-text)' }}>Fix: {s.fix}</div>
                          </>
                        ) : <div>{s}</div>}
                      </div>
                    ))}
                    {(result.suggestions || []).length > 3 && (
                      <button className="btn btn-ghost btn-sm w-full" onClick={() => setShowMore(s=>!s)}>
                        {showMore ? <><ChevronUp size={14}/> Show less</> : <><ChevronDown size={14}/> Show {result.suggestions.length - 3} more</>}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'cover' && (
        <div className="card card-p">
          <div className="section-header">
            <div>
              <div className="section-title">📝 Cover Letter</div>
              <div className="section-sub">AI-generated, ready to personalise</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={genCoverLetter} disabled={genCL || !resumeText || !jobDesc}>
              {genCL ? <div className="spinner spinner-sm" style={{ borderTopColor:'#fff' }}/> : '✨'} Regenerate
            </button>
          </div>
          {!coverLetter ? (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-2)' }}>
              <div style={{ fontSize:32, marginBottom:10 }}>📝</div>
              <div style={{ fontWeight:600, marginBottom:6 }}>No cover letter yet</div>
              <div style={{ fontSize:13, marginBottom:16 }}>Add your resume + job description on the Analyse tab, then click AI Generate</div>
              <button className="btn btn-secondary" onClick={() => setTab('analyse')}>← Go to Analyse</button>
            </div>
          ) : (
            <>
              <textarea className="input" rows={16} value={coverLetter} onChange={e => setCoverLetter(e.target.value)} style={{ fontFamily:'var(--font)', fontSize:14, lineHeight:1.7 }} />
              <div style={{ marginTop:12, display:'flex', gap:10 }}>
                <button className="btn btn-primary" onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success('Copied!'); }}>📋 Copy</button>
                <button className="btn btn-secondary" onClick={() => {
                  const el = document.createElement('a');
                  el.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(coverLetter);
                  el.download = 'cover_letter.txt'; el.click();
                }}>⬇ Download</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
