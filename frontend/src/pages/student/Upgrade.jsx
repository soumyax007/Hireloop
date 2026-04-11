import { useState } from 'react';
import { Star, CreditCard, Shield, Download, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

// ── Receipt Slip ────────────────────────────────────────────────────────────
function ReceiptSlip({ slip, onClose }) {
  const printSlip = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>HireLoop Receipt</title><style>body{font-family:-apple-system,sans-serif;max-width:420px;margin:40px auto;padding:24px;color:#1d1d1f}.logo{text-align:center;font-size:20px;font-weight:700;margin-bottom:4px}.sub{text-align:center;font-size:12px;color:#6e6e73;margin-bottom:24px}hr{border:none;border-top:1px dashed #d2d2d7;margin:20px 0}.amount{text-align:center;font-size:36px;font-weight:700;margin:16px 0}.row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px}.label{color:#6e6e73}.stamp{text-align:center;background:#e6f9ed;color:#1a7f37;padding:10px;border-radius:8px;font-weight:600;margin-top:20px}</style></head><body><div class="logo">🔗 HireLoop</div><div class="sub">Official Payment Receipt</div><hr><div class="amount">${slip.amount}</div><hr>${[['Receipt ID',slip.receiptId],['Date',new Date(slip.date).toLocaleString()],['Email',slip.userEmail],['Description',slip.description],['Gateway',slip.gateway],['Currency',slip.currency],['Status',slip.status]].map(([l,v])=>`<div class="row"><span class="label">${l}</span><span>${v}</span></div>`).join('')}<hr><div class="stamp">✓ PAYMENT CONFIRMED${slip.isDemo?' (DEMO)':''}</div></body></html>`);
    w.document.close(); w.print();
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
        <h3 style={{ fontWeight: 700, fontSize: 18 }}>Payment Successful!</h3>
        <p style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>Your {slip.description} is now active</p>
      </div>

      <div className="receipt-card">
        <div className="receipt-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>🔗 HireLoop</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Official Payment Receipt</div>
        </div>

        <div className="receipt-amount">{slip.amount}</div>
        <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-2)', marginBottom: 8 }}>{slip.description}</div>
        <hr className="receipt-divider" />

        {[
          ['Receipt ID', slip.receiptId],
          ['Date', new Date(slip.date).toLocaleString('en-IN')],
          ['Email', slip.userEmail],
          ['Gateway', slip.gateway],
          ['Currency', slip.currency],
          ['Payment ID', slip.paymentIntentId ? slip.paymentIntentId.slice(0, 22) + '…' : '—'],
          ['Status', slip.status],
        ].map(([l, v]) => (
          <div className="receipt-row" key={l}>
            <label>{l}</label>
            <span style={{ textAlign: 'right', maxWidth: '60%', wordBreak: 'break-all', fontSize: 13 }}>{v}</span>
          </div>
        ))}

        <div className="receipt-stamp">✓ PAYMENT CONFIRMED{slip.isDemo ? ' (DEMO MODE)' : ''}</div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
        <button className="btn btn-primary flex-1" onClick={printSlip}><Download size={14} /> Download Receipt</button>
        {slip.stripeReceiptUrl && (
          <a href={slip.stripeReceiptUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">Stripe Receipt ↗</a>
        )}
        <button className="btn btn-secondary" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

// ── Main Upgrade Page ───────────────────────────────────────────────────────
export default function Upgrade() {
  const { profile, refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [slip, setSlip] = useState(null);
  const [step, setStep] = useState('plan'); // plan | stripe | razorpay | success
  const [paymentDbId, setPaymentDbId] = useState('');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const fmtCard = v => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const fmtExpiry = v => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  // ── Open Stripe checkout ──
  const openStripe = async () => {
    setLoading(true);
    try {
      const d = await api.post('/payments/create-intent', { type: 'premium_student' });
      setPaymentDbId(d.paymentDbId);
      setStep('stripe');
    } catch (e) { toast.error(e.error || 'Failed to initialize payment'); }
    finally { setLoading(false); }
  };

  // ── Open Razorpay checkout ──
  const openRazorpay = async () => {
    setLoading(true);
    try {
      const d = await api.post('/payments/create-razorpay-order', { type: 'premium_student' });
      setPaymentDbId(d.paymentDbId);

      if (d.demo) {
        // Demo mode — simulate Razorpay
        const res = await api.post('/payments/demo-success', {
          paymentDbId: d.paymentDbId,
          type: 'premium_student',
          gateway: 'razorpay',
        });
        setSlip(res.slip);
        setStep('success');
        await refresh();
        toast.success('🎉 Premium activated!');
        return;
      }

      // Real Razorpay checkout
      const options = {
        key: d.keyId,
        amount: d.amount,
        currency: d.currency,
        name: 'HireLoop',
        description: 'Premium Student — 1 Year',
        order_id: d.orderId,
        handler: async (response) => {
          try {
            const confirm = await api.post('/payments/confirm-razorpay', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentDbId: d.paymentDbId,
              type: 'premium_student',
            });
            setSlip(confirm.slip);
            setStep('success');
            await refresh();
            toast.success('🎉 Premium activated!');
          } catch (e) { toast.error('Payment verification failed'); }
        },
        prefill: { email: profile?.email || '' },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => toast('Payment cancelled') },
      };

      // Load Razorpay SDK dynamically
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://checkout.razorpay.com/v1/checkout.js';
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      new window.Razorpay(options).open();
    } catch (e) { toast.error(e.error || 'Failed to initialize Razorpay'); }
    finally { setLoading(false); }
  };

  // ── Process Stripe card ──
  const processStripe = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast.error('Please fill all card details'); return;
    }
    setLoading(true);
    try {
      const d = await api.post('/payments/demo-success', {
        paymentDbId,
        type: 'premium_student',
        gateway: 'stripe',
      });
      setSlip(d.slip);
      setStep('success');
      await refresh();
      toast.success('🎉 Premium activated!');
    } catch (e) { toast.error(e.error || 'Payment failed'); }
    finally { setLoading(false); }
  };

  // ── Already premium ──
  if (profile?.is_premium) return (
    <div style={{ maxWidth: 520, margin: '0 auto', paddingTop: 40 }}>
      <div className="card card-p" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>You're Premium!</h2>
        <p style={{ color: 'var(--text-2)', marginBottom: 16 }}>Enjoy unlimited AI interviews and priority visibility.</p>
        {profile.premium_expires_at && (
          <div className="alert alert-success">
            Active until {new Date(profile.premium_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Step: Plan ── */}
      {step === 'plan' && (
        <>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 className="page-title" style={{ marginBottom: 8 }}>Upgrade to Premium</h1>
            <p className="page-sub">Unlock the full power of HireLoop AI</p>
          </div>

          {/* Free vs Premium */}
          <div className="grid-2" style={{ marginBottom: 28, gap: 16 }}>
            <div className="card card-p" style={{ opacity: .85 }}>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>Free</div>
              <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>$0</div>
              {[
                [true, '3 resume analyses / day'],
                [true, '3 mock interviews / month'],
                [true, 'Apply to jobs'],
                [false, 'Unlimited AI interviews'],
                [false, 'Priority recruiter visibility'],
                [false, 'Cover letter generator'],
              ].map(([ok, feat]) => (
                <div key={feat} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 8, color: ok ? 'var(--text-1)' : 'var(--text-3)' }}>
                  <span style={{ color: ok ? 'var(--green)' : 'var(--border)' }}>{ok ? '✓' : '✗'}</span>{feat}
                </div>
              ))}
            </div>

            <div className="payment-plan-card selected" style={{ border: '2px solid var(--accent)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span className="badge badge-blue">⭐ Best Value</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4, color: 'var(--accent)' }}>Premium</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 700 }}>$4.99</span>
                <span style={{ fontSize: 14, color: 'var(--text-2)' }}>/year</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>≈ ₹415 / year</div>
              {[
                'Unlimited AI mock interviews',
                'Unlimited resume analyses',
                'Priority visibility to recruiters',
                'AI cover letter generator',
                'Advanced job matching',
                'Detailed performance reports',
              ].map(feat => (
                <div key={feat} style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: 8 }}>
                  <span style={{ color: 'var(--green)' }}>✓</span>{feat}
                </div>
              ))}

              {/* Payment buttons */}
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="btn btn-primary btn-full" onClick={openStripe} disabled={loading}>
                  <CreditCard size={15} /> Pay with Card (Stripe) — $4.99
                </button>
                <button
                  className="btn btn-full"
                  style={{ background: '#2d6a4f', color: '#fff', border: 'none', borderRadius: 'var(--r-md)', padding: '10px 16px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  onClick={openRazorpay}
                  disabled={loading}
                >
                  <Smartphone size={15} /> Pay with UPI / Card (Razorpay) — ₹415
                </button>
              </div>
            </div>
          </div>

          <div className="alert alert-info" style={{ fontSize: 13 }}>
            🔒 <strong>Secure checkout.</strong> Choose Stripe for international cards or Razorpay for UPI, Indian cards & netbanking.
          </div>
        </>
      )}

      {/* ── Step: Stripe Card Form ── */}
      {step === 'stripe' && (
        <div style={{ maxWidth: 440, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep('plan')}>← Back</button>
          </div>
          <div className="card card-p">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>Premium — 1 Year</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Unlimited AI tools + Priority visibility</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 22 }}>$4.99</div>
            </div>
            <hr className="divider" />

            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={16} /> Card Details
            </div>

            <div className="form-group">
              <label className="label">Cardholder Name</label>
              <input className="input" placeholder="Your Name" value={cardDetails.name} onChange={e => setCardDetails(d => ({ ...d, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label">Card Number</label>
              <input className="input" placeholder="4242 4242 4242 4242"
                value={cardDetails.number}
                onChange={e => setCardDetails(d => ({ ...d, number: fmtCard(e.target.value) }))}
                maxLength={19} inputMode="numeric" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="label">Expiry</label>
                <input className="input" placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={e => setCardDetails(d => ({ ...d, expiry: fmtExpiry(e.target.value) }))}
                  maxLength={5} />
              </div>
              <div className="form-group">
                <label className="label">CVV</label>
                <input className="input" placeholder="123"
                  value={cardDetails.cvv}
                  onChange={e => setCardDetails(d => ({ ...d, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
                  maxLength={3} />
              </div>
            </div>

            <div style={{ background: 'var(--yellow-bg)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 'var(--r-md)', padding: '10px 14px', fontSize: 12, color: 'var(--yellow-text)', marginBottom: 20 }}>
              🧪 <strong>Demo mode:</strong> Use any card details. Test card: <code>4242 4242 4242 4242</code>, expiry 12/28, CVV 123
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={processStripe} disabled={loading}>
              {loading
                ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Processing…</>
                : <><Shield size={15} /> Pay $4.99 — Activate Premium</>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: 12, color: 'var(--text-3)' }}>
              <Shield size={12} /> Secured by Stripe
            </div>
          </div>
        </div>
      )}

      {/* ── Step: Success ── */}
      {step === 'success' && slip && (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <ReceiptSlip slip={slip} onClose={() => setStep('plan')} />
        </div>
      )}
    </div>
  );
}
