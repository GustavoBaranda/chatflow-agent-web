# Contributing to chatflow-agent-web

Thank you for your interest in contributing to **chatflow-agent-web**, the official multilingual website and documentation platform for [`chatflow-agent`](https://github.com/GustavoBaranda/chatflow-agent).

---

## 1. Project Leadership & Community

* **Creator & Lead Maintainer:** **Gustavo Baranda** ([@GustavoBaranda](https://github.com/GustavoBaranda)).
* **Community Contributors:** We warmly welcome contributions, bug reports, and translations from the global open-source community. Every contribution helps make conversational agent development more accessible to developers worldwide.

---

## 2. Multilingual Architecture & Adding Languages

`chatflow-agent-web` is built to be dynamically extensible without requiring rewrites or hardcoded routing changes when adding new languages.

### Launch Languages
* **English (`en`):** The authoritative source of truth for all content, documentation, and UI strings.
* **Español (`es`):** Launch-supported translation.
* **Português do Brasil (`pt-BR`):** Launch-supported translation.

### Flagless Native Language Policy
The user interface renders native language names (`English`, `Español`, `Português (Brasil)`) rather than emoji flags. This avoids country-to-language conflation, respects linguistic diversity across borders, and guarantees consistent, accessible rendering across operating systems and screen readers.

### Step-by-Step Guide: Adding a New Language

1. **Register the Language in Configuration:**
   Add the new locale to `SUPPORTED_LANGUAGES` in `src/config/languages.ts`:
   ```ts
   {
     code: 'fr',
     name: 'French',
     localName: 'Français',
     direction: 'ltr',
   }
   ```
   The routing matrix (`src/i18n/routing.ts`), SEO metadata, and language selectors dynamically inherit from this list.

2. **Create the UI Message Catalog:**
   Create `messages/<locale>.json` (e.g., `messages/fr.json`). Ensure 100% key parity with `messages/en.json`.

3. **Verify Translation Completeness:**
   Run the automated audit script:
   ```bash
   pnpm run check:i18n
   ```
   This will verify that all JSON keys exist and report any missing or empty entries.

4. **Translate Documentation (when doc engine is active):**
   - Create documentation pages in `content/docs/<locale>/` mirroring the structure in `content/docs/en/`.
   - Include `sourceRevision` (Git commit SHA of the English document) and `sourceHash` (SHA-256 of the authoritative English MDX file) in the frontmatter:
     ```yaml
     ---
     title: "Guide de démarrage"
     description: "Construisez votre premier agent conversationnel en 5 minutes."
     sourceRevision: "abc1234"
     sourceHash: "sha256:..."
     ---
     ```

---

## 3. Development Workflow & Quality Gates

### Prerequisites
* **Node.js:** `>=20.19.0` (LTS)
* **Package Manager:** `pnpm` `>=9.15.0`

### Local Development Commands
```bash
# Install dependencies
pnpm install

# Start local development server
pnpm dev

# Run quality checks (lint, typecheck, unit tests, links, parity)
pnpm run verify

# Audit translation completeness
pnpm run check:i18n

# Audit documentation link and version consistency
pnpm run check:links

# Verify topic synchronization across languages
pnpm run check:topics

# Validate Python snippets against published SDK releases
pnpm run test:sdk:parity

# Run Playwright end-to-end tests
pnpm run test:e2e

# Build for production
pnpm run build
```

### Commit Guidelines
* All commits must use the **Conventional Commits** specification in English (`feat:`, `fix:`, `docs:`, `test:`, `ci:`, `refactor:`, `chore:`).
* Make granular, atomic commits grouped strictly by responsibility.
* Ensure all verification checks (`pnpm run verify`, `pnpm run check:i18n`) pass cleanly before committing.
