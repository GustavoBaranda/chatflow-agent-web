# Operational Guidelines for AI Agents

**Project:** `chatflow-agent-web`  
**Purpose:** Instructions, safety boundaries, and development protocols for AI assistants working in this repository.  
**Authoritative Python SDK Source:** [https://github.com/GustavoBaranda/chatflow-agent](https://github.com/GustavoBaranda/chatflow-agent)  
**Authoritative Language:** English (All code, comments, internal documentation, and commit messages must be in English. User communication in Spanish. Public localized content and MDX in their respective supported languages).  

---

## 1. Absolute Operational Directives

### 1.1 Exclusively Local Development Boundary
* **No Remote Operations:** You are strictly forbidden from creating remote repositories, setting Git remotes, pushing code (`git push`), deploying to Vercel/Cloudflare, publishing npm packages, or creating remote GitHub releases.
* **No Network Publishing:** Do not interact with production services or initiate cloud provisioning.
* **Zero Secret Leakage:** Never generate, commit, or print secrets, tokens, API keys, or credentials into source files, transcripts, or `.env` files.

### 1.2 Phase Gate Enforcement
* **Sequential Execution:** The project is organized into strictly governed phases documented in `PROJECT_PLAN.md`.
* **Explicit Approval Required:** Never advance from one phase to the next without explicit confirmation and approval from the user.
* **Scope Discipline:** Complete only the deliverables defined for the active phase. Do not jump ahead or write code intended for future phases prematurely.
* **Playwright Boundary:** The interactive playground is purely an architectural possibility. Never create playground components, runtimes, or dependencies during initial development phases.

### 1.3 Communication Language & Content Domains
* All source code, variables, functions, CSS classes, comments, repository policies, internal technical documentation (`ARCHITECTURE.md`, `PROJECT_PLAN.md`, `AGENTS.md`), and Git commit messages must be written in **English**.
* Public localized user interface strings and localized documentation (`content/docs/[locale]/`, `messages/[locale].json`) must be authored in their corresponding supported launch language (`en`, `es`, `pt-BR`).
* All direct conversational responses and explanations to the user must be delivered in **Spanish** (`respondeme en español`).

---

## 2. Technical Standards & Code Quality

### 2.1 Package Manager & Tooling
* Always use **`pnpm`** as the package manager (`pnpm install`, `pnpm add`, `pnpm run <script>`).
* Respect the pinned toolchain in `package.json` (`node >= 20.19.0`, `pnpm >= 9.15.0`).

### 2.2 TypeScript & Type Safety
* All code must use strict TypeScript (`strict: true` in `tsconfig.json`).
* Do not use `any`. Use `unknown` with type narrowing, Discriminated Unions, or Zod schemas.
* Explicitly type exported functions, component props, and API handlers.
* Ensure all MDX frontmatter parses through Zod schema validation.

### 2.3 Next.js 16.4.3 & React 19 Architecture
* **Server Components First:** Default all components in `src/app/` and `src/components/` to React Server Components (RSC). Only mark components with `'use client'` when they require interactivity, event listeners, React hooks (`useState`, `useEffect`), or browser APIs.
* **Asynchronous Route Parameters:** Next.js 16 treats `params` as a Promise. Always await `params` in layouts, pages, and dynamic route handlers:
  ```tsx
  const { locale, slug } = await params;
  setRequestLocale(locale);
  ```
* **Routing Conventions & Proxy:** Follow Next.js 16 conventions: use `src/proxy.ts` (the official Next.js 16 convention replacing legacy `middleware.ts`) for routing, locale handling, and request preprocessing.
* **Persistent Root Layout:** Preserve the persistent root layout architecture (`src/app/[locale]/layout.tsx`), maintaining context providers and navigation chrome integrity across page transitions.
* **Styling with Tailwind CSS v4:** Use Tailwind v4's CSS-first architecture (`app/globals.css`). Avoid legacy `tailwind.config.js` or inline CSS styles.
* **Component Organization:**
  * `src/components/ui/`: Atomic, reusable UI primitives.
  * `src/components/navigation/`: Header, Footer, LanguageSelector, MobileDrawer.
  * `src/components/landing/`: Homepage sections.
  * `src/components/docs/`: Custom MDX components, TranslationNotice, OutdatedNotice.
  * `src/components/playground/`: **RESERVED BOUNDARY ONLY** (Do not populate in initial phases).

### 2.4 Internationalization (i18n) Rules
* **Launch Languages:** The platform launches with three supported locales: English (`en`, authoritative source), Spanish (`es`, supported launch language), and Brazilian Portuguese (`pt-BR`, supported launch language).
* **Never Hardcode Text:** Never insert raw localized text directly into React JSX/TSX components.
* **Explicit Route Prefixes:** All routes must contain explicit language prefixes (`/en/...`, `/es/...`, `/pt-BR/...`).
* **Flagless Native Language Naming:** Language selection UI must display native language names (`English`, `Español`, `Português (Brasil)`) without emoji flags, ensuring accessibility across platforms and avoiding country-to-language conflation.
* **Two Separate Translation Domains:**
  1. **UI Chrome Strings:** Use `next-intl` hooks (`useTranslations`) and message catalogs in `messages/[locale].json`.
  2. **Technical Documentation:** Maintain distinct MDX source trees in `content/docs/[locale]/`.
* **Deterministic Fallback & SEO Protection:**
  * When a requested page in a localized language (e.g., `es` or `pt-BR`) does not exist:
    1. Render the authoritative English version.
    2. Display the `TranslationNotice` banner clearly stating that the page is in English.
    3. Set `<meta name="robots" content="noindex, follow" />` on the fallback page to prevent search engines from indexing English duplicate content on a localized URL.
    4. Do not include missing language routes in `hreflang` tags or `sitemap.xml`.
  * Never render a broken route, empty layout, or silent 404 for existing authoritative content.
* **Outdated Translation Handling:**
  * Localized MDX frontmatter must track `sourceRevision` and `sourceHash`.
  * If the English original changes, render the `OutdatedNotice` banner to alert the user.

---

## 3. SEO, Discoverability & Personal Branding Standards

### 3.1 Permanent Technical SEO Standards
* **Unique Metadata:** Every public page and MDX document must define a unique, descriptive SEO title and meta description tailored to its content and locale.
* **Canonical URLs & Hreflang:**
  * Generate absolute canonical URLs for every public page reflecting the authoritative locale and slug.
  * Provide bidirectional `hreflang` alternate tags for all three launch locales (`en`, `es`, `pt-BR`) and an explicit `x-default` pointing to the authoritative English route.
* **Accurate HTTP Status Codes:** Ensure semantic HTTP status responses at all times:
  * `200 OK` for valid public routes.
  * `404 Not Found` for unmapped or nonexistent routes.
  * `503 Service Unavailable` with a configurable `Retry-After` header when scheduled maintenance mode is active.
* **Robots & Sitemap:**
  * Localized `sitemap.xml` must only include existing, fully translated, canonical pages.
  * `robots.txt` must disallow internal assets and private paths while permitting full crawlability of public content.
  * Non-indexable pages (fallback English docs under localized URLs, maintenance mode, error boundaries) must explicitly set `<meta name="robots" content="noindex, follow" />` or `noindex, nofollow`.
* **Semantic HTML & Content Hierarchy:**
  * Exactly one `<h1>` per page reflecting the primary topic.
  * Clean, logical heading hierarchy (`<h2>`, `<h3>`, `<h4>`) without skipped levels.
  * Accessible, descriptive anchor text for internal linking (avoid generic "click here" or "learn more").
* **Structured Data (Schema.org):**
  * Include structured data markup based exclusively on verifiable, authentic information.
  * Use `SoftwareSourceCode` and `SoftwareApplication` for the library itself.
  * Use `Person` to identify the creator and lead maintainer, and `BreadcrumbList` for hierarchical documentation navigation.
  * Use `sameAs` exclusively for confirmed, official repository and profile links.
* **Content Quality & Anti-Patterns:**
  * Avoid keyword stuffing, thin content, and unverified technical claims.
  * Never invent SDK capabilities, benchmarks, stars, or download figures.
* **Core Web Vitals & Accessibility Targets:**
  * $\text{LCP} \le 1.2\text{ s}$, $\text{INP} \le 100\text{ ms}$, $\text{CLS} \le 0.05$.
  * Zero WCAG 2.1 AA contrast or keyboard navigation violations.

### 3.2 Personal Branding, Attribution & Author Identity
* **Creator Recognition:** Gustavo Baranda is recognized as the **Creator & Lead Maintainer** of `chatflow-agent`, with profile link to [https://github.com/GustavoBaranda](https://github.com/GustavoBaranda).
* **Community Contributions:** Celebrate and visibly attribute international open-source community contributions on About, Community, and governance documentation.
* **Ecosystem Consistency:** Maintain consistent naming, descriptions, and cross-references across:
  * Official documentation website: `chatflow-agent-web`.
  * Authoritative Python SDK repository: [https://github.com/GustavoBaranda/chatflow-agent](https://github.com/GustavoBaranda/chatflow-agent).
  * PyPI package listing: `chatflow-agent`.
  * Creator's professional portfolio: reciprocal links where appropriate.
* **Context-Appropriate SEO Emphasis:**
  * **Home & Docs:** Prioritize the framework, developer discovery, installation, and architectural capabilities.
  * **About & Institutional Pages:** Emphasize project origin, creator background, maintainer leadership, and community collaboration.
  * Never artificially repeat the creator's name in titles or meta descriptions of technical documentation pages.

---

## 4. Python SDK Accuracy Protocol

> **CRITICAL RULE:** Never invent, hallucinate, or assume Python SDK APIs, method signatures, parameter names, or architectural features.

1. **Authoritative Source:** Every code example, guide, and API reference must be validated against published, verifiable releases of [https://github.com/GustavoBaranda/chatflow-agent](https://github.com/GustavoBaranda/chatflow-agent).
2. **Ambiguity Resolution:** If the exact signature or behavior of a `chatflow-agent` Python feature is unknown, pause and ask the user for clarification or consult the verified reference manifest rather than guessing.
3. **Runnable Snippets:** All Python code blocks in documentation must represent syntactically valid Python code compatible with Python `>=3.10`.
4. **Version Baselines:** Take stable release `0.3.4` as the initial baseline, distinguishing `0.4.0rc1` as prerelease functionality.

---

## 5. Mandatory Version Control & Atomic Commit Policy

This policy is permanent and strictly governs all development across all phases of `chatflow-agent-web`:

### 5.1 Core Commit Rules
1. **Small, Atomic, and Specific Commits:** Make granular local commits grouped strictly by technical responsibility.
2. **No Monolithic Phase Commits:** Never bundle all changes of an entire phase into a single commit.
3. **Logical Work Units:** Each commit must represent a single, functionally coherent, and easily reviewable unit of work with a clearly identifiable purpose.
4. **Conventional Commits in English:** Format all commit messages in English using the Conventional Commits specification:
   - `feat(scope): description`
   - `fix(scope): description`
   - `refactor(scope): description`
   - `test(scope): description`
   - `docs(scope): description`
   - `chore(scope): description`
5. **Separation of Concerns:** Separate configuration, implementation, testing, documentation, and refactorings when they constitute independent responsibilities. Do not artificially fragment changes that are fundamentally inseparable.
6. **Pre-Commit Verification Workflow:** Before each commit:
   - Review `git status`.
   - Inspect staged changes via `git diff --staged`.
   - Run all relevant verification checks (`pnpm run verify`, `lint`, `typecheck`, etc.).
   - Confirm that only files directly related to the specific objective of the commit are included.
7. **Clean Staging:** Never include modifications outside the scope of the immediate unit of work.
8. **Zero AI Attribution Trailers:** Do NOT add `Co-Authored-By` trailers, automated tool signatures, or AI attribution markers to commit messages.
9. **Exclusively Local Commits:** Keep all commits strictly local.
10. **Zero Remote Operations:** Do NOT configure remotes, execute `git push`, open PRs, create releases, or deploy the site without explicit user authorization.
11. **History Preservation:** Do NOT rewrite, rebase, or amend previous commits without explicit authorization.

### 5.2 Mandatory Phase Completion Reporting
Before requesting authorization to advance to the next phase, present:
1. Summary of implemented features and deliverables.
2. List of local commits performed with short SHA-1 hashes.
3. Files included in each commit.
4. Tests and verifications executed (with output/results).
5. Output of `git status`.
6. Known issues and pending tasks.
7. Explicit confirmation that no remote operations were performed.
8. Strict phase gate enforcement: wait for explicit user authorization before proceeding.

---

## 6. Verification Checklist Before Marking Steps Complete

Before requesting phase review or approval to advance:
* `pnpm run lint` (ESLint passes with 0 errors and 0 warnings).
* `pnpm run typecheck` (TypeScript compiles with 0 errors).
* `pnpm run test` (Vitest unit tests pass).
* `pnpm run test:e2e` (Playwright E2E tests pass).
* `pnpm run check:i18n` (No missing translation keys between language files, when applicable).
* `pnpm run check:translations` (Audit translation states, when applicable).
* **SEO & Metadata Validation (for newly created or modified public pages):**
  * Unique page title and meta description defined.
  * Correct canonical URL and bidirectional `hreflang` alternates in place.
  * Clean semantic HTML heading hierarchy (single `<h1>`, logical subheadings).
  * Valid HTTP status code returned (`200` for public pages, `404` for unmapped paths, `503` with `Retry-After` during maintenance).
  * No broken internal links or hardcoded unlocalized URLs.
* Verify that only files permitted for the current phase have been modified or created.
* Review git log and staged state to ensure compliance with the Mandatory Version Control & Atomic Commit Policy.
