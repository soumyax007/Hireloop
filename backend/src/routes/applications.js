const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// POST /applications — student applies
router.post('/', authenticate, authorize('student'), (req, res) => {
  const db = getDb();
  const { jobId, coverLetter = '' } = req.body;
  if (!jobId) return res.status(400).json({ error: 'jobId is required' });

  const sp = db.prepare('SELECT * FROM student_profiles WHERE user_id=?').get(req.user.id);
  if (!sp) return res.status(404).json({ error: 'Student profile not found' });

  const job = db.prepare("SELECT * FROM jobs WHERE id=? AND status='approved'").get(jobId);
  if (!job) return res.status(404).json({ error: 'Job not found or not accepting applications' });

  // Eligibility
  try {
    const branches = JSON.parse(job.eligible_branches || '[]');
    const batches = JSON.parse(job.eligible_batches || '[]');
    if (branches.length && sp.branch && !branches.includes(sp.branch)) return res.status(403).json({ error: `Your branch (${sp.branch}) is not eligible for this role` });
    if (batches.length && sp.batch && !batches.includes(Number(sp.batch))) return res.status(403).json({ error: `Your batch (${sp.batch}) is not eligible` });
    if (job.min_cgpa && sp.cgpa && sp.cgpa < job.min_cgpa) return res.status(403).json({ error: `Minimum CGPA of ${job.min_cgpa} required (yours: ${sp.cgpa})` });
  } catch {}

  if (db.prepare('SELECT id FROM applications WHERE job_id=? AND student_id=?').get(jobId, sp.id)) return res.status(409).json({ error: 'You have already applied to this job' });

  const id = uuidv4();
  db.prepare('INSERT INTO applications(id,job_id,student_id,cover_letter) VALUES(?,?,?,?)').run(id, jobId, sp.id, coverLetter);

  // Notify recruiter
  const recruiter = db.prepare('SELECT u.id FROM company_profiles cp JOIN users u ON cp.user_id=u.id WHERE cp.id=?').get(job.company_id);
  if (recruiter) db.prepare('INSERT INTO notifications(id,user_id,title,message,type,link) VALUES(?,?,?,?,?,?)').run(uuidv4(), recruiter.id, 'New Application', `${sp.first_name} ${sp.last_name} applied for ${job.title}`, 'info', '/recruiter/applicants');

  res.status(201).json({ id, message: 'Application submitted successfully' });
});

// GET /applications/mine — student's applications
router.get('/mine', authenticate, authorize('student'), (req, res) => {
  const db = getDb();
  const sp = db.prepare('SELECT id FROM student_profiles WHERE user_id=?').get(req.user.id);
  if (!sp) return res.status(404).json({ error: 'Profile not found' });
  const apps = db.prepare(`SELECT a.*,j.title as job_title,j.location,j.salary_min,j.salary_max,j.job_type,j.application_deadline,cp.company_name,cp.logo_url,cp.industry FROM applications a JOIN jobs j ON a.job_id=j.id JOIN company_profiles cp ON j.company_id=cp.id WHERE a.student_id=? ORDER BY a.applied_at DESC`).all(sp.id);
  res.json(apps);
});

// GET /applications/job/:jobId — recruiter views applicants
router.get('/job/:jobId', authenticate, authorize('recruiter','admin'), (req, res) => {
  const db = getDb();
  const { status, branch, minCgpa } = req.query;
  let q = `SELECT a.*,sp.first_name,sp.last_name,sp.cgpa,sp.branch,sp.batch,sp.skills,sp.resume_url,sp.linkedin_url,sp.github_url,sp.is_premium,u.email FROM applications a JOIN student_profiles sp ON a.student_id=sp.id JOIN users u ON sp.user_id=u.id WHERE a.job_id=?`;
  const p = [req.params.jobId];
  if (status) { q += ' AND a.status=?'; p.push(status); }
  if (branch) { q += ' AND sp.branch=?'; p.push(branch); }
  if (minCgpa) { q += ' AND sp.cgpa>=?'; p.push(parseFloat(minCgpa)); }
  q += ' ORDER BY sp.cgpa DESC,a.applied_at ASC';
  const apps = db.prepare(q).all(...p).map(a => { try { a.skills = JSON.parse(a.skills||'[]'); } catch {} return a; });
  res.json(apps);
});

// PATCH /applications/:id/status — recruiter/admin update
router.patch('/:id/status', authenticate, authorize('recruiter','admin'), (req, res) => {
  const db = getDb();
  const { status, notes, interviewSlot } = req.body;
  const valid = ['applied','shortlisted','interview_scheduled','offer','rejected'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const app = db.prepare(`SELECT a.*,j.title,j.company_id,sp.user_id as suid,sp.first_name FROM applications a JOIN jobs j ON a.job_id=j.id JOIN student_profiles sp ON a.student_id=sp.id WHERE a.id=?`).get(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  db.prepare(`UPDATE applications SET status=?,notes=?,interview_slot=?,updated_at=datetime('now') WHERE id=?`).run(status, notes||app.notes, interviewSlot||app.interview_slot, req.params.id);

  // Notify student
  const msgs = { shortlisted:'You\'ve been shortlisted! Check your dashboard.', interview_scheduled:`Interview scheduled${interviewSlot ? ` for ${interviewSlot}` : ''}.`, offer:'🎉 Congratulations! You have received a job offer!', rejected:'Application status update.' };
  if (msgs[status]) db.prepare('INSERT INTO notifications(id,user_id,title,message,type) VALUES(?,?,?,?,?)').run(uuidv4(), app.suid, `Update: ${app.title}`, msgs[status], status === 'offer' ? 'success' : status === 'rejected' ? 'warning' : 'info');

  res.json({ success: true, status });
});

// GET /applications/stats — admin overview
router.get('/stats/overview', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  res.json({
    total: db.prepare('SELECT COUNT(*) c FROM applications').get().c,
    byStatus: db.prepare('SELECT status,COUNT(*) count FROM applications GROUP BY status').all(),
    totalStudents: db.prepare('SELECT COUNT(*) c FROM student_profiles').get().c,
    premiumStudents: db.prepare('SELECT COUNT(*) c FROM student_profiles WHERE is_premium=1').get().c,
    totalCompanies: db.prepare('SELECT COUNT(*) c FROM company_profiles WHERE is_approved=1').get().c,
    pendingCompanies: db.prepare('SELECT COUNT(*) c FROM company_profiles WHERE is_approved=0').get().c,
    activeJobs: db.prepare("SELECT COUNT(*) c FROM jobs WHERE status='approved'").get().c,
    placed: db.prepare("SELECT COUNT(*) c FROM applications WHERE status='offer'").get().c,
    avgPackageLPA: (() => { const r = db.prepare("SELECT AVG(j.salary_max) avg FROM applications a JOIN jobs j ON a.job_id=j.id WHERE a.status='offer'").get(); return r.avg ? +(r.avg / 100000).toFixed(1) : 0; })(),
    maxPackageLPA: (() => { const r = db.prepare("SELECT MAX(j.salary_max) max FROM applications a JOIN jobs j ON a.job_id=j.id WHERE a.status='offer'").get(); return r.max ? +(r.max / 100000).toFixed(1) : 0; })(),
  });
});

module.exports = router;
