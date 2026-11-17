# 🏥 PulsePass — Telemedicine & Outpatient Consultation Platform

> **Production-grade Full-Stack Telemedicine Platform**  
> Built with Next.js 14 · NestJS · PostgreSQL · Redis · Socket.IO · AWS S3 · Razorpay · Docker

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Setup](#environment-setup)
  - [Run with Docker (Recommended)](#run-with-docker-recommended)
  - [Run Locally (Development)](#run-locally-development)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Key Features](#-key-features)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**PulsePass** is a production - ready telemedicine platform enabling patients to book outpatient consultations, chat in real-time with doctors, manage 7-day passes, and securely upload medical reports to an AWS S3 vault.

| Portal | URL | Description |
|---|---|---|
| **Patient Web App** | `http://localhost:3000/patient` | Mobile-optimized slot booking, real-time chat, report upload |
| **Doctor Dashboard** | `http://localhost:3000/doctor` | Live OPD queue, prescription writer, report viewer |
| **Backend REST API** | `http://localhost:4000` | NestJS JSON API with Swagger-compatible routes |
| **WebSocket (Chat)** | `ws://localhost:4000/chat` | Socket.IO real-time consultation room |

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 14 (React + TypeScript) | SSR, App Router, responsive patient & doctor views |
| **Styling** | Tailwind CSS + Shadcn UI | Accessible medical design system |
| **Backend** | NestJS (TypeScript) | Modular REST API with RBAC guards |
| **Database** | PostgreSQL 16 + Prisma ORM | ACID-compliant relational storage |
| **Cache / Locks** | Redis 7 | Distributed locking — zero double-booking |
| **Real-Time** | Socket.IO | Sub-15ms bidirectional consultation chat |
| **File Storage** | AWS S3 | Zero-exposure pre-signed URL medical vault |
| **Payments** | Razorpay | 7-day pass activation via webhook |
| **Containerization** | Docker + Docker Compose | One-command full-stack deployment |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser / Mobile Web                      │
│          Next.js 14 App Router (Patient & Doctor)            │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST + WebSocket
┌───────────────────────▼─────────────────────────────────────┐
│               NestJS API Server (:4000)                       │
│  Auth · Passes · Slots · Chat Gateway · Reports · AuditLog   │
└──────┬────────────────┬──────────────────┬───────────────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌───────▼──────┐
│ PostgreSQL  │  │   Redis 7   │  │    AWS S3    │
│ (ACID Data) │  │ (Locks/TTL) │  │ (Med Vault)  │
└─────────────┘  └─────────────┘  └──────────────┘
```

**Concurrency Design:**  
Slot booking uses a two-layer lock:  
1. **Redis** `SET lock:slot:{id} {uuid} NX PX 5000` — fast distributed mutex  
2. **PostgreSQL** `SELECT FOR UPDATE` + `version` column — optimistic lock fallback  

This guarantees exactly-one booking under simultaneous high-traffic requests.

---

## 📂 Project Structure

```
TeleMedicine/
├── backend/                        # NestJS API server
│   ├── src/
│   │   ├── auth/                   # JWT auth, RBAC, bcrypt
│   │   ├── passes/                 # 7-day consultation passes, Razorpay webhook
│   │   ├── slots/                  # Concurrency-safe slot booking (Redis + PG)
│   │   ├── chat/                   # Socket.IO gateway, WebSocket pass guard
│   │   ├── reports/                # AWS S3 pre-signed URL vault
│   │   └── common/                 # Guards, decorators, filters, Redis service
│   ├── prisma/
│   │   └── schema.prisma           # PostgreSQL database schema
│   ├── test/                       # E2E tests (concurrency, webhooks, auth)
│   ├── Dockerfile
│   └── tsconfig.build.json
│
├── frontend/                       # Next.js 14 web app
│   ├── src/
│   │   ├── app/
│   │   │   ├── patient/            # Patient portal (book, chat, reports)
│   │   │   └── doctor/             # Doctor dashboard (queue, chart, prescribe)
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn UI primitives
│   │   │   └── shared/             # PassCountdownBadge, SlotPicker, ReportViewerModal, etc.
│   │   ├── hooks/                  # usePassTimer, useSocket
│   │   └── lib/                    # API client, Socket.IO instance
│   ├── tests/                      # Component & hook unit tests
│   └── Dockerfile
│
├── shared/
│   └── types.ts                    # Shared enums & DTO contracts (UserRole, PassStatus, SlotStatus)
│
├── docker-compose.yml              # Full-stack orchestration
├── .env.example                    # Environment variable template
└── package.json                    # Workspace root scripts
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Minimum Version | Notes |
|---|---|---|
| Node.js | v20+ | Use nvm for version management |
| npm | v9+ | Comes with Node.js |
| Docker Desktop | Latest | **Run as Administrator on Windows** |
| Git | v2.40+ | For cloning |
| AWS Account | — | For S3 medical vault (optional in dev) |
| Razorpay Account | — | For payment webhooks (optional in dev) |

---

### Environment Setup

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/TeleMedicine.git
cd TeleMedicine

# 2. Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section below)

# 3. Install all workspace dependencies
npm install
```

---

### Run with Docker (Recommended)

> ⚠️ **Windows users**: Docker commands must be run from an **Administrator PowerShell**.

```bash
# Build and start all services (PostgreSQL, Redis, Backend, Frontend)
docker compose up --build

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (wipes database)
docker compose down -v
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

---

### Run Locally (Development)

```bash
# Install dependencies
npm install

# Start backend in watch mode + frontend dev server in parallel
npm run dev

# Or start individually:
npm run dev:backend    # NestJS with hot-reload on :4000
npm run dev:frontend   # Next.js dev server on :3000

# Apply database schema (requires a running PostgreSQL instance)
npm run prisma:push
```

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# ─── Backend ───────────────────────────────────────────
PORT=4000
DATABASE_URL="postgresql://telemed_admin:telemed_password_2026@localhost:5432/telemed_db?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="change_me_in_production_use_a_long_random_string"
FRONTEND_URL="http://localhost:3000"

# ─── AWS S3 Medical Vault ──────────────────────────────
AWS_REGION="ap-south-1"
AWS_S3_BUCKET="telemed-medical-vault-prod"
AWS_ACCESS_KEY_ID="your_aws_access_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_access_key"

# ─── Razorpay Payment Gateway ──────────────────────────
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# ─── Frontend ──────────────────────────────────────────
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_WS_URL="http://localhost:4000/chat"
```

> 🔒 **Never commit your `.env` file.** It is listed in `.gitignore`.

---

## 📡 API Endpoints

### Auth
| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register patient or doctor | Public |
| `POST` | `/auth/login` | Login and receive JWT | Public |
| `GET` | `/auth/me` | Get current user profile | 🔑 JWT |

### Passes (7-Day Consultation)
| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/passes` | Activate a consultation pass | 🔑 PATIENT |
| `GET` | `/passes/my` | List my active passes | 🔑 PATIENT |
| `POST` | `/passes/webhook/razorpay` | Razorpay payment webhook | HMAC Signed |

### Slots
| Method | Route | Description | Auth |
|---|---|---|---|
| `GET` | `/slots/doctor/:id` | Fetch doctor's available slots | 🔑 JWT |
| `POST` | `/slots/:id/book` | Concurrency-safe slot booking | 🔑 PATIENT |
| `PATCH` | `/slots/:id/complete` | Mark slot as completed | 🔑 DOCTOR |

### Reports (S3 Vault)
| Method | Route | Description | Auth |
|---|---|---|---|
| `POST` | `/reports/upload-url` | Get 5-min pre-signed PUT URL | 🔑 PATIENT |
| `GET` | `/reports/:id/view-url` | Get 10-min pre-signed GET URL | 🔑 JWT |

### Chat (WebSocket)
| Event | Direction | Description |
|---|---|---|
| `join_room` | Client → Server | Join consultation room by passId |
| `send_message` | Client → Server | Send text, prescription, or report ref |
| `receive_message` | Server → Client | Broadcast message to room |

---

## 🗄 Database Schema

**Core Models:**

```
Hospital ──< User >── DoctorProfile
                │
                ├──< ConsultationPass >── TimeSlot
                │                    └── ChatMessage
                └──< MedicalReport
```

| Model | Description |
|---|---|
| `Hospital` | Healthcare facility registrations |
| `User` | Patients, doctors, admins (unified auth) |
| `DoctorProfile` | Specialization, MCI number, consultation fee |
| `ConsultationPass` | 7-day access pass linked to Razorpay order |
| `TimeSlot` | Bookable slots with optimistic locking (`version`) |
| `MedicalReport` | S3 object references with pre-signed access |
| `ChatMessage` | Consultation messages (TEXT, PRESCRIPTION, REPORT_REF) |
| `AuditLog` | Security and compliance event trail |

Apply or sync the schema:

```bash
npm run prisma:push       # Sync schema to database (dev)
npm run prisma:generate   # Regenerate Prisma client types
```

---

## 🧪 Testing

```bash
# Run all tests (backend unit + frontend unit)
npm test

# Backend tests only
npm run dev:backend  # or:
cd backend && npm test

# Backend E2E tests
cd backend && npm run test:e2e
```

### Backend Test Coverage

| Test File | Type | What It Tests |
|---|---|---|
| `auth.service.spec.ts` | Unit | Registration, password hashing, duplicate detection |
| `slots.service.spec.ts` | Unit | Redis `SETNX` lock, contention, safe release |
| `passes.service.spec.ts` | Unit | 7-day TTL calculation, webhook idempotency |
| `reports.service.spec.ts` | Unit | Pre-signed URL generation, RBAC enforcement |
| `chat.gateway.spec.ts` | Unit | Room isolation, message broadcasting |
| `slots-concurrency.e2e-spec.ts` | **E2E** | Parallel `Promise.all` race — verifies zero double-booking |
| `passes-webhook.e2e-spec.ts` | **E2E** | Duplicate webhook rejection |
| `auth.e2e-spec.ts` | **E2E** | Full register → login → JWT decode flow |

### Frontend Test Coverage

| Test File | What It Tests |
|---|---|
| `PassCountdownBadge.test.tsx` | Active timer, expired state, renew button |
| `SlotPicker.test.tsx` | AVAILABLE / LOCKED / BOOKED button states |
| `usePassTimer.test.ts` | Time delta calculations, expiration transitions |

---

## 🏷 Root Scripts Reference

```bash
npm run dev              # Start backend + frontend concurrently
npm run dev:backend      # Backend only (hot-reload)
npm run dev:frontend     # Frontend only
npm run build            # Build both backend and frontend
npm run build:backend    # Build NestJS (outputs to backend/dist)
npm run build:frontend   # Build Next.js (outputs to frontend/.next)
npm run test             # Run all tests
npm run prisma:generate  # Regenerate Prisma client
npm run prisma:push      # Sync schema to database
npm run docker:up        # docker compose up --build
npm run docker:down      # docker compose down
npm run docker:build     # docker compose build
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

**Commit Convention:** Follow [Conventional Commits](https://www.conventionalcommits.org/)  
`feat:` · `fix:` · `chore:` · `docs:` · `refactor:` · `test:`

---

## 📄 License

This project is **UNLICENSED** and proprietary. All rights reserved.

---

<div align="center">
  Built with ❤️ using NestJS · Next.js · PostgreSQL · Redis · Docker
</div>
