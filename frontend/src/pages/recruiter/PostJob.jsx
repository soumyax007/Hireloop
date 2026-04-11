import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TagInput, Modal } from '../../components/shared/UI';
import { Shield, Smartphone } from 'lucide-react';
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
  const [step, setStep] = useState('form'); // form | success
  const [jobId, setJobId] = useState('');
  const [paymentDbId, setPaymentDbId] = useState('');
  const [loading, setLoading] = useState(false);

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const setE = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve();
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      s.onerror = reject;
      document.body.appendChild(s);
    });

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

      // Create Razorpay order
      const pmt = await api.post('/payments/create-razorpay-order', { type: 'job_listing', jobId: job.id });
      setPaymentDbId(pmt.paymentDbId);

      if (pmt.demo) {
        await api.post('/payments/demo-success', { paymentDbId: pmt.paymentDbId, type: 'job_listing', jobId: job.id, gateway: 'razorpay' });
        setStep('success');
        toast.success('Job posted successfully! 🎉');
        return;
      }

      await loadRazorpay();

      const options = {
        key: pmt.keyId,
        amount: pmt.amount,
        currency: pmt.currency,
        name: 'HireLoop',
        description: 'Job Listing Fee',
        order_id: pmt.orderId,
        handler: async (response) => {
          try {
            await api.post('/payments/confirm-razorpay', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentDbId: pmt.paymentDbId,
              type: 'job_listing',
              jobId: job.id,
            });
            setStep('success');
            toast.success('Job posted successfully! 🎉');
          } catch (e) { toast.error('Payment verification failed'); }
        },
        theme: { color: '#6366f1' },
        modal: { ondismiss: () => toast('Payment cancelled') },
        method: { upi: true, card: true, netbanking: true, wallet: true, emi: false },
      };

      new window.Razorpay(options).open();
    } catch (e) { toast.error(e.error || 'Failed to create job'); }
    finally { setLoading(false); }
  };

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


  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">Post a New Job</h1>
        <p className="page-sub">Fill in the details below. A listing fee of ₹8,299 applies after submission.</p>
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
          {loading ? <><div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} /> Processing…</> : <><Smartphone size={15} /> Continue to Payment (₹8,299) →</>}
        </button>
      </form>
    </div>
  );
}
