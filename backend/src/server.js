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

// CORS
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));

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

// Stripe connectivity test — hit this to debug Railway → Stripe connection
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
