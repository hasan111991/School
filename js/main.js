/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Bright Future Academy - Main Interactivity (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileNav();
  initScrollSpy();
  initFaqAccordion();
  initCourseModal();
  initQuickInquiryTriggers();
});

/* --------------------------------------------------------------------------
   1. Header Scroll Effect
   -------------------------------------------------------------------------- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
      header.style.boxShadow = '0 4px 20px rgba(23, 59, 108, 0.08)';
    } else {
      header.classList.remove('scrolled');
      header.style.boxShadow = 'none';
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
}

/* --------------------------------------------------------------------------
   2. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileNavToggle');
  const drawer = document.getElementById('mobileNavDrawer');
  const overlay = document.getElementById('mobileNavOverlay');
  const closeBtn = document.getElementById('mobileNavClose');
  const links = document.querySelectorAll('.mobile-drawer-link');

  if (!toggleBtn || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    toggleBtn.setAttribute('aria-expanded', 'true');
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    toggleBtn.setAttribute('aria-expanded', 'false');
  };

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  links.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/* --------------------------------------------------------------------------
   3. Active Navigation State (Scroll Spy)
   -------------------------------------------------------------------------- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-desktop .nav-link, .mobile-drawer-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            const href = link.getAttribute('href');
            if (href === `#${id}`) {
              link.classList.add('active');
            } else if (href && href.startsWith('#')) {
              link.classList.remove('active');
            }
          });
        }
      });
    },
    {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    }
  );

  sections.forEach((sec) => observer.observe(sec));
}

/* --------------------------------------------------------------------------
   4. FAQ Accordion
   -------------------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach((item) => {
    const btn = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer-collapse');
    if (!btn || !answer) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close other items
      items.forEach((other) => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const otherBtn = other.querySelector('.faq-question-btn');
          const otherAns = other.querySelector('.faq-answer-collapse');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherAns) otherAns.style.maxHeight = null;
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   5. Course Details Modal
   -------------------------------------------------------------------------- */
const COURSE_DETAILS_DATA = {
  preschool: {
    title: 'Pre-School & Montessori Foundation',
    badge: 'Ages 3 – 5 Years',
    overview: 'Our early childhood development curriculum blends joyful play-based exploration with Montessori sensorial manipulatives and structured phonics. We cultivate curiosity, linguistic fluency, and social-emotional confidence in small groups.',
    duration: 'Full Academic Year (Mon – Fri: 8:30 AM – 12:30 PM)',
    fee: 'PKR 6,500 / month (Illustrative Demo Fee)',
    modules: [
      'Jolly Phonics & Pre-reading Skills',
      'Early Numeracy & Practical Life Activities',
      'Sensory Discovery & Motor Skill Refinement',
      'Creative Arts, Rhymes & Bilingual Storytelling',
      'Social Etiquette & Emotional Regulation',
    ],
    features: ['Low 1:12 Student-Teacher ratio', 'Child-safe Montessori activity rooms', 'Daily digital parent communication'],
  },
  primary: {
    title: 'Primary Education (Grades 1 – 5)',
    badge: 'Grades 1 to 5',
    overview: 'A balanced primary program rooted in the national curriculum enriched with Cambridge English and inquiry-led science. We ensure every child masters core mathematics, creative expression, and analytical habits early.',
    duration: 'Full Academic Year (Mon – Fri: 8:00 AM – 1:30 PM)',
    fee: 'PKR 7,500 / month (Illustrative Demo Fee)',
    modules: [
      'Mathematics with Conceptual Problem Solving',
      'Bilingual Fluency: English & Urdu Language Arts',
      'General Science & Practical Nature Studies',
      'Social Studies, History & Islamic Studies / Ethics',
      'Art, Physical Education & Basic IT Skills',
    ],
    features: ['Activity-based learning modules', 'Remedial reading support groups', 'Monthly assessments & progress tracking'],
  },
  middle: {
    title: 'Middle School (Grades 6 – 8)',
    badge: 'Grades 6 to 8',
    overview: 'Bridging foundational concepts with critical analytical reasoning. Students build strong subject mastery in Science (Physics, Chemistry, Biology basics), Advanced Math, and Humanities to prepare seamlessly for board examinations.',
    duration: 'Full Academic Year (Mon – Sat: 8:00 AM – 2:00 PM)',
    fee: 'PKR 8,500 / month (Illustrative Demo Fee)',
    modules: [
      'Advanced Algebraic Concepts & Geometry',
      'Integrated Science: Physics, Chemistry & Biology',
      'Critical Reading, Composition & Debate',
      'Computer Science: Logic & Coding Concepts',
      'Pakistan Studies, Geography & Global Awareness',
    ],
    features: ['Dedicated science lab demonstrations', 'Public speaking & debate sessions', 'Weekly formative quizzes'],
  },
  matric: {
    title: 'Matric Preparation (Grades 9 – 10)',
    badge: 'BISE Rawalpindi & FBISE',
    overview: 'Targeted, high-yield preparation for FBISE and Rawalpindi Board examinations. Led by veteran senior educators, this program pairs rigorous conceptual coverage with systematic past-paper drills and board presentation techniques.',
    duration: '10 Months Intensive Batch + 2 Months Revision Drills',
    fee: 'PKR 9,500 / month (Illustrative Demo Fee)',
    modules: [
      'Science Group: Physics, Chemistry, Biology / Computer Science',
      'Compulsory Subjects: English, Urdu, Islamiat, Pak Studies',
      'Mathematics: Board Blueprint Problem Solving',
      'Comprehensive Past 10-Year Board Paper Series',
      'Weekly Test Series & Full-Length Mock Exams',
    ],
    features: ['Subject specialist faculty with 15+ yrs board experience', 'Detailed paper-attempting methodology', 'Targeted grade improvement tracks'],
  },
  english: {
    title: 'English Language & Public Speaking',
    badge: 'All Age Groups (Evening Track)',
    overview: 'An immersive communications workshop designed to banish hesitation and build natural spoken fluency. Students develop accurate pronunciation, professional writing abilities, and commanding public speaking presence.',
    duration: '3 Months Intensive Workshop (3 Days / Week)',
    fee: 'PKR 5,500 / month (Illustrative Demo Fee)',
    modules: [
      'Spoken English & Everyday Conversational Fluency',
      'Grammar Foundations & Sentence Structure Precision',
      'Vocabulary Expansion & Idiomatic Expressions',
      'Public Speaking, Presentations & Debating Skills',
      'Formal Email & Academic Essay Composition',
    ],
    features: ['Interactive conversational pods', 'Audio-visual recording feedback', 'Certificate of Completion upon graduation'],
  },
  computer: {
    title: 'Computer Skills & Digital Literacy',
    badge: 'Ages 9 – 18 (Weekend & Evening Batches)',
    overview: 'Practical, future-ready computer training ranging from MS Office suite mastery to beginner programming (Python/Web), graphic design basics, and safe ethical web research practices.',
    duration: '3 Months Practical Course (2 Classes / Week)',
    fee: 'PKR 5,000 / month (Illustrative Demo Fee)',
    modules: [
      'Computer Fundamentals & Operating System Navigation',
      'MS Office Suite: Word, Excel & PowerPoint Proficiency',
      'Introduction to Web Design: HTML & CSS Basics',
      'Digital Graphic Tools & Presentation Design',
      'Internet Safety, Ethical AI & Productive Research',
    ],
    features: ['1-to-1 computer workstation allocation', 'Hands-on practical portfolio projects', 'Practical lab assignments every class'],
  },
};

function initCourseModal() {
  const modal = document.getElementById('courseModal');
  const closeBtn = document.getElementById('modalCloseBtn');
  const modalTitle = document.getElementById('modalCourseTitle');
  const modalBadge = document.getElementById('modalCourseBadge');
  const modalDesc = document.getElementById('modalCourseDesc');
  const modalDuration = document.getElementById('modalCourseDuration');
  const modalFee = document.getElementById('modalCourseFee');
  const modalModules = document.getElementById('modalCourseModules');
  const modalFeatures = document.getElementById('modalCourseFeatures');
  const modalApplyBtn = document.getElementById('modalApplyBtn');
  const modalWhatsAppBtn = document.getElementById('modalWhatsAppBtn');

  if (!modal) return;

  const openModal = (courseKey) => {
    const data = COURSE_DETAILS_DATA[courseKey];
    if (!data) return;

    if (modalTitle) modalTitle.textContent = data.title;
    if (modalBadge) modalBadge.textContent = data.badge;
    if (modalDesc) modalDesc.textContent = data.overview;
    if (modalDuration) modalDuration.textContent = data.duration;
    if (modalFee) modalFee.textContent = data.fee;

    if (modalModules) {
      modalModules.innerHTML = data.modules
        .map((m) => `<li><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${m}</li>`)
        .join('');
    }

    if (modalFeatures) {
      modalFeatures.innerHTML = data.features
        .map((f) => `<span class="demo-tag" style="background:#EEF3F9;color:#173B6C;font-size:0.75rem;">${f}</span>`)
        .join(' ');
    }

    if (modalApplyBtn) {
      modalApplyBtn.onclick = () => {
        closeModal();
        prefillAndScrollCourse(data.title);
      };
    }

    if (modalWhatsAppBtn) {
      const waText = encodeURIComponent(`Hello Bright Future Academy, I want to inquire about the ${data.title} program.`);
      modalWhatsAppBtn.href = `https://wa.me/923001234567?text=${waText}`;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  // Bind to all Learn More buttons
  document.querySelectorAll('[data-course-key]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-course-key');
      openModal(key);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* --------------------------------------------------------------------------
   6. Quick Inquiry Triggers from Course Cards
   -------------------------------------------------------------------------- */
function initQuickInquiryTriggers() {
  document.querySelectorAll('[data-course-inquire]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const courseName = btn.getAttribute('data-course-inquire');
      prefillAndScrollCourse(courseName);
    });
  });
}

function prefillAndScrollCourse(courseName) {
  const formSection = document.getElementById('admissions');
  const courseSelect = document.getElementById('inquiryCourse');
  const studentNameInput = document.getElementById('studentName');

  if (formSection) {
    formSection.scrollIntoView({ behavior: 'smooth' });

    if (courseSelect && courseName) {
      // Find matching option
      for (let i = 0; i < courseSelect.options.length; i++) {
        if (
          courseSelect.options[i].text.toLowerCase().includes(courseName.toLowerCase()) ||
          courseName.toLowerCase().includes(courseSelect.options[i].value.toLowerCase())
        ) {
          courseSelect.selectedIndex = i;
          break;
        }
      }
    }

    // Flash focus
    setTimeout(() => {
      if (studentNameInput) studentNameInput.focus();
    }, 600);
  }
}

/* --------------------------------------------------------------------------
   7. Reusable Toast Notification
   -------------------------------------------------------------------------- */
window.showToast = function (message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, 4000);
};

/* --------------------------------------------------------------------------
   8. Dynamic Public Content Synchronizer (BFA_STORE)
   -------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initPublicDynamicContent();
  window.addEventListener('bfa_store_updated', () => {
    initPublicDynamicContent();
  });
});

function initPublicDynamicContent() {
  if (!window.BFA_STORE) return;

  renderPublicAlertBanner();
  renderPublicAnnouncements();
  renderPublicProjects();
  renderPublicBranches();
  renderPublicNotices();
  initFormTypeTabs();
}

function renderPublicAlertBanner() {
  const alertEl = document.getElementById('publicEmergencyAlert');
  const alertTextEl = document.getElementById('publicEmergencyText');
  const settings = window.BFA_STORE.getSettings();

  if (!alertEl || !settings) return;

  if (settings.emergencyAlertActive && settings.emergencyAlertText) {
    alertEl.classList.remove('hidden');
    if (alertTextEl) alertTextEl.textContent = settings.emergencyAlertText;
  } else {
    alertEl.classList.add('hidden');
  }

  // Sync phone & contact where referenced
  document.querySelectorAll('.js-sync-phone').forEach(el => {
    el.textContent = settings.primaryPhone;
    if (el.tagName === 'A') el.href = `tel:${settings.primaryPhone.replace(/\s+/g, '')}`;
  });
  document.querySelectorAll('.js-sync-email').forEach(el => {
    el.textContent = settings.primaryEmail;
    if (el.tagName === 'A') el.href = `mailto:${settings.primaryEmail}`;
  });
  document.querySelectorAll('.js-sync-address').forEach(el => {
    el.textContent = settings.mainCampusAddress;
  });
}

function renderPublicAnnouncements() {
  const container = document.getElementById('publicAnnouncementsContainer');
  if (!container) return;

  const announcements = window.BFA_STORE.getAnnouncements(true); // only published
  if (announcements.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted); background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">
        No active announcements at this time. Check back soon for upcoming campus updates.
      </div>
    `;
    return;
  }

  container.innerHTML = announcements.map(item => `
    <article class="announcement-card ${item.priority === 'High' ? 'priority-high' : ''}">
      <div>
        <div class="announcement-header">
          <span class="demo-tag" style="background:var(--surface-alt); color:var(--primary);">${escapeHtml(item.category)}</span>
          <div class="announcement-meta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <span>${escapeHtml(item.date)}</span>
          </div>
        </div>
        <h3 class="announcement-title" style="margin-top:0.75rem;">${escapeHtml(item.title)}</h3>
        <p class="announcement-summary" style="margin-top:0.5rem;">${escapeHtml(item.summary)}</p>
      </div>
      <div style="padding-top:0.75rem; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; font-weight:600; color:${item.priority === 'High' ? 'var(--accent-hover)' : 'var(--secondary)'};">
          ${item.priority === 'High' ? 'Important Notice' : 'Campus Update'}
        </span>
        <a href="${item.actionLink || '#admissions'}" class="btn btn-outline btn-sm" style="padding:0.3rem 0.75rem; font-size:0.8125rem;">
          ${escapeHtml(item.actionText || 'Learn More')} &rarr;
        </a>
      </div>
    </article>
  `).join('');
}

function renderPublicProjects() {
  const container = document.getElementById('publicProjectsContainer');
  if (!container) return;

  const projects = window.BFA_STORE.getProjects(true); // only published
  if (projects.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted); background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">
        Development project documentation is currently being compiled for the upcoming term.
      </div>
    `;
    return;
  }

  container.innerHTML = projects.map(item => `
    <article class="project-card">
      <div>
        <div class="project-meta-top">
          <span class="demo-tag" style="background:#EEF3F9; color:#173B6C;">${escapeHtml(item.category)}</span>
          <span class="project-location">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            ${escapeHtml(item.constituency || item.location)}
          </span>
        </div>
        <h3 class="project-title" style="margin-top:0.75rem;">${escapeHtml(item.title)}</h3>
        <p class="project-desc" style="margin-top:0.5rem;">${escapeHtml(item.summary)}</p>
      </div>

      <div class="project-progress-wrap">
        <div class="progress-label-row">
          <span>Project Completion</span>
          <span style="color:var(--secondary);">${item.progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${Math.min(100, item.progress)}%;"></div>
        </div>
      </div>

      <div class="project-details-grid">
        <div>
          <span>Constituency / Scope</span>
          <strong>${escapeHtml(item.location)}</strong>
        </div>
        <div>
          <span>Target Milestone</span>
          <strong>${escapeHtml(item.targetDate)}</strong>
        </div>
      </div>
    </article>
  `).join('');
}

function renderPublicBranches() {
  const container = document.getElementById('publicBranchesContainer');
  if (!container) return;

  const branches = window.BFA_STORE.getBranches();
  container.innerHTML = branches.map(item => `
    <div class="branch-card">
      <div class="branch-header">
        <div>
          <h3 class="branch-title">${escapeHtml(item.name)}</h3>
          <span class="branch-constituency">${escapeHtml(item.constituency)}</span>
        </div>
        <span class="demo-tag" style="background:#ECFDF5; color:#047857; font-size:0.7rem;">${escapeHtml(item.status)}</span>
      </div>

      <ul class="branch-info-list">
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <span>${escapeHtml(item.address)}</span>
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Focal Person: <strong>${escapeHtml(item.focalPerson)}</strong></span>
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          <span>Helpline: <a href="tel:${escapeHtml(item.phone)}" style="color:var(--secondary); font-weight:600;">${escapeHtml(item.phone)}</a></span>
        </li>
        <li>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>
          <span>Programs: ${escapeHtml(item.levels)}</span>
        </li>
      </ul>

      <div style="padding-top:0.75rem; border-top:1px solid var(--border); display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
        <span>Capacity: <strong>${item.capacity} Students</strong></span>
        <span>Current Enrollment: <strong>${item.enrolled} Students</strong></span>
      </div>
    </div>
  `).join('');
}

function renderPublicNotices() {
  const container = document.getElementById('publicNoticesContainer');
  if (!container) return;

  const notices = window.BFA_STORE.getNotices(true); // only published
  if (notices.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--text-muted); background: var(--surface); border: 1px dashed var(--border); border-radius: var(--radius-md);">
        No downloadable notices at this time.
      </div>
    `;
    return;
  }

  container.innerHTML = notices.map(item => `
    <div class="notice-item-card">
      <div>
        <div class="notice-icon-title">
          <div class="notice-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div>
            <h4 class="notice-title">${escapeHtml(item.title)}</h4>
            <span class="notice-meta-tag">${escapeHtml(item.category)} &middot; ${escapeHtml(item.fileType)} (${escapeHtml(item.fileSize)})</span>
          </div>
        </div>
        <p style="font-size:0.8125rem; color:var(--text-muted); margin-top:0.75rem; line-height:1.45;">${escapeHtml(item.description)}</p>
      </div>

      <div class="notice-footer">
        <span style="font-size:0.75rem; color:var(--text-subtle);">Updated: ${escapeHtml(item.date)}</span>
        <button type="button" class="btn btn-primary btn-sm" onclick="downloadNoticeSimulated('${escapeHtml(item.title)}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Download PDF
        </button>
      </div>
    </div>
  `).join('');
}

window.downloadNoticeSimulated = function(title) {
  if (window.showToast) {
    window.showToast(`Downloading "${title}"...`, 'success');
  }
};

function initFormTypeTabs() {
  const tabBtns = document.querySelectorAll('.form-tab-btn');
  const typeInput = document.getElementById('submissionType');
  const courseGroup = document.getElementById('courseSelectionGroup');
  const formHeading = document.getElementById('formDynamicHeading');

  if (!tabBtns.length || !typeInput) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedType = btn.getAttribute('data-type');
      typeInput.value = selectedType;

      if (selectedType === 'Inquiry') {
        if (courseGroup) courseGroup.style.display = 'flex';
        if (formHeading) formHeading.textContent = 'Student Admission Application';
      } else if (selectedType === 'Complaint') {
        if (courseGroup) courseGroup.style.display = 'none';
        if (formHeading) formHeading.textContent = 'Submit Citizen / Parent Grievance';
      } else if (selectedType === 'Suggestion') {
        if (courseGroup) courseGroup.style.display = 'none';
        if (formHeading) formHeading.textContent = 'Share an Academic Suggestion';
      } else {
        if (courseGroup) courseGroup.style.display = 'none';
        if (formHeading) formHeading.textContent = 'General Inquiry & Feedback';
      }
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
