const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.NODE_ENV === 'production' 
  ? '/app/data/hireloop.db' 
  : path.join(__dirname, '../../../hireloop.db');
  let db;

function getDb() {
  if (db) return db;
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  applySchema();
  return db;
}

function applySchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student','recruiter','admin')),
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      phone TEXT DEFAULT '',
      college TEXT DEFAULT '',
      branch TEXT DEFAULT '',
      batch INTEGER DEFAULT 2025,
      cgpa REAL DEFAULT 0.0,
      skills TEXT DEFAULT '[]',
      bio TEXT DEFAULT '',
      linkedin_url TEXT DEFAULT '',
      github_url TEXT DEFAULT '',
      portfolio_url TEXT DEFAULT '',
      resume_url TEXT DEFAULT '',
      avatar_url TEXT DEFAULT '',
      is_premium INTEGER DEFAULT 0,
      premium_expires_at TEXT,
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS company_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company_name TEXT NOT NULL DEFAULT '',
      industry TEXT DEFAULT '',
      description TEXT DEFAULT '',
      website TEXT DEFAULT '',
      logo_url TEXT DEFAULT '',
      headquarters TEXT DEFAULT '',
      company_size TEXT DEFAULT '',
      is_approved INTEGER DEFAULT 0,
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS admin_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL DEFAULT 'Admin',
      institution TEXT DEFAULT '',
      created_at TEXT DEFAULT(datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      requirements TEXT DEFAULT '[]',
      responsibilities TEXT DEFAULT '[]',
      location TEXT DEFAULT '',
      job_type TEXT DEFAULT 'full-time',
      salary_min INTEGER DEFAULT 0,
      salary_max INTEGER DEFAULT 0,
      min_cgpa REAL DEFAULT 0,
      eligible_branches TEXT DEFAULT '[]',
      eligible_batches TEXT DEFAULT '[]',
      required_skills TEXT DEFAULT '[]',
      application_deadline TEXT DEFAULT '',
      interview_date TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','closed')),
      is_paid INTEGER DEFAULT 0,
      slots INTEGER DEFAULT 1,
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'applied' CHECK(status IN ('applied','shortlisted','interview_scheduled','offer','rejected')),
      cover_letter TEXT DEFAULT '',
      interview_slot TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      ats_score INTEGER DEFAULT 0,
      applied_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now')),
      UNIQUE(job_id, student_id)
    );

    CREATE TABLE IF NOT EXISTS interview_sessions (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      job_role TEXT NOT NULL,
      questions TEXT DEFAULT '[]',
      answers TEXT DEFAULT '[]',
      evaluations TEXT DEFAULT '[]',
      overall_score INTEGER DEFAULT 0,
      summary TEXT DEFAULT '{}',
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT(datetime('now')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL CHECK(type IN ('job_listing','premium_student')),
      amount_cents INTEGER NOT NULL,
      currency TEXT DEFAULT 'usd',
      stripe_payment_intent_id TEXT DEFAULT '',
      stripe_charge_id TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','failed','refunded')),
      metadata TEXT DEFAULT '{}',
      receipt_url TEXT DEFAULT '',
      created_at TEXT DEFAULT(datetime('now')),
      updated_at TEXT DEFAULT(datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('info','warning','success','urgent')),
      target_role TEXT DEFAULT 'all',
      is_pinned INTEGER DEFAULT 0,
      expires_at TEXT,
      created_at TEXT DEFAULT(datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS resume_analyses (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
      job_description TEXT DEFAULT '',
      ats_score INTEGER DEFAULT 0,
      match_percentage INTEGER DEFAULT 0,
      missing_keywords TEXT DEFAULT '[]',
      suggestions TEXT DEFAULT '[]',
      strengths TEXT DEFAULT '[]',
      section_scores TEXT DEFAULT '{}',
      overall_feedback TEXT DEFAULT '',
      created_at TEXT DEFAULT(datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      link TEXT DEFAULT '',
      created_at TEXT DEFAULT(datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_apps_student ON applications(student_id);
    CREATE INDEX IF NOT EXISTS idx_apps_job ON applications(job_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
  `);
}

module.exports = { getDb };
