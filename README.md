# HireLoop — South Asian University Placement Portal 

HireLoop is the official, comprehensive career placement and campus recruitment portal designed specifically for South Asian University (SAU). It bridges the gap between students, top recruiters, and the university placement cell, leveraging modern web technologies and AI to streamline the hiring process.

## Key Features

### For Students
*   **AI Resume Scoring & Feedback**: Get instant ATS-friendly analysis and actionable improvements using the NVIDIA Llama-powered AI engine.
*   **Mock Interviews**: Practice answering role-specific questions with AI grading and personalized, per-answer feedback.
*   **Smart Job Matching**: Receive personalized job recommendations based on skills, branch, and career goals.
*   **Centralized Application Tracking**: Track all job applications, test scores, and interview statuses in one unified dashboard.
*   **Competitions & Hackathons**: Register for university-wide coding and aptitude competitions.

### For Recruiters
*   **Streamlined Job Posting**: Easily create and manage job postings, internships, and placement drives.
*   **Applicant Tracking System (ATS)**: Filter, sort, and manage student applications efficiently.
*   **Profile Verification**: Secure, verified company profiles approved by the placement cell.

### For Placement Cell (Admins)
*   **Complete Oversight**: Manage companies, student profiles, and job postings.
*   **Detailed Analytics**: View placement statistics, branch-wise performance, and highest/average salary packages.
*   **Announcements**: Broadcast important notices to specific roles (students, recruiters) or the entire campus.
*   **Master Administration**: Super-admins have the ability to moderate all accounts and content.

---

## 🛠️ Technology Stack

*   **Frontend**: React.js, Vite, React Router, custom CSS for a premium UI, and Lucide React for iconography.
*   **Backend**: Node.js, Express.js.
*   **Database**: SQLite (local `hireloop.db` for fast, portable development and deployment).
*   **Authentication**: JWT-based authentication with Google OAuth integration support.
*   **AI Integration**: NVIDIA Llama 3.1 70B Instruct model (via API).
*   **Payments**: Stripe integration (currently configured for Demo/Test mode).

---

##  Getting Started

### Prerequisites
*   Node.js (v18 or higher recommended)
*   npm or yarn

### 1. Clone & Setup

```bash
# Navigate to the project directory
cd "hireloop 3"

# Install Backend Dependencies
cd backend
npm install

# Install Frontend Dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

The project requires environment variables to function correctly, especially for AI features and Google Auth. 

**Backend (`backend/.env`)**
```env
PORT=5001
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
NVIDIA_API_KEY=your_nvidia_api_key_here
STRIPE_SECRET_KEY=your_stripe_test_key_here
FRONTEND_URL=http://localhost:5173
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 3. Running the Application

You can run both servers simultaneously using two terminal windows.

**Start Backend (API)**
```bash
cd backend
npm run dev
# Server will run on http://localhost:5001
```

**Start Frontend (Web UI)**
```bash
cd frontend
npm run dev
# App will run on http://localhost:5173
```

---

##  Access & Demo Credentials

The platform is strictly locked to **South Asian University** domains (`@sau.ac.in`, `@sau.int`, `@sa.ac.in`).

If running locally without a full database, you can use the built-in **Demo Mode** accounts to explore the platform:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Student** | `student@sau.int` | `Student@123` |
| **Recruiter** | `recruiter@sau.ac.in` | `Recruiter@123` |

###  Master Admins
The following accounts possess super-admin capabilities:

| Name | Email | Password |
| :--- | :--- | :--- |
| Soumyadip Debnath | `soumya@sau.ac.in` | `Admin@SAU#2025` |
| Udit  | `udit@sau.ac.in` | `Admin@SAU#2025` |
| Vedant  | `vedant@sau.ac.in` | `Admin@SAU#2025` |

*(Note: There is also a legacy admin account `admin@sau.int` with the same password).*

---

## 📂 Project Structure

```text
hireloop/
├── backend/                  # Express API Server
│   ├── src/
│   │   ├── middleware/       # JWT Auth, Admin Authorization
│   │   ├── routes/           # API endpoints (auth, misc, etc.)
│   │   ├── db.js             # SQLite initialization and schema
│   │   └── server.js         # Main entry point
│   ├── hireloop.db           # SQLite database file
│   └── .env
└── frontend/                 # React UI Web App
    ├── public/               # Static assets (campus.jpg, etc.)
    ├── src/
    │   ├── components/       # Shared UI, AppShell, Topbar, Sidebar
    │   ├── contexts/         # React Context (AuthContext)
    │   ├── pages/            # View components (Landing, Login, Dashboard)
    │   ├── styles/           # global.css, global-additions.css
    │   └── utils/            # Axios API interceptors, helpers
    ├── vite.config.js
    └── .env
```

---

##  Credits
Crafted with ❤️ by the SAU Development Team: **Soumya, Udit, Vijjval & Vedant**.
