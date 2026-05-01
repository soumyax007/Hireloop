const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dns = require('dns').promises;
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const { getDb } = require('../db');
const { authenticate, requireSuperAdmin } = require('../middleware/auth');

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

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

    // DNS MX validation — soft fail: log but don't block if DNS lookup fails on Railway
    try {
      const domain = email.split('@')[1];
      const records = await dns.resolveMx(domain);
      if (!records || records.length === 0) return res.status(400).json({ error: `The domain "${domain}" does not appear to be a valid email domain` });
    } catch (dnsErr) {
      // Railway or other cloud environments may have DNS restrictions.
      // Only block if the error is definitely "domain not found" (ENOTFOUND), not a timeout or permission issue.
      if (dnsErr.code === 'ENOTFOUND' || dnsErr.code === 'ENODATA') {
        return res.status(400).json({ error: `Cannot verify email domain. Please use a real email address.` });
      }
      // For ETIMEOUT, ECONNREFUSED, etc. — let registration proceed
      console.warn(`DNS lookup soft-failed for ${email}: ${dnsErr.code} — allowing registration`);
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

// POST /auth/google — sign in or register via Google OAuth token
router.post('/google', async (req, res) => {
  try {
    if (!googleClient) return res.status(501).json({ error: 'Google OAuth is not configured on this server. Add GOOGLE_CLIENT_ID to Railway environment variables.' });
    const { token, role = 'student' } = req.body;
    if (!token) return res.status(400).json({ error: 'Google token required' });
    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email?.toLowerCase().trim();
    const name = payload.name || '';
    const picture = payload.picture || '';
    if (!email) return res.status(400).json({ error: 'Could not get email from Google account' });
    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE email=?').get(email);
    if (!user) {
      const uid = uuidv4(), pid = uuidv4();
      const allowedRole = ['student','recruiter','admin'].includes(role) ? role : 'student';
      db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(uid, email, bcrypt.hashSync(uuidv4(), 10), allowedRole);
      const firstName = name.split(' ')[0] || '';
      const lastName = name.split(' ').slice(1).join(' ') || '';
      if (allowedRole === 'student') {
        db.prepare('INSERT INTO student_profiles(id,user_id,first_name,last_name,college,branch,batch,cgpa,skills,avatar_url) VALUES(?,?,?,?,?,?,?,?,?,?)').run(pid, uid, firstName, lastName, 'South Asian University', 'Computer Science', 2025, 0, '[]', picture);
      } else if (allowedRole === 'recruiter') {
        db.prepare('INSERT INTO company_profiles(id,user_id,company_name,industry) VALUES(?,?,?,?)').run(pid, uid, '', 'Technology');
      } else {
        db.prepare('INSERT INTO admin_profiles(id,user_id,name,institution) VALUES(?,?,?,?)').run(pid, uid, name, 'South Asian University');
      }
      user = db.prepare('SELECT * FROM users WHERE id=?').get(uid);
    }
    if (!user.is_active) return res.status(401).json({ error: 'Account is inactive' });
    const u = { id: user.id, email: user.email, role: user.role, is_super_admin: user.is_super_admin || 0 };
    res.json({ token: sign(user.id), user: u, profile: getProfile(db, user.id, user.role) });
  } catch (e) { console.error('Google auth error:', e.message); res.status(401).json({ error: 'Invalid Google token. Please try again.' }); }
});

router.get('/me', authenticate, (req, res) => {  const db = getDb();
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
    const PROTECTED_DEMOS = ['student@sau.int', 'recruiter@sau.ac.in', 'soumya@sau.ac.in', 'udit@sau.ac.in', 'sunil@sau.ac.in', 'uddeshya@sau.ac.in', 'sumit@sau.ac.in', 'admin@sau.int'];
    if (PROTECTED_DEMOS.includes(req.user.email)) return res.status(403).json({ error: 'Demo accounts are protected and cannot be deleted.' });
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

// POST /auth/forgot-password — generates a reset token (stored in DB, returned in response for demo)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    const db = getDb();
    const user = db.prepare('SELECT id,email FROM users WHERE email=? AND is_active=1').get(email.toLowerCase().trim());
    // Always return success to prevent email enumeration
    if (!user) return res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
    // Generate a simple time-limited token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    // Store token in users table (safe migration — column added if not exists)
    try { db.exec('ALTER TABLE users ADD COLUMN reset_token TEXT'); } catch {}
    try { db.exec('ALTER TABLE users ADD COLUMN reset_expires TEXT'); } catch {}
    db.prepare('UPDATE users SET reset_token=?, reset_expires=? WHERE id=?').run(resetToken, expiresAt, user.id);
    // In production: send email. For now return token so frontend can use it directly.
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    console.log(`[RESET] ${user.email} → ${resetUrl}`);
    res.json({ success: true, message: 'If that email exists, a reset link has been sent.', resetUrl }); // remove resetUrl in prod
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to process request' }); }
});

// POST /auth/reset-password — validates token and sets new password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !token || !newPassword) return res.status(400).json({ error: 'All fields required' });
    if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email=? AND reset_token=?').get(email.toLowerCase().trim(), token);
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });
    if (new Date(user.reset_expires) < new Date()) return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });
    db.prepare('UPDATE users SET password=?, reset_token=NULL, reset_expires=NULL WHERE id=?').run(bcrypt.hashSync(newPassword, 10), user.id);
    res.json({ success: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to reset password' }); }
});

module.exports = router;
