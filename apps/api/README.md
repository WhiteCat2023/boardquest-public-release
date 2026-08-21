# BoardQuest API & Microservices

[![Runtime](https://img.shields.io/badge/runtime-Node.js%20v18+-brightgreen.svg)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/framework-Express%20v5-black.svg)](https://expressjs.com/)
[![Language](https://img.shields.io/badge/language-TypeScript%20v5-blue.svg)](https://www.typescriptlang.org/)
[![Database](https://img.shields.io/badge/database-MongoDB-green.svg)](https://www.mongodb.com/)
[![ORM](https://img.shields.io/badge/ORM-Prisma%20v6-2D3748.svg)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](#license)

> [!IMPORTANT]
> **Confidential & Proprietary**
> This service contains the core backend business logic, database schemas, and AI integration pipelines for **BoardQuest**. Unauthorized copying or distribution is strictly prohibited.

---

## Overview & Purpose

The **BoardQuest API** is a high-performance RESTful backend engineered using **Express 5**, **TypeScript**, and **Prisma ORM (MongoDB)**. It powers all authentication, question bank management, exam simulation workflows, institutional review center analytics, background job queues, and AI-driven services across the BoardQuest ecosystem.

---

## Core Capabilities

- **🔐 Authentication & RBAC**: Stateless JWT authorization with secure cookies, Argon2 password hashing, and role checks (`SUPERADMIN`, `DEAN`, `TEAMLEAD`, `TEACHER`, `STUDENT`).
- **📝 Question Bank Curation**: Multi-stage question approval workflow (Draft $\rightarrow$ Review $\rightarrow$ Approved $\rightarrow$ Published), taxonomy mapping, and bulk Excel parsing via `xlsx`.
- **⚙️ Background Workers**: Asynchronous task scheduling and job queueing powered by **Agenda.js** connected directly to MongoDB.
- **🤖 AI Synthesis & Webhooks**: Google Gemini integration for question generation/synthesis and automated n8n webhook pipelines for paraphrasing and performance insights.
- **🛡️ Security & Performance**: Redis-backed distributed rate limiting (with automatic in-memory fallback), CORS domain protection, and Zod schema validation.
- **📧 Transactional Mailer**: Automated HTML notifications, password resets, and account onboarding via **Nodemailer**.
- **☁️ Cloud Asset Storage**: Secure image and media asset management via **Cloudinary**.

---

## Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Runtime & Language** | Node.js (v18+) & TypeScript |
| **Server Framework** | Express.js v5 |
| **Database & ORM** | MongoDB 7.0 & Prisma ORM v6 |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), Argon2 (`argon2`), Cookie Parser |
| **Job Queue & Scheduling** | Agenda.js (`@agendajs/mongo-backend`) |
| **Validation** | Zod |
| **Media Hosting** | Cloudinary SDK |
| **Email Service** | Nodemailer |
| **Cache & Rate Limiter** | ioredis & express-rate-limit |
| **Testing** | Jest, ts-jest, Supertest |

---

## Directory Structure

```
apps/api/
├── prisma/
│   └── schema.prisma           # Prisma MongoDB models & schemas
├── src/
│   ├── config/                 # Credentials, Cloudinary, and Redis configurations
│   ├── controller/             # HTTP route controllers & request handlers
│   ├── extraction/             # Bulk document & Excel extraction helpers
│   ├── middleware/             # Auth guards, RBAC verification, rate-limiting, error handler
│   ├── routes/                 # Express API router definitions (/api/*)
│   ├── scripts.ts/             # Administrative bootstrap & seed scripts (setup_admin.ts)
│   ├── seeds/                  # Baseline seed datasets for development
│   ├── services/               # Business logic services (Faculty, Mail, Queue, AI, etc.)
│   │   ├── admin/              # Administrative services (Analytics, Synthesizer, Logger)
│   │   ├── review-center/      # Review center partner service logic
│   │   ├── mail.service.ts     # Nodemailer template engine and dispatcher
│   │   ├── prisma.ts           # Prisma client singleton instance
│   │   └── queue.service.ts    # Agenda.js background job manager
│   ├── types/                  # Global TypeScript interfaces and declarations
│   ├── utils/                  # Cryptography, JWT tokens, response formatters
│   ├── __tests__/              # Automated test suites (Jest & Supertest)
│   └── index.ts                # Application entrypoint & HTTP server bootstrap
├── .env.example                # Environment variables template
├── Dockerfile                  # Containerization build manifest
├── jest.config.js              # Test runner configuration
├── package.json
└── tsconfig.json
```

---

## Local Setup & Configuration

### 1. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Configure the following variables in `.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/boardquest
PRIVATE_KEY=your_super_secure_jwt_private_key_here
PUBLIC_KEY=your_super_secure_jwt_public_key_here
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5175
ADMIN_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# Optional Integrations
REDIS_URL=redis://localhost:6379
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
GEMINI_API_KEY=
N8N_BASE_URL=
```

### 2. Generate Prisma Client

```bash
# From workspace root
pnpm --filter=./apps/api prisma generate

# Or inside apps/api
npx prisma generate
```

### 3. Initialize Admin Seed (Optional)

```bash
# Seed initial administrator credentials
npx tsx src/scripts.ts/setup_admin.ts
```

---

## Available Scripts

Run these scripts from the repository root using `pnpm --filter=./apps/api <script>` or directly inside the `apps/api` directory:

| Script | Command | Description |
| :--- | :--- | :--- |
| **`dev`** | `pnpm --filter=./apps/api dev` | Generates Prisma client and runs API with hot-reload (`tsx watch`). |
| **`build`** | `pnpm --filter=./apps/api build` | Generates Prisma client and compiles TypeScript to `dist/`. |
| **`start`** | `pnpm --filter=./apps/api start` | Starts the compiled production server. |
| **`test`** | `pnpm --filter=./apps/api test` | Runs Jest unit and integration tests. |
| **`test:watch`** | `pnpm --filter=./apps/api test:watch` | Runs test runner in interactive watch mode. |
| **`test:coverage`**| `pnpm --filter=./apps/api test:coverage` | Generates code coverage report. |
| **`typecheck`** | `pnpm --filter=./apps/api typecheck` | Type-checks the TypeScript codebase without emitting files. |

---

## License

Copyright (c) 2026 BoardQuest. All rights reserved.  
Confidential and Proprietary.
