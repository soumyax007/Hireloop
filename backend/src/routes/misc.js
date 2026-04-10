const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

// ── PROFILE ─────────────────────────────────────────────────────────────────

router.patch('/profile/student', authenticate, authorize('student'), (req, res) => {
  const db = getDb();
  const { firstName, lastName, phone, college, branch, batch, cgpa, skills=[], bio, linkedinUrl, githubUrl, portfolioUrl } = req.body;
  db.prepare(`UPDATE student_profiles SET first_name=?,last_name=?,phone=?,college=?,branch=?,batch=?,cgpa=?,skills=?,bio=?,linkedin_url=?,github_url=?,portfolio_url=?,updated_at=datetime('now') WHERE user_id=?`).run(firstName, lastName, phone, college, branch, batch, cgpa, JSON.stringify(skills), bio, linkedinUrl, githubUrl, portfolioUrl, req.user.id);
  const p = db.prepare('SELECT * FROM student_profiles WHERE user_id=?').get(req.user.id);
  try { p.skills = JSON.parse(p.skills||'[]'); } catch {}
  res.json(p);
});

router.patch('/profile/company', authenticate, authorize('recruiter'), (req, res) => {
  const db = getDb();
  const { companyName, industry, description, website, headquarters, companySize } = req.body;
  db.prepare(`UPDATE company_profiles SET company_name=?,industry=?,description=?,website=?,headquarters=?,company_size=?,updated_at=datetime('now') WHERE user_id=?`).run(companyName, industry, description, website, headquarters, companySize, req.user.id);
  res.json(db.prepare('SELECT * FROM company_profiles WHERE user_id=?').get(req.user.id));
});

// ── ADMIN ────────────────────────────────────────────────────────────────────

router.get('/admin/companies', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const { approved } = req.query;
  let q = 'SELECT cp.*,u.email,(SELECT COUNT(*) FROM jobs WHERE company_id=cp.id) as job_count FROM company_profiles cp JOIN users u ON cp.user_id=u.id';
  const p = [];
  if (approved !== undefined) { q += ' WHERE cp.is_approved=?'; p.push(parseInt(approved)); }
  res.json(db.prepare(q + ' ORDER BY cp.created_at DESC').all(...p));
});

router.patch('/admin/companies/:id/approve', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const { approved } = req.body;
  db.prepare('UPDATE company_profiles SET is_approved=? WHERE id=?').run(approved ? 1 : 0, req.params.id);
  const co = db.prepare('SELECT cp.*,u.id as uid FROM company_profiles cp JOIN users u ON cp.user_id=u.id WHERE cp.id=?').get(req.params.id);
  if (co) db.prepare('INSERT INTO notifications(id,user_id,title,message,type) VALUES(?,?,?,?,?)').run(uuidv4(), co.uid, approved ? '✅ Company Approved' : '❌ Registration Rejected', approved ? 'Your company is approved. You can now post jobs.' : 'Your registration was not approved. Contact placement cell.', approved ? 'success' : 'warning');
  res.json({ success: true });
});

router.get('/admin/students', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const students = db.prepare(`SELECT sp.*,u.email,(SELECT COUNT(*) FROM applications WHERE student_id=sp.id) as app_count,(SELECT COUNT(*) FROM applications WHERE student_id=sp.id AND status='offer') as offers FROM student_profiles sp JOIN users u ON sp.user_id=u.id ORDER BY sp.cgpa DESC`).all();
  students.forEach(s => { try { s.skills = JSON.parse(s.skills||'[]'); } catch {} });
  res.json(students);
});

router.post('/admin/announcements', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const admin = db.prepare('SELECT id FROM admin_profiles WHERE user_id=?').get(req.user.id);
  if (!admin) return res.status(404).json({ error: 'Admin profile not found' });
  const { title, content, type='info', targetRole='all', isPinned=false, expiresAt } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const id = uuidv4();
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,target_role,is_pinned,expires_at) VALUES(?,?,?,?,?,?,?,?)').run(id, admin.id, title, content, type, targetRole, isPinned?1:0, expiresAt||null);
  res.status(201).json(db.prepare('SELECT * FROM announcements WHERE id=?').get(id));
});

router.delete('/admin/announcements/:id', authenticate, authorize('admin'), (req, res) => {
  getDb().prepare('DELETE FROM announcements WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

router.get('/admin/report', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const byBranch = db.prepare(`SELECT sp.branch,COUNT(DISTINCT a.student_id) placed,AVG(j.salary_max) avg_pkg,MAX(j.salary_max) max_pkg FROM applications a JOIN student_profiles sp ON a.student_id=sp.id JOIN jobs j ON a.job_id=j.id WHERE a.status='offer' GROUP BY sp.branch ORDER BY placed DESC`).all();
  const byCompany = db.prepare(`SELECT cp.company_name,COUNT(a.id) offers,AVG(j.salary_max) avg_pkg FROM applications a JOIN jobs j ON a.job_id=j.id JOIN company_profiles cp ON j.company_id=cp.id WHERE a.status='offer' GROUP BY cp.company_name ORDER BY offers DESC`).all();
  const overview = {
    totalStudents: db.prepare('SELECT COUNT(*) c FROM student_profiles').get().c,
    totalPlaced: db.prepare("SELECT COUNT(DISTINCT student_id) c FROM applications WHERE status='offer'").get().c,
    totalCompanies: db.prepare('SELECT COUNT(*) c FROM company_profiles WHERE is_approved=1').get().c,
    totalOffers: db.prepare("SELECT COUNT(*) c FROM applications WHERE status='offer'").get().c,
    avgPackageLPA: (() => { const r=db.prepare("SELECT AVG(j.salary_max) v FROM applications a JOIN jobs j ON a.job_id=j.id WHERE a.status='offer'").get(); return r.v?+(r.v/100000).toFixed(1):0; })(),
    maxPackageLPA: (() => { const r=db.prepare("SELECT MAX(j.salary_max) v FROM applications a JOIN jobs j ON a.job_id=j.id WHERE a.status='offer'").get(); return r.v?+(r.v/100000).toFixed(1):0; })(),
  };
  overview.placementRate = overview.totalStudents ? Math.round(overview.totalPlaced/overview.totalStudents*100) : 0;
  res.json({ overview, byBranch, byCompany });
});

// ── NOTIFICATIONS ────────────────────────────────────────────────────────────

router.get('/notifications', authenticate, (req, res) => {
  const db = getDb();
  const notifs = db.prepare('SELECT * FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 50').all(req.user.id);
  const unread = db.prepare('SELECT COUNT(*) c FROM notifications WHERE user_id=? AND is_read=0').get(req.user.id).c;
  res.json({ notifications: notifs, unreadCount: unread });
});

router.patch('/notifications/read-all', authenticate, (req, res) => {
  getDb().prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.user.id);
  res.json({ success: true });
});

// ── ANNOUNCEMENTS ────────────────────────────────────────────────────────────

router.get('/announcements', authenticate, (req, res) => {
  const db = getDb();
  const announcements = db.prepare(`SELECT a.*,ap.name as author FROM announcements a JOIN admin_profiles ap ON a.admin_id=ap.id WHERE (a.target_role='all' OR a.target_role=?) AND (a.expires_at IS NULL OR a.expires_at>datetime('now')) ORDER BY a.is_pinned DESC,a.created_at DESC LIMIT 20`).all(req.user.role);
  res.json(announcements);
});

module.exports = router;
