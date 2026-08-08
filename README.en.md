# Jobilot AI

> Portfolio project · MVP completed · use test data only

[![Status](https://img.shields.io/badge/status-MVP%20completed-2d5034?style=flat-square)](docs/FINAL_TEST_RESULTS.md)
[![Cloud](https://img.shields.io/badge/Cloud-Vercel-000000?style=flat-square)](https://jobilot-ai-cloud.vercel.app)
[![Local Vault](https://img.shields.io/badge/Local%20Vault-Windows-2d5034?style=flat-square)](https://jobilot-ai-cloud.vercel.app/local-vault)
[![License](https://img.shields.io/badge/license-MIT-315b3a?style=flat-square)](LICENSE)

[Polska wersja](README.md) · [Cloud Mode](https://jobilot-ai-cloud.vercel.app) · [Download Local Vault](https://jobilot-ai-cloud.vercel.app/local-vault) · [Documentation](#documentation)

Jobilot AI is a job-search management system with optional AI assistance. It connects job offers, applications, CV versions, portfolio items, notes, and status history in one place. It was built as a working portfolio application with a strong focus on privacy, security, and user control over data.

## Why it exists

During a job search, it is easy to lose track of which CV, portfolio, and materials were sent to a given company. Jobilot AI keeps that context around an **application**: one job offer connected to a selected CV version, portfolio, status, notes, and optional AI results.

## Two independent products

| Product | Purpose | Data and AI |
| --- | --- | --- |
| [Cloud Mode](https://jobilot-ai-cloud.vercel.app) | A convenient, signed-in web application. | Supabase, user isolation through RLS, optional AI after consent. |
| [Local Vault](https://jobilot-ai-cloud.vercel.app/local-vault) | A local Windows application. | No account, sync, telemetry, or AI features. |

There is no in-app mode selector: Cloud Mode and Local Vault are separate applications.

## MVP highlights

- manual job-offer capture with validation;
- PDF CV library, versioning, and secure download of every version;
- portfolio links with details and editing;
- applications that connect an offer, one CV version, and multiple portfolio items;
- statuses, durable status history, sent date, and notes;
- prevention of a second active application for the same offer;
- an AI Gateway for CV/job analysis and cover-letter generation after explicit consent;
- Local Vault with local SQLite data, device-only files, and JSON export.

## Security and privacy

- Each Cloud Mode user can access only their own data; RLS was manually tested with two accounts.
- CV files are private and use short-lived signed URLs for download.
- AI provider keys stay on the server. The frontend never contacts the provider directly.
- AI is disabled until explicit consent for a specific application. Prompts and draft answers are not stored by default.
- The MVP AI provider is `gemini-3-flash-preview` in the Free Tier. The interface warns that Google may use submitted content to improve its products. OpenAI remains a planned provider behind the same AI Gateway.

> The public deployment is a portfolio demonstration. Do not use real personal data or confidential documents.

## Technology

- **Cloud:** Next.js, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL/Storage/RLS, Vercel.
- **Local Vault:** Tauri, React, TypeScript, SQLite, Vite.
- **AI:** Next.js Route Handlers as an AI Gateway, Google Gemini in the MVP.
- **Quality:** ESLint, TypeScript, and manual UI, RLS, and case-study scenarios.

## Run locally

### Cloud Mode

Node.js, a Supabase project, and local environment values are required.

```powershell
git clone https://github.com/kamiln123/jobilot-ai.git
cd jobilot-ai/apps/cloud
Copy-Item .env.example .env.local
npm install
npm run dev
```

Add your Supabase values to `.env.local`. The schema and migrations are in [`supabase/migrations`](supabase/migrations); setup instructions are in [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

### Local Vault

Node.js, Rust, and the Windows prerequisites required by Tauri are needed for development.

```powershell
cd jobilot-ai/apps/local
npm install
npm run tauri dev
```

Node.js, Rust, and Tauri are not needed to use Local Vault normally; use the [Windows installer](https://jobilot-ai-cloud.vercel.app/local-vault).

## Tests and MVP result

```powershell
cd apps/cloud
npm run lint
npx tsc --noEmit
npm run build
```

The final results cover user-interface tests, RLS with a second account, and a case-study scenario. Every documented MVP criterion passed: [test results](docs/FINAL_TEST_RESULTS.md).

## Documentation

- [Product idea](docs/PRODUCT-IDEA.md)
- [PRD](docs/PRD.md)
- [Roadmap](docs/ROADMAP.md)
- [User stories](docs/USER-STORIES.md)
- [Test plan](docs/FINAL_TEST_PLAN.md)
- [Test results](docs/FINAL_TEST_RESULTS.md)
- [Supabase setup](docs/SUPABASE_SETUP.md)

## Next versions

### Version 1.1

- a complete privacy policy and terms;
- a synthetic-data demo mode;
- certificates and training with files, downloads, and links;
- `.docx` CV support;
- light and dark themes;
- AI Job Discovery.

### Version 2.0

- an Interview Coach with simulated job interviews;
- text and voice answers;
- answer scoring, strengths, and improvement areas;
- a final report with recommendations.

## Author and license

Author: [Kamil Napora](https://github.com/kamiln123)

License: [MIT](LICENSE)
