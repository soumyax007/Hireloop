const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { createPaymentIntent, confirmPayment, getPriceInfo, formatAmount, PRICES } = require('../services/payment.service');

// POST /payments/create-intent
router.post('/create-intent', authenticate, async (req, res) => {
  try {
    const { type, jobId } = req.body;
    if (!PRICES[type]) return res.status(400).json({ error: 'Invalid payment type. Use job_listing or premium_student' });

    const intent = await createPaymentIntent(type, { userId: req.user.id, jobId: jobId || '' });
    const db = getDb();
    const pid = uuidv4();
    db.prepare('INSERT INTO payments(id,user_id,type,amount_cents,currency,stripe_payment_intent_id,metadata) VALUES(?,?,?,?,?,?,?)').run(pid, req.user.id, type, intent.amount, intent.currency, intent.paymentIntentId, JSON.stringify({ jobId: jobId || '' }));

    res.json({
      ...intent,
      paymentDbId: pid,
      priceInfo: getPriceInfo(type),
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create payment: ' + e.message }); }
});

// POST /payments/confirm — called after Stripe confirms
router.post('/confirm', authenticate, async (req, res) => {
  try {
    const { paymentIntentId, paymentDbId, type, jobId } = req.body;
    const db = getDb();

    const payment = db.prepare('SELECT * FROM payments WHERE id=?').get(paymentDbId);
    if (!payment) return res.status(404).json({ error: 'Payment record not found' });
    if (payment.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    let receiptUrl = null;
    let chargeId = null;

    if (!paymentIntentId.startsWith('pi_demo')) {
      const result = await confirmPayment(paymentIntentId);
      if (result.status !== 'succeeded') return res.status(400).json({ error: 'Payment not completed' });
      receiptUrl = result.receipt_url;
      chargeId = result.charge_id;
    }

    // Mark payment complete
    db.prepare("UPDATE payments SET status='completed',stripe_charge_id=?,receipt_url=?,updated_at=datetime('now') WHERE id=?").run(chargeId||'', receiptUrl||'', paymentDbId);

    // Fulfill
    const price = getPriceInfo(type);
    if (type === 'premium_student') {
      const exp = new Date(Date.now() + 365*24*60*60*1000).toISOString();
      db.prepare('UPDATE student_profiles SET is_premium=1,premium_expires_at=? WHERE user_id=?').run(exp, req.user.id);
      db.prepare('INSERT INTO notifications(id,user_id,title,message,type) VALUES(?,?,?,?,?)').run(uuidv4(), req.user.id, '🎉 Premium Activated!', 'You now have unlimited AI interviews and priority visibility.', 'success');
    }
    if (type === 'job_listing' && jobId) {
      db.prepare('UPDATE jobs SET is_paid=1 WHERE id=?').run(jobId);
    }

    // Build receipt data
    const user = db.prepare('SELECT email FROM users WHERE id=?').get(req.user.id);
    const slip = {
      receiptId: `HL-${Date.now()}`,
      date: new Date().toISOString(),
      userEmail: user.email,
      type,
      description: price.label,
      amount: formatAmount(price.amount),
      amountCents: price.amount,
      currency: 'USD',
      paymentIntentId,
      chargeId: chargeId || null,
      stripeReceiptUrl: receiptUrl,
      status: 'PAID',
    };

    res.json({ success: true, slip });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Payment confirmation failed: ' + e.message }); }
});

// POST /payments/demo-success — demo mode without real Stripe
router.post('/demo-success', authenticate, async (req, res) => {
  try {
    const { paymentDbId, type, jobId } = req.body;
    const db = getDb();
    const payment = db.prepare('SELECT * FROM payments WHERE id=?').get(paymentDbId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    db.prepare("UPDATE payments SET status='completed',stripe_payment_intent_id=?,updated_at=datetime('now') WHERE id=?").run(`pi_demo_${Date.now()}`, paymentDbId);

    if (type === 'premium_student') {
      const exp = new Date(Date.now() + 365*24*60*60*1000).toISOString();
      db.prepare('UPDATE student_profiles SET is_premium=1,premium_expires_at=? WHERE user_id=?').run(exp, req.user.id);
      db.prepare('INSERT INTO notifications(id,user_id,title,message,type) VALUES(?,?,?,?,?)').run(uuidv4(), req.user.id, '🎉 Premium Activated! (Demo)', 'Your premium subscription is now active.', 'success');
    }
    if (type === 'job_listing' && jobId) db.prepare('UPDATE jobs SET is_paid=1 WHERE id=?').run(jobId);

    const price = getPriceInfo(type);
    const user = db.prepare('SELECT email FROM users WHERE id=?').get(req.user.id);

    res.json({
      success: true,
      slip: {
        receiptId: `HL-DEMO-${Date.now()}`,
        date: new Date().toISOString(),
        userEmail: user.email,
        type, description: price.label,
        amount: formatAmount(price.amount),
        amountCents: price.amount,
        currency: 'USD',
        paymentIntentId: `pi_demo_${Date.now()}`,
        status: 'PAID (DEMO)',
        isDemo: true,
      }
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /payments/history
router.get('/history', authenticate, (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT * FROM payments WHERE user_id=? ORDER BY created_at DESC').all(req.user.id));
});

module.exports = router;
