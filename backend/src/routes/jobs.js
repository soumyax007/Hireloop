const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const parse = j => {
  ['required_skills','eligible_branches','eligible_batches','requirements','responsibilities'].forEach(f => {
    if (j[f] && typeof j[f] === 'string') try { j[f] = JSON.parse(j[f]); } catch {}
  });
  return j;
};

// GET /jobs — approved jobs list
router.get('/', authenticate, (req, res) => {
  const db = getDb();
  const { search, status = 'approved' } = req.query;
  let q = `SELECT j.*,cp.company_name,cp.logo_url,cp.industry,cp.website FROM jobs j JOIN company_profiles cp ON j.company_id=cp.id WHERE j.status=?`;
  const p = [status];
  if (search) { q += ' AND (j.title LIKE ? OR j.description LIKE ? OR cp.company_name LIKE ?)'; p.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  q += ' ORDER BY j.created_at DESC';
  res.json(db.prepare(q).all(...p).map(parse));
});

// GET /jobs/:id
router.get('/:id', authenticate, (req, res) => {
  const j = getDb().prepare(`SELECT j.*,cp.company_name,cp.logo_url,cp.industry,cp.website,cp.description as company_desc FROM jobs j JOIN company_profiles cp ON j.company_id=cp.id WHERE j.id=?`).get(req.params.id);
  if (!j) return res.status(404).json({ error: 'Job not found' });
  res.json(parse(j));
});

// GET /jobs/company/mine — recruiter's jobs
router.get('/company/mine', authenticate, authorize('recruiter'), (req, res) => {
  const db = getDb();
  const co = db.prepare('SELECT id FROM company_profiles WHERE user_id=?').get(req.user.id);
  if (!co) return res.status(404).json({ error: 'Company not found' });
  const jobs = db.prepare(`SELECT j.*,(SELECT COUNT(*) FROM applications WHERE job_id=j.id) as app_count FROM jobs j WHERE j.company_id=? ORDER BY j.created_at DESC`).all(co.id).map(parse);
  res.json(jobs);
});

// GET /jobs/admin/all — admin view
router.get('/admin/all', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const { status } = req.query;
  let q = `SELECT j.*,cp.company_name,cp.industry,(SELECT COUNT(*) FROM applications WHERE job_id=j.id) as app_count FROM jobs j JOIN company_profiles cp ON j.company_id=cp.id`;
  const p = [];
  if (status) { q += ' WHERE j.status=?'; p.push(status); }
  q += ' ORDER BY j.created_at DESC';
  res.json(db.prepare(q).all(...p).map(parse));
});

// POST /jobs — recruiter creates
router.post('/', authenticate, authorize('recruiter'), (req, res) => {
  const db = getDb();
  const co = db.prepare('SELECT * FROM company_profiles WHERE user_id=?').get(req.user.id);
  if (!co) return res.status(404).json({ error: 'Company profile not found' });
  if (!co.is_approved) return res.status(403).json({ error: 'Your company must be approved before posting jobs' });

  const { title, description, requirements=[], responsibilities=[], location, jobType='full-time', salaryMin=0, salaryMax=0, minCgpa=0, eligibleBranches=[], eligibleBatches=[], requiredSkills=[], applicationDeadline='', interviewDate='', slots=1 } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });

  const id = uuidv4();
  db.prepare(`INSERT INTO jobs(id,company_id,title,description,requirements,responsibilities,location,job_type,salary_min,salary_max,min_cgpa,eligible_branches,eligible_batches,required_skills,application_deadline,interview_date,slots) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(id,co.id,title,description,JSON.stringify(requirements),JSON.stringify(responsibilities),location,jobType,salaryMin,salaryMax,minCgpa,JSON.stringify(eligibleBranches),JSON.stringify(eligibleBatches),JSON.stringify(requiredSkills),applicationDeadline,interviewDate,slots);
  res.status(201).json(parse(db.prepare('SELECT * FROM jobs WHERE id=?').get(id)));
});

// PATCH /jobs/:id
router.patch('/:id', authenticate, authorize('recruiter','admin'), (req, res) => {
  const db = getDb();
  const job = db.prepare('SELECT * FROM jobs WHERE id=?').get(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  const map = { title:'title', description:'description', location:'location', salaryMin:'salary_min', salaryMax:'salary_max', minCgpa:'min_cgpa', applicationDeadline:'application_deadline', status:'status', slots:'slots', isPaid:'is_paid' };
  const jsonMap = { requiredSkills:'required_skills', eligibleBranches:'eligible_branches', eligibleBatches:'eligible_batches', requirements:'requirements', responsibilities:'responsibilities' };

  const fields=[],vals=[];
  Object.entries(map).forEach(([k,col])=>{ if(req.body[k]!==undefined){fields.push(`${col}=?`);vals.push(req.body[k]);} });
  Object.entries(jsonMap).forEach(([k,col])=>{ if(req.body[k]!==undefined){fields.push(`${col}=?`);vals.push(JSON.stringify(req.body[k]));} });
  if(fields.length){fields.push(`updated_at=datetime('now')`);db.prepare(`UPDATE jobs SET ${fields.join(',')} WHERE id=?`).run(...vals,req.params.id);}
  res.json(parse(db.prepare('SELECT * FROM jobs WHERE id=?').get(req.params.id)));
});

module.exports = router;
