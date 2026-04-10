const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authenticate } = require('../middleware/auth');

const sign = id => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

function getProfile(db, userId, role) {
  let p = null;
  if (role === 'student') p = db.prepare('SELECT * FROM student_profiles WHERE user_id=?').get(userId);
  else if (role === 'recruiter') p = db.prepare('SELECT * FROM company_profiles WHERE user_id=?').get(userId);
  else if (role === 'admin') p = db.prepare('SELECT * FROM admin_profiles WHERE user_id=?').get(userId);
  if (p) {
    ['skills','eligible_branches','eligible_batches','required_skills'].forEach(f => {
      if (p[f] && typeof p[f] === 'string') try { p[f] = JSON.parse(p[f]); } catch {}
    });
  }
  return p;
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, role, ...extra } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password, and role are required' });
    if (!['student','recruiter','admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    const db = getDb();
    if (db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase())) return res.status(409).json({ error: 'Email already registered' });

    const uid = uuidv4(), pid = uuidv4();
    db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(uid, email.toLowerCase().trim(), bcrypt.hashSync(password, 10), role);

    if (role === 'student') {
      db.prepare('INSERT INTO student_profiles(id,user_id,first_name,last_name,college,branch,batch,cgpa,skills) VALUES(?,?,?,?,?,?,?,?,?)').run(pid, uid, extra.firstName||'', extra.lastName||'', extra.college||'', extra.branch||'', extra.batch||2025, extra.cgpa||0, '[]');
    } else if (role === 'recruiter') {
      db.prepare('INSERT INTO company_profiles(id,user_id,company_name,industry) VALUES(?,?,?,?)').run(pid, uid, extra.companyName||'', extra.industry||'');
    } else {
      db.prepare('INSERT INTO admin_profiles(id,user_id,name,institution) VALUES(?,?,?,?)').run(pid, uid, extra.name||'Admin', extra.institution||'');
    }

    const user = { id: uid, email: email.toLowerCase(), role };
    res.status(201).json({ token: sign(uid), user, profile: getProfile(db, uid, role) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Registration failed' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email=? AND is_active=1').get(email?.toLowerCase()?.trim());
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
    const u = { id: user.id, email: user.email, role: user.role };
    res.json({ token: sign(user.id), user: u, profile: getProfile(db, user.id, user.role) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Login failed' }); }
});

router.get('/me', authenticate, (req, res) => {
  const db = getDb();
  const u = { id: req.user.id, email: req.user.email, role: req.user.role };
  res.json({ user: u, profile: getProfile(db, req.user.id, req.user.role) });
});

module.exports = router;
