/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Bright Future Academy - Admission Lead Form & WhatsApp Integration
 */

// ==========================================================================
// CONFIGURATION
// To connect to a live Google Sheet:
// 1. In Google Sheets: Extensions > Apps Script
// 2. Deploy as Web App (Execute as: Me, Who has access: Anyone)
// 3. Paste the Web App URL below:
// ==========================================================================
const GOOGLE_SHEETS_ENDPOINT = ''; // e.g. 'https://script.google.com/macros/s/.../exec'
const ACADEMY_WHATSAPP_NUMBER = '923001234567';
const LOCAL_STORAGE_LEADS_KEY = 'bright_future_leads';

document.addEventListener('DOMContentLoaded', () => {
  initAdmissionForm();
  initWhatsAppButtons();
});

/* --------------------------------------------------------------------------
   1. Admission Inquiry Form Handling
   -------------------------------------------------------------------------- */
function initAdmissionForm() {
  const form = document.getElementById('admissionForm');
  if (!form) return;

  const studentNameInput = document.getElementById('studentName');
  const parentNameInput = document.getElementById('parentName');
  const phoneInput = document.getElementById('phone');
  const emailInput = document.getElementById('email');
  const courseSelect = document.getElementById('inquiryCourse');
  const studentAgeInput = document.getElementById('studentAge');
  const previousSchoolInput = document.getElementById('previousSchool');
  const messageInput = document.getElementById('message');
  const submitBtn = document.getElementById('submitInquiryBtn');
  const submitWhatsAppBtn = document.getElementById('submitWhatsAppBtn');
  const statusAlert = document.getElementById('formStatusAlert');

  // Clear errors on input
  [studentNameInput, parentNameInput, phoneInput, emailInput, courseSelect, studentAgeInput].forEach((el) => {
    if (!el) return;
    el.addEventListener('input', () => {
      clearFieldError(el);
    });
    el.addEventListener('change', () => {
      clearFieldError(el);
    });
  });

  // Regular Form Submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isValid = validateForm();
    if (!isValid) return;

    const leadData = getFormData();
    await handleLeadSubmission(leadData, submitBtn, statusAlert, false);
  });

  // Direct "Submit & Open WhatsApp"
  if (submitWhatsAppBtn) {
    submitWhatsAppBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const isValid = validateForm();
      if (!isValid) return;

      const leadData = getFormData();

      // Submit lead to storage/sheets first
      await handleLeadSubmission(leadData, submitWhatsAppBtn, statusAlert, true);

      // Open WhatsApp with pre-filled message
      sendWhatsAppLeadMessage(leadData);
    });
  }

  function validateForm() {
    let valid = true;

    // Student Name
    if (!studentNameInput.value.trim() || studentNameInput.value.trim().length < 2) {
      showFieldError(studentNameInput, 'Please enter the student\'s full name (min 2 characters).');
      valid = false;
    }

    // Parent Name
    if (!parentNameInput.value.trim() || parentNameInput.value.trim().length < 2) {
      showFieldError(parentNameInput, 'Please enter the parent or guardian\'s name.');
      valid = false;
    }

    // Phone Number (Pakistani format: 0300 1234567, 03001234567, +923001234567)
    const phoneVal = phoneInput.value.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/;
    if (!phoneVal || !phoneRegex.test(phoneVal)) {
      showFieldError(phoneInput, 'Enter a valid Pakistani mobile number (e.g., 0300 1234567 or +92 300 1234567).');
      valid = false;
    }

    // Email
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal || !emailRegex.test(emailVal)) {
      showFieldError(emailInput, 'Enter a valid email address (e.g., name@example.com).');
      valid = false;
    }

    const subType = document.getElementById('submissionType')?.value || 'Inquiry';

    // Course Selection (only required for inquiries)
    if (subType === 'Inquiry' && !courseSelect.value) {
      showFieldError(courseSelect, 'Please select an academic course or program.');
      valid = false;
    }

    // Student Age
    const ageVal = parseInt(studentAgeInput.value, 10);
    if (!ageVal || isNaN(ageVal) || ageVal < 3 || ageVal > 70) {
      showFieldError(studentAgeInput, 'Enter a valid age.');
      valid = false;
    }

    return valid;
  }

  function getFormData() {
    const subType = document.getElementById('submissionType')?.value || 'Inquiry';
    const selectedCourseText = courseSelect.value ? courseSelect.options[courseSelect.selectedIndex].text : 'General / Administrative';

    return {
      id: 'SUB-' + Date.now().toString().slice(-6),
      type: subType,
      timestamp: new Date().toISOString(),
      studentName: studentNameInput.value.trim(),
      parentName: parentNameInput.value.trim(),
      phone: phoneInput.value.trim(),
      email: emailInput.value.trim(),
      course: selectedCourseText,
      courseKey: courseSelect.value || 'general',
      studentAge: studentAgeInput.value.trim(),
      previousSchool: previousSchoolInput.value.trim() || 'N/A',
      subject: `${subType}: ${selectedCourseText}`,
      message: messageInput.value.trim() || 'No additional notes provided.',
      status: 'New',
      source: `Public Website ${subType} Form`,
    };
  }

  function showFieldError(inputEl, msg) {
    inputEl.classList.add('error');
    const errEl = document.getElementById(inputEl.id + 'Error');
    if (errEl) errEl.textContent = msg;
  }

  function clearFieldError(inputEl) {
    inputEl.classList.remove('error');
    const errEl = document.getElementById(inputEl.id + 'Error');
    if (errEl) errEl.textContent = '';
  }
}

/* --------------------------------------------------------------------------
   2. Lead Submission & Storage Pipeline
   -------------------------------------------------------------------------- */
async function handleLeadSubmission(leadData, actionBtn, statusAlert, isWhatsAppFlow) {
  const originalBtnHtml = actionBtn.innerHTML;

  // Set loading state
  actionBtn.disabled = true;
  actionBtn.innerHTML = `
    <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
    </svg>
    <span>Processing...</span>
  `;

  let sheetsSuccess = false;
  let sheetsMessage = '';

  // 1. Save locally to central academy data store
  if (window.BFA_STORE) {
    window.BFA_STORE.addSubmission(leadData);
  }
  saveLeadToLocalStorage(leadData);

  // 2. Check if a live Google Apps Script endpoint is provided
  if (GOOGLE_SHEETS_ENDPOINT && GOOGLE_SHEETS_ENDPOINT.trim() !== '') {
    try {
      await fetch(GOOGLE_SHEETS_ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadData),
      });
      sheetsSuccess = true;
      sheetsMessage = 'Inquiry logged and synchronized with admissions registry.';
    } catch (err) {
      console.warn('Google Sheets endpoint request failed:', err);
      sheetsMessage = 'Inquiry recorded securely in academy admissions registry.';
    }
  } else {
    sheetsMessage = 'Inquiry recorded securely in academy admissions registry.';
  }

  // Restore button state
  actionBtn.disabled = false;
  actionBtn.innerHTML = originalBtnHtml;

  // Display status message
  if (statusAlert) {
    statusAlert.className = 'form-status-alert active success';
    statusAlert.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div>
        <strong style="display:block; font-size:1rem; color:#065F46;">Admission Inquiry Received!</strong>
        <p style="font-size:0.875rem; color:#047857; margin-top:0.25rem;">
          Thank you, <strong>${leadData.parentName}</strong>. Our admissions team for <strong>${leadData.course}</strong> will review <strong>${leadData.studentName}</strong>'s application and call you at <strong>${leadData.phone}</strong> within 24 hours.
        </p>
        <p style="font-size:0.75rem; color:#059669; margin-top:0.5rem; opacity:0.9;">
          ${sheetsMessage} Confirmation reference ID: <strong>${leadData.id}</strong>.
        </p>
      </div>
    `;

    statusAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Also trigger top toast
  if (window.showToast) {
    window.showToast(`Inquiry for ${leadData.studentName} recorded successfully!`, 'success');
  }

  // Reset form inputs (without clearing status alert)
  document.getElementById('admissionForm').reset();
}

/* --------------------------------------------------------------------------
   3. LocalStorage Lead Record Management
   -------------------------------------------------------------------------- */
function saveLeadToLocalStorage(lead) {
  try {
    let existing = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LEADS_KEY) || '[]');
    // Insert new lead at top
    existing.unshift(lead);
    localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('Failed to write to localStorage:', err);
  }
}

/* --------------------------------------------------------------------------
   4. WhatsApp Message Generator & Integration
   -------------------------------------------------------------------------- */
function sendWhatsAppLeadMessage(lead) {
  const messageText = 
`*NEW ADMISSION INQUIRY*
━━━━━━━━━━━━━━━━━━━━━━
*Academy:* Bright Future Academy (Satellite Town, Rawalpindi)
*Student Name:* ${lead.studentName}
*Student Age:* ${lead.studentAge}
*Parent Name:* ${lead.parentName}
*Phone:* ${lead.phone}
*Email:* ${lead.email}
*Selected Course:* ${lead.course}
*Previous School:* ${lead.previousSchool}
*Notes:* ${lead.message}
━━━━━━━━━━━━━━━━━━━━━━
_Sent via AdmissionBoost Digital Admission Portal_`;

  const encodedText = encodeURIComponent(messageText);
  const waUrl = `https://wa.me/${ACADEMY_WHATSAPP_NUMBER}?text=${encodedText}`;

  // Open in new tab or native WhatsApp app
  window.open(waUrl, '_blank', 'noopener,noreferrer');
}

function initWhatsAppButtons() {
  // Bind any generic WhatsApp buttons with pre-filled inquiry text
  const waDirectBtns = document.querySelectorAll('.js-wa-direct');
  waDirectBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const defaultText = encodeURIComponent(
        'Hello Bright Future Academy (Satellite Town, Rawalpindi), I would like to inquire about student admission and fee structures.'
      );
      window.open(`https://wa.me/${ACADEMY_WHATSAPP_NUMBER}?text=${defaultText}`, '_blank', 'noopener,noreferrer');
    });
  });
}
