# Telemedicine & Patient Consultation Platform — MVP Blueprint

## 1. Vision & Core Objective
**The Problem:**
Patients in both urban and rural areas frequently travel long distances and wait in overcrowded hospital queues for minor follow-up queries (e.g., medication adjustments, dosage confirmations, or routine lab report reviews). This creates unnecessary financial and physical strain on patients while overwhelming doctors with non-critical outpatient traffic.

**The Solution:**
A digital health and hospital-integrated consultation platform that enables patients to book allotted, time-slotted virtual consultations with verified doctors. Through a time-bound consultation pass (e.g., a 7-day pass for ₹500), patients can upload medical reports and chat directly with their specialist within scheduled windows—eliminating physical travel for routine follow-ups and streamlining hospital outpatient queues.

**MVP Goal:**
Build, deploy, and validate a lean, secure, and production-grade Version 1 covering the end-to-end patient-to-doctor consultation loop, ready for initial hospital onboarding and Google Play Store internal testing.

---

## 2. Target User Personas (MVP Scope)
1. **Patient (Mobile App — Android / Web):**
   * Searches hospitals and specialists by department.
   * Purchases a time-bound consultation pass (e.g., 7-day access window).
   * Claims an available 10-to-15-minute consultation slot.
   * Uploads past prescriptions and lab reports (PDF/Images) prior to the slot.
   * Chats in real time with the doctor during the active consultation window.
2. **Doctor (Web Portal / Mobile):**
   * Publishes daily availability windows and slot durations.
   * Views an organized queue of upcoming patient slots.
   * Reviews uploaded patient medical reports before initiating chat.
   * Responds to patient queries in real time and marks consultations as resolved.
3. **Hospital / Platform Admin (Web Dashboard — Lightweight V1):**
   * Verifies and onboards doctors under specific hospital profiles.
   * Monitors active consultation passes, slot utilization, and platform health.

---

## 3. Core MVP Features (Must-Haves for V1)

### A. Role-Based Authentication & Profiles (RBAC)
* Phone/OTP or Email + Password authentication using stateless **JWT (Access + Refresh tokens)**.
* Strict Role-Based Access Control (`PATIENT`, `DOCTOR`, `ADMIN`) ensuring patients cannot access doctor queues and doctors can only view records of patients assigned to them.

### B. Time-Bound Consultation Pass & Payments
* **Pass Model:** Patients purchase a fixed-validity pass (e.g., ₹500 for 7 days) tied to a specific doctor/department.
* **Payment Integration:** Razorpay / Stripe integration with idempotent webhook verification to activate the pass upon payment confirmation.
* **Automated Expiry:** System automatically locks new slot bookings and chat messaging once `expires_at` is reached, prompting renewal if needed.

### C. Concurrency-Safe Time-Slot Booking Engine
* Doctors configure daily recurring or custom time blocks (e.g., 5:00 PM – 7:00 PM split into 10-minute slots).
* Patients with an active pass claim open slots.
* **Zero Double-Booking Guarantee:** Distributed locking ensures two patients clicking the same slot simultaneously never cause a booking collision.

### D. Real-Time Scoped Consultation Chat
* Bidirectional real-time messaging powered by **WebSockets (Socket.IO)**.
* **Access Guard:** Chat rooms automatically unlock during the patient's booked turn/active pass window and enter read-only mode after pass expiration.
* **Turn Notifications:** Push/in-app alerts notifying the patient when their slot is next in the doctor's queue.

### E. Secure Medical Report Vault
* Patients upload lab reports, X-rays, and previous prescriptions directly to cloud object storage.
* **Privacy First:** Files are stored privately and accessed strictly via short-lived, time-limited pre-signed URLs verified against active doctor-patient bookings.

---

## 4. Recommended Technical Architecture

### Tech Stack
* **Backend Framework:** **NestJS (TypeScript)** — Modular domain architecture (`Auth`, `Users`, `Passes`, `Slots`, `Chat`, `Reports`) with native WebSocket gateways and strict DTO validation.
* **Primary Database:** **PostgreSQL** (with Prisma or TypeORM) — ACID-compliant relational storage for bookings, financial transactions, and audit logs.
* **Caching, Locks & TTL:** **Redis** — Distributed locks (`SET NX PX`) for slot reservation concurrency, active pass caching, and rate limiting.
* **Real-Time Layer:** **Socket.IO / WebSockets** — Authenticated room-based chat and live queue status updates.
* **File Storage:** **AWS S3** — Private bucket storage using Pre-Signed `PutObject` and `GetObject` URLs.
* **Frontend & Mobile:**
  * **Patient App:** React Native (Expo) for cross-platform Android Play Store (`.aab`) deployment.
  * **Doctor & Admin Portal:** Next.js (React + TypeScript) for fast desktop browser workflows inside hospitals.
* **Infrastructure:** Docker + Docker Compose deployed on AWS EC2 behind Nginx with SSL.

---

## 5. Core Database Schema (PostgreSQL)

1. **`users`**
   * `id` (UUID, PK), `full_name`, `phone` (Unique), `email`, `password_hash`, `role` (`PATIENT` | `DOCTOR` | `ADMIN`), `hospital_id` (Nullable FK), `created_at`
2. **`doctor_profiles`**
   * `id` (UUID, PK), `user_id` (FK -> `users`), `specialization`, `registration_number`, `consultation_fee`, `pass_duration_days` (Default: 7), `is_verified`
3. **`consultation_passes`**
   * `id` (UUID, PK), `patient_id` (FK), `doctor_id` (FK), `payment_order_id`, `amount_paid`, `starts_at`, `expires_at`, `status` (`ACTIVE` | `EXPIRED`)
4. **`time_slots`**
   * `id` (UUID, PK), `doctor_id` (FK), `patient_id` (Nullable FK), `pass_id` (Nullable FK), `start_time`, `end_time`, `status` (`AVAILABLE` | `BOOKED` | `COMPLETED` | `CANCELLED`)
5. **`medical_reports`**
   * `id` (UUID, PK), `patient_id` (FK), `pass_id` (FK), `file_name`, `s3_object_key`, `mime_type`, `uploaded_at`
6. **`chat_messages`**
   * `id` (UUID, PK), `pass_id` (FK), `sender_id` (FK), `message_type` (`TEXT` | `REPORT_REF` | `PRESCRIPTION_NOTE`), `content`, `created_at`

---

## 6. Key Engineering Highlights (Interview & Portfolio Differentiators)

1. **Distributed Slot-Locking Mechanism:**
   * When a patient requests to book `slot_id`, the backend acquires a Redis lock (`lock:slot:{slot_id}`, TTL 5s) before executing a PostgreSQL row-locked transaction (`SELECT ... FOR UPDATE`), eliminating race conditions under high traffic.
2. **Zero-Exposure Medical File Pipeline:**
   * Medical files never pass through the Node.js server memory or sit in public buckets. The backend validates RBAC permissions and issues a 5-minute S3 upload URL to the patient and a 10-minute read-only S3 URL to the assigned doctor.
3. **WebSocket Session Enforcement:**
   * Every incoming WebSocket message validates the JWT payload and checks a Redis-cached pass TTL (`pass:active:{pass_id}`). Expired passes are immediately rejected at the gateway layer without hitting PostgreSQL.

---

## 7. 4-Week Execution Roadmap

* **Week 1: Backend Foundation & Auth**
  * Initialize NestJS monorepo/project structure, PostgreSQL schema, JWT + RBAC guards, and hospital/doctor profile endpoints.
* **Week 2: Slot Engine, Redis Locks & Payments**
  * Build doctor slot-generation APIs, Redis distributed lock booking service, and Razorpay test-mode webhook for 7-day pass activation.
* **Week 3: Real-Time Chat & S3 Medical Reports**
  * Implement Socket.IO chat gateway with pass-expiry guards, AWS S3 pre-signed upload/view endpoints, and core Next.js + Expo screens.
* **Week 4: Deployment, Documentation & Play Store Prep**
  * Containerize with Docker, deploy to AWS EC2 + Nginx, write a detailed `README.md` with system architecture diagrams, and build a signed Android App Bundle (`.aab`) for Google Play Console internal testing.

---

## 8. Future Roadmap (Post-MVP / V2 Ideas)
* **AI Pre-Consultation Triage:** Automated symptom intake summary generated before the doctor opens the chat.
* **Digital E-Prescription Generator:** Structured PDF prescription export with doctor digital signature.
* **Hospital EMR/HIS Webhook Integration:** Syncing booked virtual turns directly with existing hospital reception displays.
* **Multi-Language Support:** Regional language UI support for rural patient accessibility.

---

## 9. Your Custom Additions & Notes
*(Use this section to add your specific hospital onboarding strategy, pricing tiers, UI ideas, or additional features you want to include)*

* **Target Hospitals / Clinics for Pilot:** 
* **Custom Consultation Tiers / Pricing:** 
* **Additional Features to Add:** 