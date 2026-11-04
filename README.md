# chatflow-agent-web

Official multilingual documentation platform and web portal for [**`chatflow-agent`**](https://github.com/GustavoBaranda/chatflow-agent), the lightweight, contextual Python framework for orchestrating conversational AI agents, stateful multi-agent workflows, and channel integrations.

---

## Overview

`chatflow-agent-web` provides developer documentation, architecture deep dives, runnable code examples, and versioned API references for the `chatflow-agent` Python ecosystem.

The platform is engineered with modern full-stack standards:
- **Strict Version Isolation:** Distinct documentation tracks for the stable baseline (`v0.3.4`) and upcoming prerelease functionality (`v0.4.0rc1`).
- **Native Multilingual Parity:** 100% topic and code block parity across three launch languages: English (`en`, authoritative source), Spanish (`es`), and Brazilian Portuguese (`pt-BR`).
- **Automated SDK Parity & AST Validation:** Every code snippet is validated against official published Python wheels from PyPI to prevent documentation rot and signature drift.
- **Search & Navigation Architecture:** Version-scoped full-text search powered by Fumadocs and isolated sidebar navigation trees.

> **Note on Deployment Status:** This repository is currently in local development and staging verification. The public production deployment and domain configuration are in progress.

---

## Supported SDK Versions & Documentation Tracks

| Documentation Track | SDK Release Baseline | Status | Indexability (SEO) | Architecture Focus |
| :--- | :--- | :---: | :---: | :--- |
| **`v0.3`** | `chatflow-agent==0.3.4` | **Stable** | `index, follow` | Synchronous runner loops, file-based SQLite stores, basic handoffs |
| **`v0.4`** | `chatflow-agent==0.4.0rc1` | **Prerelease** | `noindex, follow` | `async with runner:` context managers, `turn_timeout`, `ReentrantTurnError`, session locks |

---

## Supported Launch Languages

The platform adheres to a strict flagless, native naming convention to ensure international accessibility and prevent country-to-language conflation:

1. **English (`en`)** — The authoritative technical source of truth for all content, signatures, and UI strings.
2. **Español (`es`)** — Complete, idiomatic Spanish translation across all 42 versioned topics.
3. **Português do Brasil (`pt-BR`)** — Complete, idiomatic Brazilian Portuguese translation across all 42 versioned topics.

---

## Technology Stack

- **Framework:** [Next.js 16.4.3](https://nextjs.org/) (App Router, React Server Components first, `proxy.ts` routing)
- **Runtime & Library:** [React 19.3.1](https://react.dev/)
- **Documentation Engine:** [Fumadocs](https://fumadocs.vercel.app/) (`fumadocs-core 16.17.8`, `fumadocs-ui 16.17.8`, `fumadocs-mdx 15.4.10`)
- **Internationalization (i18n):** [next-intl 4.14.9](https://next-intl.dev/) (Request-based locale detection, compile-time message catalogs)
- **Styling & Design System:** [Tailwind CSS v4.3.3](https://tailwindcss.com/) (CSS-first architecture via `@tailwindcss/postcss`)
- **Animations & Icons:** [Framer Motion 14.7.1](https://www.framer.com/motion/), [Lucide React 1.63.0](https://lucide.dev/)
- **Unit & Integration Testing:** [Vitest 5.0.5](https://vitest.dev/) (417 automated unit and regression tests)
- **End-to-End Testing:** [Playwright 1.50.0](https://playwright.dev/) (105 browser integration tests)
- **Python AST Parity Validator:** Python 3.10+ isolated virtual environments validating syntax and execution against published PyPI wheels

---

## Prerequisites & System Requirements

Before running the project locally, verify the following dependencies:

| Tool | Required Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `>=20.18.0` (LTS) | Next.js server runtime and tooling |
| **pnpm** | `>=9.15.0` | Strict package manager and dependency resolution |
| **Python** | `>=3.10` | Python runtime for AST parity checks and SDK execution tests |

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/GustavoBaranda/chatflow-agent-web.git
cd chatflow-agent-web
```

### 2. Install Node Dependencies

```bash
pnpm install
```

### 3. Provision Isolated SDK Releases for Parity Testing

Download and verify the official PyPI wheels for SDK versions `0.3.4` and `0.4.0rc1`:

```bash
python scripts/ensure-sdk-releases.py --version all
```

This caches wheels in `.cache/sdk-wheels/` with cryptographic SHA-256 validation and configures isolated virtual environments in `.cache/sdk-venvs/`.

### 4. Start the Local Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The root path automatically redirects to your preferred or default locale (`/en`).

---

## Development & Quality Assurance Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start development server with Turbopack / Webpack |
| `pnpm build` | Generate Fumadocs content collections and compile production build (209 static routes) |
| `pnpm start` | Serve production build locally on port 3001 |
| `pnpm run lint` | Run ESLint across all source files |
| `pnpm run typecheck` | Run TypeScript type checking (`tsc --noEmit`) |
| `pnpm test` | Run 417 Vitest unit and regression tests |
| `pnpm run test:e2e` | Run 105 Playwright E2E browser tests (Chromium) |
| `pnpm run test:sdk:parity` | Validate documentation Python snippets against published SDK releases |
| `pnpm run check:i18n` | Verify UI message key completeness across all supported locales |
| `pnpm run check:links` | Audit internal documentation link and version consistency |
| `pnpm run check:topics` | Verify topic synchronization across all languages and version tracks |
| `pnpm run verify` | Full quality gate: runs lint, typecheck, i18n, links, topics, unit tests, and SDK parity |

---

## Documentation Architecture

```
content/docs/
├── en/                      # Authoritative English documentation baseline
│   ├── v0.3/                # Stable track (21 topics)
│   └── v0.4/                # Prerelease track (21 topics)
├── es/                      # Spanish translation
│   ├── v0.3/                # Stable track (21 topics)
│   └── v0.4/                # Prerelease track (21 topics)
└── pt-BR/                   # Brazilian Portuguese translation
    ├── v0.3/                # Stable track (21 topics)
    └── v0.4/                # Prerelease track (21 topics)
```

### Section Taxonomy (21 Topics per Track)
1. **Getting Started:** Overview (`index.mdx`), Installation, Quickstart, Core Concepts
2. **Core Architecture:** Agents, Runner Lifecycle, Tools, Sessions & State, Multi-Agent Handoffs
3. **Model Providers:** Providers Overview, OpenAI, Anthropic & Gemini, Ollama (Local)
4. **Integrations & Channels:** Webhook, Telegram, WhatsApp
5. **Production Patterns:** Configuration, Deployment, Observability, Security, Error Handling

---

## Versioning & Translation Policy

1. **Authoritative Source:** English documentation in `content/docs/en/` is the sole technical source of truth.
2. **Deterministic Fallback:** If a localized topic in `es` or `pt-BR` is missing, the router renders the authoritative English version, displays a `TranslationNotice` banner, and sets `<meta name="robots" content="noindex, follow" />` to safeguard SEO against duplicate English content on localized URLs.
3. **Canonical Versioning:** 
   - Stable documentation routes use explicit version prefixes (e.g., `/[locale]/docs/v0.3/guides/agents`).
   - Legacy unversioned paths (e.g., `/[locale]/docs/guides/agents`) automatically alias to the stable track and declare canonical URLs pointing to `/v0.3/`.
   - Prerelease `v0.4` routes are isolated and declare `robots: noindex, follow`.

---

## Relationship with the Python SDK

`chatflow-agent-web` is the dedicated documentation platform for the [`chatflow-agent`](https://github.com/GustavoBaranda/chatflow-agent) Python library.

- **Authoritative Python SDK Repository:** [https://github.com/GustavoBaranda/chatflow-agent](https://github.com/GustavoBaranda/chatflow-agent)
- **PyPI Package:** [`chatflow-agent`](https://pypi.org/project/chatflow-agent/)
- **Creator & Lead Maintainer:** [Gustavo Baranda](https://github.com/GustavoBaranda)

---

## Contributing

We welcome community contributions, bug reports, and translations! Please read our [**Contributing Guide**](CONTRIBUTING.md) for details on code style, commit conventions, and the pull request workflow.

---

## Security

For vulnerability reporting guidelines and supported version scope, please review our [**Security Policy**](SECURITY.md).

---

## License

The `chatflow-agent-web` website source code and documentation are released under the **MIT License**.

- **Copyright:** Copyright (c) 2026 Gustavo Baranda.
- **Full License Text:** Available in the root [`LICENSE`](LICENSE) file.
- **Python SDK Licensing:** The [`chatflow-agent`](https://github.com/GustavoBaranda/chatflow-agent) Python SDK is an independent project that is also released under the MIT License.
- **Brand & Identifiers:** The MIT License applies to the software and documentation source code and does not grant rights to use the `chatflow-agent` name, logos, or other brand identifiers in a manner that suggests official endorsement or affiliation.

