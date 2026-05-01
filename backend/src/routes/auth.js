const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dns = require('dns').promises;
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const { getDb } = require('../db');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const sign = id => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

function getProfile(db, userId, role) {
  let p = null;
  if (role === 'student') p = db.prepare('SELECT * FROM student_profiles WHERE user_id=?').get(userId);
  else if (role === 'recruiter') p = db.prepare('SELECT * FROM company_profiles WHERE user_id=?').get(userId);
  else if (role === 'admin') p = db.prepare('SELECT * FROM admin_profiles WHERE user_id=?').get(userId);
  if (p) {
    ['skills', 'eligible_branches', 'eligible_batches', 'required_skills'].forEach(f => {
      if (p[f] && typeof p[f] === 'string') try { p[f] = JSON.parse(p[f]); } catch {}
    });
  }
  return p;
}

// POST /auth/validate-email — check email domain has valid MX records
router.post('/validate-email', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ valid: false, error: 'Email required' });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.json({ valid: false, error: 'Invalid email format' });
  const domain = email.split('@')[1];
  try {
    const records = await dns.resolveMx(domain);
    if (records && records.length > 0) return res.json({ valid: true });
    return res.json({ valid: false, error: `No mail server found for ${domain}` });
  } catch {
    return res.json({ valid: false, error: `The domain "${domain}" doesn't appear to be a valid email domain` });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, ...extra } = req.body;
    if (!email || !password || !role) return res.status(400).json({ error: 'email, password, and role are required' });
    if (!['student', 'recruiter', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role' });

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });

    try {
      const domain = email.split('@')[1];
      const records = await dns.resolveMx(domain);
      if (!records || records.length === 0) return res.status(400).json({ error: `The domain "${domain}" is not a valid email domain` });
    } catch {
      return res.status(400).json({ error: `Cannot verify email domain. Please use a real email address.` });
    }

    const db = getDb();
    if (db.prepare('SELECT id FROM users WHERE email=?').get(email.toLowerCase())) return res.status(409).json({ error: 'Email already registered' });

    const uid = uuidv4(), pid = uuidv4();
    db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(uid, email.toLowerCase().trim(), bcrypt.hashSync(password, 10), role);

    if (role === 'student') {
      db.prepare('INSERT INTO student_profiles(id,user_id,first_name,last_name,college,branch,batch,cgpa,skills) VALUES(?,?,?,?,?,?,?,?,?)').run(pid, uid, extra.firstName || '', extra.lastName || '', extra.college || '', extra.branch || '', extra.batch || 2025, extra.cgpa || 0, '[]');
    } else if (role === 'recruiter') {
      db.prepare('INSERT INTO company_profiles(id,user_id,company_name,industry) VALUES(?,?,?,?)').run(pid, uid, extra.companyName || '', extra.industry || '');
    } else {
      db.prepare('INSERT INTO admin_profiles(id,user_id,name,institution) VALUES(?,?,?,?)').run(pid, uid, extra.name || 'Admin', extra.institution || '');
    }

    const user = { id: uid, email: email.toLowerCase(), role, is_super_admin: 0 };
    res.status(201).json({ token: sign(uid), user, profile: getProfile(db, uid, role) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Registration failed' }); }
});

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email=? AND is_active=1').get(email?.toLowerCase()?.trim());
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Invalid email or password' });
    const u = { id: user.id, email: user.email, role: user.role, is_super_admin: user.is_super_admin || 0 };
    res.json({ token: sign(user.id), user: u, profile: getProfile(db, user.id, user.role) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Login failed' }); }
});

// POST /auth/google — Google OAuth sign-in / sign-up
router.post('/google', async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token) return res.status(400).json({ error: 'Google token is required' });

    // 1. Verify the token with Google
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const email = payload.email.toLowerCase();
    const db = getDb();

    // 2. Check if user already exists
    let user = db.prepare('SELECT * FROM users WHERE email=? AND is_active=1').get(email);

    if (user && user.role !== 'student') {
      return res.status(403).json({ error: 'Google sign-in is restricted to student accounts only' });
    }

    if (!user) {
      // 3. New user — enforce student role
      if (role !== 'student') {
        return res.status(403).json({ error: 'Google sign-up is restricted to students only' });
      }

      const uid = uuidv4(), pid = uuidv4();
      // Random unguessable password since they authenticate via Google
      const randomPassword = bcrypt.hashSync(uuidv4(), 10);

      db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(uid, email, randomPassword, 'student');

      db.prepare('INSERT INTO student_profiles(id,user_id,first_name,last_name,college,branch,batch,cgpa,skills) VALUES(?,?,?,?,?,?,?,?,?)')
        .run(pid, uid, payload.given_name || '', payload.family_name || '', '', '', 2025, 0, '[]');

      user = db.prepare('SELECT * FROM users WHERE id=?').get(uid);
    }

    // 4. Return JWT + profile (same shape as /login)
    const u = { id: user.id, email: user.email, role: user.role, is_super_admin: user.is_super_admin || 0 };
    res.json({ token: sign(user.id), user: u, profile: getProfile(db, user.id, user.role) });

  } catch (e) {
    console.error('Google Auth Error:', e);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// GET /auth/me
router.get('/me', authenticate, (req, res) => {
  const db = getDb();
  const u = { id: req.user.id, email: req.user.email, role: req.user.role, is_super_admin: req.user.is_super_admin || 0 };
  res.json({ user: u, profile: getProfile(db, req.user.id, req.user.role) });
});

// PUT /auth/update-profile
router.put('/update-profile', authenticate, (req, res) => {
  try {
    const db = getDb();
    const { role } = req.user;
    const { firstName, lastName, college, branch, batch, cgpa, companyName, industry, description, website, headquarters, companySize, name, institution, avatarUrl } = req.body;
    if (role === 'student') {
      db.prepare(`UPDATE student_profiles SET first_name=COALESCE(?,first_name), last_name=COALESCE(?,last_name), college=COALESCE(?,college), branch=COALESCE(?,branch), batch=COALESCE(?,batch), cgpa=COALESCE(?,cgpa), avatar_url=COALESCE(?,avatar_url) WHERE user_id=?`)
        .run(firstName || null, lastName || null, college || null, branch || null, batch || null, cgpa || null, avatarUrl || null, req.user.id);
    } else if (role === 'recruiter') {
      db.prepare(`UPDATE company_profiles SET company_name=COALESCE(?,company_name), industry=COALESCE(?,industry), description=COALESCE(?,description), website=COALESCE(?,website), headquarters=COALESCE(?,headquarters), company_size=COALESCE(?,company_size) WHERE user_id=?`)
        .run(companyName || null, industry || null, description || null, website || null, headquarters || null, companySize || null, req.user.id);
    } else if (role === 'admin') {
      db.prepare(`UPDATE admin_profiles SET name=COALESCE(?,name), institution=COALESCE(?,institution) WHERE user_id=?`)
        .run(name || null, institution || null, req.user.id);
    }
    res.json({ success: true, profile: getProfile(db, req.user.id, role) });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Profile update failed' }); }
});

// PUT /auth/change-password
router.put('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
    if (!bcrypt.compareSync(currentPassword, user.password)) return res.status(401).json({ error: 'Current password is incorrect' });
    db.prepare('UPDATE users SET password=? WHERE id=?').run(bcrypt.hashSync(newPassword, 10), req.user.id);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Password change failed' }); }
});

// DELETE /auth/account — any user can delete their own account EXCEPT the super admin
router.delete('/account', authenticate, (req, res) => {
  try {
    if (req.user.is_super_admin) return res.status(403).json({ error: 'The default admin account cannot be deleted' });
    const db = getDb();
    db.prepare('DELETE FROM users WHERE id=?').run(req.user.id);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Account deletion failed' }); }
});

// DELETE /auth/users/:id — only super admin can delete any other account
router.delete('/users/:id', authenticate, requireSuperAdmin, (req, res) => {
  try {
    const db = getDb();
    const target = db.prepare('SELECT * FROM users WHERE id=?').get(req.params.id);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (target.is_super_admin) return res.status(403).json({ error: 'Cannot delete the default admin account' });
    db.prepare('DELETE FROM users WHERE id=?').run(req.params.id);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Deletion failed' }); }
});

module.exports = router;
