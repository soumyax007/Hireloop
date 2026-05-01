require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('./index');

async function seed() {
  const db = getDb();
  console.log('🌱 Seeding HireLoop...\n');

  db.exec(`
    DELETE FROM notifications; DELETE FROM resume_analyses;
    DELETE FROM announcements; DELETE FROM payments; DELETE FROM interview_sessions;
    DELETE FROM applications; DELETE FROM jobs; DELETE FROM admin_profiles;
    DELETE FROM company_profiles; DELETE FROM student_profiles; DELETE FROM users;
  `);

  const hash = pwd => bcrypt.hashSync(pwd, 10);

  // ADMIN
  const adminPIDs = [];
  const admins = [
    { email: 'admin@hireloop.io', name: 'Placement Cell', pwd: 'password123' },
    { email: 'soumya@sau.ac.in', name: 'Soumyadip Debnath', pwd: 'password123' },
    { email: 'udit@sau.ac.in', name: 'Udit Sharma', pwd: 'password123' },
    { email: 'sunil@sau.ac.in', name: 'Sunil', pwd: 'password123' },
    { email: 'uddeshya@sau.ac.in', name: 'Uddeshya', pwd: 'password123' },
    { email: 'sumit@sau.ac.in', name: 'Sumit', pwd: 'password123' },
  ];
  for (const a of admins) {
    const uid = uuidv4(), pid = uuidv4();
    db.prepare('INSERT INTO users(id,email,password,role,is_super_admin) VALUES(?,?,?,?,?)').run(uid,a.email,hash(a.pwd),'admin', 1);
    db.prepare('INSERT INTO admin_profiles(id,user_id,name,institution) VALUES(?,?,?,?)').run(pid,uid,a.name,'South Asian University');
    adminPIDs.push(pid);
  }

  // STUDENTS
  const studentsData = [
    { email:'arjun@student.sau.int', fn:'Arjun', ln:'Mehta', branch:'Computer Science', cgpa:8.7, skills:['React','Node.js','Python','Machine Learning','Docker'], batch:2025, premium:1, pwd: 'password123' },
    { email:'sneha@student.sau.int', fn:'Sneha', ln:'Patel', branch:'Electronics & Communication', cgpa:8.2, skills:['VLSI','Embedded C','MATLAB','PCB Design'], batch:2025, premium:0, pwd: 'password123' },
    { email:'rahul@student.sau.int', fn:'Rahul', ln:'Kumar', branch:'Mechanical Engineering', cgpa:7.9, skills:['CAD','SolidWorks','Python','ANSYS'], batch:2025, premium:0, pwd: 'password123' },
    { email:'priya@student.sau.int', fn:'Priya', ln:'Singh', branch:'Computer Science', cgpa:9.1, skills:['Java','Spring Boot','AWS','Kubernetes','SQL'], batch:2025, premium:1, pwd: 'password123' },
    { email:'student@hireloop.io', fn:'Demo', ln:'Student', branch:'Computer Science', cgpa:8.5, skills:['React','TypeScript','Python','Node.js'], batch:2025, premium:0, pwd: 'password123' },
    { email:'demo@student.iitd.ac.in', fn:'Demo', ln:'IITD', branch:'Computer Science', cgpa:8.5, skills:['React','TypeScript','Python','Node.js'], batch:2025, premium:0, pwd: 'Student@123' },
  ];
  const studentPIDs = [];
  for (const s of studentsData) {
    const uid = uuidv4(), pid = uuidv4();
    db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(uid,s.email,hash(s.pwd),'student');
    db.prepare('INSERT INTO student_profiles(id,user_id,first_name,last_name,phone,college,branch,batch,cgpa,skills,bio,is_premium) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(pid,uid,s.fn,s.ln,'9876543210','IIT Delhi',s.branch,s.batch,s.cgpa,JSON.stringify(s.skills),`${s.branch} student passionate about building scalable systems.`,s.premium);
    studentPIDs.push(pid);
  }

  // COMPANIES
  const companiesData = [
    { email:'hr@google.com', name:'Google India', industry:'Technology', desc:'Organise the world\'s information.', site:'https://google.com', approved:1, pwd: 'Recruiter@123' },
    { email:'hr@microsoft.com', name:'Microsoft India', industry:'Technology', desc:'Empower every person and organisation.', site:'https://microsoft.com', approved:1, pwd: 'password123' },
    { email:'hr@goldman.com', name:'Goldman Sachs', industry:'Finance & Banking', desc:'Global investment banking firm.', site:'https://goldmansachs.com', approved:1, pwd: 'password123' },
    { email:'hr@flipkart.com', name:'Flipkart', industry:'E-Commerce', desc:'India\'s leading e-commerce company.', site:'https://flipkart.com', approved:1, pwd: 'password123' },
    { email:'recruiter@hireloop.io', name:'Demo Corp SAU', industry:'AI Startup', desc:'Building next-gen AI products.', site:'https://technova.io', approved:1, pwd: 'password123' },
  ];
  const companyPIDs = [];
  for (const c of companiesData) {
    const uid = uuidv4(), pid = uuidv4();
    db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(uid,c.email,hash(c.pwd),'recruiter');
    db.prepare('INSERT INTO company_profiles(id,user_id,company_name,industry,description,website,is_approved) VALUES(?,?,?,?,?,?,?)').run(pid,uid,c.name,c.industry,c.desc,c.site,c.approved);
    companyPIDs.push(pid);
  }

  // JOBS
  const jobsData = [
    { cIdx:0, title:'Software Engineer L3', desc:'Build highly scalable distributed systems at Google.', skills:['Python','Go','Distributed Systems','Kubernetes'], branches:['Computer Science','Electronics & Communication'], minCgpa:7.5, salMin:1800000, salMax:2500000, slots:5, deadline:'2025-07-31', loc:'Bangalore' },
    { cIdx:1, title:'SDE-1 Azure Platform', desc:'Work on Microsoft Azure cloud platform engineering.', skills:['Java','C#','Azure','Docker','SQL'], branches:['Computer Science'], minCgpa:7.0, salMin:1600000, salMax:2200000, slots:8, deadline:'2025-08-15', loc:'Hyderabad' },
    { cIdx:2, title:'Technology Analyst', desc:'Join GS Technology division building trading platforms.', skills:['Python','SQL','Finance','Algorithms'], branches:['Computer Science','Mathematics'], minCgpa:8.0, salMin:1400000, salMax:1900000, slots:3, deadline:'2025-06-30', loc:'Bangalore' },
    { cIdx:3, title:'SDE - Backend Platform', desc:'Build Flipkart\'s next-gen backend microservices.', skills:['Java','Spring Boot','Kafka','Redis','MySQL'], branches:['Computer Science'], minCgpa:7.0, salMin:1200000, salMax:1800000, slots:10, deadline:'2025-07-15', loc:'Bangalore' },
  ];
  const jobIds = [];
  for (const j of jobsData) {
    const id = uuidv4();
    db.prepare('INSERT INTO jobs(id,company_id,title,description,required_skills,eligible_branches,eligible_batches,min_cgpa,salary_min,salary_max,status,is_paid,slots,application_deadline,location,job_type) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,companyPIDs[j.cIdx],j.title,j.desc,JSON.stringify(j.skills),JSON.stringify(j.branches),JSON.stringify([2025]),j.minCgpa,j.salMin,j.salMax,'approved',1,j.slots,j.deadline,j.loc,'full-time');
    jobIds.push(id);
  }

  // APPLICATIONS
  const apps = [
    [jobIds[0],studentPIDs[0],'shortlisted',82],
    [jobIds[1],studentPIDs[0],'interview_scheduled',91],
    [jobIds[2],studentPIDs[0],'applied',75],
    [jobIds[0],studentPIDs[3],'offer',96],
    [jobIds[1],studentPIDs[1],'rejected',60],
    [jobIds[3],studentPIDs[0],'applied',78],
    [jobIds[2],studentPIDs[3],'shortlisted',88],
    // demo student
    [jobIds[0],studentPIDs[4],'applied',70],
    [jobIds[1],studentPIDs[4],'shortlisted',80],
  ];
  for (const [jid,sid,status,score] of apps) {
    db.prepare('INSERT OR IGNORE INTO applications(id,job_id,student_id,status,ats_score) VALUES(?,?,?,?,?)').run(uuidv4(),jid,sid,status,score);
  }

  // ANNOUNCEMENTS
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,is_pinned) VALUES(?,?,?,?,?,?)').run(uuidv4(),adminPIDs[0],'Campus Placement Season 2025 is Open','All eligible students must complete their profiles and upload updated resumes before May 15th. 50+ companies expected this season.','success',1);
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,is_pinned) VALUES(?,?,?,?,?,?)').run(uuidv4(),adminPIDs[0],'Pre-Placement Talk: Google India','Google India will host a PPT on April 22nd at 3 PM, Auditorium Hall A. Register via your student portal.','info',0);
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,is_pinned) VALUES(?,?,?,?,?,?)').run(uuidv4(),adminPIDs[0],'Resume Submission Deadline','Final deadline for resume submission is April 30th. No extensions. Use the Resume Builder or upload directly.','warning',1);
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,is_pinned) VALUES(?,?,?,?,?,?)').run(uuidv4(),adminPIDs[0],'Mock Interview Sessions Available','AI-powered mock interviews are now live. Premium students get unlimited sessions. Upgrade from your dashboard.','info',0);

  // COMPETITIONS — seed demo data so page is never empty
  const now = new Date();
  const future1 = new Date(now.getTime() + 7*24*60*60*1000).toISOString();
  const future2 = new Date(now.getTime() + 14*24*60*60*1000).toISOString();
  const future3 = new Date(now.getTime() + 21*24*60*60*1000).toISOString();
  const past1   = new Date(now.getTime() - 5*24*60*60*1000).toISOString();

  db.prepare('INSERT OR IGNORE INTO competitions(id,title,description,type,start_time,end_time,prize,max_participants,rules,is_active,status,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(
    uuidv4(),'SAU Coding Championship 2025',
    'Test your data structures and algorithm skills against the best minds at SAU. Problems range from beginner to expert level.',
    'coding', future1, future2,
    'Winner: ₹25,000 cash + Google interview fast-track | Runner-up: ₹10,000 + certificate',
    200, 'Individual participation only. No plagiarism. 3 hours per round. Online judge final verdict is binding.', 1, 'approved', adminPIDs[0]
  );
  db.prepare('INSERT OR IGNORE INTO competitions(id,title,description,type,start_time,end_time,prize,max_participants,rules,is_active,status,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(
    uuidv4(),'National Aptitude Challenge',
    'Quantitative aptitude, logical reasoning, and verbal ability — a comprehensive test designed to mirror top company placement assessments.',
    'aptitude', future2, future3,
    'Top 3: ₹5,000 each + premium placement cell recommendation letter',
    500, 'MCQ format. 90 minutes. No negative marking. Results announced within 48 hours.', 1, 'approved', adminPIDs[0]
  );
  db.prepare('INSERT OR IGNORE INTO competitions(id,title,description,type,start_time,end_time,prize,max_participants,rules,is_active,status,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(
    uuidv4(),'HireLoop Hackathon — Build for Bharat',
    '48-hour hackathon to build solutions addressing real problems in education, healthcare, or financial inclusion. Mentors from Google and Microsoft.',
    'hackathon', future1, future3,
    'Winner: ₹50,000 + internship offer from sponsoring company | Best UX: ₹15,000',
    150, 'Teams of 2-4 people. Must include at least one SAU student. Final demo to panel of judges.', 1, 'approved', adminPIDs[0]
  );
  db.prepare('INSERT OR IGNORE INTO competitions(id,title,description,type,start_time,end_time,prize,max_participants,rules,is_active,status,created_by) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(
    uuidv4(),'Business Case Study Challenge',
    'Analyse a real-world business problem presented by Deloitte and McKinsey consultants. Present your solution in 15 minutes.',
    'case_study', past1, now.toISOString(),
    'Winner: McKinsey case prep course + ₹8,000 | Runner-up: Deloitte aptitude fast-track',
    80, 'Teams of 2-3. Written submission due before presentation. Case revealed 48 hours prior.', 1, 'approved', adminPIDs[0]
  );

  // Remove legacy DEMO account generation code

  console.log('\nSeeded successfully!\n');
  console.log('Demo Credentials:');
  console.log('  Student   -> student@hireloop.io   / password123');
  console.log('  Recruiter -> recruiter@hireloop.io / password123');
  console.log('  Admin     -> admin@hireloop.io     / password123');
  console.log('  Admin 2   -> soumya@sau.ac.in      / password123');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
