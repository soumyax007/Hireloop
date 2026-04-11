const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { authenticate, authorize } = require('../middleware/auth');
const { getDb } = require('../db');
const ai = require('../services/ai.service');

// POST /ai/analyse-resume
router.post('/analyse-resume', authenticate, authorize('student'), async (req, res) => {
  try {
    const { resumeText, jobDescription = '', jobId } = req.body;
    if (!resumeText || resumeText.trim().length < 50) return res.status(400).json({ error: 'Please provide resume text (minimum 50 characters)' });

    const db = getDb();
    const sp = db.prepare('SELECT * FROM student_profiles WHERE user_id=?').get(req.user.id);
    if (!sp) return res.status(404).json({ error: 'Student profile not found' });

    // Free tier: 3 analyses per day
    if (!sp.is_premium) {
      const today = new Date().toISOString().split('T')[0];
      const count = db.prepare(`SELECT COUNT(*) c FROM resume_analyses WHERE student_id=? AND created_at>=?`).get(sp.id, today).c;
      if (count >= 3) return res.status(429).json({ error: 'Daily limit reached (3). Upgrade to Premium for unlimited analyses.' });
    }

    const result = await ai.analyseResume(resumeText, jobDescription);

    // Save analysis
    const aid = uuidv4();
    db.prepare('INSERT INTO resume_analyses(id,student_id,job_description,ats_score,match_percentage,missing_keywords,suggestions,strengths,section_scores,overall_feedback) VALUES(?,?,?,?,?,?,?,?,?,?)').run(aid, sp.id, jobDescription, result.ats_score||0, result.match_percentage||0, JSON.stringify(result.missing_keywords||[]), JSON.stringify(result.suggestions||[]), JSON.stringify(result.strengths||[]), JSON.stringify(result.section_scores||{}), result.overall_feedback||'');

    if (jobId) db.prepare('UPDATE applications SET ats_score=? WHERE job_id=? AND student_id=?').run(result.ats_score||0, jobId, sp.id);

    res.json(result);
  } catch (e) { console.error('Resume analyse error:', e); res.status(500).json({ error: e.message || 'Analysis failed. Please try again.' }); }
});

// POST /ai/cover-letter
router.post('/cover-letter', authenticate, authorize('student'), async (req, res) => {
  try {
    const { resumeText, jobDescription, companyName = 'the company', jobTitle = 'this role' } = req.body;
    if (!resumeText || !jobDescription) return res.status(400).json({ error: 'Resume text and job description are required' });
    const letter = await ai.generateCoverLetter(resumeText, jobDescription, companyName, jobTitle);
    res.json({ coverLetter: letter });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Cover letter generation failed' }); }
});

// POST /ai/interview/start
router.post('/interview/start', authenticate, authorize('student'), async (req, res) => {
  try {
    const { jobRole, difficulty = 'medium' } = req.body;
    if (!jobRole) return res.status(400).json({ error: 'jobRole is required' });

    const db = getDb();
    const sp = db.prepare('SELECT * FROM student_profiles WHERE user_id=?').get(req.user.id);

    // Free tier: 3 sessions per month
    if (!sp.is_premium) {
      const monthAgo = new Date(Date.now() - 30*24*60*60*1000).toISOString();
      const count = db.prepare('SELECT COUNT(*) c FROM interview_sessions WHERE student_id=? AND created_at>?').get(sp.id, monthAgo).c;
      if (count >= 3) return res.status(429).json({ error: 'Monthly limit reached (3 sessions). Upgrade to Premium for unlimited mock interviews.' });
    }

    const questions = await ai.generateInterviewQuestions(jobRole, difficulty);
    const sid = uuidv4();
    db.prepare('INSERT INTO interview_sessions(id,student_id,job_role,questions,status) VALUES(?,?,?,?,?)').run(sid, sp.id, jobRole, JSON.stringify(questions), 'active');
    res.json({ sessionId: sid, questions, jobRole, difficulty });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to start interview: ' + e.message }); }
});

// POST /ai/interview/evaluate
router.post('/interview/evaluate', authenticate, authorize('student'), async (req, res) => {
  try {
    const { sessionId, questionId, question, answer, questionType = 'general' } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer are required' });

    const result = await ai.evaluateAnswer(question, answer, questionType);

    const db = getDb();
    const sess = db.prepare('SELECT * FROM interview_sessions WHERE id=?').get(sessionId);
    if (sess) {
      const answers = JSON.parse(sess.answers||'[]');
      const evals = JSON.parse(sess.evaluations||'[]');
      answers.push({ questionId, question, answer });
      evals.push({ questionId, ...result });
      db.prepare('UPDATE interview_sessions SET answers=?,evaluations=? WHERE id=?').run(JSON.stringify(answers), JSON.stringify(evals), sessionId);
    }

    res.json(result);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Evaluation failed: ' + e.message }); }
});

// POST /ai/interview/finish
router.post('/interview/finish', authenticate, authorize('student'), async (req, res) => {
  try {
    const { sessionId } = req.body;
    const db = getDb();
    const sess = db.prepare('SELECT * FROM interview_sessions WHERE id=?').get(sessionId);
    if (!sess) return res.status(404).json({ error: 'Session not found' });

    const evals = JSON.parse(sess.evaluations||'[]');
    const summary = await ai.generateInterviewSummary(sess.job_role, evals);

    db.prepare(`UPDATE interview_sessions SET overall_score=?,summary=?,status='completed',completed_at=datetime('now') WHERE id=?`).run(summary.overall_score||0, JSON.stringify(summary), sessionId);
    res.json(summary);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to finish interview: ' + e.message }); }
});

// GET /ai/recommendations
router.get('/recommendations', authenticate, authorize('student'), (req, res) => {
  try {
    const db = getDb();
    const sp = db.prepare('SELECT * FROM student_profiles WHERE user_id=?').get(req.user.id);
    let skills = [];
    try { skills = JSON.parse(sp.skills||'[]'); } catch {}

    const applied = db.prepare('SELECT job_id FROM applications WHERE student_id=?').all(sp.id).map(r=>r.job_id);
    let jobs = db.prepare(`SELECT j.*,cp.company_name,cp.logo_url,cp.industry FROM jobs j JOIN company_profiles cp ON j.company_id=cp.id WHERE j.status='approved' ORDER BY j.created_at DESC LIMIT 30`).all();

    const scored = jobs.map(j => {
      let req_skills = [];
      try { req_skills = JSON.parse(j.required_skills||'[]'); } catch {}
      const score = ai.scoreJobMatch(skills, req_skills);
      const already = applied.includes(j.id);
      try { j.required_skills = req_skills; } catch {}
      return { ...j, match_score: score, already_applied: already };
    }).filter(j => !j.already_applied).sort((a,b) => b.match_score - a.match_score).slice(0, 8);

    res.json(scored);
  } catch (e) { res.status(500).json({ error: 'Recommendations failed' }); }
});

// GET /ai/interview-sessions
router.get('/interview-sessions', authenticate, authorize('student'), (req, res) => {
  const db = getDb();
  const sp = db.prepare('SELECT id FROM student_profiles WHERE user_id=?').get(req.user.id);
  if (!sp) return res.json([]);
  res.json(db.prepare('SELECT id,job_role,overall_score,status,created_at,completed_at FROM interview_sessions WHERE student_id=? ORDER BY created_at DESC').all(sp.id));
});

// GET /ai/resume-analyses
router.get('/resume-analyses', authenticate, authorize('student'), (req, res) => {
  const db = getDb();
  const sp = db.prepare('SELECT id FROM student_profiles WHERE user_id=?').get(req.user.id);
  if (!sp) return res.json([]);
  res.json(db.prepare('SELECT id,ats_score,match_percentage,overall_feedback,created_at FROM resume_analyses WHERE student_id=? ORDER BY created_at DESC LIMIT 10').all(sp.id));
});

// POST /ai/chat — general assistant chatbot
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    const db = getDb();
    const role = req.user.role;
    let contextInfo = `You are HireLoop Assistant, a helpful AI for a college placement portal. User role: ${role}.`;

    if (role === 'student') {
      const sp = db.prepare('SELECT * FROM student_profiles WHERE user_id=?').get(req.user.id);
      if (sp) {
        const apps = db.prepare('SELECT COUNT(*) c FROM applications WHERE student_id=?').get(sp.id);
        contextInfo += ` Student: ${sp.first_name} ${sp.last_name}, ${sp.branch}, CGPA: ${sp.cgpa}, Applications: ${apps.c}, Premium: ${sp.is_premium ? 'Yes' : 'No'}.`;
        contextInfo += ` You can help them: navigate the portal (Dashboard, Browse Jobs, My Applications, Resume Analyser, Mock Interview, Upgrade), improve their profile, find suitable jobs, and understand their application status.`;
      }
    } else if (role === 'recruiter') {
      const cp = db.prepare('SELECT * FROM company_profiles WHERE user_id=?').get(req.user.id);
      if (cp) contextInfo += ` Recruiter at ${cp.company_name}. Help them: post jobs quickly (go to Post New Job in sidebar), manage applicants, and understand the hiring pipeline.`;
    } else if (role === 'admin') {
      const pending = db.prepare("SELECT COUNT(*) c FROM jobs WHERE status='pending'").get();
      const companies = db.prepare("SELECT COUNT(*) c FROM company_profiles WHERE is_approved=0").get();
      contextInfo += ` Admin. Pending jobs: ${pending.c}, Pending company approvals: ${companies.c}. Help them prioritize tasks and manage the platform.`;
    }

    contextInfo += ` Be concise, friendly, and specific. For navigation, tell them exactly which sidebar item to click.`;

    const msgs = [
      ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const reply = await ai.chat(contextInfo, msgs);
    res.json({ reply });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Chat failed. Please try again.' }); }
});

module.exports = router;
