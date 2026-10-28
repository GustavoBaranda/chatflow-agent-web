# Operational Guidelines for AI Agents

**Project:** `chatflow-agent-web`  
**Purpose:** Instructions, safety boundaries, and development protocols for AI assistants working in this repository.  
**Authoritative Python SDK Source:** [https://github.com/GustavoBaranda/chatflow-agent](https://github.com/GustavoBaranda/chatflow-agent)  
**Authoritative Language:** English (All code, comments, documentation, and commit messages must be in English. User communication in Spanish).  

---

## 1. Absolute Operational Directives

### 1.1 Exclusively Local Development Boundary
* **No Remote Operations:** You are strictly forbidden from creating remote repositories, setting Git remotes, pushing code (`git push`), deploying to Vercel/Cloudflare, publishing npm packages, or creating remote GitHub releases.
* **No Network Publishing:** Do not interact with production services or initiate cloud provisioning.
* **Zero Secret Leakage:** Never generate, commit, or print secrets, tokens, API keys, or credentials into source files, transcripts, or `.env` files.

### 1.2 Phase Gate Enforcement
* **Sequential Execution:** The project is organized into strictly governed phases (Phase 0 to Phase 8) documented in `PROJECT_PLAN.md`.
* **Explicit Approval Required:** Never advance from one phase to the next without explicit confirmation and approval from the user.
* **Scope Discipline:** Complete only the deliverables defined for the active phase. Do not jump ahead or write code intended for future phases prematurely.
* **Playwright Boundary:** The interactive playground is purely an architectural possibility. Never create playground components, runtimes, or dependencies during the initial development phases.

### 1.3 Communication Language
* All source code, variables, functions, CSS classes, comments, repository policies, and technical documentation files (`.md`, `.mdx`, `.ts`, `.json`) must be written in **English**.
* All direct conversational responses and explanations to the user must be delivered in **Spanish** (`respondeme en español`).

---

## 2. Technical Standards & Code Quality

### 2.1 Package Manager & Tooling
* Always use **`pnpm`** as the package manager (`pnpm install`, `pnpm add`, `pnpm run <script>`).
* Respect the pinned toolchain in `package.json` (`node >= 20.18.0`, `pnpm >= 9.15.0`).

### 2.2 TypeScript & Type Safety
* All code must use strict TypeScript (`strict: true` in `tsconfig.json`).
* Do not use `any`. Use `unknown` with type narrowing, Discriminated Unions, or Zod schemas.
* Explicitly type exported functions, component props, and API handlers.
* Ensure all MDX frontmatter parses through Zod schema validation.

### 2.3 Next.js 15 & React 19 Architecture
* **Server Components First:** Default all components in `src/app/` and `src/components/` to React Server Components (RSC). Only mark components with `'use client'` when they require interactivity, event listeners, React hooks (`useState`, `useEffect`), or browser APIs.
* **Asynchronous Route Parameters:** Next.js 15 treats `params` as a Promise. Always await `params` in layouts and pages:
  ```tsx
  const { locale, slug } = await params;
  setRequestLocale(locale);
  ```
* **Styling with Tailwind CSS v4:** Use Tailwind v4's CSS-first architecture (`app/globals.css`). Avoid legacy `tailwind.config.js` or inline CSS styles.
* **Component Organization:**
  * `src/components/ui/`: Atomic, reusable UI primitives.
  * `src/components/navigation/`: Header, Footer, LanguageSelector, MobileDrawer.
  * `src/components/landing/`: Homepage sections.
  * `src/components/docs/`: Custom MDX components, TranslationNotice, OutdatedNotice.
  * `src/components/playground/`: **RESERVED BOUNDARY ONLY** (Do not populate in initial phases).

### 2.4 Internationalization (i18n) & SEO Rules
* **Never Hardcode Text:** Never insert raw English or Spanish text directly into React JSX/TSX components.
* **Explicit Route Prefixes:** All routes must contain explicit language prefixes (`/en/...`, `/es/...`).
* **Two Separate Translation Domains:**
  1. **UI Chrome Strings:** Use `next-intl` hooks (`useTranslations`) and message catalogs in `messages/[locale].json`.
  2. **Technical Documentation:** Maintain distinct MDX source trees in `content/docs/[locale]/`.
* **Deterministic Fallback & SEO Policy:**
  * When a requested page in a localized language (e.g., `es`) does not exist:
    1. Render the authoritative English version.
    2. Display the `TranslationNotice` banner clearly stating that the page is in English.
    3. Set `<meta name="robots" content="noindex, follow" />` on the fallback page to prevent search engines from indexing English duplicate content on a Spanish URL.
    4. Do not include missing language routes in `hreflang` tags or `sitemap.xml`.
  * Never render a broken route, empty layout, or silent 404 for existing authoritative content.
* **Outdated Translation Handling:**
  * Localized MDX frontmatter must track `sourceRevision` and `sourceHash`.
  * If the English original changes, render the `OutdatedNotice` banner to alert the user.

---

## 3. Python SDK Accuracy Protocol

> **CRITICAL RULE:** Never invent, hallucinate, or assume Python SDK APIs, method signatures, parameter names, or architectural features.

1. **Authoritative Source:** Every code example, guide, and API reference must be validated against published, verifiable releases of [https://github.com/GustavoBaranda/chatflow-agent](https://github.com/GustavoBaranda/chatflow-agent).
2. **Ambiguity Resolution:** If the exact signature or behavior of a `chatflow-agent` Python feature is unknown, pause and ask the user for clarification or consult the verified reference manifest rather than guessing.
3. **Runnable Snippets:** All Python code blocks in documentation must represent syntactically valid Python code compatible with Python `>=3.10`.

---

## 4. Local Git & Commit Standards

When Phase 1 initiates and local Git commits are permitted:
1. **Granular Commits:** Make small, atomic, and descriptive local commits. Each commit must address a single responsibility.
2. **Conventional Commits Specification:** Format all commit messages in English according to the Conventional Commits format:
   - `feat(i18n): implement explicit locale prefixes and fallback SEO rules`
   - `fix(nav): correct mobile drawer focus trapping`
   - `docs(quick-start): add installation guide verified with sdk v0.1`
   - `chore(tooling): configure pnpm, vitest, and playwright test runners`
3. **No Secret Commits:** Ensure `.gitignore` ignores `.env*`, `.next/`, `node_modules/`, `coverage/`, and OS temporary files.

---

## 5. Verification Checklist Before Marking Steps Complete

Before asking the user to review deliverables or requesting approval to advance to the next phase, verify:
* `pnpm run lint` (ESLint passes with 0 errors and 0 warnings).
* `pnpm run typecheck` (TypeScript compiles with 0 errors).
* `pnpm run test` (Vitest unit tests pass).
* `pnpm run test:e2e` (Playwright E2E tests pass).
* `pnpm run check:i18n` (No missing translation keys between language files).
* `pnpm run check:translations` (Audit translation states: up to date, outdated, missing).
* Verify that only files permitted for the current phase have been modified or created.
