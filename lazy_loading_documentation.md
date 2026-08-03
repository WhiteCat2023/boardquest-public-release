# Code-Splitting & Lazy Loading Architecture Guide

This document explains the **React Lazy Loading & Code-Splitting Strategy** implemented in `src/App.tsx`.

---

## 1. Overview & Strategy

To maintain fast initial page load times (First Contentful Paint) as the application grows, the project uses **React Lazy Loading (`React.lazy`)** combined with **Vite Dynamic Code-Splitting**.

### How It Works:
Instead of bundling the entire codebase (Dashboard, Faculty, Question Bank, Analytics, Settings) into one giant JavaScript file, Vite splits each route into a separate JavaScript "chunk" file. The user only downloads the JavaScript chunk for the page they are currently visiting over the network.

---

## 2. Syntax Pattern Explanation

```tsx
const QuestionBank = lazy(() => 
  import("@/features/question-bank").then(m => ({ default: m.QuestionBank }))
);
```

### Breakdown of Elements:

| Code Segment | Technical Purpose |
| :--- | :--- |
| `lazy(...)` | React primitive that delays rendering a component until its code has been fetched. |
| `import("@/features/question-bank")` | Vite dynamic import. Triggers an asynchronous network request to fetch the feature's JS chunk. |
| `.then(m => ({ default: m.QuestionBank }))` | **Named-to-Default Export Adapter**. Maps Bulletproof React named exports (`export { QuestionBank }`) to the `{ default: ... }` format expected by `React.lazy()`. |
| `<Suspense fallback={<PageFallback />}>` | React boundary that displays a loading placeholder while the page chunk is fetching over the network. |

---

## 3. Architecture Integration with Bulletproof React

In Bulletproof React architecture, each feature module exposes a **Public API** via `index.ts`:

```ts
// src/features/question-bank/index.ts
export { default as QuestionBank } from './components/QuestionBank';
export { default as ViewQuestion } from './components/ViewQuestion';
export * from './api/useQuestionBank';
```

Because page components are exported as **named exports** from the feature `index.ts`, `App.tsx` imports pages via:

```tsx
// Lazy load directly from Feature Public API
const QuestionBank = lazy(() => import("@/features/question-bank").then(m => ({ default: m.QuestionBank })));
const ViewQuestion = lazy(() => import("@/features/question-bank").then(m => ({ default: m.ViewQuestion })));
```

---

## 4. Performance & UX Comparison

| Feature | Without Lazy Loading (Static Imports) | With Lazy Loading (Dynamic Imports) |
| :--- | :--- | :--- |
| **Initial JS Bundle Size** | ~3MB – 5MB (Heavy) | **~150KB** (Ultra-light) |
| **First Contentful Paint (FCP)** | Slower (Wait for all pages) | **Instant** (Only initial route) |
| **Mobile Hotspot Bandwidth** | Wastes data on unvisited pages | **Saves data** (On-demand) |
| **Route Navigation** | Instant (Already in memory) | Brief fetch delay + Loading Spinner |

---

## 5. Developer Rules & Best Practices

1. **Route Components in `App.tsx`**: ALWAYS use `React.lazy()` for top-level page routes.
2. **Heavy / Rare Modals**: Use `React.lazy()` for heavy, rarely accessed modals (e.g. PDF Exporters, Rich Text Editors, Chart Analytics).
3. **Core UI Primitives**: NEVER use lazy loading for shared UI primitives (`Button`, `Badge`, `Card`, `Input`, `Sidebar`, `Header`). Keep these statically imported.
