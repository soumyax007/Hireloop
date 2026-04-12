const jwt = require('jsonwebtoken');
const { getDb } = require('../db');

const authenticate = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Authentication required' });
  try {
    const { userId } = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    const user = getDb().prepare('SELECT id,email,role,is_active,is_super_admin FROM users WHERE id=?').get(userId);
    if (!user || !user.is_active) return res.status(401).json({ error: 'Account not found or inactive' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};

// Only the super admin (default admin) can perform this action
const requireSuperAdmin = (req, res, next) => {
  if (!req.user.is_super_admin) return res.status(403).json({ error: 'Only the default admin can perform this action' });
  next();
};

module.exports = { authenticate, authorize, requireSuperAdmin };
