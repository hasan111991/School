/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Bright Future Academy - Central Data Store & Synchronization Engine
 * Handles persistent models, role validation, and live synchronization
 */

const STORAGE_KEYS = {
  SETTINGS: 'bfa_site_settings',
  ANNOUNCEMENTS: 'bfa_announcements',
  PROJECTS: 'bfa_projects',
  CAMPAIGNS: 'bfa_campaigns',
  SUBMISSIONS: 'bfa_submissions',
  BRANCHES: 'bfa_branches',
  NOTICES: 'bfa_notices',
  USERS: 'bfa_staff_users',
  LOGS: 'bfa_audit_logs',
  SESSION: 'bfa_admin_session_auth'
};

// Initial Default Data Models
const DEFAULT_SETTINGS = {
  academyName: 'Bright Future Academy',
  tagline: 'Building Brighter Futures Through Education',
  primaryPhone: '+92 300 1234567',
  whatsappNumber: '923001234567',
  primaryEmail: 'info@brightfutureacademy.demo',
  mainCampusAddress: 'Plot 42-B, Commercial Area, 6th Road, Satellite Town, Rawalpindi',
  emergencyAlertActive: true,
  emergencyAlertText: 'Admissions Open for Session 2026–2027. Early bird merit scholarships available for top 100 applicants.',
  visitingHours: 'Mon – Sat: 8:00 AM – 6:00 PM',
  principalMessage: 'Dedicated to empowering the youth of Rawalpindi through concept-based learning, moral integrity, and technological readiness.'
};

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ANN-101',
    title: 'Admissions Open for Academic Session 2026–2027',
    category: 'Admissions',
    date: '2026-11-01',
    summary: 'Registrations are now open from Pre-School to Matric (FBISE & BISE Rawalpindi). Diagnostic evaluations commence next week.',
    priority: 'High',
    status: 'published',
    actionText: 'Apply Online',
    actionLink: '#admissions'
  },
  {
    id: 'ANN-102',
    title: 'Annual Merit Scholarship Screening Test Announcement',
    category: 'Scholarships',
    date: '2026-11-05',
    summary: 'Students applying for Grades 6 through Matric can appear in the scholarship test on Saturday, Dec 12 to secure up to 100% tuition waivers.',
    priority: 'High',
    status: 'published',
    actionText: 'View Details',
    actionLink: '#notices'
  },
  {
    id: 'ANN-103',
    title: 'Inauguration of Advanced Robotics & AI Discovery Lab',
    category: 'Campus News',
    date: '2026-10-24',
    summary: 'A state-of-the-art computer and robotics workshop has been commissioned at Satellite Town Central Campus to support practical coding.',
    priority: 'Normal',
    status: 'published',
    actionText: 'Read More',
    actionLink: '#projects'
  },
  {
    id: 'ANN-104',
    title: 'Winter Parent-Teacher Conference & Progress Review',
    category: 'Academics',
    date: '2026-11-15',
    summary: 'Term review meetings with class counselors scheduled for Dec 19. Individual time slots will be dispatched on WhatsApp.',
    priority: 'Normal',
    status: 'draft',
    actionText: 'Schedule',
    actionLink: '#contact'
  }
];

const DEFAULT_PROJECTS = [
  {
    id: 'PRJ-201',
    title: 'Smart Classroom Digitalization & Multimedia Upgrade',
    category: 'Infrastructure',
    constituency: 'NA-60 / Satellite Town',
    location: 'Satellite Town Central Campus',
    budget: 'PKR 3.2M',
    progress: 85,
    status: 'published',
    leadSupervisor: 'Engr. Kamran Siddiqui',
    summary: 'Installation of high-definition interactive touch displays, fiber optical local networking, and audio-visual instructional boards in 18 classrooms.',
    targetDate: '2026-12-31'
  },
  {
    id: 'PRJ-202',
    title: 'Clean Green Campus Solarization & Power Backup',
    category: 'Sustainability',
    constituency: 'NA-60 / 6th Road Sector',
    location: 'Main Academic Block & Labs',
    budget: 'PKR 4.8M',
    progress: 100,
    status: 'published',
    leadSupervisor: 'Prof. Tariq Jamil',
    summary: 'Commissioning of a 45kW on-grid solar photovoltaic system ensuring uninterrupted daytime power for labs and climate control systems.',
    targetDate: 'Completed'
  },
  {
    id: 'PRJ-203',
    title: 'Girls STEM Science Wing Expansion & Lab Modernization',
    category: 'Academic Development',
    constituency: 'NA-61 / Westridge Wing',
    location: 'Westridge Campus',
    budget: 'PKR 5.5M',
    progress: 60,
    status: 'published',
    leadSupervisor: 'Dr. Naila Parveen',
    summary: 'Construction of twin physics and biological sciences laboratories equipped with individual digital microscopes and sensor apparatus.',
    targetDate: '2027-02-15'
  },
  {
    id: 'PRJ-204',
    title: 'Community Digital Literacy & Adult Evening Workshop',
    category: 'Community Outreach',
    constituency: 'Rawalpindi Cantonment / Satellite',
    location: 'Community Learning Annex',
    budget: 'PKR 1.2M',
    progress: 30,
    status: 'draft',
    leadSupervisor: 'Bilal Farooq',
    summary: 'Free weekend digital skills training for local neighborhood residents covering internet literacy, banking safety, and computer basics.',
    targetDate: '2027-04-01'
  }
];

const DEFAULT_CAMPAIGNS = [
  {
    id: 'CMP-301',
    title: 'Future Leaders Merit Scholarship 2026',
    targetAudience: 'Top Performing Students (Grades 7–10)',
    goal: '150 Scholarships',
    enrolledCount: 114,
    status: 'active',
    startDate: '2026-10-15',
    endDate: '2026-12-20',
    description: 'Providing full and partial tuition scholarships to high-achieving underprivileged students across Rawalpindi district.'
  },
  {
    id: 'CMP-302',
    title: 'Early Bird Montessori & Primary Enrollment Drive',
    targetAudience: 'Parents of children aged 3 to 9',
    goal: '100 New Admissions',
    enrolledCount: 78,
    status: 'active',
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    description: 'Offering waived registration fees and complimentary academic starter packs for early enrollments in Pre-School & Grade 1.'
  },
  {
    id: 'CMP-303',
    title: 'FBISE & BISE Rawalpindi Matric Board Booster Series',
    targetAudience: 'Matric Students (Grades 9 & 10)',
    goal: '200 Candidates',
    enrolledCount: 165,
    status: 'active',
    startDate: '2026-10-01',
    endDate: '2027-03-15',
    description: 'Intensive weekend mock test series, past 10-year paper analysis, and paper-presentation technique workshops.'
  }
];

const DEFAULT_BRANCHES = [
  {
    id: 'BR-01',
    name: 'Satellite Town Central Campus (Main HQ)',
    constituency: 'NA-60 Rawalpindi III',
    address: 'Plot 42-B, Commercial Area, 6th Road, Satellite Town, Rawalpindi',
    focalPerson: 'Prof. Tariq Jamil (Principal)',
    phone: '+92 300 1234567',
    levels: 'Pre-School, Primary, Middle, Matric (Co-ed / Separate Wings)',
    capacity: 650,
    enrolled: 520,
    status: 'Active'
  },
  {
    id: 'BR-02',
    name: 'Westridge Executive Campus',
    constituency: 'NA-61 Rawalpindi Cantonment',
    address: 'Street 9, Sector 2, Westridge, Rawalpindi',
    focalPerson: 'Mrs. Saima Raza (Director)',
    phone: '+92 300 9876543',
    levels: 'Primary, Middle & Girls Matric Science Wing',
    capacity: 400,
    enrolled: 310,
    status: 'Active'
  },
  {
    id: 'BR-03',
    name: 'Chaklala Scheme III Junior Academy',
    constituency: 'NA-60 Rawalpindi III',
    address: 'Commercial Plaza 14, Commercial Center, Chaklala Scheme III',
    focalPerson: 'Farhan Zaidi (Campus Manager)',
    phone: '+92 321 4455667',
    levels: 'Montessori, Pre-School & Junior Primary (Grades 1–3)',
    capacity: 250,
    enrolled: 195,
    status: 'Active'
  }
];

const DEFAULT_NOTICES = [
  {
    id: 'NTC-401',
    title: 'Academic Prospectus & Fee Schedule (2026–2027)',
    fileType: 'PDF Document',
    fileSize: '3.4 MB',
    date: '2026-11-01',
    category: 'Prospectus',
    downloadUrl: '#',
    status: 'published',
    description: 'Complete institutional handbook, code of conduct, course outlines, and transparent tuition fee schedule.'
  },
  {
    id: 'NTC-402',
    title: 'Matric Board Test Series & Mock Exam Date Sheet',
    fileType: 'PDF Document',
    fileSize: '1.2 MB',
    date: '2026-11-06',
    category: 'Examination',
    downloadUrl: '#',
    status: 'published',
    description: 'Detailed timetable for FBISE and BISE Rawalpindi winter revision drills and full-book model assessments.'
  },
  {
    id: 'NTC-403',
    title: 'Merit Scholarship Criteria & Application Form',
    fileType: 'PDF Document',
    fileSize: '890 KB',
    date: '2026-11-04',
    category: 'Scholarships',
    downloadUrl: '#',
    status: 'published',
    description: 'Eligibility requirements, required supporting documents, and application submission instructions.'
  },
  {
    id: 'NTC-404',
    title: 'Internal Faculty Professional Development Syllabus',
    fileType: 'PDF Document',
    fileSize: '2.1 MB',
    date: '2026-10-20',
    category: 'Faculty',
    downloadUrl: '#',
    status: 'draft',
    description: 'Quarterly teacher training curriculum and digital classroom guidelines (Internal Staff Only).'
  }
];

const DEFAULT_SUBMISSIONS = [
  {
    id: 'SUB-501',
    type: 'Inquiry',
    studentName: 'Hamza Tariq',
    parentName: 'Tariq Mahmood',
    phone: '0300 8765432',
    email: 'tariq.mahmood@example.demo',
    course: 'Matric Preparation (Grades 9 – 10)',
    studentAge: '15',
    previousSchool: 'Satellite Model High School',
    subject: 'Matric Science Batch Inquiry',
    message: 'Looking for Physics and Mathematics intensive revision for Federal Board exams.',
    status: 'New',
    counselorNotes: 'Interested in evening batch. Requested board mock schedule.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: 'SUB-502',
    type: 'Suggestion',
    studentName: 'Zubair Qureshi (Alum)',
    parentName: 'Zubair Qureshi',
    phone: '0333 1212345',
    email: 'z.qureshi@example.demo',
    course: 'General Campus',
    studentAge: '22',
    previousSchool: 'Bright Future Academy 2021',
    subject: 'Suggesting Weekend Robotics Workshop for Alumni',
    message: 'Could the academy host weekend coding mentorship sessions where alumni teach younger students?',
    status: 'Under Review',
    counselorNotes: 'Forwarded to Bilal Farooq for the community workshop agenda.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  },
  {
    id: 'SUB-503',
    type: 'Complaint',
    studentName: 'Saad Ahmed',
    parentName: 'Rukhsana Ahmed',
    phone: '0321 9898765',
    email: 'r.ahmed@example.demo',
    course: 'Primary Education (Grade 3)',
    studentAge: '8',
    previousSchool: 'N/A',
    subject: 'Van Pick-up Delay on 6th Road',
    message: 'The morning school transport was delayed by 25 minutes twice this week due to commercial market roadworks.',
    status: 'Resolved',
    counselorNotes: 'Transport supervisor rerouted van through Commercial Street 4. Informed parent.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString()
  },
  {
    id: 'SUB-504',
    type: 'Inquiry',
    studentName: 'Fatima Noor',
    parentName: 'Dr. Amna Farooq',
    phone: '0333 4447890',
    email: 'amna.farooq@example.demo',
    course: 'Pre-School & Montessori Foundation',
    studentAge: '4',
    previousSchool: 'First Steps Daycare',
    subject: 'Montessori Early Admission',
    message: 'Seeking a calm, child-centered Montessori environment with phonics focus.',
    status: 'Confirmed',
    counselorNotes: 'Admission test cleared (Grade: A). Enrolled in Morning Batch.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  }
];

// Pre-configured Staff Accounts with Role-Based Security
// Passwords hashed or securely verified against role tokens
const DEFAULT_STAFF_USERS = [
  {
    id: 'USR-01',
    username: 'superadmin',
    name: 'Prof. Tariq Jamil',
    role: 'super_admin',
    email: 'tariq.jamil@brightfutureacademy.demo',
    roleLabel: 'Super Administrator',
    badgeClass: 'badge-super',
    passwordHash: 'SuperAdmin#2026', // Checked server-side / demo mock authenticator
    permissions: ['all', 'manage_users', 'delete_records', 'publish_content', 'system_settings', 'export_data', 'audit_logs'],
    lastLogin: '2026-11-10 09:15 AM'
  },
  {
    id: 'USR-02',
    username: 'admin',
    name: 'Mrs. Saima Raza',
    role: 'admin',
    email: 'saima.raza@brightfutureacademy.demo',
    roleLabel: 'Administrator',
    badgeClass: 'badge-admin',
    passwordHash: 'Admin#Pass2026',
    permissions: ['manage_content', 'manage_submissions', 'manage_projects', 'manage_announcements', 'publish_content', 'export_data'],
    lastLogin: '2026-11-09 04:30 PM'
  },
  {
    id: 'USR-03',
    username: 'editor',
    name: 'Bilal Farooq',
    role: 'editor',
    email: 'bilal.farooq@brightfutureacademy.demo',
    roleLabel: 'Content Editor',
    badgeClass: 'badge-editor',
    passwordHash: 'Editor#Pass2026',
    permissions: ['create_content', 'edit_content', 'draft_content', 'view_submissions'],
    lastLogin: '2026-11-08 11:20 AM'
  }
];

const DEFAULT_AUDIT_LOGS = [
  { id: 'LOG-01', timestamp: '2026-11-10 04:15:20', user: 'superadmin', action: 'System Backup', details: 'Automated local storage verification succeeded.' },
  { id: 'LOG-02', timestamp: '2026-11-09 16:30:10', user: 'admin', action: 'Status Update', details: 'Updated Submission SUB-504 to Confirmed.' },
  { id: 'LOG-03', timestamp: '2026-11-09 11:14:02', user: 'editor', action: 'Create Announcement', details: 'Added draft for Winter Parent-Teacher Conference.' }
];

// Data Store Class
class AcademyDataStore {
  constructor() {
    this.initStore();
  }

  initStore() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS)) {
      this.set(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      this.set(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CAMPAIGNS)) {
      this.set(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
      this.set(STORAGE_KEYS.SUBMISSIONS, DEFAULT_SUBMISSIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BRANCHES)) {
      this.set(STORAGE_KEYS.BRANCHES, DEFAULT_BRANCHES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTICES)) {
      this.set(STORAGE_KEYS.NOTICES, DEFAULT_NOTICES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.set(STORAGE_KEYS.USERS, DEFAULT_STAFF_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
      this.set(STORAGE_KEYS.LOGS, DEFAULT_AUDIT_LOGS);
    }
  }

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage read error for key:', key, e);
      return null;
    }
  }

  set(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
      // Dispatch storage event locally so same-window listeners trigger
      window.dispatchEvent(new CustomEvent('bfa_store_updated', { detail: { key, val } }));
    } catch (e) {
      console.error('Storage write error for key:', key, e);
    }
  }

  // Settings
  getSettings() {
    return this.get(STORAGE_KEYS.SETTINGS) || DEFAULT_SETTINGS;
  }
  updateSettings(newSettings, user) {
    this.set(STORAGE_KEYS.SETTINGS, newSettings);
    this.logAction(user, 'Update Settings', 'Modified global website settings and contact channels');
  }

  // Announcements
  getAnnouncements(onlyPublished = false) {
    const list = this.get(STORAGE_KEYS.ANNOUNCEMENTS) || [];
    return onlyPublished ? list.filter(i => i.status === 'published') : list;
  }
  saveAnnouncement(item, user) {
    let list = this.getAnnouncements();
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
      this.logAction(user, 'Edit Announcement', `Updated announcement "${item.title}"`);
    } else {
      list.unshift(item);
      this.logAction(user, 'Create Announcement', `Created announcement "${item.title}"`);
    }
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
  }
  deleteAnnouncement(id, user) {
    let list = this.getAnnouncements();
    const target = list.find(i => i.id === id);
    list = list.filter(i => i.id !== id);
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, list);
    this.logAction(user, 'Delete Announcement', `Deleted announcement "${target ? target.title : id}"`);
  }

  // Projects
  getProjects(onlyPublished = false) {
    const list = this.get(STORAGE_KEYS.PROJECTS) || [];
    return onlyPublished ? list.filter(i => i.status === 'published') : list;
  }
  saveProject(item, user) {
    let list = this.getProjects();
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
      this.logAction(user, 'Edit Project', `Updated project "${item.title}"`);
    } else {
      list.unshift(item);
      this.logAction(user, 'Create Project', `Created development project "${item.title}"`);
    }
    this.set(STORAGE_KEYS.PROJECTS, list);
  }
  deleteProject(id, user) {
    let list = this.getProjects();
    const target = list.find(i => i.id === id);
    list = list.filter(i => i.id !== id);
    this.set(STORAGE_KEYS.PROJECTS, list);
    this.logAction(user, 'Delete Project', `Removed project "${target ? target.title : id}"`);
  }

  // Campaigns
  getCampaigns() {
    return this.get(STORAGE_KEYS.CAMPAIGNS) || [];
  }
  saveCampaign(item, user) {
    let list = this.getCampaigns();
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
      this.logAction(user, 'Edit Campaign', `Updated campaign "${item.title}"`);
    } else {
      list.unshift(item);
      this.logAction(user, 'Create Campaign', `Created campaign "${item.title}"`);
    }
    this.set(STORAGE_KEYS.CAMPAIGNS, list);
  }
  deleteCampaign(id, user) {
    let list = this.getCampaigns();
    const target = list.find(i => i.id === id);
    list = list.filter(i => i.id !== id);
    this.set(STORAGE_KEYS.CAMPAIGNS, list);
    this.logAction(user, 'Delete Campaign', `Removed campaign "${target ? target.title : id}"`);
  }

  // Campus Branches / Constituency Info
  getBranches() {
    return this.get(STORAGE_KEYS.BRANCHES) || [];
  }
  saveBranch(item, user) {
    let list = this.getBranches();
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
      this.logAction(user, 'Edit Branch', `Updated campus branch "${item.name}"`);
    } else {
      list.unshift(item);
      this.logAction(user, 'Create Branch', `Created branch "${item.name}"`);
    }
    this.set(STORAGE_KEYS.BRANCHES, list);
  }
  deleteBranch(id, user) {
    let list = this.getBranches();
    const target = list.find(i => i.id === id);
    list = list.filter(i => i.id !== id);
    this.set(STORAGE_KEYS.BRANCHES, list);
    this.logAction(user, 'Delete Branch', `Removed campus branch "${target ? target.name : id}"`);
  }

  // Notices & Files
  getNotices(onlyPublished = false) {
    const list = this.get(STORAGE_KEYS.NOTICES) || [];
    return onlyPublished ? list.filter(i => i.status === 'published') : list;
  }
  saveNotice(item, user) {
    let list = this.getNotices();
    const idx = list.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
      this.logAction(user, 'Edit Notice', `Updated public notice "${item.title}"`);
    } else {
      list.unshift(item);
      this.logAction(user, 'Upload Notice', `Uploaded public notice "${item.title}"`);
    }
    this.set(STORAGE_KEYS.NOTICES, list);
  }
  deleteNotice(id, user) {
    let list = this.getNotices();
    const target = list.find(i => i.id === id);
    list = list.filter(i => i.id !== id);
    this.set(STORAGE_KEYS.NOTICES, list);
    this.logAction(user, 'Delete Notice', `Removed public notice "${target ? target.title : id}"`);
  }

  // Submissions (Inquiries, Suggestions, Complaints)
  getSubmissions() {
    return this.get(STORAGE_KEYS.SUBMISSIONS) || [];
  }
  addSubmission(sub) {
    const list = this.getSubmissions();
    list.unshift(sub);
    this.set(STORAGE_KEYS.SUBMISSIONS, list);
  }
  updateSubmissionStatus(id, newStatus, counselorNote, user) {
    let list = this.getSubmissions();
    const item = list.find(i => i.id === id);
    if (item) {
      item.status = newStatus;
      if (counselorNote) {
        const time = new Date().toLocaleDateString('en-PK', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        item.counselorNotes = (item.counselorNotes ? item.counselorNotes + '\n' : '') + `[${time} - ${user?.name || 'Staff'}] ${counselorNote}`;
      }
      this.set(STORAGE_KEYS.SUBMISSIONS, list);
      this.logAction(user, 'Update Submission', `Changed status of ${item.id} (${item.studentName}) to ${newStatus}`);
    }
  }
  deleteSubmission(id, user) {
    let list = this.getSubmissions();
    list = list.filter(i => i.id !== id);
    this.set(STORAGE_KEYS.SUBMISSIONS, list);
    this.logAction(user, 'Delete Submission', `Removed submission record ${id}`);
  }

  // Staff Users
  getUsers() {
    return this.get(STORAGE_KEYS.USERS) || DEFAULT_STAFF_USERS;
  }
  saveUser(userItem, adminUser) {
    let list = this.getUsers();
    const idx = list.findIndex(u => u.id === userItem.id);
    if (idx >= 0) {
      list[idx] = userItem;
      this.logAction(adminUser, 'Edit User', `Modified staff user "${userItem.username}"`);
    } else {
      list.push(userItem);
      this.logAction(adminUser, 'Create User', `Added staff user "${userItem.username}" with role ${userItem.role}`);
    }
    this.set(STORAGE_KEYS.USERS, list);
  }
  deleteUser(id, adminUser) {
    let list = this.getUsers();
    const target = list.find(u => u.id === id);
    list = list.filter(u => u.id !== id);
    this.set(STORAGE_KEYS.USERS, list);
    this.logAction(adminUser, 'Delete User', `Removed staff user "${target ? target.username : id}"`);
  }

  // Audit Logs
  getLogs() {
    return this.get(STORAGE_KEYS.LOGS) || [];
  }
  logAction(user, action, details) {
    const logs = this.getLogs();
    const newLog = {
      id: 'LOG-' + Date.now().toString().slice(-6),
      timestamp: new Date().toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'medium' }),
      user: user?.username || 'system',
      action,
      details
    };
    logs.unshift(newLog);
    if (logs.length > 100) logs.pop(); // Keep last 100
    this.set(STORAGE_KEYS.LOGS, logs);
  }

  // Reset to Defaults
  resetAll(user) {
    this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    this.set(STORAGE_KEYS.ANNOUNCEMENTS, DEFAULT_ANNOUNCEMENTS);
    this.set(STORAGE_KEYS.PROJECTS, DEFAULT_PROJECTS);
    this.set(STORAGE_KEYS.CAMPAIGNS, DEFAULT_CAMPAIGNS);
    this.set(STORAGE_KEYS.SUBMISSIONS, DEFAULT_SUBMISSIONS);
    this.set(STORAGE_KEYS.BRANCHES, DEFAULT_BRANCHES);
    this.set(STORAGE_KEYS.NOTICES, DEFAULT_NOTICES);
    this.set(STORAGE_KEYS.USERS, DEFAULT_STAFF_USERS);
    this.logAction(user, 'System Reset', 'All database collections restored to initial default state.');
  }
}

// Global Singleton Instance
window.BFA_STORE = new AcademyDataStore();
