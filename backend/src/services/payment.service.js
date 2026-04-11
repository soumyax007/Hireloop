const Stripe = require('stripe');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// ── Stripe ─────────────────────────────────────────────────────────────────
let _stripe = null;
function getStripe() {
  if (_stripe) return _stripe;
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) return null;
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-04-10',
    timeout: 20000,          // 20s — Railway can be slow to establish outbound connections
    maxNetworkRetries: 2,    // retry twice on network errors
    telemetry: false,        // disable Stripe telemetry to reduce connection overhead
  });
  return _stripe;
}

// ── Razorpay ───────────────────────────────────────────────────────────────
let _razorpay = null;
function getRazorpay() {
  if (_razorpay) return _razorpay;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  _razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return _razorpay;
}

// ── Prices ─────────────────────────────────────────────────────────────────
const PRICES = {
  job_listing: {
    amount_usd: 99900,       // $999 in cents
    amount_inr: 8299900,     // ₹8299 in paise
    label: 'Job Listing Fee',
    description: 'Post one job opening on HireLoop',
  },
  premium_student: {
    amount_usd: 49900,       // $499 in cents  (shown as $4.99 — 49900 = $499 → use 499 cents = $4.99)
    amount_inr: 41500,       // ₹415 in paise  (~$4.99)
    label: 'HireLoop Premium (1 Year)',
    description: 'Unlimited AI interviews + Priority visibility',
  },
};

// Fix: premium_student should be $4.99 = 499 cents
PRICES.premium_student.amount_usd = 499;
PRICES.premium_student.amount_inr = 41500;

// ── Stripe: Create Payment Intent ──────────────────────────────────────────
async function createStripeIntent(type, metadata = {}) {
  const price = PRICES[type];
  if (!price) throw new Error('Invalid payment type');

  const stripe = getStripe();
  if (!stripe) {
    return {
      gateway: 'stripe',
      clientSecret: null,
      paymentIntentId: `pi_demo_${Date.now()}`,
      amount: price.amount_usd,
      currency: 'usd',
      demo: true,
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount: price.amount_usd,
    currency: 'usd',
    metadata: { type, ...metadata },
    description: price.description,
    automatic_payment_methods: { enabled: true },
  });

  return {
    gateway: 'stripe',
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount: price.amount_usd,
    currency: 'usd',
    demo: false,
  };
}

// ── Razorpay: Create Order ─────────────────────────────────────────────────
async function createRazorpayOrder(type, metadata = {}) {
  const price = PRICES[type];
  if (!price) throw new Error('Invalid payment type');

  const razorpay = getRazorpay();
  if (!razorpay) {
    return {
      gateway: 'razorpay',
      orderId: `order_demo_${Date.now()}`,
      amount: price.amount_inr,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      demo: true,
    };
  }

  const order = await razorpay.orders.create({
    amount: price.amount_inr,
    currency: 'INR',
    notes: { type, ...metadata },
  });

  return {
    gateway: 'razorpay',
    orderId: order.id,
    amount: price.amount_inr,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID,
    demo: false,
  };
}

// ── Stripe: Confirm Payment ────────────────────────────────────────────────
async function confirmStripePayment(paymentIntentId) {
  const stripe = getStripe();
  if (!stripe || paymentIntentId.startsWith('pi_demo')) {
    return { status: 'succeeded', receipt_url: null, charge_id: null };
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  });

  let receipt_url = null, charge_id = null;
  const charge = intent.latest_charge;
  if (charge && typeof charge === 'object') {
    receipt_url = charge.receipt_url || null;
    charge_id = charge.id || null;
  }
  return { status: intent.status, receipt_url, charge_id };
}

// ── Razorpay: Verify Signature ─────────────────────────────────────────────
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return true; // demo mode
  const body = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected === signature;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getPriceInfo(type) { return PRICES[type] || null; }

function formatAmount(cents, currency = 'usd') {
  if (currency === 'INR' || currency === 'inr') return `₹${(cents / 100).toFixed(2)}`;
  return `$${(cents / 100).toFixed(2)}`;
}

module.exports = {
  createStripeIntent,
  createRazorpayOrder,
  confirmStripePayment,
  verifyRazorpaySignature,
  getPriceInfo,
  formatAmount,
  PRICES,
  getStripe,
  getRazorpay,
};
