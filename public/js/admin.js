/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Bright Future Academy - Secure Admin Portal & Role-Based Controller
 */

let currentAdminSession = null;
let currentActiveView = 'overview';
let activeSubmissionForModal = null;
let loginAttempts = 0;
let lockoutTimer = null;

document.addEventListener('DOMContentLoaded', () => {
  initAuthGateway();
  initSidebarNavigation();
  initMobileSidebar();
});

/* --------------------------------------------------------------------------
   1. Authentication Gateway & Session Enforcement
   -------------------------------------------------------------------------- */
function initAuthGateway() {
  const loginForm = document.getElementById('adminLoginForm');
  const sessionData = sessionStorage.getItem('bfa_admin_session_auth');

  if (sessionData) {
    try {
      const parsed = JSON.parse(sessionData);
      // Validate session expiry (24 hours)
      if (parsed.expiresAt && Date.now() < parsed.expiresAt) {
        currentAdminSession = parsed;
        launchAdminDashboard();
        return;
      } else {
        sessionStorage.removeItem('bfa_admin_session_auth');
      }
    } catch (e) {
      sessionStorage.removeItem('bfa_admin_session_auth');
    }
  }

  // Not authenticated: display Login Gateway
  showAuthGateway();

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleAdminLogin();
    });
  }
}

function showAuthGateway() {
  document.getElementById('adminAuthView').style.display = 'flex';
  document.getElementById('adminAppView').style.display = 'none';
}

function handleAdminLogin() {
  if (lockoutTimer) return;

  const usernameInput = document.getElementById('authUsername');
  const passwordInput = document.getElementById('authPassword');
  const errorAlert = document.getElementById('authErrorAlert');
  const submitBtn = document.getElementById('btnAuthSubmit');

  const username = usernameInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  const users = window.BFA_STORE.getUsers();
  const matchedUser = users.find(u => u.username.toLowerCase() === username);

  if (matchedUser && matchedUser.passwordHash === password) {
    // Authentication successful
    loginAttempts = 0;
    errorAlert.classList.remove('active');

    // Create secure session token
    currentAdminSession = {
      token: 'BFA-SEC-' + Math.random().toString(36).substring(2) + Date.now(),
      id: matchedUser.id,
      username: matchedUser.username,
      name: matchedUser.name,
      role: matchedUser.role,
      roleLabel: matchedUser.roleLabel,
      badgeClass: matchedUser.badgeClass,
      permissions: matchedUser.permissions,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };

    sessionStorage.setItem('bfa_admin_session_auth', JSON.stringify(currentAdminSession));

    // Update last login
    matchedUser.lastLogin = new Date().toLocaleString('en-PK', { dateStyle: 'short', timeStyle: 'short' });
    window.BFA_STORE.saveUser(matchedUser, matchedUser);
    window.BFA_STORE.logAction(currentAdminSession, 'Admin Login', `Authenticated session for role "${matchedUser.role}"`);

    launchAdminDashboard();
  } else {
    loginAttempts++;
    if (loginAttempts >= 5) {
      triggerAccountLockout();
    } else {
      errorAlert.textContent = `Access Denied: Invalid administrative credentials. (${5 - loginAttempts} attempts remaining).`;
      errorAlert.classList.add('active');
    }
  }
}

function triggerAccountLockout() {
  const errorAlert = document.getElementById('authErrorAlert');
  const submitBtn = document.getElementById('btnAuthSubmit');
  let secondsLeft = 30;

  submitBtn.disabled = true;
  errorAlert.classList.add('active');

  lockoutTimer = setInterval(() => {
    secondsLeft--;
    errorAlert.textContent = `Security Lockout Active: Too many failed login attempts. Retry in ${secondsLeft}s.`;
    if (secondsLeft <= 0) {
      clearInterval(lockoutTimer);
      lockoutTimer = null;
      loginAttempts = 0;
      submitBtn.disabled = false;
      errorAlert.classList.remove('active');
    }
  }, 1000);
}

// Quick fill helper for client test-drive
window.prefillRole = function(role) {
  const uInput = document.getElementById('authUsername');
  const pInput = document.getElementById('authPassword');
  if (role === 'superadmin') {
    uInput.value = 'superadmin';
    pInput.value = 'SuperAdmin#2026';
  } else if (role === 'admin') {
    uInput.value = 'admin';
    pInput.value = 'Admin#Pass2026';
  } else if (role === 'editor') {
    uInput.value = 'editor';
    pInput.value = 'Editor#Pass2026';
  }
  showAdminToast(`Loaded credentials for ${role.toUpperCase()}`, 'warning');
};

window.signOutAdmin = function() {
  if (confirm('Are you sure you want to securely sign out of the administrative portal?')) {
    if (currentAdminSession) {
      window.BFA_STORE.logAction(currentAdminSession, 'Admin Logout', 'Session ended by user');
    }
    currentAdminSession = null;
    sessionStorage.removeItem('bfa_admin_session_auth');
    window.location.reload();
  }
};

/* --------------------------------------------------------------------------
   2. Launch Dashboard & Enforce Role UI
   -------------------------------------------------------------------------- */
function launchAdminDashboard() {
  document.getElementById('adminAuthView').style.display = 'none';
  document.getElementById('adminAppView').style.display = 'flex';

  applyUserRoleBadges();
  bindViewForms();
  switchView('overview');
  renderCurrentView();

  showAdminToast(`Welcome, ${currentAdminSession.name} (${currentAdminSession.roleLabel})`, 'success');
}

function applyUserRoleBadges() {
  if (!currentAdminSession) return;

  // Sidebar profile
  document.getElementById('sidebarUserName').textContent = currentAdminSession.name;
  document.getElementById('sidebarRoleLabel').textContent = currentAdminSession.roleLabel;
  document.getElementById('sidebarAvatar').textContent = currentAdminSession.name.split(' ').map(n => n[0]).join('').slice(0, 2);

  // Top bar badge
  const topBadge = document.getElementById('topbarRoleBadge');
  topBadge.className = `role-indicator-badge ${currentAdminSession.badgeClass}`;
  topBadge.textContent = currentAdminSession.roleLabel.toUpperCase();

  // Role visibility guards for Super Admin modules
  const isSuperAdmin = currentAdminSession.role === 'super_admin';
  const isAdminOrSuper = currentAdminSession.role === 'super_admin' || currentAdminSession.role === 'admin';

  // Staff management guard
  const userModalBtn = document.getElementById('btnOpenAddUserModal');
  const usersRestricted = document.getElementById('usersRestrictedNotice');
  const usersTableContainer = document.getElementById('usersTableContainer');
  if (userModalBtn) userModalBtn.style.display = isSuperAdmin ? 'inline-flex' : 'none';
  if (usersRestricted) usersRestricted.style.display = isSuperAdmin ? 'none' : 'flex';
  if (usersTableContainer) usersTableContainer.style.display = isSuperAdmin ? 'block' : 'none';

  // Audit logs guard
  const logsRestricted = document.getElementById('logsRestrictedNotice');
  const logsTableContainer = document.getElementById('logsTableContainer');
  if (logsRestricted) logsRestricted.style.display = isSuperAdmin ? 'none' : 'flex';
  if (logsTableContainer) logsTableContainer.style.display = isSuperAdmin ? 'block' : 'none';

  // CMS settings form guard
  const cmsSubmit = document.querySelector('#cmsSettingsForm button[type="submit"]');
  if (cmsSubmit) cmsSubmit.disabled = !isAdminOrSuper;
}

/* --------------------------------------------------------------------------
   3. Navigation & View Switching
   -------------------------------------------------------------------------- */
function initSidebarNavigation() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      const targetView = link.getAttribute('data-view');
      switchView(targetView);
    });
  });
}

function initMobileSidebar() {
  const toggleBtn = document.getElementById('mobileSidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

window.switchView = function(viewKey) {
  currentActiveView = viewKey;

  // Update active sidebar link
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-view') === viewKey);
  });

  // Update active view panel
  document.querySelectorAll('.admin-view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `view-${viewKey}`);
  });

  // Update breadcrumb and header title
  const titles = {
    overview: 'Dashboard Overview & Analytics',
    announcements: 'Public Announcements & Bulletins',
    projects: 'Development Projects & Progress',
    campaigns: 'Campaigns & Admission Drives',
    submissions: 'Submissions, Complaints & Leads',
    branches: 'Campus Branches & Constituency Info',
    notices: 'Public Notices & Document Uploads',
    settings: 'Website Settings & No-Code CMS',
    users: 'Staff & Role Management (Super Admin)',
    logs: 'Security Audit Logs'
  };

  const breadcrumbEl = document.getElementById('breadcrumbCurrent');
  const titleEl = document.getElementById('topbarTitle');
  if (breadcrumbEl) breadcrumbEl.textContent = titles[viewKey] || viewKey;
  if (titleEl) titleEl.textContent = titles[viewKey] || viewKey;

  // Close mobile sidebar if open
  document.getElementById('adminSidebar')?.classList.remove('open');

  renderCurrentView();
};

function renderCurrentView() {
  updateSidebarBadges();

  switch (currentActiveView) {
    case 'overview': renderOverviewView(); break;
    case 'announcements': renderAnnouncementsView(); break;
    case 'projects': renderProjectsView(); break;
    case 'campaigns': renderCampaignsView(); break;
    case 'submissions': renderSubmissionsView(); break;
    case 'branches': renderBranchesView(); break;
    case 'notices': renderNoticesView(); break;
    case 'settings': renderSettingsView(); break;
    case 'users': renderUsersView(); break;
    case 'logs': renderLogsView(); break;
  }
}

function updateSidebarBadges() {
  const annCount = window.BFA_STORE.getAnnouncements().length;
  const projCount = window.BFA_STORE.getProjects().length;
  const notCount = window.BFA_STORE.getNotices().length;
  const subCount = window.BFA_STORE.getSubmissions().filter(s => s.status === 'New').length;

  document.getElementById('badgeAnnouncementsCount').textContent = annCount;
  document.getElementById('badgeProjectsCount').textContent = projCount;
  document.getElementById('badgeNoticesCount').textContent = notCount;
  document.getElementById('badgeSubmissionsCount').textContent = subCount;
}

/* --------------------------------------------------------------------------
   4. View Renderers
   -------------------------------------------------------------------------- */

// OVERVIEW
function renderOverviewView() {
  const submissions = window.BFA_STORE.getSubmissions();
  const projects = window.BFA_STORE.getProjects();

  const total = submissions.length;
  const newCount = submissions.filter(s => s.status === 'New').length;
  const confirmedCount = submissions.filter(s => s.status === 'Confirmed').length;
  const convRatio = total > 0 ? ((confirmedCount / total) * 100).toFixed(1) : 0;
  const activeProjCount = projects.filter(p => p.status === 'published' && p.progress < 100).length;

  document.getElementById('kpiTotalSubmissions').textContent = total;
  document.getElementById('kpiNewInquiries').textContent = newCount;
  document.getElementById('kpiConfirmed').textContent = confirmedCount;
  document.getElementById('kpiActiveProjects').textContent = activeProjCount;
  document.getElementById('kpiConversionRatio').textContent = `${convRatio}%`;

  // Render recent 5 submissions
  const recentTable = document.getElementById('overviewRecentSubmissionsBody');
  if (recentTable) {
    const recent = submissions.slice(0, 5);
    recentTable.innerHTML = recent.map(s => `
      <tr>
        <td style="font-family:monospace; font-size:0.8125rem;">${s.id}</td>
        <td><span class="status-pill ${getStatusPillClass(s.type)}">${s.type}</span></td>
        <td><strong>${escapeHtml(s.studentName)}</strong><br/><span style="font-size:0.75rem; color:var(--admin-muted);">${escapeHtml(s.phone)}</span></td>
        <td>${escapeHtml(s.course || s.subject)}</td>
        <td><span class="status-pill ${getStatusPillClass(s.status)}">${s.status}</span></td>
        <td>
          <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="viewSubmissionDetail('${s.id}')">View</button>
        </td>
      </tr>
    `).join('');
  }
}

// ANNOUNCEMENTS
function renderAnnouncementsView() {
  const list = window.BFA_STORE.getAnnouncements();
  const tableBody = document.getElementById('announcementsTableBody');
  if (!tableBody) return;

  const isEditor = currentAdminSession?.role === 'editor';

  tableBody.innerHTML = list.map(item => `
    <tr>
      <td>${escapeHtml(item.date)}</td>
      <td><strong>${escapeHtml(item.title)}</strong></td>
      <td><span class="demo-tag" style="background:#EEF3F9; color:#173B6C;">${escapeHtml(item.category)}</span></td>
      <td>
        <span style="font-size:0.75rem; font-weight:700; color:${item.priority === 'High' ? 'var(--admin-danger)' : 'var(--admin-muted)'};">
          ${item.priority}
        </span>
      </td>
      <td>
        <span class="status-pill ${item.status === 'published' ? 'published' : 'draft'}">
          ${item.status === 'published' ? 'Published' : 'Draft'}
        </span>
      </td>
      <td>
        <div class="table-action-btns">
          <button class="btn-tbl-action" onclick="editAnnouncement('${item.id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-tbl-action" onclick="toggleAnnouncementStatus('${item.id}')" title="Toggle Publish/Draft">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="btn-tbl-action tbl-delete" onclick="deleteAnnouncementItem('${item.id}')" ${isEditor ? 'disabled title="Restricted to Admin"' : 'title="Delete"'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// PROJECTS
function renderProjectsView() {
  const list = window.BFA_STORE.getProjects();
  const tableBody = document.getElementById('projectsTableBody');
  if (!tableBody) return;

  const isEditor = currentAdminSession?.role === 'editor';

  tableBody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.title)}</strong><br/><span style="font-size:0.75rem; color:var(--admin-muted);">${escapeHtml(item.category)}</span></td>
      <td>${escapeHtml(item.constituency || item.location)}</td>
      <td><strong>${escapeHtml(item.budget)}</strong></td>
      <td style="min-width:140px;">
        <div style="font-size:0.75rem; font-weight:700; margin-bottom:2px;">${item.progress}% Completed</div>
        <div style="height:6px; background:#E2E8F0; border-radius:99px; overflow:hidden;">
          <div style="height:100%; width:${item.progress}%; background:var(--admin-secondary);"></div>
        </div>
      </td>
      <td>
        <span class="status-pill ${item.status === 'published' ? 'published' : 'draft'}">${item.status}</span>
      </td>
      <td>
        <div class="table-action-btns">
          <button class="btn-tbl-action" onclick="editProjectItem('${item.id}')" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
          </button>
          <button class="btn-tbl-action tbl-delete" onclick="deleteProjectItem('${item.id}')" ${isEditor ? 'disabled title="Restricted to Admin"' : 'title="Delete"'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// CAMPAIGNS
function renderCampaignsView() {
  const list = window.BFA_STORE.getCampaigns();
  const tableBody = document.getElementById('campaignsTableBody');
  if (!tableBody) return;

  const isEditor = currentAdminSession?.role === 'editor';

  tableBody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.title)}</strong><br/><span style="font-size:0.75rem; color:var(--admin-muted);">${escapeHtml(item.description)}</span></td>
      <td>${escapeHtml(item.targetAudience)}</td>
      <td><strong>${item.enrolledCount} / ${escapeHtml(item.goal)}</strong></td>
      <td style="font-size:0.75rem;">${escapeHtml(item.startDate)} &rarr; ${escapeHtml(item.endDate)}</td>
      <td><span class="status-pill ${item.status === 'active' ? 'active' : 'draft'}">${item.status}</span></td>
      <td>
        <div class="table-action-btns">
          <button class="btn-tbl-action" onclick="toggleCampaignStatus('${item.id}')" title="Toggle Active">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </button>
          <button class="btn-tbl-action tbl-delete" onclick="deleteCampaignItem('${item.id}')" ${isEditor ? 'disabled title="Restricted to Admin"' : 'title="Delete"'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// SUBMISSIONS, COMPLAINTS & INQUIRIES
function renderSubmissionsView() {
  const list = window.BFA_STORE.getSubmissions();
  const searchInput = document.getElementById('submissionsSearch');
  const typeFilter = document.getElementById('submissionsTypeFilter');
  const statusFilter = document.getElementById('submissionsStatusFilter');
  const tableBody = document.getElementById('submissionsTableBody');

  if (!tableBody) return;

  const search = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const type = typeFilter ? typeFilter.value : '';
  const status = statusFilter ? statusFilter.value : '';

  const filtered = list.filter(s => {
    const matchSearch = !search ||
      s.studentName.toLowerCase().includes(search) ||
      (s.parentName && s.parentName.toLowerCase().includes(search)) ||
      (s.phone && s.phone.includes(search)) ||
      s.id.toLowerCase().includes(search);

    const matchType = !type || s.type === type;
    const matchStatus = !status || s.status === status;

    return matchSearch && matchType && matchStatus;
  });

  const isEditor = currentAdminSession?.role === 'editor';

  tableBody.innerHTML = filtered.map(item => `
    <tr>
      <td style="font-family:monospace; font-size:0.8125rem;">
        ${item.id}
        <div style="font-size:0.7rem; color:var(--admin-muted);">${new Date(item.timestamp).toLocaleDateString('en-PK', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}</div>
      </td>
      <td><span class="status-pill ${getStatusPillClass(item.type)}">${item.type}</span></td>
      <td><strong>${escapeHtml(item.studentName)}</strong><br/><span style="font-size:0.75rem; color:var(--admin-muted);">Parent: ${escapeHtml(item.parentName)}</span></td>
      <td>
        <a href="tel:${escapeHtml(item.phone)}" style="color:var(--admin-secondary); font-weight:600; text-decoration:none;">${escapeHtml(item.phone)}</a><br/>
        <span style="font-size:0.75rem; color:var(--admin-muted);">${escapeHtml(item.email)}</span>
      </td>
      <td>${escapeHtml(item.course || item.subject)}</td>
      <td><span class="status-pill ${getStatusPillClass(item.status)}">${item.status}</span></td>
      <td>
        <div class="table-action-btns">
          <button class="btn-tbl-action" onclick="viewSubmissionDetail('${item.id}')" title="View Full Details">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="btn-tbl-action tbl-wa" onclick="openDirectWhatsAppChat('${item.phone}', '${escapeHtml(item.parentName)}', '${escapeHtml(item.course || item.subject)}')" title="Follow Up on WhatsApp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          </button>
          <button class="btn-tbl-action tbl-delete" onclick="deleteSubmissionItem('${item.id}')" ${isEditor ? 'disabled title="Restricted to Admin"' : 'title="Delete"'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// CAMPUS BRANCHES
function renderBranchesView() {
  const list = window.BFA_STORE.getBranches();
  const tableBody = document.getElementById('branchesTableBody');
  if (!tableBody) return;

  const isEditor = currentAdminSession?.role === 'editor';

  tableBody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.name)}</strong><br/><span style="font-size:0.75rem; color:var(--admin-muted);">${escapeHtml(item.address)}</span></td>
      <td>${escapeHtml(item.constituency)}</td>
      <td>${escapeHtml(item.focalPerson)}</td>
      <td>${escapeHtml(item.phone)}</td>
      <td><strong>${item.enrolled} / ${item.capacity}</strong></td>
      <td>
        <div class="table-action-btns">
          <button class="btn-tbl-action tbl-delete" onclick="deleteBranchItem('${item.id}')" ${isEditor ? 'disabled title="Restricted to Admin"' : 'title="Delete"'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// PUBLIC NOTICES & DOCUMENTS
function renderNoticesView() {
  const list = window.BFA_STORE.getNotices();
  const tableBody = document.getElementById('noticesTableBody');
  if (!tableBody) return;

  const isEditor = currentAdminSession?.role === 'editor';

  tableBody.innerHTML = list.map(item => `
    <tr>
      <td><strong>${escapeHtml(item.title)}</strong><br/><span style="font-size:0.75rem; color:var(--admin-muted);">${escapeHtml(item.description)}</span></td>
      <td><span class="demo-tag" style="background:#F1F5F9; color:#173B6C;">${escapeHtml(item.category)}</span></td>
      <td>${escapeHtml(item.fileType)} &middot; ${escapeHtml(item.fileSize)}</td>
      <td>${escapeHtml(item.date)}</td>
      <td><span class="status-pill ${item.status === 'published' ? 'published' : 'draft'}">${item.status}</span></td>
      <td>
        <div class="table-action-btns">
          <button class="btn-tbl-action" onclick="toggleNoticeStatus('${item.id}')" title="Toggle Published/Draft">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
          <button class="btn-tbl-action tbl-delete" onclick="deleteNoticeItem('${item.id}')" ${isEditor ? 'disabled title="Restricted to Admin"' : 'title="Delete"'}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// SETTINGS (NO-CODE CMS)
function renderSettingsView() {
  const settings = window.BFA_STORE.getSettings();
  document.getElementById('settingAcademyName').value = settings.academyName || '';
  document.getElementById('settingTagline').value = settings.tagline || '';
  document.getElementById('settingPhone').value = settings.primaryPhone || '';
  document.getElementById('settingWhatsapp').value = settings.whatsappNumber || '';
  document.getElementById('settingEmail').value = settings.primaryEmail || '';
  document.getElementById('settingAddress').value = settings.mainCampusAddress || '';
  document.getElementById('settingVisitingHours').value = settings.visitingHours || '';
  document.getElementById('settingAlertActive').checked = !!settings.emergencyAlertActive;
  document.getElementById('settingAlertText').value = settings.emergencyAlertText || '';
}

// USERS & ROLES (Super Admin Only)
function renderUsersView() {
  if (currentAdminSession?.role !== 'super_admin') return;

  const users = window.BFA_STORE.getUsers();
  const tableBody = document.getElementById('usersTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${escapeHtml(u.name)}</strong></td>
      <td><code>${escapeHtml(u.username)}</code></td>
      <td><span class="role-indicator-badge ${u.badgeClass}">${u.roleLabel}</span></td>
      <td>${escapeHtml(u.email)}</td>
      <td style="font-size:0.75rem; color:var(--admin-muted);">${escapeHtml(u.lastLogin || 'Never')}</td>
      <td>
        <div class="table-action-btns">
          ${u.role === 'super_admin' ? '<span style="font-size:0.75rem; color:var(--admin-muted);">Protected</span>' : `
            <button class="btn-tbl-action tbl-delete" onclick="deleteStaffUser('${u.id}')" title="Revoke Staff Access">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          `}
        </div>
      </td>
    </tr>
  `).join('');
}

// AUDIT LOGS (Super Admin Only)
function renderLogsView() {
  if (currentAdminSession?.role !== 'super_admin') return;

  const logs = window.BFA_STORE.getLogs();
  const tableBody = document.getElementById('logsTableBody');
  if (!tableBody) return;

  tableBody.innerHTML = logs.map(l => `
    <tr>
      <td style="font-family:monospace; font-size:0.8125rem;">${escapeHtml(l.timestamp)}</td>
      <td><code>${escapeHtml(l.user)}</code></td>
      <td><span class="demo-tag" style="background:#EEF3F9; color:#173B6C;">${escapeHtml(l.action)}</span></td>
      <td style="font-size:0.8125rem;">${escapeHtml(l.details)}</td>
    </tr>
  `).join('');
}

/* --------------------------------------------------------------------------
   5. Action Handlers (Create, Edit, Delete, Toggle)
   -------------------------------------------------------------------------- */
function bindViewForms() {
  // Submissions search & filters
  document.getElementById('submissionsSearch')?.addEventListener('input', renderSubmissionsView);
  document.getElementById('submissionsTypeFilter')?.addEventListener('change', renderSubmissionsView);
  document.getElementById('submissionsStatusFilter')?.addEventListener('change', renderSubmissionsView);

  // Settings form
  document.getElementById('cmsSettingsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentAdminSession?.role === 'editor') {
      alert('Access Denied: Editors cannot modify global website settings.');
      return;
    }

    const newSettings = {
      academyName: document.getElementById('settingAcademyName').value.trim(),
      tagline: document.getElementById('settingTagline').value.trim(),
      primaryPhone: document.getElementById('settingPhone').value.trim(),
      whatsappNumber: document.getElementById('settingWhatsapp').value.trim(),
      primaryEmail: document.getElementById('settingEmail').value.trim(),
      mainCampusAddress: document.getElementById('settingAddress').value.trim(),
      visitingHours: document.getElementById('settingVisitingHours').value.trim(),
      emergencyAlertActive: document.getElementById('settingAlertActive').checked,
      emergencyAlertText: document.getElementById('settingAlertText').value.trim()
    };

    window.BFA_STORE.updateSettings(newSettings, currentAdminSession);
    showAdminToast('Website settings saved & synchronized with public website!', 'success');
  });

  // Announcement Form
  document.getElementById('announcementForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('annId').value || 'ANN-' + Math.floor(100 + Math.random() * 900);
    const item = {
      id,
      title: document.getElementById('annTitle').value.trim(),
      category: document.getElementById('annCategory').value,
      priority: document.getElementById('annPriority').value,
      date: document.getElementById('annDate').value,
      status: document.getElementById('annStatus').value,
      summary: document.getElementById('annSummary').value.trim(),
      actionText: 'Learn More',
      actionLink: '#notices'
    };
    window.BFA_STORE.saveAnnouncement(item, currentAdminSession);
    closeModal('announcementModal');
    renderAnnouncementsView();
    showAdminToast(`Announcement "${item.title}" saved.`, 'success');
  });

  // Project Form
  document.getElementById('projectForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('projId').value || 'PRJ-' + Math.floor(200 + Math.random() * 800);
    const item = {
      id,
      title: document.getElementById('projTitle').value.trim(),
      category: 'Infrastructure',
      constituency: document.getElementById('projConstituency').value.trim(),
      location: document.getElementById('projConstituency').value.trim(),
      budget: document.getElementById('projBudget').value.trim(),
      progress: parseInt(document.getElementById('projProgress').value, 10),
      status: document.getElementById('projStatus').value,
      leadSupervisor: document.getElementById('projSupervisor').value.trim(),
      summary: document.getElementById('projSummary').value.trim(),
      targetDate: 'Ongoing Milestone'
    };
    window.BFA_STORE.saveProject(item, currentAdminSession);
    closeModal('projectModal');
    renderProjectsView();
    showAdminToast(`Project "${item.title}" saved.`, 'success');
  });

  // Notice Form
  document.getElementById('noticeForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('noticeId').value || 'NTC-' + Math.floor(400 + Math.random() * 600);
    const item = {
      id,
      title: document.getElementById('noticeTitle').value.trim(),
      category: document.getElementById('noticeCategory').value,
      fileType: 'PDF Document',
      fileSize: '1.8 MB',
      date: new Date().toISOString().slice(0, 10),
      downloadUrl: '#',
      status: document.getElementById('noticeStatus').value,
      description: document.getElementById('noticeDescription').value.trim()
    };
    window.BFA_STORE.saveNotice(item, currentAdminSession);
    closeModal('noticeModal');
    renderNoticesView();
    showAdminToast(`Notice document uploaded & saved.`, 'success');
  });

  // Staff User Form
  document.getElementById('userForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (currentAdminSession?.role !== 'super_admin') {
      alert('Access Denied: Only Super Admin can register staff accounts.');
      return;
    }

    const role = document.getElementById('userRole').value;
    const roleLabels = { super_admin: 'Super Administrator', admin: 'Administrator', editor: 'Content Editor' };
    const badgeClasses = { super_admin: 'badge-super', admin: 'badge-admin', editor: 'badge-editor' };

    const newUser = {
      id: 'USR-' + Math.floor(10 + Math.random() * 90),
      username: document.getElementById('userUsername').value.trim().toLowerCase(),
      name: document.getElementById('userFullName').value.trim(),
      email: document.getElementById('userEmail').value.trim(),
      role: role,
      roleLabel: roleLabels[role],
      badgeClass: badgeClasses[role],
      passwordHash: document.getElementById('userPassword').value,
      permissions: ['content'],
      lastLogin: 'Never'
    };

    window.BFA_STORE.saveUser(newUser, currentAdminSession);
    closeModal('userModal');
    renderUsersView();
    showAdminToast(`Staff account for ${newUser.name} created.`, 'success');
  });
}

// Announcements Actions
window.openAddAnnouncementModal = function() {
  document.getElementById('annId').value = '';
  document.getElementById('annTitle').value = '';
  document.getElementById('annDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('annSummary').value = '';
  document.getElementById('annModalHeading').textContent = 'Create Public Announcement';
  openModal('announcementModal');
};

window.editAnnouncement = function(id) {
  const item = window.BFA_STORE.getAnnouncements().find(i => i.id === id);
  if (!item) return;

  document.getElementById('annId').value = item.id;
  document.getElementById('annTitle').value = item.title;
  document.getElementById('annCategory').value = item.category;
  document.getElementById('annPriority').value = item.priority;
  document.getElementById('annDate').value = item.date;
  document.getElementById('annStatus').value = item.status;
  document.getElementById('annSummary').value = item.summary;
  document.getElementById('annModalHeading').textContent = 'Edit Public Announcement';
  openModal('announcementModal');
};

window.toggleAnnouncementStatus = function(id) {
  const item = window.BFA_STORE.getAnnouncements().find(i => i.id === id);
  if (!item) return;

  item.status = item.status === 'published' ? 'draft' : 'published';
  window.BFA_STORE.saveAnnouncement(item, currentAdminSession);
  renderAnnouncementsView();
  showAdminToast(`Announcement is now ${item.status}.`, 'success');
};

window.deleteAnnouncementItem = function(id) {
  if (currentAdminSession?.role === 'editor') {
    alert('Access Denied: Editors are not permitted to delete records.');
    return;
  }
  if (confirm('Are you sure you want to delete this announcement? This action is irreversible.')) {
    window.BFA_STORE.deleteAnnouncement(id, currentAdminSession);
    renderAnnouncementsView();
    showAdminToast('Announcement removed.', 'danger');
  }
};

// Projects Actions
window.openAddProjectModal = function() {
  document.getElementById('projId').value = '';
  document.getElementById('projTitle').value = '';
  document.getElementById('projConstituency').value = '';
  document.getElementById('projBudget').value = '';
  document.getElementById('projProgress').value = 30;
  document.getElementById('projProgressLabel').textContent = '30%';
  document.getElementById('projSupervisor').value = '';
  document.getElementById('projSummary').value = '';
  document.getElementById('projModalHeading').textContent = 'New Development Project';
  openModal('projectModal');
};

window.editProjectItem = function(id) {
  const item = window.BFA_STORE.getProjects().find(i => i.id === id);
  if (!item) return;

  document.getElementById('projId').value = item.id;
  document.getElementById('projTitle').value = item.title;
  document.getElementById('projConstituency').value = item.constituency || item.location;
  document.getElementById('projBudget').value = item.budget;
  document.getElementById('projProgress').value = item.progress;
  document.getElementById('projProgressLabel').textContent = `${item.progress}%`;
  document.getElementById('projStatus').value = item.status;
  document.getElementById('projSupervisor').value = item.leadSupervisor;
  document.getElementById('projSummary').value = item.summary;
  document.getElementById('projModalHeading').textContent = 'Edit Development Project';
  openModal('projectModal');
};

window.deleteProjectItem = function(id) {
  if (currentAdminSession?.role === 'editor') {
    alert('Access Denied: Editors cannot delete project records.');
    return;
  }
  if (confirm('Delete this development project record permanently?')) {
    window.BFA_STORE.deleteProject(id, currentAdminSession);
    renderProjectsView();
    showAdminToast('Project record deleted.', 'danger');
  }
};

// Campaign Actions
window.openAddCampaignModal = function() {
  const title = prompt('Enter New Campaign Title:');
  if (!title) return;
  const item = {
    id: 'CMP-' + Math.floor(300 + Math.random() * 700),
    title,
    targetAudience: 'Prospective Students',
    goal: '100 Applications',
    enrolledCount: 0,
    status: 'active',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '2027-01-31',
    description: 'Active promotional drive for educational outreach in Rawalpindi.'
  };
  window.BFA_STORE.saveCampaign(item, currentAdminSession);
  renderCampaignsView();
  showAdminToast(`Campaign "${title}" created.`, 'success');
};

window.toggleCampaignStatus = function(id) {
  const item = window.BFA_STORE.getCampaigns().find(i => i.id === id);
  if (!item) return;
  item.status = item.status === 'active' ? 'completed' : 'active';
  window.BFA_STORE.saveCampaign(item, currentAdminSession);
  renderCampaignsView();
  showAdminToast(`Campaign status updated to ${item.status}.`, 'success');
};

window.deleteCampaignItem = function(id) {
  if (currentAdminSession?.role === 'editor') {
    alert('Access Denied: Editors cannot delete campaigns.');
    return;
  }
  if (confirm('Delete this campaign?')) {
    window.BFA_STORE.deleteCampaign(id, currentAdminSession);
    renderCampaignsView();
    showAdminToast('Campaign removed.', 'danger');
  }
};

// Branch Actions
window.openAddBranchModal = function() {
  const name = prompt('Campus Branch Name:');
  if (!name) return;
  const constituency = prompt('Constituency / Zone (e.g. NA-60 Rawalpindi):') || 'Rawalpindi Sector';
  const focal = prompt('Focal Person & Phone:') || 'Academic Coordinator';

  const item = {
    id: 'BR-' + Math.floor(10 + Math.random() * 90),
    name,
    constituency,
    address: 'Satellite Town & Adjoining Sectors',
    focalPerson: focal,
    phone: '+92 300 1234567',
    levels: 'Pre-School, Primary, Middle & Matric',
    capacity: 350,
    enrolled: 0,
    status: 'Active'
  };
  window.BFA_STORE.saveBranch(item, currentAdminSession);
  renderBranchesView();
  showAdminToast(`Branch "${name}" added.`, 'success');
};

window.deleteBranchItem = function(id) {
  if (currentAdminSession?.role === 'editor') {
    alert('Access Denied: Editors cannot delete branch records.');
    return;
  }
  if (confirm('Delete this campus branch?')) {
    window.BFA_STORE.deleteBranch(id, currentAdminSession);
    renderBranchesView();
    showAdminToast('Branch removed.', 'danger');
  }
};

// Notices Actions
window.openAddNoticeModal = function() {
  document.getElementById('noticeId').value = '';
  document.getElementById('noticeTitle').value = '';
  document.getElementById('noticeDescription').value = '';
  openModal('noticeModal');
};

window.toggleNoticeStatus = function(id) {
  const item = window.BFA_STORE.getNotices().find(i => i.id === id);
  if (!item) return;
  item.status = item.status === 'published' ? 'draft' : 'published';
  window.BFA_STORE.saveNotice(item, currentAdminSession);
  renderNoticesView();
  showAdminToast(`Notice is now ${item.status}.`, 'success');
};

window.deleteNoticeItem = function(id) {
  if (currentAdminSession?.role === 'editor') {
    alert('Access Denied: Editors cannot delete notices.');
    return;
  }
  if (confirm('Delete this downloadable document?')) {
    window.BFA_STORE.deleteNotice(id, currentAdminSession);
    renderNoticesView();
    showAdminToast('Notice deleted.', 'danger');
  }
};

// Submissions Actions
window.viewSubmissionDetail = function(id) {
  const item = window.BFA_STORE.getSubmissions().find(s => s.id === id);
  if (!item) return;

  activeSubmissionForModal = item;
  document.getElementById('subModalTitle').textContent = `${item.type} Record Details`;
  document.getElementById('subModalRef').textContent = item.id;
  document.getElementById('subDetailName').textContent = item.studentName;
  document.getElementById('subDetailParent').textContent = item.parentName;
  document.getElementById('subDetailPhone').textContent = item.phone;
  document.getElementById('subDetailEmail').textContent = item.email;
  document.getElementById('subDetailSubject').textContent = item.course || item.subject;
  document.getElementById('subDetailStatusPill').innerHTML = `<span class="status-pill ${getStatusPillClass(item.status)}">${item.status}</span>`;
  document.getElementById('subDetailMessage').textContent = item.message;
  document.getElementById('subDetailNotes').textContent = item.counselorNotes || 'No notes appended yet.';
  document.getElementById('subStatusSelect').value = item.status;

  const waBtn = document.getElementById('subWhatsAppBtn');
  let cleanPhone = item.phone.replace(/[\s-]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
  const waMsg = encodeURIComponent(`Assalam-o-Alaikum ${item.parentName},\nThis is the Administration Office at Bright Future Academy (Satellite Town, Rawalpindi) following up regarding your ${item.type} (${item.id}).`);
  waBtn.href = `https://wa.me/${cleanPhone}?text=${waMsg}`;

  openModal('submissionDetailModal');
};

window.saveSubmissionNote = function() {
  if (!activeSubmissionForModal) return;
  const input = document.getElementById('subNewNoteInput');
  const note = input.value.trim();
  if (!note) return;

  window.BFA_STORE.updateSubmissionStatus(activeSubmissionForModal.id, activeSubmissionForModal.status, note, currentAdminSession);
  input.value = '';
  viewSubmissionDetail(activeSubmissionForModal.id);
  renderSubmissionsView();
  showAdminToast('Counselor note recorded.', 'success');
};

window.saveSubmissionStatusChange = function() {
  if (!activeSubmissionForModal) return;
  const newStatus = document.getElementById('subStatusSelect').value;
  window.BFA_STORE.updateSubmissionStatus(activeSubmissionForModal.id, newStatus, `Status updated to ${newStatus}`, currentAdminSession);
  viewSubmissionDetail(activeSubmissionForModal.id);
  renderSubmissionsView();
  showAdminToast(`Status changed to ${newStatus}.`, 'success');
};

window.openDirectWhatsAppChat = function(phone, parent, subject) {
  let cleanPhone = phone.replace(/[\s-]/g, '');
  if (cleanPhone.startsWith('0')) cleanPhone = '92' + cleanPhone.slice(1);
  const text = encodeURIComponent(`Assalam-o-Alaikum ${parent},\nThis is Bright Future Academy Admissions regarding your inquiry for ${subject}. How may we assist you today?`);
  window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
};

window.deleteSubmissionItem = function(id) {
  if (currentAdminSession?.role === 'editor') {
    alert('Access Denied: Editors cannot delete submission records.');
    return;
  }
  if (confirm(`Delete submission record ${id}?`)) {
    window.BFA_STORE.deleteSubmission(id, currentAdminSession);
    renderSubmissionsView();
    showAdminToast('Submission record removed.', 'danger');
  }
};

window.exportSubmissionsCsv = function() {
  const list = window.BFA_STORE.getSubmissions();
  if (!list.length) {
    alert('No submissions available to export.');
    return;
  }
  const headers = ['ID', 'Date', 'Type', 'Student Name', 'Parent Name', 'Phone', 'Email', 'Program / Subject', 'Status', 'Message', 'Notes'];
  const rows = list.map(s => [
    s.id,
    new Date(s.timestamp).toISOString(),
    s.type,
    `"${(s.studentName || '').replace(/"/g, '""')}"`,
    `"${(s.parentName || '').replace(/"/g, '""')}"`,
    `"${s.phone}"`,
    s.email,
    `"${(s.course || s.subject || '').replace(/"/g, '""')}"`,
    s.status,
    `"${(s.message || '').replace(/"/g, '""')}"`,
    `"${(s.counselorNotes || '').replace(/"/g, '""')}"`
  ]);

  const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encoded = encodeURI(csv);
  const link = document.createElement('a');
  link.setAttribute('href', encoded);
  link.setAttribute('download', `BFA_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showAdminToast('Submissions CSV downloaded successfully.', 'success');
};

// Staff Actions (Super Admin Only)
window.openAddUserModal = function() {
  if (currentAdminSession?.role !== 'super_admin') {
    alert('Restricted: Super Admin clearance required.');
    return;
  }
  document.getElementById('userFullName').value = '';
  document.getElementById('userUsername').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('userPassword').value = '';
  openModal('userModal');
};

window.deleteStaffUser = function(id) {
  if (currentAdminSession?.role !== 'super_admin') {
    alert('Restricted: Super Admin clearance required.');
    return;
  }
  if (confirm('Revoke all administrative access for this staff member?')) {
    window.BFA_STORE.deleteUser(id, currentAdminSession);
    renderUsersView();
    showAdminToast('Staff access revoked.', 'danger');
  }
};

// Live Lead Simulation
window.simulateNewSubmission = function() {
  const students = ['Daniyal Qureshi', 'Minahil Waqas', 'Saad Nadeem', 'Zainab Bibi', 'Bilal Arshad'];
  const parents = ['Qureshi Ahmed', 'Waqas Younis', 'Nadeem Sheikh', 'Tahir Mehmood', 'Arshad Khan'];
  const courses = ['Matric Preparation (FBISE)', 'Pre-School & Montessori', 'Middle School (Grade 7)', 'English Language Spoken', 'Primary Education (Grade 4)'];
  const randIdx = Math.floor(Math.random() * students.length);

  const newSub = {
    id: 'SUB-' + Math.floor(500 + Math.random() * 500),
    type: 'Inquiry',
    studentName: students[randIdx],
    parentName: parents[randIdx],
    phone: '0300 ' + Math.floor(1000000 + Math.random() * 9000000),
    email: `${students[randIdx].toLowerCase().replace(' ', '.')}@example.demo`,
    course: courses[randIdx],
    studentAge: (Math.floor(Math.random() * 12) + 4).toString(),
    previousSchool: 'Satellite Town Model School',
    subject: `Admission Inquiry: ${courses[randIdx]}`,
    message: 'Submitted via live agency demo simulation.',
    status: 'New',
    counselorNotes: 'Simulated lead for presentation.',
    timestamp: new Date().toISOString()
  };

  window.BFA_STORE.addSubmission(newSub);
  renderCurrentView();
  showAdminToast(`Simulated inbound lead from ${newSub.studentName} recorded!`, 'success');
};

window.handleQuickCreate = function() {
  switch (currentActiveView) {
    case 'announcements': openAddAnnouncementModal(); break;
    case 'projects': openAddProjectModal(); break;
    case 'campaigns': openAddCampaignModal(); break;
    case 'notices': openAddNoticeModal(); break;
    case 'branches': openAddBranchModal(); break;
    case 'users': openAddUserModal(); break;
    default: simulateNewSubmission(); break;
  }
};

/* --------------------------------------------------------------------------
   6. Modal & Toast Utilities
   -------------------------------------------------------------------------- */
window.openModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
};

window.closeModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
};

window.showAdminToast = function(msg, type = 'info') {
  const container = document.getElementById('adminToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
};

function getStatusPillClass(val) {
  if (!val) return 'draft';
  const clean = val.toLowerCase().replace(/[\s/]/g, '_');
  return clean;
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
