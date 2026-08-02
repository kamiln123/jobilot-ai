# Jobilot AI

[Polska wersja](README.md) · English version

Jobilot AI is a job-search management system with optional AI assistance. It brings job offers, applications, CV versions, portfolio materials, notes, and recruitment history into one private, user-controlled workspace.

## MVP goal

By 8 August 2026, Jobilot AI will deliver two portfolio products: the Jobilot AI Cloud web application and an installable Windows Jobilot AI Local Vault app. There is no in-app mode picker; they are independent applications. Both are centered on an **Application**: the complete record for one role at one company.

## Planned stack

- Next.js + TypeScript + Tailwind CSS + Vercel for Jobilot AI Cloud
- Supabase (Auth, PostgreSQL, Storage, Row Level Security) for Cloud
- Tauri + React/TypeScript + SQLite for the Local Vault desktop app
- Zod and React Hook Form for validation
- Next.js Route Handlers as an AI Gateway for OpenAI
- Vitest and Playwright for testing

## MVP features

- CV library with versioning and an immutable CV snapshot on each Application.
- Manual job-offer capture and application creation.
- Portfolio files or links, with multiple artifacts per Application.
- Statuses, immutable status history, and notes.
- Cloud Mode with accounts and isolated user data.
- Local Vault as a separate Windows app with no account, sync, AI, telemetry, or external-service communication.
- Optional CV/job analysis and cover-letter generation after explicit AI consent.

## Documentation

- [Product idea](docs/PRODUCT-IDEA.md)
- [PRD](docs/PRD.md)
- [Roadmap](docs/ROADMAP.md)
- [User stories](docs/USER-STORIES.md)

## Configuration security

1. Copy `.env.example` to `.env.local`.
2. Add personal values only to `.env.local`.
3. Never commit `.env.local`, provider keys, tokens, CV files, or Local Vault data.

[`.env.example`](.env.example) is intentionally a values-free template. `.gitignore` excludes environment files and user data.

> `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, and `GEMINI_API_KEY` are server-only secrets. Never prefix them with `NEXT_PUBLIC_` or expose them to the browser.

## Privacy principles

- AI is optional and available only in Cloud Mode.
- The frontend never talks directly to OpenAI or Gemini.
- AI prompts and draft responses are not stored by default.
- A user may explicitly save a final analysis or cover letter to an Application.
- Local Vault makes no user-data-related network requests.

## Status

Product definition and documentation phase. Implementation will start with the application foundation, data model, and security controls for both Cloud Mode and Local Vault Mode.
