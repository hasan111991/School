# Bright Future Academy – Digital Admission Portal (Commercial Demo)
**Designed & Built by AdmissionBoost**

Commercial digital admission and lead generation website designed for private educational academies and schools in Pakistan (demonstration client: *Bright Future Academy*, Satellite Town, Rawalpindi).

---

## 1. Project Overview & Features

- **High-Converting Hero Section**: Engaging value proposition, trust metrics (25+ faculty, 1:15 student-teacher ratio, smart labs), and instant CTAs.
- **6 Core Academic Programs**:
  1. Pre-School & Montessori (Ages 3–5)
  2. Primary Education (Grades 1–5)
  3. Middle School (Grades 6–8)
  4. Matric Preparation (FBISE & BISE Rawalpindi)
  5. English Language Mastery & Public Speaking
  6. Computer Skills & Digital Literacy
- **Interactive Course Modals**: Detailed syllabus, class timings, fee vouchers, and direct inquiry links for all programs.
- **Online Admission Inquiry Form**: Full validation (Pakistani phone format `03xx-xxxxxxx`, email, age 3–22), loading spinners, and transparent local storage persistence.
- **Zero Public Admin Entry Points**: Public visitors see only public academic programs, campus announcements, development projects, and downloadable notices. No admin button or login link exists anywhere on the public website.
- **Dedicated Private Admin Portal (`/admin`)**:
  - Accessible strictly via direct URL `/admin`.
  - Unauthenticated visitors are intercepted by the private security gateway with anti-brute force throttling.
  - Multi-role access control:
    - **Super Admin** (`superadmin` / `SuperAdmin#2026`): Full system control, staff & role management, security audit logs, data deletion.
    - **Administrator** (`admin` / `Admin#Pass2026`): Manage announcements, projects, campaigns, notices, and review/respond to parent submissions.
    - **Content Editor** (`editor` / `Editor#Pass2026`): Create and update content; prohibited from deleting records or modifying staff accounts.
- **Full-Spectrum Administrative Modules**:
  1. Overview & Analytics (KPIs, conversion ratio, recent submissions stream)
  2. Public Announcements & News Bulletins (Draft vs Published states)
  3. Development Projects & Progress Tracking (Budget, location/constituency, progress sliders)
  4. Campaigns & Admission Drives (Goal vs enrolled tracking)
  5. Citizen Submissions, Inquiries & Grievances (Type filters, counselor notes, direct WhatsApp follow-up)
  6. Constituency & Campus Branches (Capacities, focal supervisors, addresses)
  7. Public Notices & Document Vault (Upload simulation, categories, download toggles)
  8. Website Content Settings (No-code CMS for phone, email, WhatsApp, emergency banner)
  9. Staff & Role Management (Super Admin only)
  10. Security Audit Logs (Super Admin only)
- **Public & Admin Data Synchronization**:
  - Live data store (`js/storage.js`) ensures published updates immediately reflect on the public website.
  - Draft items are strictly hidden from public visitors.
- **Direct WhatsApp Lead Integration**: Generates formatted, URL-encoded WhatsApp messages containing student name, parent name, phone, course, and notes directly to the academy admissions office (`wa.me/923001234567`).
- **Zero Framework Overhead**: Vanilla HTML5, CSS3, and JavaScript—lightning fast, zero bloat, deployable on Netlify.

---

## 2. File Organization

```
/
├── index.html          # Clean public website (No admin buttons or links)
├── admin.html          # Dedicated secure administrative portal (Route: /admin)
├── 404.html            # Custom 404 not found page
├── metadata.json       # Applet title, description, and capabilities
├── netlify.toml        # Netlify build and redirect routing rules
├── _redirects          # Direct Netlify / Apache static redirects (/admin -> /admin.html)
├── css/
│   ├── style.css       # Public design system and responsive styles
│   └── admin.css       # Dedicated Admin Portal layout and SaaS dashboard styles
├── js/
│   ├── storage.js      # Central data store, role authorization & audit engine
│   ├── main.js         # Public navigation, FAQ accordion, modals, dynamic sync
│   ├── admission.js    # Public form validation, Google Sheets connector, WhatsApp
│   └── admin.js        # Admin portal controller, session guards, CRUD & CSV export
└── assets/
    ├── logo.svg        # Academy crest logo
    ├── favicon.svg     # Browser favicon
    └── images/         # High-resolution education photos
```

---

## 3. How to Run Locally

```bash
npm install
npm run dev
```
- Public Website: `http://localhost:3000/`
- Private Admin Portal: `http://localhost:3000/admin` (or `http://localhost:3000/admin.html`)

### Demonstration Credentials
| Role | Username | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin` | `SuperAdmin#2026` | Full system access, staff management, audit logs, purge |
| **Administrator** | `admin` | `Admin#Pass2026` | Content management, submissions, campaigns, projects |
| **Content Editor** | `editor` | `Editor#Pass2026` | Create & update drafts/content; cannot delete records |

### Option B: Using Python Simple Server
```bash
python3 -m http.server 8080
```
Visit `http://localhost:8080`.

### Option C: Using VS Code Live Server
Right-click `index.html` and click **"Open with Live Server"**.

---

## 4. How to Deploy to Netlify

### Method 1: Git Integration (Recommended for Continuous Deployment)
1. Push this codebase to your GitHub, GitLab, or Bitbucket repository.
2. Log in to [Netlify](https://www.netlify.com/).
3. Click **"Add new site"** &gt; **"Import an existing project"**.
4. Select your repository.
5. In the build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click **"Deploy site"**. Netlify will build the production bundle and assign a free `.netlify.app` subdomain with automatic HTTPS.

### Method 2: Netlify Drag-and-Drop (Instant 60-Second Deploy)
1. Build the production files:
   ```bash
   npm run build
   ```
2. In Netlify Dashboard, navigate to **Sites** &gt; drag and drop the `dist/` folder directly into the upload area.
3. Your academy website is live immediately!

---

## 5. How to Connect a Custom Domain (e.g., `brightfutureacademy.edu.pk`)

1. In your Netlify dashboard, go to **Site configuration** &gt; **Domain management**.
2. Click **"Add custom domain"** and enter your academy domain (e.g., `brightfutureacademy.edu.pk`).
3. Add the following DNS records at your domain registrar (e.g., PKNIC, GoDaddy, Namecheap):
   - **A Record**: Point `@` to Netlify's load balancer IP: `75.2.60.5`
   - **CNAME Record**: Point `www` to your Netlify site URL (e.g., `your-site-name.netlify.app`).
4. Netlify will automatically provision a free Let's Encrypt SSL/TLS certificate within 24 hours.

---

## 6. How to Configure Live Google Sheets Integration

To sync every incoming website inquiry into a Google Sheet automatically:

1. Open [Google Sheets](https://sheets.new) and create a new spreadsheet named **"Bright Future Academy - Inquiries"**.
2. Set row 1 column headers:
   `Inquiry ID | Date | Student Name | Parent Name | Phone | Email | Course | Age | Previous School | Notes | Status`
3. Click **Extensions** &gt; **Apps Script**.
4. Paste the following script:

```javascript
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.id || ("BF-" + new Date().getTime().toString().slice(-6)),
      data.timestamp || new Date().toISOString(),
      data.studentName,
      data.parentName,
      data.phone,
      data.email,
      data.course,
      data.studentAge,
      data.previousSchool,
      data.message,
      data.status || "New"
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

5. Click **Deploy** &gt; **New deployment**.
6. Select type: **Web app**.
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
7. Copy the generated Web App URL.
8. Open `/js/admission.js` in your project and paste the URL into:
   ```javascript
   const GOOGLE_SHEETS_ENDPOINT = 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL';
   ```
9. Test submit the form—new leads will populate your Google Sheet in real time!

---

## 7. Production Architecture Roadmap (Firebase & Security)

For full commercial deployments with multiple branch campuses or role-based staff access:

1. **Firebase Authentication**:
   - Provide email/password or Google Workspace login on `/admin.html`.
   - Protect routes using auth state listeners.
2. **Cloud Firestore**:
   - Store leads in `/leads/{leadId}` with Firestore security rules restricting reads to authenticated staff.
3. **Role-Based Access Control (RBAC)**:
   - Assign `admin` and `counselor` custom claims.
   - Restrict delete and export privileges to `admin` role only.

---

&copy; 2026 AdmissionBoost &middot; Commercial Digital Solutions for Educational Academies.
