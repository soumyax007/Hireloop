import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TagInput, Modal } from '../../components/shared/UI';
import { Shield, CreditCard } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BRANCHES = ['Computer Science','Electronics & Communication','Mechanical Engineering','Civil Engineering','Electrical Engineering','Chemical Engineering','Mathematics','Physics','Biotechnology','All Branches'];

export default function PostJob() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', location: '', jobType: 'full-time',
    salaryMin: '', salaryMax: '', minCgpa: '', applicationDeadline: '',
    interviewDate: '', slots: 1, requiredSkills: [], eligibleBranches: [],
    eligibleBatches: [2025], requirements: [], responsibilities: [],
  });
  const [step, setStep] = useState('form'); // form | payment | success
  const [jobId, setJobId] = useState('');
  const [paymentDbId, setPaymentDbId] = useState('');
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const setE = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const createJob = async e => {
    e.preventDefault();
    if (!form.title || !form.description) { toast.error('Title and description are required'); return; }
    setLoading(true);
    try {
      const job = await api.post('/jobs', {
        ...form,
        salaryMin: parseInt(form.salaryMin) || 0,
        salaryMax: parseInt(form.salaryMax) || 0,
        minCgpa: parseFloat(form.minCgpa) || 0,
        slots: parseInt(form.slots) || 1,
      });
      setJobId(job.id);

      // Create payment intent
      const pmt = await api.post('/payments/create-intent', { type: 'job_listing', jobId: job.id });
      setPaymentDbId(pmt.paymentDbId);
      setStep('payment');
    } catch (e) { toast.error(e.error || 'Failed to create job'); }
    finally { setLoading(false); }
  };

  const pay = async () => {
    if (!cardDetails.name || !cardDetails.number) { toast.error('Fill card details'); return; }
    setLoading(true);
    try {
      await api.post('/payments/demo-success', { paymentDbId, type: 'job_listing', jobId });
      setStep('success');
      toast.success('Job posted and submitted for review! 🎉');
    } catch (e) { toast.error(e.error || 'Payment failed'); }
    finally { setLoading(false); }
  };

  const fmtCard = v => v.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19);
  const fmtExpiry = v => v.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1/$2').slice(0,5);

  if (step === 'success') return (
    <div style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
      <div className="card card-p">
        <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
        <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Job Posted Successfully!</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 20 }}>Your job has been submitted for placement cell approval. You'll be notified once it goes live.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => nav('/recruiter/jobs')}>View My Jobs</button>
          <button className="btn btn-secondary" onClick={() => { setStep('form'); setForm({ title:'',description:'',location:'',jobType:'full-time',salaryMin:'',salaryMax:'',minCgpa:'',applicationDeadline:'',interviewDate:'',slots:1,requiredSkills:[],eligibleBranches:[],eligibleBatches:[2025],requirements:[],responsibilities:[] }); }}>Post Another</button>
        </div>
      </div>
    </div>
  );

  if (step === 'payment') return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setStep('form')}>← Back</button>
      </div>
      <div className="card card-p">
        <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Job Listing Fee</h2>
        <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20 }}>One-time fee to post and activate your job listing on HireLoop.</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 'var(--r-md)', marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 600 }}>Job Listing</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Single posting · Pending admin approval</div>
          </div>
          <div style={{ fontWeight: 700, fontSize: 20 }}>$9.99</div>
        </div>

        <label className="label">Cardholder Name</label>
        <input className="input form-group" placeholder="John Smith" value={cardDetails.name} onChange={e => setCardDetails(d => ({ ...d, name: e.target.value }))} style={{ marginBottom: 12 }} />

        <label className="label">Card Number</label>
        <input className="input form-group" placeholder="4242 4242 4242 4242"
          value={cardDetails.number} onChange={e => setCardDetails(d => ({ ...d, number: fmtCard(e.target.value) }))} maxLength={19} style={{ marginBottom: 12 }} />

        <div className="form-row" style={{ marginBottom: 16 }}>
          <div>
            <label className="label">Expiry</label>
            <input className="input" placeholder="MM/YY" value={cardDetails.expiry} onChange={e => setCardDetails(d => ({ ...d, expiry: fmtExpiry(e.target.value) }))} maxLength={5} />
          </div>
          <div>
            <label className="label">CVV</label>
            <input className="input" placeholder="123" value={cardDetails.cvv} onChange={e => setCardDetails(d => ({ ...d, cvv: e.target.value.replace(/\D/g,'').slice(0,3) }))} maxLength={3} />
          </div>
        </div>

        <div className="alert alert-warning" style={{ fontSize: 12, marginBottom: 16 }}>
          🧪 Demo: Use 4242 4242 4242 4242 / 12/28 / 123
        </div>

        <button className="btn btn-primary btn-full btn-lg" onClick={pay} disabled={loading}>
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Processing…</> : <><Shield size={15} /> Pay $9.99 & Submit Job</>}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Post a New Job</h1>
        <p className="page-sub">Fill in the details below. A listing fee of $9.99 applies after submission.</p>
      </div>

      <form onSubmit={createJob}>
        {/* Basic Info */}
        <div className="card card-p" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>📋 Basic Information</div>
          <div className="form-group">
            <label className="label">Job Title *</label>
            <input className="input" placeholder="e.g. Software Engineer, Data Analyst" value={form.title} onChange={setE('title')} required />
          </div>
          <div className="form-group">
            <label className="label">Job Description *</label>
            <textarea className="input" rows={5} placeholder="Describe the role, responsibilities, and what you're looking for…" value={form.description} onChange={setE('description')} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Location</label>
              <input className="input" placeholder="Bangalore, India" value={form.location} onChange={setE('location')} />
            </div>
            <div className="form-group">
              <label className="label">Job Type</label>
              <select className="input" value={form.jobType} onChange={setE('jobType')}>
                {['full-time','internship','part-time','contract'].map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Compensation & Eligibility */}
        <div className="card card-p" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>💰 Compensation & Eligibility</div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Min Salary (₹/year)</label>
              <input className="input" type="number" placeholder="1200000" value={form.salaryMin} onChange={setE('salaryMin')} />
            </div>
            <div className="form-group">
              <label className="label">Max Salary (₹/year)</label>
              <input className="input" type="number" placeholder="2000000" value={form.salaryMax} onChange={setE('salaryMax')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Minimum CGPA</label>
              <input className="input" type="number" step="0.1" min="0" max="10" placeholder="7.0" value={form.minCgpa} onChange={setE('minCgpa')} />
            </div>
            <div className="form-group">
              <label className="label">Open Slots</label>
              <input className="input" type="number" min="1" placeholder="5" value={form.slots} onChange={setE('slots')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="label">Application Deadline</label>
              <input className="input" type="date" value={form.applicationDeadline} onChange={setE('applicationDeadline')} />
            </div>
            <div className="form-group">
              <label className="label">Interview Date</label>
              <input className="input" type="date" value={form.interviewDate} onChange={setE('interviewDate')} />
            </div>
          </div>
        </div>

        {/* Skills & Branches */}
        <div className="card card-p" style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 16 }}>🎯 Skills & Branch Eligibility</div>
          <div className="form-group">
            <label className="label">Required Skills</label>
            <TagInput tags={form.requiredSkills} onChange={set('requiredSkills')} placeholder="Add skill (press Enter)…" />
          </div>
          <div className="form-group">
            <label className="label">Eligible Branches</label>
            <div className="tags-row" style={{ marginBottom: 8 }}>
              {BRANCHES.map(b => (
                <button key={b} type="button"
                  className={`tag${form.eligibleBranches.includes(b) ? '' : ''}`}
                  style={{ cursor: 'pointer', background: form.eligibleBranches.includes(b) ? 'var(--accent-bg)' : 'var(--bg)', color: form.eligibleBranches.includes(b) ? 'var(--accent)' : 'var(--text-2)', border: form.eligibleBranches.includes(b) ? '1px solid var(--accent)' : '1px solid var(--border-light)' }}
                  onClick={() => set('eligibleBranches')(form.eligibleBranches.includes(b) ? form.eligibleBranches.filter(x => x !== b) : [...form.eligibleBranches, b])}>
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Creating…</> : 'Continue to Payment →'}
        </button>
      </form>
    </div>
  );
}
