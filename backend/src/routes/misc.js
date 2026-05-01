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
  const { title, content, type, isPinned, targetRole } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  const id = uuidv4();
  const db = getDb();
  
  const admin = db.prepare('SELECT id FROM admin_profiles WHERE user_id=?').get(req.user.id);
  if (!admin) return res.status(404).json({ error: 'Admin profile not found' });

  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,target_role,is_pinned) VALUES(?,?,?,?,?,?,?)')
    .run(id, admin.id, title, content, type || 'info', targetRole || 'all', isPinned ? 1 : 0);

  // Broadcast notification
  let users;
  if (targetRole === 'student' || targetRole === 'recruiter') {
    users = db.prepare('SELECT id FROM users WHERE id != ? AND role = ?').all(req.user.id, targetRole);
  } else {
    users = db.prepare('SELECT id FROM users WHERE id != ?').all(req.user.id);
  }

  const insertNotif = db.prepare('INSERT INTO notifications(id,user_id,type,title,message,link) VALUES(?,?,?,?,?,?)');
  db.transaction(() => {
    for (const u of users) {
      insertNotif.run(uuidv4(), u.id, 'info', '📢 ' + title, content.slice(0, 100) + '...', '/admin/announcements');
    }
  })();

  res.json({ success: true, id });
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

router.patch('/notifications/:id/read', authenticate, (req, res) => {
  getDb().prepare('UPDATE notifications SET is_read=1 WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

router.delete('/notifications/:id', authenticate, (req, res) => {
  getDb().prepare('DELETE FROM notifications WHERE id=? AND user_id=?').run(req.params.id, req.user.id);
  res.json({ success: true });
});

// ── COMPETITIONS ─────────────────────────────────────────────────────────────

router.get('/competitions', authenticate, (req, res) => {
  const db = getDb();
  let comps;
  if (req.user.role === 'admin') {
    comps = db.prepare('SELECT * FROM competitions ORDER BY start_time ASC').all();
  } else if (req.user.role === 'recruiter') {
    comps = db.prepare('SELECT * FROM competitions WHERE status="approved" OR created_by=? ORDER BY start_time ASC').all(req.user.id);
  } else {
    comps = db.prepare('SELECT * FROM competitions WHERE status="approved" ORDER BY start_time ASC').all();
  }
  
  if (req.user.role === 'student') {
    const sp = db.prepare('SELECT id FROM student_profiles WHERE user_id=?').get(req.user.id);
    if (sp) {
      const registered = db.prepare('SELECT competition_id FROM competition_participants WHERE student_id=?').all(sp.id).map(r=>r.competition_id);
      comps.forEach(c => c.is_registered = registered.includes(c.id));
    }
  }
  res.json(comps);
});

router.post('/competitions', authenticate, authorize('admin', 'recruiter'), (req, res) => {
  const { title, description, type, startTime, endTime, prize, maxParticipants, rules } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const id = uuidv4();
  const status = req.user.role === 'admin' ? 'approved' : 'pending';
  getDb().prepare('INSERT INTO competitions(id,title,description,type,start_time,end_time,prize,max_participants,rules,status,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .run(id, title, description, type||'coding', startTime, endTime, prize, maxParticipants||0, rules, status, req.user.id);
  res.json({ success: true, id, status });
});

router.patch('/competitions/:id/approve', authenticate, authorize('admin'), (req, res) => {
  getDb().prepare('UPDATE competitions SET status="approved" WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

router.post('/competitions/:id/register', authenticate, authorize('student'), (req, res) => {
  const db = getDb();
  const sp = db.prepare('SELECT id FROM student_profiles WHERE user_id=?').get(req.user.id);
  if (!sp) return res.status(404).json({ error: 'Profile not found' });
  const comp = db.prepare('SELECT * FROM competitions WHERE id=? AND is_active=1').get(req.params.id);
  if (!comp) return res.status(404).json({ error: 'Competition not found' });
  if (comp.max_participants > 0) {
    const count = db.prepare('SELECT COUNT(*) c FROM competition_registrations WHERE competition_id=?').get(req.params.id).c;
    if (count >= comp.max_participants) return res.status(400).json({ error: 'Competition is full' });
  }
  try {
    db.prepare('INSERT INTO competition_registrations(id,competition_id,student_id) VALUES(?,?,?)').run(uuidv4(), req.params.id, sp.id);
    res.json({ success: true });
  } catch { res.status(409).json({ error: 'Already registered' }); }
});

router.delete('/competitions/:id', authenticate, authorize('admin', 'recruiter'), (req, res) => {
  getDb().prepare('DELETE FROM competitions WHERE id=?').run(req.params.id);
  res.json({ success: true });
});

// ── MOCK TESTS ───────────────────────────────────────────────────────────────

router.get('/mock-tests', authenticate, (req, res) => {
  const db = getDb();
  const tests = db.prepare('SELECT id,title,description,category,duration_minutes,total_questions,is_active,created_at FROM mock_tests WHERE is_active=1 ORDER BY created_at DESC').all();
  if (req.user.role === 'student') {
    const sp = db.prepare('SELECT id FROM student_profiles WHERE user_id=?').get(req.user.id);
    if (sp) {
      return res.json(tests.map(t => {
        const attempt = db.prepare('SELECT * FROM mock_test_attempts WHERE test_id=? AND student_id=?').get(t.id, sp.id);
        return { ...t, attempt };
      }));
    }
  }
  res.json(tests);
});

router.post('/mock-tests', authenticate, authorize('admin'), (req, res) => {
  const db = getDb();
  const { title, description, category = 'aptitude', durationMinutes = 30, totalQuestions = 20, questions = [] } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  const id = uuidv4();
  db.prepare('INSERT INTO mock_tests(id,title,description,category,duration_minutes,total_questions,questions) VALUES(?,?,?,?,?,?,?)').run(id, title, description, category, durationMinutes, totalQuestions, JSON.stringify(questions));
  res.status(201).json(db.prepare('SELECT * FROM mock_tests WHERE id=?').get(id));
});

module.exports = router;
