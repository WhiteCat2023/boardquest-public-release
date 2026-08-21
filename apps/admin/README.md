# BoardQuest Admin & Management Portal

[![Framework](https://img.shields.io/badge/framework-React%20v19-blue.svg)](https://react.dev/)
[![Bundler](https://img.shields.io/badge/bundler-Vite%20v8-purple.svg)](https://vite.dev/)
[![Language](https://img.shields.io/badge/language-TypeScript%20v5-blue.svg)](https://www.typescriptlang.org/)
[![Styling](https://img.shields.io/badge/styling-Tailwind%20CSS%20v4-38B2AC.svg)](https://tailwindcss.com/)
[![State Management](https://img.shields.io/badge/state-Zustand%20%2B%20TanStack%20Query-orange.svg)](https://tanstack.com/query)
[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](#license)

> [!IMPORTANT]
> **Confidential & Proprietary**
> This repository contains the administrative frontend portal and institutional management interface for **BoardQuest**. Unauthorized copying or distribution is strictly prohibited.

---

## Overview & Purpose

The **BoardQuest Admin Portal** is an enterprise-grade Single Page Application (SPA) built with **React 19**, **Vite 8**, and **TypeScript**. It provides administrative operators, faculty educators, and review center directors with a centralized command center to author question banks, coordinate multi-stage review workflows, manage faculty rosters, analyze cohort performance diagnostics, and monitor system metrics.

---

## Key Features

- **📚 Question Bank Studio**:
  - Full CRUD question authoring with rich text formatting and media attachments.
  - Multi-tiered review workflow (*Draft $\rightarrow$ Review $\rightarrow$ Approved $\rightarrow$ Published*).
  - Categorization via Bloom's Taxonomy, difficulty ratings, and subject domain tags.
  - Bulk question import and template parsing via Excel (`.xlsx`).
- **👥 Faculty & Reviewer Administration**:
  - Account onboarding, credential management, and role-based permissions (`SUPERADMIN`, `DEAN`, `TEAMLEAD`, `TEACHER`).
  - Automated invitation dispatch and status toggles.
- **🏫 Review Center & Institutional Portal**:
  - Partner institution onboarding and cohort oversight.
  - Organization-level access filtering and diagnostic reporting.
- **📊 Diagnostic Analytics & Performance Insights**:
  - Student pass-rate forecasting, strength/weakness heatmaps, and topic mastery benchmarks.
  - High-performance data tables with virtualized filtering and sorting via `@tanstack/react-table`.
- **⚡ Bulletproof Architecture & Dynamic Code-Splitting**:
  - Sub-150KB initial JavaScript bundle with route-level `React.lazy()` chunking.

---

## Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework & Build Tool** | React 19 + Vite 8 |
| **Language** | TypeScript |
| **Design System & Styling** | Tailwind CSS v4, `@aejkatappaja/phantom-ui`, Radix UI, Lucide React |
| **Data Fetching & Caching** | TanStack React Query v5 & Axios |
| **Data Tables** | TanStack React Table v8 |
| **State Management** | Zustand |
| **Form Validation** | Zod |
| **Routing** | React Router v7 with Code-Splitting (`React.lazy`) |
| **Notifications & Dialogs** | Sonner toasts & Vaul drawers |

---

## Directory Structure (Bulletproof React)

```
apps/admin/
├── src/
│   ├── app/                    # Application configuration layer
│   │   ├── routes/             # App route declarations & page views
│   │   ├── app.tsx             # Root React component
│   │   ├── provider.tsx        # Global context & QueryClient providers
│   │   └── router.tsx          # React Router v7 configuration
│   ├── assets/                 # Static assets, brand logos, SVG illustrations
│   ├── components/             # Reusable UI primitives (Buttons, Cards, Dialogs, Inputs)
│   ├── config/                 # Environment variables and API client configs
│   ├── features/               # Feature-based modular architecture
│   │   ├── analytics/          # Institutional & student performance analytics
│   │   ├── auth/               # Authentication, login guards, and session state
│   │   ├── faculty/            # Faculty accounts & role administration
│   │   ├── question-bank/      # Question authoring, review workflow, and imports
│   │   ├── review-center/      # Partner review center management
│   │   └── settings/           # Profile settings & system preferences
│   ├── hooks/                  # Global custom React hooks (debouncing, media queries)
│   ├── lib/                    # Configured Axios instance and utility helpers
│   ├── stores/                 # Zustand global client stores
│   ├── types/                  # Shared TypeScript models and interfaces
│   └── utils/                  # Date formatters, string parsers, and helpers
├── public/                     # Public static assets
├── .env.example                # Frontend environment template
├── Dockerfile                  # Production Nginx containerization setup
├── nginx.conf                  # Nginx SPA fallback configuration
├── package.json
└── vite.config.ts              # Vite plugins and path aliases (@/*)
```

---

## Local Setup & Configuration

### 1. Environment Configuration

Create a `.env` file from the provided template:
```bash
cp .env.example .env
```

Ensure the API endpoint points to your running backend:
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5000/api
```

---

## Available Scripts

Run these scripts from the workspace root or inside `apps/admin`:

| Script | Command | Description |
| :--- | :--- | :--- |
| **`dev`** | `pnpm --filter=./apps/admin dev` | Starts Vite development server at [http://localhost:5173](http://localhost:5173). |
| **`build`** | `pnpm --filter=./apps/admin build` | Typechecks with `tsc` and creates production bundle in `dist/`. |
| **`preview`** | `pnpm --filter=./apps/admin preview` | Previews the production build locally. |
| **`lint`** | `pnpm --filter=./apps/admin lint` | Runs ESLint across all TypeScript and React files. |
| **`typecheck`** | `pnpm --filter=./apps/admin typecheck` | Validates TypeScript types across the app without emitting code. |

---

## Code-Splitting Architecture

To ensure instantaneous First Contentful Paint (FCP), page-level routes in `src/App.tsx` are imported dynamically via `React.lazy`:

```tsx
const QuestionBank = lazy(() => 
  import("@/features/question-bank").then(m => ({ default: m.QuestionBank }))
);
```

For complete architecture details and guidelines, see [`lazy_loading_documentation.md`](file:///d:/Code/capstone/lazy_loading_documentation.md).

---

## License

Copyright (c) 2026 BoardQuest. All rights reserved.  
Confidential and Proprietary.
