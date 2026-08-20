# BoardQuest Admin & Portal System

### **CONFIDENTIAL & PROPRIETARY**
> [!IMPORTANT]
> This repository contains proprietary source code and intellectual property of **BoardQuest**. Access to, modification of, or distribution of this code without explicit authorization from the company is strictly prohibited.

---

## Project Documentation/Purpose

**BoardQuest** is an advanced, gamified learning and exam preparation platform tailored for board exam review (specifically optimized for medical/clinical board exams, such as Clinical Chemistry). This monorepo contains both the **API Backend** and the **Vite-based Frontend** components.

The platform supports robust role-based access control (RBAC), user progression tracking (XP, levels, streaks), study plans, question bank management with full review workflows, and AI integration via n8n workflows for question paraphrasing and performance analytics.

---

## Technology Stack

### Backend (`api`)
- **Runtime**: Node.js
- **Framework**: Express.js (v5)
- **Language**: TypeScript
- **Database ORM**: Prisma ORM (MongoDB adapter)
- **Authentication**: JWT & Argon2 Hashing
- **Validation**: Zod
- **Testing**: Jest & Supertest
- **AI Automation**: n8n Webhook integrations

### Frontend (`frontend`)
- **Framework**: React 19 + Vite 8
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query & SWR
- **Routing**: React Router v7
- **Icons**: Lucide React

---

## Setup Instructions

### Prerequisites
Ensure you have the following installed on your local machine:
- **Node.js** (v18.x or later recommended)
- **npm** (v9.x or later)
- **MongoDB** (Local instance or Atlas connection string)

---

### 1. Backend Setup (`/api`)

1. **Navigate to the API directory:**
   ```bash
   cd api
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Provide values for:
   - `DATABASE_URL`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure signing key for authorization.
   - `PORT`: Port number to run the backend (e.g., `3000`).
   - `N8N_BASE_URL` & webhooks: For the AI workflow integrations.

4. **Initialize Prisma Client:**
   Generate the client code based on the schema:
   ```bash
   npx prisma generate
   ```
5. **Run Database Seeds/Scripts (Optional):**
   To seed administrative users or setup initial question banks, use `tsx` to execute the scripts located in `src/seeds/` or `src/scripts.ts/setup_admin.ts`:
   ```bash
   npx tsx src/scripts.ts/setup_admin.ts
   ```
6. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   The backend will run under hot-reload using `tsx watch`.

---

### 2. Frontend Setup (`/frontend`)

1. **Navigate to the Frontend directory:**
   ```bash
   cd ../frontend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Set the API entrypoint:
   - `VITE_API_URL`: Path to your backend API server (e.g., `http://localhost:3000/api`).

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the port specified in terminal) in your browser.

---

## File Structure Explanation

The project is structured as a monorepo containing two main directories:

- **[`api/`](file:///d:/Code/capstone/api)**: Node.js/Express backend service using Prisma ORM and TypeScript.
- **[`frontend/`](file:///d:/Code/capstone/frontend)**: Single Page Application (SPA) built with React 19, Vite, Tailwind CSS v4, and shadcn/ui.

---

## Security & Code Guidelines

As this is a private corporate codebase, please adhere strictly to these practices:

1. **Secrets Management**: Never commit `.env` files or hardcoded credentials (passwords, JWT secrets, database connection strings, n8n API keys) to version control. The `.gitignore` files are pre-configured to ignore environment files.
2. **Access Control**: Roles are strictly checked. Testing must cover the following roles:
   - `SUPERADMIN`
   - `ADMIN`
   - `TEACHER`
   - `TEAMLEAD`
   - `USER` (Students)
3. **Code Quality**:
   - Run linter before pushing changes: `npm run lint`.
   - Ensure all TypeScript types are fully declared; avoid using `any` type mappings.
   - Write tests for new services inside `api/src/__tests__`. Run tests via `npm run test`.
4. **Git Flow**:
   - Create feature branches from `main` or `develop`.
   - Follow standard semantic commit messages (e.g., `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`).
   - Pull Requests (PRs) must be reviewed and approved by at least one maintainer.

---

# License
## Proprietary License

Copyright (c) 2026 BoardQuest. All rights reserved.

This software and its documentation are confidential and proprietary to BoardQuest. Unauthorized copying, modification, distribution, or use of this software, in whole or in part, is strictly prohibited without explicit written permission from the copyright owners.

© 2026 BoardQuest. All rights reserved.
