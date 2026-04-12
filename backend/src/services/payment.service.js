const Razorpay = require('razorpay');
const crypto   = require('crypto');

// ── Razorpay ───────────────────────────────────────────────────────────────
let _razorpay = null;
function getRazorpay() {
  if (_razorpay) return _razorpay;
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  _razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return _razorpay;
}

// ── Prices ─────────────────────────────────────────────────────────────────
const PRICES = {
  job_listing: {
    amount_inr:  829900,   // ₹8299 in paise
    label:       'Job Listing Fee',
    description: 'Post one job opening on HireLoop',
  },
  premium_student: {
    amount_inr:  41500,    // ₹415 in paise
    label:       'HireLoop Premium (1 Year)',
    description: 'Unlimited AI interviews + Priority visibility',
  },
};

// ── Create Razorpay Order ──────────────────────────────────────────────────
async function createRazorpayOrder(type, metadata = {}) {
  const price = PRICES[type];
  if (!price) throw new Error('Invalid payment type');

  const razorpay = getRazorpay();
  if (!razorpay) {
    // Demo mode
    return {
      gateway:  'razorpay',
      orderId:  `order_demo_${Date.now()}`,
      amount:   price.amount_inr,
      currency: 'INR',
      keyId:    process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
      demo:     true,
    };
  }

  const order = await razorpay.orders.create({
    amount:   price.amount_inr,
    currency: 'INR',
    notes:    { type, ...metadata },
  });

  return {
    gateway:  'razorpay',
    orderId:  order.id,
    amount:   price.amount_inr,
    currency: 'INR',
    keyId:    process.env.RAZORPAY_KEY_ID,
    demo:     false,
  };
}

// ── Verify Razorpay Signature ──────────────────────────────────────────────
function verifyRazorpaySignature(orderId, paymentId, signature) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return true; // demo mode
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expected === signature;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getPriceInfo(type) { return PRICES[type] || null; }

function formatAmount(paise) {
  return `₹${(paise / 100).toFixed(2)}`;
}

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  getPriceInfo,
  formatAmount,
  PRICES,
};
