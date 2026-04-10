const Stripe = require('stripe');

let _stripe = null;

function getStripe() {
  if (_stripe) return _stripe;
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('your_stripe')) {
    return null; // Demo mode
  }
  _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-04-10' });
  return _stripe;
}

const PRICES = {
  job_listing: { amount: 99900, label: 'Job Listing Fee', description: 'Post one job opening on HireLoop' },
  premium_student: { amount: 49900, label: 'HireLoop Premium (1 Year)', description: 'Unlimited AI interviews + Priority visibility' },
};

async function createPaymentIntent(type, metadata = {}) {
  const price = PRICES[type];
  if (!price) throw new Error('Invalid payment type');

  const stripe = getStripe();
  if (!stripe) {
    // Demo mode - return mock intent
    return {
      clientSecret: null,
      paymentIntentId: `pi_demo_${Date.now()}`,
      amount: price.amount,
      currency: 'usd',
      demo: true,
    };
  }

  const intent = await stripe.paymentIntents.create({
    amount: price.amount,
    currency: 'usd',
    metadata: { type, ...metadata },
    description: price.description,
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: intent.client_secret,
    paymentIntentId: intent.id,
    amount: price.amount,
    currency: 'usd',
    demo: false,
  };
}

async function confirmPayment(paymentIntentId) {
  const stripe = getStripe();
  if (!stripe || paymentIntentId.startsWith('pi_demo')) {
    return { status: 'succeeded', receipt_url: null, charge_id: null };
  }

  const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  let receipt_url = null;
  let charge_id = null;

  if (intent.latest_charge) {
    const charge = await stripe.charges.retrieve(intent.latest_charge);
    receipt_url = charge.receipt_url;
    charge_id = charge.id;
  }

  return { status: intent.status, receipt_url, charge_id };
}

function getPriceInfo(type) {
  return PRICES[type] || null;
}

function formatAmount(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

module.exports = { createPaymentIntent, confirmPayment, getPriceInfo, formatAmount, PRICES };
