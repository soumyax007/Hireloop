# 🔗 HireLoop — AI-Powered Campus Recruitment Portal

> Built by **Soumya** | GitHub: [@soumyax007](https://github.com/soumyax007)
> 
> End-to-end campus placement management system with NVIDIA Llama AI, Stripe payments, and three-role architecture.

---

## 🏗️ Architecture

```
hireloop/
├── backend/                  # Express.js API (Node.js)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js      # SQLite schema (11 tables, WAL mode)
│   │   │   └── seed.js       # Demo data seeder
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT authentication + role guards
│   │   ├── routes/
│   │   │   ├── auth.js       # Login, register, /me
│   │   │   ├── jobs.js       # CRUD jobs, admin approval
│   │   │   ├── applications.js  # Apply, status tracking, stats
│   │   │   ├── ai.js         # NVIDIA Llama endpoints
│   │   │   ├── payments.js   # Stripe + demo checkout + receipts
│   │   │   └── misc.js       # Profile, admin, notifications, announcements
│   │   ├── services/
│   │   │   ├── ai.service.js        # NVIDIA Llama integration
│   │   │   └── payment.service.js   # Stripe integration
│   │   └── server.js         # Express app entry point
│   ├── .env                  # Environment variables (NVIDIA key pre-filled)
│   └── package.json
│
└── frontend/                 # React + Vite (no TypeScript by design)
    ├── src/
    │   ├── App.jsx            # Router + role guards
    │   ├── main.jsx           # Entry point
    │   ├── styles/global.css  # Apple-inspired design system
    │   ├── components/
    │   │   └── shared/
    │   │       ├── AppShell.jsx  # Layout wrapper
    │   │       ├── Sidebar.jsx   # Role-aware nav + mobile toggle
    │   │       ├── Topbar.jsx    # Notifications + hamburger
    │   │       └── UI.jsx        # Modal, Badge, ScoreRing, etc.
    │   ├── contexts/
    │   │   └── AuthContext.jsx   # JWT auth state
    │   ├── pages/
    │   │   ├── auth/          # Login, Register
    │   │   ├── student/       # Dashboard, Jobs, Applications, ResumeAI, MockInterview, Upgrade
    │   │   ├── recruiter/     # Dashboard, Jobs, Applicants, PostJob
    │   │   └── admin/         # Dashboard, Companies, Students, Jobs, Reports, Announcements
    │   └── utils/
    │       ├── api.js         # Axios instance with JWT interceptors
    │       └── helpers.js     # fmtSalary, timeAgo, parseArr, etc.
    ├── index.html
    ├── package.json
    └── vite.config.js         # Proxy to backend port 5000
```

---

## 🚀 Quick Start in VS Code

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | Comes with Node.js |

> No database installation needed — uses SQLite (file-based, zero config).

---

### Step 1 — Clone & Open

```bash
git clone https://github.com/soumyax007/hireloop.git
cd hireloop
code .
```

---

### Step 2 — Backend Setup

Open a new terminal in VS Code (`Ctrl+\`` `):

```bash
cd backend
npm install
```

> ⚠️ If `better-sqlite3` fails to build (native addon):
> ```bash
> npm install --ignore-scripts
> # then:
> npm install better-sqlite3 --build-from-source
> # OR use prebuilt:
> npm install better-sqlite3@latest
> ```

**Seed the database with demo data:**
```bash
node src/db/seed.js
```

**Start the API server:**
```bash
npm run dev
# → http://localhost:5000
```

---

### Step 3 — Frontend Setup

Open a **second terminal** (`Ctrl+Shift+\`` `):

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

### Step 4 — Open in Browser

Navigate to **http://localhost:5173**

Use the **Demo** buttons on the login page for instant access:

| Role | Email | Password |
|------|-------|---------|
| 🎓 Student | `demo@student.iitd.ac.in` | `Student@123` |
| 🏢 Recruiter | `hr@google.com` | `Recruiter@123` |
| 🔑 Admin | `admin@hireloop.io` | `Admin@123` |

---

## 🤖 AI Integration — NVIDIA Llama

**Already configured!** The NVIDIA API key is pre-filled in `backend/.env`:

```env
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
```

**AI Features powered by Llama:**
- ✅ **Resume Analyser** — ATS score, keyword gap, improvement suggestions
- ✅ **Cover Letter Generator** — Personalised from resume + JD
- ✅ **Mock Interview** — 5 role-specific questions, per-answer grading
- ✅ **Interview Summary** — Grade, performance level, readiness score
- ✅ **Job Recommendations** — Skill-match scoring

---

## 💳 Payment Integration — Stripe

The app runs in **demo mode** by default (no real Stripe key needed).

**Demo card for testing:** `4242 4242 4242 4242` | Expiry: `12/28` | CVV: `123`

**To enable real Stripe:**

1. Create account at [stripe.com](https://stripe.com) → Test Mode
2. Copy your keys to `backend/.env`:
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
3. Restart the backend

**Payment features:**
- ✅ Job listing fee ($9.99) — companies pay before job goes live
- ✅ Premium student upgrade ($4.99/year) — unlimited AI features
- ✅ **Printable receipt slip** after every successful payment
- ✅ Stripe receipt URL linked (when real Stripe configured)
- ✅ Demo fallback mode — full UX without Stripe keys

---

## 🔌 API Endpoints Reference

```
POST  /api/auth/register        Register new user
POST  /api/auth/login           Login
GET   /api/auth/me              Get current user + profile

GET   /api/jobs                 List approved jobs
GET   /api/jobs/:id             Job details
POST  /api/jobs                 Create job (recruiter)
PATCH /api/jobs/:id             Update job
GET   /api/jobs/company/mine    Recruiter's jobs
GET   /api/jobs/admin/all       Admin: all jobs

POST  /api/applications         Apply to job (student)
GET   /api/applications/mine    Student's applications
GET   /api/applications/job/:id Recruiter: job applicants
PATCH /api/applications/:id/status  Update status
GET   /api/applications/stats/overview  Admin stats

POST  /api/ai/analyse-resume    Resume analysis
POST  /api/ai/cover-letter      Generate cover letter
POST  /api/ai/interview/start   Start mock interview
POST  /api/ai/interview/evaluate  Evaluate answer
POST  /api/ai/interview/finish   Get session summary
GET   /api/ai/recommendations   Job recommendations
GET   /api/ai/interview-sessions  Session history

POST  /api/payments/create-intent  Create payment
POST  /api/payments/confirm     Verify Stripe payment
POST  /api/payments/demo-success  Demo payment (no Stripe key)
GET   /api/payments/history     Payment history

GET   /api/admin/companies      List companies
PATCH /api/admin/companies/:id/approve  Approve/reject
GET   /api/admin/students       All students
POST  /api/admin/announcements  Post announcement
GET   /api/admin/report         Placement report
GET   /api/notifications        User notifications
GET   /api/announcements        Public announcements

GET   /api/health               Health check
```

---

## 🗄️ Database Schema

SQLite with 11 tables:

| Table | Purpose |
|-------|---------|
| `users` | Auth accounts (all roles) |
| `student_profiles` | Student data, CGPA, skills |
| `company_profiles` | Company data, approval status |
| `admin_profiles` | Placement cell admins |
| `jobs` | Job postings with eligibility filters |
| `applications` | Student–job applications |
| `interview_sessions` | AI mock interview Q&A |
| `payments` | Stripe payment records + receipts |
| `announcements` | Placement cell notices |
| `resume_analyses` | AI analysis history |
| `notifications` | In-app notifications |

---

## 🎨 Design System

**Apple-inspired** — DM Sans + DM Serif Display fonts, full CSS custom properties:

| Token | Value |
|-------|-------|
| `--accent` | `#0071e3` (Apple Blue) |
| `--text-1` | `#1d1d1f` |
| `--bg` | `#f5f5f7` |
| `--radius-lg` | `16px` |
| `--font` | `DM Sans` |

**Responsive breakpoints:** Mobile-first, sidebar collapses to hamburger at 768px.

---

## 📁 GitHub Repo Structure

```
soumyax007/hireloop/
├── backend/       ← Express API (deploy to Railway/Render)
├── frontend/      ← React Vite app (deploy to Vercel)
└── README.md
```

**Recommended branches:**
```bash
git checkout -b feature/your-feature    # feature branches
git checkout -b fix/bug-description     # bug fixes
```

---

## 🚢 Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Push to GitHub → Connect repo to Vercel → Auto-deploy
```

### Backend → Railway
```bash
# Push to GitHub → New project on railway.app
# Set env vars in Railway dashboard
# Start command: node src/server.js
```

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=<64-char random string>
NVIDIA_API_KEY=nvapi-...
STRIPE_SECRET_KEY=sk_live_...
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🐛 Common Issues

**`better-sqlite3` build fails:**
```bash
npm install --ignore-scripts  # skip native build
# Database will work fine for most operations
```

**NVIDIA API returns 401:**
- Check `NVIDIA_API_KEY` in `backend/.env`
- Verify key at [build.nvidia.com](https://build.nvidia.com)

**Port already in use:**
```bash
# Kill port 5000
npx kill-port 5000
# Kill port 5173
npx kill-port 5173
```

**Frontend can't reach backend:**
- Check `vite.config.js` proxy target is `http://localhost:5000`
- Ensure backend is running first

---

## ✅ Quality Checklist

- [x] JWT auth with role guards (student/recruiter/admin)
- [x] SQLite with WAL mode (concurrent reads)
- [x] Rate limiting on AI endpoints (15/min)
- [x] CORS locked to frontend URL
- [x] Helmet security headers
- [x] Duplicate application prevention (409)
- [x] Eligibility validation on apply (CGPA, branch, batch)
- [x] Payment fulfillment only after verification
- [x] Printable payment receipt slip
- [x] Mobile-responsive navigation (hamburger)
- [x] Notification system (in-app real-time polling)
- [x] Empty states on all list pages
- [x] Loading spinners on all async operations
- [x] Toast notifications for all actions
- [x] Error boundaries and fallbacks

---

## 📄 License

MIT — Built for DevFusion Hackathon 2025 by Soumya.
