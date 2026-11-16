/**
 * CuraSlot / PulsePass Telemedicine & Consultation Platform
 * Complete Production-Grade Interactive MVP Engine
 * Supporting Multi-Role RBAC, Concurrency Locks, S3 Vault, and Live Consultation Chat
 */

// Initialize Audio Context for subtle UX chimes without external assets
let audioCtx = null;
function playChime(type = 'success') {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    if (type === 'success') {
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'alert') {
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'message') {
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
    }
  } catch (e) {
    // Audio optional, silently proceed
  }
}

// Multi-Tab Real-time Broadcast Channel
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('telemedicine_bus') : null;

// Initial Seed Data
const DEFAULT_STATE = {
  currentRole: 'PATIENT', // 'PATIENT' | 'DOCTOR' | 'ADMIN'
  activeTab: 'patient',
  
  // Users
  currentUser: {
    id: 'usr_pat_101',
    name: 'Rohan Verma',
    phone: '+91 98765 43210',
    email: 'rohan.verma@example.com',
    role: 'PATIENT',
    age: 38,
    bloodGroup: 'B+'
  },
  
  // Active Consultation Pass
  pass: {
    id: 'pass_7d_9842',
    patientId: 'usr_pat_101',
    doctorId: 'doc_101',
    doctorName: 'Dr. Arvind Mehta',
    department: 'Cardiology',
    hospital: 'Metro Care Super-Speciality Hospital',
    amountPaid: 500,
    currency: 'INR',
    // 7 days validity starting now
    startsAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(), // started 4 hours ago
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    status: 'ACTIVE' // 'ACTIVE' | 'EXPIRED'
  },
  
  // Doctors Directory
  doctors: [
    {
      id: 'doc_101',
      name: 'Dr. Arvind Mehta',
      title: 'Senior Consultant Cardiologist',
      qualifications: 'MBBS, MD, DM (Cardiology), FACC',
      regNo: 'MCI-28491-DEL',
      hospital: 'Metro Care Super-Speciality Hospital',
      department: 'Cardiology',
      experience: '18 Years',
      rating: 4.9,
      reviewsCount: 312,
      passFee: 500,
      passDurationDays: 7,
      isVerified: true,
      avatar: '👨‍⚕️',
      clinicHours: '05:00 PM - 07:30 PM (Mon-Sat)',
      about: 'Specializes in coronary interventions, hypertension management, preventive heart care, and post-angioplasty outpatient rehabilitation.'
    },
    {
      id: 'doc_102',
      name: 'Dr. Shreya Nair',
      title: 'Pediatric Specialist & Neonatologist',
      qualifications: 'MBBS, DCH, DNB (Pediatrics)',
      regNo: 'KMC-77215-BLR',
      hospital: 'Apollo Child & Maternity Centre',
      department: 'Pediatrics',
      experience: '12 Years',
      rating: 4.8,
      reviewsCount: 245,
      passFee: 500,
      passDurationDays: 7,
      isVerified: true,
      avatar: '👩‍⚕️',
      clinicHours: '10:00 AM - 01:00 PM (Daily)',
      about: 'Expert in pediatric infectious diseases, developmental milestones, infant nutritional follow-ups, and immunization counseling.'
    },
    {
      id: 'doc_103',
      name: 'Dr. Rajesh Iyer',
      title: 'Chief Orthopedic Surgeon',
      qualifications: 'MBBS, MS (Ortho), M.Ch (UK)',
      regNo: 'MMC-44109-MUM',
      hospital: 'Fortis Apex Healthcare',
      department: 'Orthopedics',
      experience: '22 Years',
      rating: 4.9,
      reviewsCount: 420,
      passFee: 500,
      passDurationDays: 7,
      isVerified: true,
      avatar: '👨‍⚕️',
      clinicHours: '02:00 PM - 05:00 PM (Mon, Wed, Fri)',
      about: 'Leading joint replacement and sports injury specialist, offering post-surgical rehabilitation and digital follow-up consultations.'
    },
    {
      id: 'doc_104',
      name: 'Dr. Sunita Rao',
      title: 'Consultant Endocrinologist',
      qualifications: 'MBBS, MD (Med), DM (Endo)',
      regNo: 'TMC-89301-HYD',
      hospital: 'Metro Care Super-Speciality Hospital',
      department: 'General Medicine',
      experience: '15 Years',
      rating: 4.7,
      reviewsCount: 188,
      passFee: 500,
      passDurationDays: 7,
      isVerified: true,
      avatar: '👩‍⚕️',
      clinicHours: '09:00 AM - 12:30 PM (Mon-Sat)',
      about: 'Focuses on type-1 & type-2 diabetes titration, thyroid disorders, metabolic syndromes, and routine HbA1c review.'
    }
  ],
  
  // Available Slots for Today and Tomorrow
  slots: [
    { id: 's1', doctorId: 'doc_101', date: 'Today', time: '05:00 PM', status: 'BOOKED', patientId: 'usr_pat_101', patientName: 'Rohan Verma', turnNo: 1 },
    { id: 's2', doctorId: 'doc_101', date: 'Today', time: '05:15 PM', status: 'BOOKED', patientId: 'usr_pat_102', patientName: 'Ananya Roy', turnNo: 2 },
    { id: 's3', doctorId: 'doc_101', date: 'Today', time: '05:30 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 3 },
    { id: 's4', doctorId: 'doc_101', date: 'Today', time: '05:45 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 4 },
    { id: 's5', doctorId: 'doc_101', date: 'Today', time: '06:00 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 5 },
    { id: 's6', doctorId: 'doc_101', date: 'Today', time: '06:15 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 6 },
    { id: 's7', doctorId: 'doc_101', date: 'Today', time: '06:30 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 7 },
    { id: 's8', doctorId: 'doc_101', date: 'Tomorrow', time: '05:00 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 1 },
    { id: 's9', doctorId: 'doc_101', date: 'Tomorrow', time: '05:15 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 2 },
    { id: 's10', doctorId: 'doc_101', date: 'Tomorrow', time: '05:30 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 3 },
    { id: 's11', doctorId: 'doc_101', date: 'Tomorrow', time: '05:45 PM', status: 'AVAILABLE', patientId: null, patientName: null, turnNo: 4 }
  ],
  
  // Medical Vault Reports
  reports: [
    {
      id: 'rep_001',
      patientId: 'usr_pat_101',
      title: 'Lipid Profile & Serum Cholesterol',
      type: 'LAB_REPORT',
      fileSize: '1.2 MB',
      mimeType: 'application/pdf',
      uploadedAt: 'Today, 11:20 AM',
      s3Key: 'secure_vault/patients/usr_pat_101/lipid_profile_nov2026.pdf',
      verified: true,
      summary: 'Total Chol: 218 mg/dL (Borderline High), Triglycerides: 165 mg/dL, HDL: 44 mg/dL, LDL: 141 mg/dL.'
    },
    {
      id: 'rep_002',
      patientId: 'usr_pat_101',
      title: '12-Lead Electrocardiogram (ECG)',
      type: 'CARDIOLOGY_TRACE',
      fileSize: '3.4 MB',
      mimeType: 'image/jpeg',
      uploadedAt: 'Yesterday, 04:45 PM',
      s3Key: 'secure_vault/patients/usr_pat_101/ecg_trace_12lead.jpg',
      verified: true,
      summary: 'Sinus rhythm, HR 74 bpm, Normal PR interval, No acute ST-elevation or ischemic changes noted.'
    },
    {
      id: 'rep_003',
      patientId: 'usr_pat_101',
      title: 'Hospital Discharge Summary & Statin Prescription',
      type: 'PRESCRIPTION',
      fileSize: '840 KB',
      mimeType: 'application/pdf',
      uploadedAt: '5 Days Ago',
      s3Key: 'secure_vault/patients/usr_pat_101/discharge_summary_oct2026.pdf',
      verified: true,
      summary: 'Advised Rosuvastatin 10mg OD at night, Telmisartan 40mg OD in morning. Follow-up advised within 7 days.'
    }
  ],
  
  // Scoped Consultation Messages
  messages: [
    {
      id: 'msg_001',
      passId: 'pass_7d_9842',
      senderId: 'system',
      senderRole: 'system',
      senderName: 'System Gatekeeper',
      type: 'SYSTEM',
      content: '🟢 7-Day Consultation Pass active. Real-time consultation channel established under SSL/TLS with Dr. Arvind Mehta.',
      time: '04:55 PM'
    },
    {
      id: 'msg_002',
      passId: 'pass_7d_9842',
      senderId: 'usr_pat_101',
      senderRole: 'patient',
      senderName: 'Rohan Verma',
      type: 'TEXT',
      content: 'Good evening Dr. Mehta. I have uploaded my latest Lipid Profile test results from this morning. I had a slight dizzy spell on Thursday while walking.',
      time: '05:00 PM'
    },
    {
      id: 'msg_003',
      passId: 'pass_7d_9842',
      senderId: 'usr_pat_101',
      senderRole: 'patient',
      senderName: 'Rohan Verma',
      type: 'REPORT_REF',
      content: 'Attached Lab Report: Lipid Profile & Serum Cholesterol (Nov 2026)',
      reportId: 'rep_001',
      time: '05:01 PM'
    },
    {
      id: 'msg_004',
      passId: 'pass_7d_9842',
      senderId: 'doc_101',
      senderRole: 'doctor',
      senderName: 'Dr. Arvind Mehta',
      type: 'TEXT',
      content: 'Good evening Rohan. I have reviewed your Lipid Profile. Your LDL has dropped from 170 to 141 mg/dL, which shows the statin is working well. What was your blood pressure reading when you felt dizzy?',
      time: '05:03 PM'
    },
    {
      id: 'msg_005',
      passId: 'pass_7d_9842',
      senderId: 'usr_pat_101',
      senderRole: 'patient',
      senderName: 'Rohan Verma',
      type: 'TEXT',
      content: 'My home BP monitor showed 108/68 mmHg about 30 minutes after taking morning Telmisartan.',
      time: '05:04 PM'
    }
  ],
  
  // Audit Logs (for Admin & System observability)
  auditLogs: [
    { timestamp: '17:04:12', event: 'WS_MSG_IN', role: 'PATIENT', details: 'Message msg_005 sent in pass pass_7d_9842. Passed Redis TTL check.' },
    { timestamp: '17:03:00', event: 'DOCTOR_JOIN', role: 'DOCTOR', details: 'Dr. Arvind Mehta (doc_101) opened consultation room for patient Rohan Verma.' },
    { timestamp: '16:59:45', event: 'REDIS_LOCK_ACQUIRED', role: 'SYSTEM', details: 'Distributed lock lock:slot:s1 acquired (TTL 5000ms). Slot booked without collision.' },
    { timestamp: '16:58:30', event: 'RAZORPAY_WEBHOOK', role: 'PAYMENT', details: 'Payment order_pay_9024 confirmed ₹500. 7-Day Pass pass_7d_9842 provisioned.' },
    { timestamp: '16:55:10', event: 'S3_PRESIGNED_GEN', role: 'SECURITY', details: 'Issued 5-min S3 pre-signed PutObject URL for patient report lipid_profile_nov2026.pdf' }
  ]
};

// Application State Manager
class TeleMedicineStore {
  constructor() {
    const saved = localStorage.getItem('curaslot_telemedicine_state');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        // Ensure new properties from default exist
        this.state.doctors = this.state.doctors || DEFAULT_STATE.doctors;
        this.state.slots = this.state.slots || DEFAULT_STATE.slots;
        this.state.reports = this.state.reports || DEFAULT_STATE.reports;
        this.state.messages = this.state.messages || DEFAULT_STATE.messages;
        this.state.auditLogs = this.state.auditLogs || DEFAULT_STATE.auditLogs;
      } catch (e) {
        this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      }
    } else {
      this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
    
    // Listen for storage events (multi-window sync)
    window.addEventListener('storage', (e) => {
      if (e.key === 'curaslot_telemedicine_state') {
        try {
          this.state = JSON.parse(e.newValue);
          renderAll();
        } catch (err) {}
      }
    });

    if (channel) {
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'SYNC') {
          this.state = event.data.state;
          renderAll();
        }
      };
    }
  }

  save() {
    localStorage.setItem('curaslot_telemedicine_state', JSON.stringify(this.state));
    if (channel) {
      channel.postMessage({ type: 'SYNC', state: this.state });
    }
  }

  logAudit(event, role, details) {
    const timeStr = new Date().toTimeString().split(' ')[0];
    this.state.auditLogs.unshift({ timestamp: timeStr, event, role, details });
    if (this.state.auditLogs.length > 50) this.state.auditLogs.pop();
    this.save();
  }

  setRole(role) {
    this.state.currentRole = role;
    if (role === 'PATIENT') {
      this.state.activeTab = 'patient';
      this.state.currentUser = {
        id: 'usr_pat_101',
        name: 'Rohan Verma',
        phone: '+91 98765 43210',
        email: 'rohan.verma@example.com',
        role: 'PATIENT',
        age: 38,
        bloodGroup: 'B+'
      };
    } else if (role === 'DOCTOR') {
      this.state.activeTab = 'doctor';
      this.state.currentUser = {
        id: 'doc_101',
        name: 'Dr. Arvind Mehta',
        phone: '+91 94444 11223',
        email: 'arvind.mehta@metrocare.org',
        role: 'DOCTOR',
        specialization: 'Senior Cardiologist'
      };
    } else if (role === 'ADMIN') {
      this.state.activeTab = 'admin';
      this.state.currentUser = {
        id: 'usr_adm_01',
        name: 'Admin - Metro Care Ops',
        phone: '+91 99999 00000',
        email: 'ops@metrocare.org',
        role: 'ADMIN'
      };
    }
    this.save();
    renderAll();
  }

  // Pass actions
  renewPass() {
    const now = new Date();
    this.state.pass.startsAt = now.toISOString();
    this.state.pass.expiresAt = new Date(now.getTime() + 7 * 24 * 3600 * 1000).toISOString();
    this.state.pass.status = 'ACTIVE';
    this.logAudit('PASS_ACTIVATED', 'PAYMENT', '7-Day Pass renewed via Razorpay webhook. Valid till ' + new Date(this.state.pass.expiresAt).toLocaleDateString());
    this.save();
    renderAll();
  }

  togglePassExpiryForDemo() {
    if (this.state.pass.status === 'ACTIVE') {
      this.state.pass.status = 'EXPIRED';
      this.state.pass.expiresAt = new Date(Date.now() - 1000).toISOString();
      this.logAudit('PASS_EXPIRED', 'SYSTEM', 'Pass pass_7d_9842 expired by system cron guard. Chat locked.');
    } else {
      this.renewPass();
    }
    this.save();
    renderAll();
  }

  // Booking with Simulated Concurrency Locking (Redis SET NX PX + PostgreSQL row lock)
  bookSlot(slotId) {
    const slot = this.state.slots.find(s => s.id === slotId);
    if (!slot) return { success: false, message: 'Slot not found' };
    
    if (this.state.pass.status !== 'ACTIVE') {
      return { success: false, message: 'Active 7-Day Consultation Pass required to book a slot.' };
    }
    
    if (slot.status === 'BOOKED') {
      return { success: false, message: 'This slot is already booked by another patient.' };
    }
    
    if (slot.status === 'LOCKED') {
      return { success: false, message: 'Slot is currently locked by a concurrent booking transaction. Try again in 5 seconds.' };
    }

    // Step 1: Simulate Redis Distributed Lock acquisition
    this.logAudit('REDIS_LOCK_TRY', 'BOOKING_ENGINE', `Acquiring Redis lock lock:slot:${slotId} (NX PX 5000)...`);
    
    // Mark as booked
    slot.status = 'BOOKED';
    slot.patientId = this.state.currentUser.id;
    slot.patientName = this.state.currentUser.name;

    this.logAudit('POSTGRES_TX_COMMIT', 'BOOKING_ENGINE', `SELECT FOR UPDATE committed on time_slots WHERE id = '${slotId}'. Double-booking averted.`);
    
    // Add system notification to chat
    this.state.messages.push({
      id: 'msg_' + Date.now(),
      passId: this.state.pass.id,
      senderId: 'system',
      senderRole: 'system',
      senderName: 'Booking Engine',
      type: 'SYSTEM',
      content: `📅 Consultation slot confirmed for ${slot.date} at ${slot.time} (Turn #${slot.turnNo}). Doctor queue notified.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    this.save();
    renderAll();
    return { success: true, slot };
  }

  // Concurrency collision test
  simulateConcurrencyRace(slotId) {
    const slot = this.state.slots.find(s => s.id === slotId);
    if (!slot || slot.status === 'BOOKED') {
      return { status: 'ERROR', message: 'Please pick an AVAILABLE slot to run the race test!' };
    }

    // Temporarily lock slot to simulate another patient hitting the API in the exact same millisecond
    slot.status = 'LOCKED';
    this.logAudit('CONCURRENT_COLLISION_SIM', 'REDIS_TEST', `Client B attempted to book slot ${slotId} while Client A holds Redis lock:slot:${slotId}. Lock returned 0.`);
    this.save();
    renderAll();

    setTimeout(() => {
      // Release or book
      slot.status = 'BOOKED';
      slot.patientId = 'usr_pat_999';
      slot.patientName = 'Concurrent Patient X';
      this.logAudit('REDIS_LOCK_RELEASED', 'REDIS_TEST', `Client A finished PostgreSQL write and released lock:slot:${slotId}. Client B safely received HTTP 409 Conflict.`);
      this.save();
      renderAll();
    }, 3000);

    return { status: 'COLLISION_HANDLED' };
  }

  // Send Chat Message
  sendMessage(content, type = 'TEXT', reportId = null) {
    if (this.state.pass.status !== 'ACTIVE') {
      return { success: false, error: 'Pass is expired. Cannot send messages.' };
    }
    
    const newMsg = {
      id: 'msg_' + Date.now(),
      passId: this.state.pass.id,
      senderId: this.state.currentUser.id,
      senderRole: this.state.currentUser.role.toLowerCase(),
      senderName: this.state.currentUser.name,
      type: type,
      content: content,
      reportId: reportId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.state.messages.push(newMsg);
    this.logAudit('WS_BROADCAST', this.state.currentUser.role, `Room pass_${this.state.pass.id}: ${content.substring(0, 40)}...`);
    this.save();
    playChime('message');
    renderAll();

    // If patient sent message, simulate smart doctor response after 2.5 seconds if in patient view
    if (this.state.currentRole === 'PATIENT' && type === 'TEXT') {
      setTimeout(() => {
        this.simulateDoctorReply(content);
      }, 2500);
    }

    return { success: true };
  }

  // Automated Doctor Follow-up Response
  simulateDoctorReply(patientText) {
    let reply = "I have noted that. Please continue your current medication as scheduled, and update me if any new symptoms arise.";
    const lower = patientText.toLowerCase();
    if (lower.includes('bp') || lower.includes('blood pressure') || lower.includes('dizzy') || lower.includes('108')) {
      reply = "108/68 mmHg is on the lower side of normal, which explains the mild dizziness when standing up. Let's adjust Telmisartan: take half tablet (20mg) in the morning for the next 3 days and monitor. Keep well hydrated!";
    } else if (lower.includes('report') || lower.includes('test') || lower.includes('cholesterol') || lower.includes('lipid')) {
      reply = "The report parameters look reassuring overall. Triglycerides are slightly elevated, so keep refined carbs and fried food to a minimum. We will repeat the panel in 3 months.";
    } else if (lower.includes('chest') || lower.includes('pain') || lower.includes('breath')) {
      reply = "⚠️ If you experience acute chest pressure, pain radiating to the left arm, or sudden breathlessness, please visit the emergency hospital room immediately rather than waiting for chat.";
    }

    const docMsg = {
      id: 'msg_' + Date.now(),
      passId: this.state.pass.id,
      senderId: 'doc_101',
      senderRole: 'doctor',
      senderName: 'Dr. Arvind Mehta',
      type: 'TEXT',
      content: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.state.messages.push(docMsg);
    this.logAudit('WS_DOC_REPLY', 'DOCTOR', `Dr. Arvind Mehta replied to room pass_${this.state.pass.id}`);
    this.save();
    playChime('message');
    renderAll();
  }

  // Upload Medical Report (Simulates S3 Zero-Exposure Pre-Signed URL Pipeline)
  uploadReport(title, type, summary, fileName = 'patient_report.pdf') {
    const s3Key = `secure_vault/patients/${this.state.currentUser.id}/${Date.now()}_${fileName}`;
    const newRep = {
      id: 'rep_' + Date.now(),
      patientId: this.state.currentUser.id,
      title: title || 'Patient Diagnostic Report',
      type: type || 'LAB_REPORT',
      fileSize: (Math.random() * 2 + 0.8).toFixed(1) + ' MB',
      mimeType: fileName.endsWith('.jpg') ? 'image/jpeg' : 'application/pdf',
      uploadedAt: 'Just now',
      s3Key: s3Key,
      verified: true,
      summary: summary || 'Report uploaded and validated via SHA-256 pre-signed S3 pipeline.'
    };
    
    this.state.reports.unshift(newRep);
    this.logAudit('S3_UPLOAD_SUCCESS', 'VAULT', `Direct browser-to-S3 upload verified for ${newRep.title} (Key: ${s3Key}). Zero server RAM exposure.`);
    
    // Automatically announce in chat
    this.sendMessage(`📄 New Medical Document Uploaded: ${newRep.title}`, 'REPORT_REF', newRep.id);
    
    this.save();
    playChime('success');
    renderAll();
    return newRep;
  }

  // Issue Digital Prescription
  issuePrescription(medications, advice) {
    const presText = `📋 OFFICIAL E-PRESCRIPTION\nDoctor: Dr. Arvind Mehta (MCI-28491-DEL)\nPatient: Rohan Verma (Age: 38, B+)\nDate: ${new Date().toLocaleDateString()}\n\nRx:\n${medications}\n\nClinical Advice:\n${advice}\n\n[Digitally Signed & Verified by Metro Care HIS]`;
    
    const newMsg = {
      id: 'msg_' + Date.now(),
      passId: this.state.pass.id,
      senderId: 'doc_101',
      senderRole: 'doctor',
      senderName: 'Dr. Arvind Mehta',
      type: 'PRESCRIPTION',
      content: presText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    this.state.messages.push(newMsg);
    this.logAudit('PRESCRIPTION_ISSUED', 'DOCTOR', 'Digital prescription generated, signed, and delivered to patient pass.');
    this.save();
    playChime('success');
    renderAll();
    return newMsg;
  }

  // Admin Onboard Doctor
  onboardDoctor(name, title, qualifications, regNo, department, hospital, fee = 500) {
    const newDoc = {
      id: 'doc_' + Date.now(),
      name: name,
      title: title,
      qualifications: qualifications,
      regNo: regNo,
      hospital: hospital,
      department: department,
      experience: '10+ Years',
      rating: 5.0,
      reviewsCount: 1,
      passFee: fee,
      passDurationDays: 7,
      isVerified: true,
      avatar: '👨‍⚕️',
      clinicHours: '04:00 PM - 07:00 PM',
      about: 'Verified medical specialist onboarded under hospital digital consultation network.'
    };
    this.state.doctors.push(newDoc);
    this.logAudit('DOCTOR_ONBOARDED', 'ADMIN', `Doctor ${name} (${regNo}) verified and active under ${hospital}.`);
    this.save();
    playChime('success');
    renderAll();
    return newDoc;
  }
}

// Global Store Instance
const store = new TeleMedicineStore();

// UI Render Engine
function renderAll() {
  renderNavbar();
  renderPassStatus();
  renderViewSections();
  renderDoctorsGrid();
  renderSlotEngine();
  renderMedicalVault();
  renderChatWindow();
  renderDoctorDesk();
  renderAdminDashboard();
  renderAuditLogs();
}

// 1. Navigation Bar
function renderNavbar() {
  const currentRole = store.state.currentRole;
  
  // Update role buttons
  document.querySelectorAll('.role-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.role === currentRole);
  });

  // Update Pass Pill in Navbar
  const passPill = document.getElementById('nav-pass-pill');
  if (passPill) {
    const isPassActive = store.state.pass.status === 'ACTIVE';
    passPill.className = 'pass-pill-badge ' + (isPassActive ? '' : 'inactive');
    
    if (isPassActive) {
      const remainingMs = new Date(store.state.pass.expiresAt) - new Date();
      const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      passPill.innerHTML = `<span class="pulse-dot"></span> 7-Day Pass: <strong>${days}d ${hours}h left</strong>`;
    } else {
      passPill.innerHTML = `<span class="pulse-dot"></span> Pass Expired (Click to Renew)`;
    }
  }

  // Update user avatar badge
  const user = store.state.currentUser;
  const avatarName = document.getElementById('nav-user-name');
  const avatarRole = document.getElementById('nav-user-role');
  const avatarCircle = document.getElementById('nav-avatar-circle');
  if (avatarName) avatarName.textContent = user.name;
  if (avatarRole) avatarRole.textContent = user.role;
  if (avatarCircle) avatarCircle.textContent = user.name.split(' ').map(n => n[0]).join('').substring(0, 2);
}

// 2. Pass Status Banner Card (Patient View)
function renderPassStatus() {
  const card = document.getElementById('patient-pass-card');
  if (!card) return;

  const isPassActive = store.state.pass.status === 'ACTIVE';
  card.className = 'pass-status-card ' + (isPassActive ? 'active-pass' : 'expired-pass');
  
  const timerDigits = document.getElementById('pass-timer-display');
  const passTitle = document.getElementById('pass-card-title');
  const passSubtitle = document.getElementById('pass-card-subtitle');
  const passActionBtn = document.getElementById('pass-action-btn');

  if (isPassActive) {
    const remainingMs = new Date(store.state.pass.expiresAt) - new Date();
    const days = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    const mins = Math.max(0, Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60)));
    
    if (timerDigits) timerDigits.textContent = `${days}d ${hours}h ${mins}m`;
    if (passTitle) passTitle.textContent = `🟢 Active 7-Day Consultation Pass (₹500)`;
    if (passSubtitle) passSubtitle.textContent = `Assigned to: ${store.state.pass.doctorName} • ${store.state.pass.hospital}`;
    if (passActionBtn) {
      passActionBtn.textContent = 'Simulate Pass Expiry';
      passActionBtn.className = 'btn btn-outline btn-sm';
      passActionBtn.onclick = () => {
        store.togglePassExpiryForDemo();
        showToast('Pass set to EXPIRED for testing guard rails.', 'warning');
      };
    }
  } else {
    if (timerDigits) timerDigits.textContent = `EXPIRED`;
    if (passTitle) passTitle.textContent = `🔴 7-Day Consultation Pass Expired`;
    if (passSubtitle) passSubtitle.textContent = `Renew your pass to book new time-slots and chat with your doctor.`;
    if (passActionBtn) {
      passActionBtn.textContent = 'Renew Pass (₹500)';
      passActionBtn.className = 'btn btn-success btn-sm';
      passActionBtn.onclick = () => openRazorpayModal();
    }
  }
}

// 3. Switch View Sections
function renderViewSections() {
  const activeRole = store.state.currentRole;
  document.getElementById('patient-view')?.classList.toggle('active', activeRole === 'PATIENT');
  document.getElementById('doctor-view')?.classList.toggle('active', activeRole === 'DOCTOR');
  document.getElementById('admin-view')?.classList.toggle('active', activeRole === 'ADMIN');
  document.getElementById('architecture-view')?.classList.toggle('active', activeRole === 'ARCH');
}

// 4. Doctor Directory Grid
function renderDoctorsGrid() {
  const grid = document.getElementById('doctors-list-grid');
  if (!grid) return;

  grid.innerHTML = store.state.doctors.map(doc => `
    <div class="doctor-card">
      <div class="doctor-card-top">
        <div class="doctor-img-wrap">${doc.avatar}</div>
        <div class="doctor-meta">
          <h4>${doc.name}</h4>
          <div class="doctor-specialty">${doc.title}</div>
          <div class="doctor-reg">Reg: ${doc.regNo}</div>
          <span class="doctor-hospital-tag">🏥 ${doc.hospital}</span>
        </div>
      </div>
      <p style="font-size: 0.8125rem; color: var(--neutral-600); margin-bottom: 0.75rem; line-height: 1.4;">
        ${doc.about}
      </p>
      <div class="doctor-card-stats">
        <div class="stat-item"><span class="val">⭐ ${doc.rating}</span><span class="lbl">${doc.reviewsCount} reviews</span></div>
        <div class="stat-item"><span class="val">${doc.experience}</span><span class="lbl">Experience</span></div>
        <div class="stat-item"><span class="val">₹${doc.passFee}</span><span class="lbl">7-Day Pass</span></div>
      </div>
      <div class="doctor-card-actions">
        <button class="btn btn-primary btn-sm" style="flex:1" onclick="selectDoctorForPass('${doc.id}')">
          Book / Claim Slot
        </button>
        <button class="btn btn-outline btn-sm" onclick="showDoctorDetailsModal('${doc.id}')">
          View Profile
        </button>
      </div>
    </div>
  `).join('');
}

// 5. Slot Booking Engine UI
let selectedSlotDate = 'Today';
function renderSlotEngine() {
  const slotsGrid = document.getElementById('slots-grid');
  if (!slotsGrid) return;

  const currentUserId = store.state.currentUser.id;
  const filteredSlots = store.state.slots.filter(s => s.date === selectedSlotDate);

  slotsGrid.innerHTML = filteredSlots.map(slot => {
    const isMine = slot.patientId === currentUserId;
    let statusClass = 'available';
    let statusText = 'Available';

    if (slot.status === 'BOOKED') {
      statusClass = isMine ? 'selected-by-user' : 'booked';
      statusText = isMine ? 'Your Slot' : 'Booked';
    } else if (slot.status === 'LOCKED') {
      statusClass = 'locked';
      statusText = 'In Progress (Lock)';
    }

    return `
      <div class="slot-card ${statusClass}" onclick="handleSlotClick('${slot.id}')">
        <span class="slot-time">${slot.time}</span>
        <span class="slot-status-lbl">${statusText}</span>
        ${isMine ? '<span style="font-size:0.65rem; color:#065f46">Turn #' + slot.turnNo + '</span>' : ''}
      </div>
    `;
  }).join('');
}

function filterSlotDate(date) {
  selectedSlotDate = date;
  document.querySelectorAll('.date-pill').forEach(pill => {
    pill.classList.toggle('active', pill.dataset.date === date);
  });
  renderSlotEngine();
}

function handleSlotClick(slotId) {
  const slot = store.state.slots.find(s => s.id === slotId);
  if (!slot) return;

  if (slot.status === 'BOOKED' && slot.patientId === store.state.currentUser.id) {
    showToast(`You already booked this slot for ${slot.time}. Join the chat room to consult!`, 'success');
    return;
  }

  if (store.state.pass.status !== 'ACTIVE') {
    showToast('You need an active 7-Day Consultation Pass to claim a slot.', 'danger');
    openRazorpayModal();
    return;
  }

  const res = store.bookSlot(slotId);
  if (res.success) {
    showToast(`✅ Slot claimed successfully for ${res.slot.time} (Turn #${res.slot.turnNo})!`, 'success');
    playChime('success');
  } else {
    showToast(res.message, 'danger');
    playChime('alert');
  }
}

// 6. Medical Report Vault UI
function renderMedicalVault() {
  const reportsList = document.getElementById('patient-reports-list');
  if (!reportsList) return;

  reportsList.innerHTML = store.state.reports.map(rep => `
    <div class="report-item-card">
      <div class="report-item-meta">
        <div class="report-item-icon">${rep.mimeType.includes('image') ? '🩻' : '📄'}</div>
        <div>
          <div class="report-item-name" title="${rep.title}">${rep.title}</div>
          <div class="report-item-date">${rep.uploadedAt} • ${rep.fileSize}</div>
        </div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-outline btn-sm" onclick="previewReport('${rep.id}')" title="Preview secure S3 file">
          👁️ Preview
        </button>
        <button class="btn btn-primary btn-sm" onclick="attachReportToChat('${rep.id}')" title="Send to doctor in chat">
          Share
        </button>
      </div>
    </div>
  `).join('');
}

function previewReport(reportId) {
  const rep = store.state.reports.find(r => r.id === reportId);
  if (!rep) return;

  const modal = document.getElementById('report-preview-modal');
  const title = document.getElementById('preview-modal-title');
  const body = document.getElementById('preview-modal-body');

  if (title) title.textContent = rep.title;
  if (body) {
    body.innerHTML = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1.25rem; margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.8125rem;">
          <span style="color:#64748b">S3 Pre-Signed Token (5 min TTL):</span>
          <span style="color:#059669; font-weight:700">AES-256 Validated</span>
        </div>
        <code style="font-size:0.75rem; word-break:break-all; color:#0369a1; display:block; background:#fff; padding:6px; border-radius:4px; border:1px solid #cbd5e1;">
          https://telemed-vault-prod.s3.ap-south-1.amazonaws.com/${rep.s3Key}?X-Amz-Signature=8f7e2d9a1c...
        </code>
      </div>
      <div style="background:#fff; border:1px solid #e2e8f0; border-radius:10px; padding:1.25rem;">
        <h4 style="font-size:0.95rem; font-weight:700; margin-bottom:0.5rem; color:#0f172a;">Diagnostic Summary:</h4>
        <p style="font-size:0.875rem; color:#334155; line-height:1.6;">${rep.summary}</p>
      </div>
    `;
  }
  openModal('report-preview-modal');
}

function attachReportToChat(reportId) {
  const rep = store.state.reports.find(r => r.id === reportId);
  if (!rep) return;
  store.sendMessage(`📄 Shared Report: ${rep.title}`, 'REPORT_REF', rep.id);
  showToast(`Attached ${rep.title} into the consultation chat room.`, 'success');
}

// 7. Scoped Consultation Chat UI
function renderChatWindow() {
  const chatMessagesBox = document.getElementById('chat-messages-box');
  const doctorChatMessagesBox = document.getElementById('doc-chat-messages-box');
  const chatGuardBanner = document.getElementById('chat-guard-banner');
  const docChatGuardBanner = document.getElementById('doc-chat-guard-banner');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');

  const isPassActive = store.state.pass.status === 'ACTIVE';

  // Guard Banner Update
  if (chatGuardBanner) {
    chatGuardBanner.className = 'chat-guard-overlay ' + (isPassActive ? '' : 'locked');
    chatGuardBanner.innerHTML = isPassActive
      ? `<span>🟢 <strong>Consultation Window Active:</strong> Pass valid till ${new Date(store.state.pass.expiresAt).toLocaleDateString()}</span>
         <span style="font-size:0.75rem; color:#166534">SSL Encrypted</span>`
      : `<span>🔒 <strong>Consultation Pass Expired:</strong> Chat is read-only. Renew pass to send messages.</span>
         <button class="btn btn-danger btn-sm" onclick="openRazorpayModal()">Renew Pass</button>`;
  }

  if (docChatGuardBanner) {
    docChatGuardBanner.className = 'chat-guard-overlay ' + (isPassActive ? '' : 'locked');
    docChatGuardBanner.innerHTML = isPassActive
      ? `<span>🩺 <strong>Doctor Consultation Desk:</strong> Connected to Patient: Rohan Verma (Turn #1)</span>
         <span style="font-size:0.75rem; color:#166534">Pass ID: ${store.state.pass.id}</span>`
      : `<span>⚠️ Patient's 7-Day pass is expired. Please ask patient to renew before prescribing.</span>`;
  }

  if (chatSendBtn) chatSendBtn.disabled = !isPassActive;
  if (chatInput) {
    chatInput.disabled = !isPassActive;
    chatInput.placeholder = isPassActive ? 'Type your consultation message or question here...' : 'Pass expired. Renew to message.';
  }

  const renderMessagesHTML = () => {
    return store.state.messages.map(msg => {
      let bubbleClass = 'chat-bubble ' + (msg.senderRole || 'system');
      let contentHTML = msg.content;

      if (msg.type === 'SYSTEM') {
        return `<div class="chat-bubble system">${msg.content}</div>`;
      }

      if (msg.type === 'PRESCRIPTION') {
        bubbleClass = 'chat-bubble prescription';
        contentHTML = `
          <div style="font-weight:700; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
            <span>💊 Medical Prescription Note</span>
          </div>
          <pre style="font-family:inherit; white-space:pre-wrap; font-size:0.8125rem;">${msg.content}</pre>
          <button class="btn btn-outline btn-sm" style="margin-top:8px; background:#fff;" onclick="showPrintablePrescription('${msg.id}')">
            🖨️ Print / Save Prescription
          </button>
        `;
      } else if (msg.type === 'REPORT_REF') {
        bubbleClass = 'chat-bubble report-ref';
        contentHTML = `
          <div style="font-weight:600; margin-bottom:2px;">${msg.content}</div>
          <button class="btn btn-outline btn-sm" style="margin-top:6px; background:#fff;" onclick="previewReport('${msg.reportId}')">
            View Shared Report
          </button>
        `;
      }

      return `
        <div class="${bubbleClass}">
          <div style="font-weight:700; font-size:0.75rem; margin-bottom:2px; opacity:0.85;">${msg.senderName}</div>
          <div>${contentHTML}</div>
          <div class="msg-meta">${msg.time}</div>
        </div>
      `;
    }).join('');
  };

  if (chatMessagesBox) {
    chatMessagesBox.innerHTML = renderMessagesHTML();
    chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
  }

  if (doctorChatMessagesBox) {
    doctorChatMessagesBox.innerHTML = renderMessagesHTML();
    doctorChatMessagesBox.scrollTop = doctorChatMessagesBox.scrollHeight;
  }
}

function handleSendMessage() {
  const input = document.getElementById('chat-input');
  if (!input || !input.value.trim()) return;

  const res = store.sendMessage(input.value.trim());
  if (res.success) {
    input.value = '';
  } else {
    showToast(res.error, 'danger');
  }
}

function handleDoctorSendMessage() {
  const input = document.getElementById('doc-chat-input');
  if (!input || !input.value.trim()) return;

  const res = store.sendMessage(input.value.trim());
  if (res.success) {
    input.value = '';
  } else {
    showToast(res.error, 'danger');
  }
}

// 8. Doctor Portal Workspace
function renderDoctorDesk() {
  const queueList = document.getElementById('doctor-patient-queue');
  if (!queueList) return;

  const todaySlots = store.state.slots.filter(s => s.date === 'Today');

  queueList.innerHTML = todaySlots.map((s, index) => {
    let badgeClass = 'waiting';
    let badgeText = 'Waiting';

    if (s.turnNo === 1 && s.status === 'BOOKED') {
      badgeClass = 'current';
      badgeText = 'Active Turn';
    } else if (s.status === 'AVAILABLE') {
      badgeClass = 'done';
      badgeText = 'Available';
    }

    return `
      <div class="queue-patient-item ${s.turnNo === 1 ? 'active' : ''}">
        <div>
          <div style="font-weight:700; font-size:0.875rem;">${s.patientName || 'Open Slot'}</div>
          <div style="font-size:0.75rem; color:#64748b;">Turn #${s.turnNo} • Slot: ${s.time}</div>
        </div>
        <span class="queue-badge ${badgeClass}">${badgeText}</span>
      </div>
    `;
  }).join('');
}

// 9. Admin Dashboard Metrics & Management
function renderAdminDashboard() {
  const totalPassesVal = document.getElementById('admin-metric-passes');
  const revenueVal = document.getElementById('admin-metric-revenue');
  const slotsBookedVal = document.getElementById('admin-metric-slots');
  const doctorsCountVal = document.getElementById('admin-metric-doctors');
  const doctorsTable = document.getElementById('admin-doctors-table-body');

  if (totalPassesVal) totalPassesVal.textContent = '148 Passes';
  if (revenueVal) revenueVal.textContent = '₹74,000';
  if (slotsBookedVal) {
    const booked = store.state.slots.filter(s => s.status === 'BOOKED').length;
    slotsBookedVal.textContent = `${booked} / ${store.state.slots.length} Slots`;
  }
  if (doctorsCountVal) doctorsCountVal.textContent = store.state.doctors.length + ' Doctors';

  if (doctorsTable) {
    doctorsTable.innerHTML = store.state.doctors.map(d => `
      <tr>
        <td style="font-weight:600">${d.name}</td>
        <td>${d.department}</td>
        <td><code>${d.regNo}</code></td>
        <td>${d.hospital}</td>
        <td><span style="background:#d1fae5; color:#065f46; font-size:0.75rem; font-weight:700; padding:2px 8px; border-radius:999px;">Verified</span></td>
        <td>₹${d.passFee} / 7 Days</td>
      </tr>
    `).join('');
  }
}

// 10. Audit Logs Stream
function renderAuditLogs() {
  const logsContainer = document.getElementById('admin-audit-logs-list');
  if (!logsContainer) return;

  logsContainer.innerHTML = store.state.auditLogs.map(l => `
    <div style="padding:6px 0; border-bottom:1px solid #f1f5f9; font-size:0.75rem; display:flex; gap:10px; align-items:baseline;">
      <span style="color:#64748b; font-family:monospace;">[${l.timestamp}]</span>
      <span style="font-weight:700; color:#0369a1; min-width:140px;">${l.event}</span>
      <span style="color:#334155;">${l.details}</span>
    </div>
  `).join('');
}

// Modal Helpers
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('open');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('open');
}

// Toast System
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🚨'}</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Razorpay Simulated Checkout Flow
function openRazorpayModal() {
  openModal('razorpay-modal');
}

function processSimulatedPayment() {
  const payBtn = document.getElementById('razorpay-pay-button');
  if (payBtn) {
    payBtn.disabled = true;
    payBtn.innerHTML = '⏳ Processing with Bank Gateway...';
  }

  setTimeout(() => {
    store.renewPass();
    closeModal('razorpay-modal');
    if (payBtn) {
      payBtn.disabled = false;
      payBtn.innerHTML = 'Pay ₹500 & Activate Pass';
    }
    showToast('🎉 Payment Successful! 7-Day Consultation Pass is now ACTIVE.', 'success');
    playChime('success');
  }, 1200);
}

// Prescription Modal & Generator
function openPrescriptionModal() {
  openModal('prescription-modal');
}

function submitPrescriptionForm(event) {
  event.preventDefault();
  const med = document.getElementById('rx-medications')?.value || 'Rosuvastatin 10mg OD at night (14 days)';
  const adv = document.getElementById('rx-advice')?.value || 'Repeat lipid profile after 6 weeks. Maintain moderate aerobic walks.';

  store.issuePrescription(med, adv);
  closeModal('prescription-modal');
  showToast('Prescription signed and delivered to patient!', 'success');
}

function showPrintablePrescription(msgId) {
  const msg = store.state.messages.find(m => m.id === msgId);
  if (!msg) return;

  const modal = document.getElementById('printable-prescription-modal');
  const body = document.getElementById('printable-prescription-body');
  if (body) {
    body.innerHTML = `
      <div style="border:2px solid #0f172a; padding:2rem; border-radius:8px; background:#fff; font-family:'Inter', sans-serif;">
        <div style="display:flex; justify-content:space-between; border-bottom:2px solid #0f172a; padding-bottom:1rem; margin-bottom:1rem;">
          <div>
            <h2 style="font-size:1.4rem; font-weight:800; color:#0f172a;">METRO CARE SUPER-SPECIALITY HOSPITAL</h2>
            <div style="font-size:0.875rem; color:#475569;">Department of Cardiology & Cardiovascular Sciences</div>
            <div style="font-size:0.75rem; color:#64748b;">14 Health City Avenue, Outer Ring Road, New Delhi</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:700;">Dr. Arvind Mehta</div>
            <div style="font-size:0.75rem; color:#64748b;">MBBS, MD, DM (Cardiology)</div>
            <div style="font-size:0.75rem; color:#0369a1; font-weight:600;">Reg No: MCI-28491-DEL</div>
          </div>
        </div>
        
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:1rem; background:#f8fafc; padding:0.75rem; border-radius:6px; margin-bottom:1.5rem; font-size:0.8125rem;">
          <div><strong>Patient:</strong> Rohan Verma</div>
          <div><strong>Age / Gender:</strong> 38 Yrs / Male</div>
          <div><strong>Pass ID:</strong> ${store.state.pass.id}</div>
        </div>

        <div style="margin-bottom:2rem;">
          <h3 style="font-size:1.1rem; border-bottom:1px solid #cbd5e1; padding-bottom:4px; margin-bottom:1rem;">Rx (Prescribed Medications):</h3>
          <pre style="font-family:inherit; white-space:pre-wrap; line-height:1.7; font-size:0.95rem;">${msg.content}</pre>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:flex-end; border-top:1px solid #cbd5e1; padding-top:1.5rem; margin-top:2rem;">
          <div style="font-size:0.75rem; color:#64748b;">
            Verified via Digital Telemedicine Pass • Time-limited follow-up window
          </div>
          <div style="text-align:center;">
            <div style="color:#059669; font-weight:800; font-size:0.9rem;">✓ DIGITALLY SIGNED</div>
            <div style="font-size:0.75rem; color:#475569;">Dr. Arvind Mehta</div>
          </div>
        </div>
      </div>
    `;
  }
  openModal('printable-prescription-modal');
}

// Doctor Details Modal
function showDoctorDetailsModal(docId) {
  const doc = store.state.doctors.find(d => d.id === docId);
  if (!doc) return;

  const modal = document.getElementById('doctor-profile-modal');
  const title = document.getElementById('doc-profile-modal-name');
  const body = document.getElementById('doc-profile-modal-body');

  if (title) title.textContent = doc.name;
  if (body) {
    body.innerHTML = `
      <div style="display:flex; gap:1.25rem; align-items:center; margin-bottom:1.25rem;">
        <div style="font-size:3rem; width:80px; height:80px; background:#eff6ff; border-radius:16px; display:flex; align-items:center; justify-content:center;">${doc.avatar}</div>
        <div>
          <h3 style="font-size:1.2rem; font-weight:800;">${doc.name}</h3>
          <div style="color:#0d9488; font-weight:600; font-size:0.875rem;">${doc.title}</div>
          <div style="font-size:0.75rem; color:#64748b;">Registration: ${doc.regNo}</div>
          <div style="font-size:0.8125rem; color:#334155; margin-top:4px;">🏥 ${doc.hospital}</div>
        </div>
      </div>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:1rem; margin-bottom:1rem; font-size:0.875rem; line-height:1.6;">
        <strong>Specialist Bio:</strong>
        <p style="color:#475569; margin-top:4px;">${doc.about}</p>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:1.5rem; font-size:0.8125rem;">
        <div style="background:#eff6ff; padding:10px; border-radius:8px;">
          <div style="color:#1e40af; font-weight:700;">Consultation Pass</div>
          <div style="font-size:1.1rem; font-weight:800; color:#0f172a;">₹${doc.passFee} / 7 Days</div>
        </div>
        <div style="background:#f0fdf4; padding:10px; border-radius:8px;">
          <div style="color:#166534; font-weight:700;">Availability</div>
          <div style="font-size:0.85rem; color:#0f172a;">${doc.clinicHours}</div>
        </div>
      </div>
      <button class="btn btn-primary" style="width:100%" onclick="selectDoctorForPass('${doc.id}')">
        Purchase 7-Day Pass & Book Slot
      </button>
    `;
  }
  openModal('doctor-profile-modal');
}

function selectDoctorForPass(docId) {
  closeModal('doctor-profile-modal');
  const doc = store.state.doctors.find(d => d.id === docId);
  if (!doc) return;

  store.state.pass.doctorId = doc.id;
  store.state.pass.doctorName = doc.name;
  store.state.pass.hospital = doc.hospital;
  store.state.pass.department = doc.department;
  store.save();
  
  // Scroll down to slots
  document.getElementById('slots-section')?.scrollIntoView({ behavior: 'smooth' });
  showToast(`Selected ${doc.name}. Pick an available consultation slot below.`, 'success');
  renderAll();
}

// AI Symptom Intake Triage Form
function submitAiTriage(event) {
  event.preventDefault();
  const reason = document.getElementById('triage-reason')?.value || 'Medication follow-up';
  const meds = document.getElementById('triage-meds')?.value || 'Telmisartan 40mg, Rosuvastatin 10mg';
  const severity = document.getElementById('triage-severity')?.value || 'Mild (Score 3/10)';

  const triageSummary = `🤖 AI CLINICAL TRIAGE INTAKE SUMMARY:\n• Primary Follow-up Reason: ${reason}\n• Current Meds: ${meds}\n• Severity / Symptom Index: ${severity}\n• Vitals Recorded: BP 108/68, HR 74, SpO2 99%\n• Risk Category: Stable Follow-up (Tier 1)`;

  store.state.messages.push({
    id: 'msg_' + Date.now(),
    passId: store.state.pass.id,
    senderId: 'system',
    senderRole: 'system',
    senderName: 'AI Triage Engine',
    type: 'SYSTEM',
    content: triageSummary,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  store.logAudit('AI_TRIAGE_INTAKE', 'TRIAGE', `Generated intake profile for patient Rohan Verma.`);
  store.save();
  closeModal('ai-triage-modal');
  showToast('AI Pre-consultation intake recorded and shared with Doctor.', 'success');
  playChime('success');
  renderAll();
}

// New Doctor Onboard Modal Form
function submitDoctorOnboard(event) {
  event.preventDefault();
  const name = document.getElementById('onboard-doc-name')?.value;
  const title = document.getElementById('onboard-doc-title')?.value;
  const quals = document.getElementById('onboard-doc-quals')?.value;
  const regNo = document.getElementById('onboard-doc-reg')?.value;
  const dept = document.getElementById('onboard-doc-dept')?.value;
  const hosp = document.getElementById('onboard-doc-hospital')?.value;
  const fee = parseInt(document.getElementById('onboard-doc-fee')?.value || '500');

  store.onboardDoctor(name, title, quals, regNo, dept, hosp, fee);
  closeModal('doctor-onboard-modal');
  showToast(`Dr. ${name} verified and onboarded to platform.`, 'success');
}

// Video Call Simulator Overlay
function toggleVideoCall(start) {
  const overlay = document.getElementById('video-call-overlay');
  if (overlay) {
    overlay.classList.toggle('active', start);
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  // Enter key in chat inputs
  document.getElementById('chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSendMessage();
  });

  document.getElementById('doc-chat-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleDoctorSendMessage();
  });
});
