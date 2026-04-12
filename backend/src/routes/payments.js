const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authenticate } = require('../middleware/auth');
const {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getPriceInfo,
  formatAmount,
  PRICES,
} = require('../services/payment.service');

// ── Helper: fulfill after successful payment ───────────────────────────────
function fulfillPayment(db, type, jobId, userId) {
  if (type === 'premium_student') {
    const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare('UPDATE student_profiles SET is_premium=1,premium_expires_at=? WHERE user_id=?').run(exp, userId);
    db.prepare('INSERT INTO notifications(id,user_id,title,message,type) VALUES(?,?,?,?,?)')
      .run(uuidv4(), userId, 'Premium Activated!', 'You now have unlimited AI interviews and priority visibility.', 'success');
  }
  if (type === 'job_listing' && jobId) {
    db.prepare('UPDATE jobs SET is_paid=1 WHERE id=?').run(jobId);
  }
}

// ── POST /payments/create-razorpay-order ──────────────────────────────────
router.post('/create-razorpay-order', authenticate, async (req, res) => {
  try {
    const { type, jobId } = req.body;
    if (!PRICES[type]) return res.status(400).json({ error: 'Invalid payment type' });

    const order = await createRazorpayOrder(type, { userId: req.user.id, jobId: jobId || '' });
    const db  = getDb();
    const pid = uuidv4();

    db.prepare(
      'INSERT INTO payments(id,user_id,type,amount_cents,currency,stripe_payment_intent_id,metadata) VALUES(?,?,?,?,?,?,?)'
    ).run(pid, req.user.id, type, order.amount, order.currency, order.orderId, JSON.stringify({ jobId: jobId || '', gateway: 'razorpay' }));

    res.json({ ...order, paymentDbId: pid, priceInfo: getPriceInfo(type) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to create order: ' + e.message });
  }
});

// ── POST /payments/confirm-razorpay ───────────────────────────────────────
router.post('/confirm-razorpay', authenticate, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentDbId, type, jobId } = req.body;
    const db = getDb();

    const payment = db.prepare('SELECT * FROM payments WHERE id=?').get(paymentDbId);
    if (!payment)                      return res.status(404).json({ error: 'Payment record not found' });
    if (payment.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    // Verify signature (skip in demo)
    if (!razorpay_order_id.startsWith('order_demo')) {
      const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
      if (!valid) return res.status(400).json({ error: 'Invalid payment signature' });
    }

    db.prepare("UPDATE payments SET status='completed',stripe_charge_id=?,updated_at=datetime('now') WHERE id=?")
      .run(razorpay_payment_id || 'demo', paymentDbId);

    fulfillPayment(db, type, jobId, req.user.id);

    const price = getPriceInfo(type);
    const user  = db.prepare('SELECT email FROM users WHERE id=?').get(req.user.id);

    res.json({
      success: true,
      slip: {
        receiptId:       `HL-RZP-${Date.now()}`,
        date:            new Date().toISOString(),
        userEmail:       user.email,
        type,
        description:     price.label,
        amount:          formatAmount(price.amount_inr),
        currency:        'INR',
        gateway:         'Razorpay',
        paymentIntentId: razorpay_payment_id || razorpay_order_id,
        status:          'PAID',
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Razorpay confirmation failed: ' + e.message });
  }
});

// ── POST /payments/demo-success ───────────────────────────────────────────
router.post('/demo-success', authenticate, async (req, res) => {
  try {
    const { paymentDbId, type, jobId } = req.body;
    const db = getDb();

    const payment = db.prepare('SELECT * FROM payments WHERE id=?').get(paymentDbId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    db.prepare("UPDATE payments SET status='completed',stripe_payment_intent_id=?,updated_at=datetime('now') WHERE id=?")
      .run(`rzp_demo_${Date.now()}`, paymentDbId);

    fulfillPayment(db, type, jobId, req.user.id);

    const price = getPriceInfo(type);
    const user  = db.prepare('SELECT email FROM users WHERE id=?').get(req.user.id);

    res.json({
      success: true,
      slip: {
        receiptId:       `HL-DEMO-${Date.now()}`,
        date:            new Date().toISOString(),
        userEmail:       user.email,
        type,
        description:     price.label,
        amount:          formatAmount(price.amount_inr),
        currency:        'INR',
        gateway:         'Razorpay (Demo)',
        paymentIntentId: `rzp_demo_${Date.now()}`,
        status:          'PAID (DEMO)',
        isDemo:          true,
      },
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── GET /payments/history ─────────────────────────────────────────────────
router.get('/history', authenticate, (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC').all(req.user.id));
});

module.exports = router;
