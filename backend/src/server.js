require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');

// Boot DB
const { getDb } = require('./db');
try { getDb(); console.log('✅ Database ready'); } catch (e) { console.error('❌ DB error:', e.message); process.exit(1); }

const app = express();

// Railway / Vercel run behind a reverse proxy — trust it for rate limiting & IP detection
app.set('trust proxy', 1);

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — allow localhost dev + production Vercel URL
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o.replace(/\/$/, '')))) return cb(null, true);
    // In development allow everything
    if (process.env.NODE_ENV !== 'production') return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// Rate limiting
app.use('/api/ai', rateLimit({ windowMs: 60*1000, max: 15, message: { error: 'Too many AI requests. Slow down.' } }));
app.use(rateLimit({ windowMs: 15*60*1000, max: 300 }));

// Body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api', require('./routes/misc'));

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok', service: 'HireLoop API v2.0',
    ai: process.env.NVIDIA_API_KEY ? 'NVIDIA Llama ✓' : '⚠ Not configured',
    payments: (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe')) ? 'Stripe ✓' : 'Demo mode',
    timestamp: new Date().toISOString()
  });
});

// One-time migration: set default admin as super admin
app.post('/api/setup/super-admin', (req, res) => {
  try {
    const { getDb } = require('./db');
    const db = getDb();
    const { email, secret } = req.body;
    if (secret !== (process.env.JWT_SECRET || '')) return res.status(403).json({ error: 'Invalid secret' });
    const result = db.prepare('UPDATE users SET is_super_admin=1 WHERE email=? AND role=?').run(email, 'admin');
    res.json({ success: true, changed: result.changes });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Seed competitions on live Railway DB (safe — uses INSERT OR IGNORE)
app.post('/api/setup/seed-competitions', (req, res) => {
  try {
    const { getDb } = require('./db');
    const db = getDb();
    const { secret } = req.body;
    if (secret !== (process.env.JWT_SECRET || '')) return res.status(403).json({ error: 'Invalid secret' });
    const { v4: uuidv4 } = require('uuid');
    const now = new Date();
    const d = (days) => new Date(now.getTime() + days*24*60*60*1000).toISOString();
    const comps = [
      ['SAU Coding Championship 2025','Test your DSA skills against the best minds at SAU.','coding',d(7),d(14),'Winner: Rs 25,000 + Google interview fast-track',200,'Individual only. No plagiarism. 3 hours per round.'],
      ['National Aptitude Challenge','Quant, logical reasoning, verbal — mirrors top company assessments.','aptitude',d(14),d(21),'Top 3: Rs 5,000 each + placement recommendation',500,'MCQ format. 90 minutes. No negative marking.'],
      ['HireLoop Hackathon — Build for Bharat','48-hour hackathon with mentors from Google and Microsoft.','hackathon',d(7),d(21),'Winner: Rs 50,000 + internship offer',150,'Teams of 2-4. At least one SAU student required.'],
      ['Business Case Study Challenge','Real-world problem from Deloitte and McKinsey consultants.','case_study',d(-5),d(0),'Winner: McKinsey case prep course + Rs 8,000',80,'Teams of 2-3. Case revealed 48 hours prior.'],
    ];
    let added = 0;
    for (const [title,desc,type,st,et,prize,max,rules] of comps) {
      const r = db.prepare('INSERT OR IGNORE INTO competitions(id,title,description,type,start_time,end_time,prize,max_participants,rules,is_active) VALUES(?,?,?,?,?,?,?,?,?,1)').run(uuidv4(),title,desc,type,st,et,prize,max,rules);
      added += r.changes;
    }
    res.json({ success: true, added });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get('/api/health/stripe', async (req, res) => {
  const { getStripe } = require('./services/payment.service');
  const stripe = getStripe();
  if (!stripe) return res.json({ status: 'demo_mode', message: 'STRIPE_SECRET_KEY not configured or is placeholder' });
  try {
    const balance = await stripe.balance.retrieve();
    res.json({ status: 'connected', available: balance.available, keyPrefix: process.env.STRIPE_SECRET_KEY?.slice(0, 8) });
  } catch (e) {
    res.status(500).json({ status: 'error', message: e.message, type: e.type, code: e.code });
  }
});

// 404
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack || err.message);
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 HireLoop API → http://localhost:${PORT}`);
  console.log(`🤖 AI: NVIDIA ${process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct'}`);
  console.log(`💳 Payments: ${(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your_stripe')) ? 'Stripe (live)' : 'Demo mode'}`);
  console.log(`📦 ENV: ${process.env.NODE_ENV}\n`);
});
