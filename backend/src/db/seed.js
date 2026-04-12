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
  const adminUID = uuidv4(), adminPID = uuidv4();
  db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(adminUID,'admin@hireloop.io',hash('Admin@123'),'admin');
  db.prepare('INSERT INTO admin_profiles(id,user_id,name,institution) VALUES(?,?,?,?)').run(adminPID,adminUID,'Dr. Soumya Sharma','IIT Delhi Placement Cell');

  // STUDENTS
  const studentsData = [
    { email:'arjun@student.iitd.ac.in', fn:'Arjun', ln:'Mehta', branch:'Computer Science', cgpa:8.7, skills:['React','Node.js','Python','Machine Learning','Docker'], batch:2025, premium:1 },
    { email:'sneha@student.iitd.ac.in', fn:'Sneha', ln:'Patel', branch:'Electronics & Communication', cgpa:8.2, skills:['VLSI','Embedded C','MATLAB','PCB Design'], batch:2025, premium:0 },
    { email:'rahul@student.iitd.ac.in', fn:'Rahul', ln:'Kumar', branch:'Mechanical Engineering', cgpa:7.9, skills:['CAD','SolidWorks','Python','ANSYS'], batch:2025, premium:0 },
    { email:'priya@student.iitd.ac.in', fn:'Priya', ln:'Singh', branch:'Computer Science', cgpa:9.1, skills:['Java','Spring Boot','AWS','Kubernetes','SQL'], batch:2025, premium:1 },
    { email:'demo@student.iitd.ac.in', fn:'Demo', ln:'Student', branch:'Computer Science', cgpa:8.5, skills:['React','TypeScript','Python','Node.js'], batch:2025, premium:0 },
  ];
  const studentPIDs = [];
  for (const s of studentsData) {
    const uid = uuidv4(), pid = uuidv4();
    db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(uid,s.email,hash('Student@123'),'student');
    db.prepare('INSERT INTO student_profiles(id,user_id,first_name,last_name,phone,college,branch,batch,cgpa,skills,bio,is_premium) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(pid,uid,s.fn,s.ln,'9876543210','IIT Delhi',s.branch,s.batch,s.cgpa,JSON.stringify(s.skills),`${s.branch} student passionate about building scalable systems.`,s.premium);
    studentPIDs.push(pid);
  }

  // COMPANIES
  const companiesData = [
    { email:'hr@google.com', name:'Google India', industry:'Technology', desc:'Organise the world\'s information.', site:'https://google.com', approved:1 },
    { email:'hr@microsoft.com', name:'Microsoft India', industry:'Technology', desc:'Empower every person and organisation.', site:'https://microsoft.com', approved:1 },
    { email:'hr@goldman.com', name:'Goldman Sachs', industry:'Finance & Banking', desc:'Global investment banking firm.', site:'https://goldmansachs.com', approved:1 },
    { email:'hr@flipkart.com', name:'Flipkart', industry:'E-Commerce', desc:'India\'s leading e-commerce company.', site:'https://flipkart.com', approved:1 },
    { email:'hr@startup.io', name:'TechNova AI', industry:'AI Startup', desc:'Building next-gen AI products.', site:'https://technova.io', approved:0 },
  ];
  const companyPIDs = [];
  for (const c of companiesData) {
    const uid = uuidv4(), pid = uuidv4();
    db.prepare('INSERT INTO users(id,email,password,role) VALUES(?,?,?,?)').run(uid,c.email,hash('Recruiter@123'),'recruiter');
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
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,is_pinned) VALUES(?,?,?,?,?,?)').run(uuidv4(),adminPID,'🎉 Campus Placement Season 2025 is Open!','All eligible students must complete their profiles and upload updated resumes before May 15th. 50+ companies expected this season.','success',1);
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,is_pinned) VALUES(?,?,?,?,?,?)').run(uuidv4(),adminPID,'Pre-Placement Talk: Google India','Google India will host a PPT on April 22nd at 3 PM, Auditorium Hall A. Register via your student portal.','info',0);
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,is_pinned) VALUES(?,?,?,?,?,?)').run(uuidv4(),adminPID,'⚠️ Resume Submission Deadline','Final deadline for resume submission is April 30th. No extensions. Use the Resume Builder or upload directly.','warning',1);
  db.prepare('INSERT INTO announcements(id,admin_id,title,content,type,is_pinned) VALUES(?,?,?,?,?,?)').run(uuidv4(),adminPID,'Mock Interview Sessions Available','AI-powered mock interviews are now live. Premium students get unlimited sessions. Upgrade from your dashboard.','info',0);

  // Mark the default admin as super admin
  db.prepare('UPDATE users SET is_super_admin=1 WHERE email=?').run('admin@hireloop.io');

  console.log('✅ Seeded successfully!\n');
  console.log('🔐 Demo Credentials:');
  console.log('   Student   → demo@student.iitd.ac.in / Student@123');
  console.log('   Recruiter → hr@google.com / Recruiter@123');
  console.log('   Admin     → admin@hireloop.io / Admin@123\n');
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
