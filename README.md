# Jobilot AI

Polska wersja README · [English version](README.en.md)

Jobilot AI to system zarządzania poszukiwaniem pracy z opcjonalnym wsparciem AI. Łączy oferty pracy, aplikacje, wersje CV, portfolio, notatki oraz historię procesu rekrutacyjnego — z naciskiem na prywatność i kontrolę użytkownika nad danymi.

## Cel MVP

Do 8 sierpnia 2026 powstaną dwa działające produkty portfolio: aplikacja webowa Jobilot AI Cloud oraz instalowalny Jobilot AI Local Vault dla Windows. Nie wybiera się trybu po uruchomieniu — są to niezależne aplikacje. Centralnym elementem obu jest **Application**, czyli kompletna aplikacja do konkretnej firmy i stanowiska.

## Planowany stack

- Next.js + TypeScript + Tailwind CSS + Vercel dla Jobilot AI Cloud
- Supabase (Auth, PostgreSQL, Storage, Row Level Security) dla Cloud
- Tauri + React/TypeScript + SQLite dla aplikacji desktopowej Local Vault
- Zod i React Hook Form do walidacji
- Route Handlers Next.js jako AI Gateway do OpenAI
- Vitest i Playwright do testów

## Główne funkcje MVP

- Biblioteka CV z wersjonowaniem i snapshotem wersji użytej w Application.
- Ręczne dodawanie ofert pracy i tworzenie aplikacji.
- Portfolio jako pliki lub linki oraz przypisywanie wielu elementów do Application.
- Statusy, trwała historia zmian i notatki.
- Cloud Mode z kontem oraz odseparowanymi danymi użytkowników.
- Local Vault jako osobna aplikacja Windows bez konta, synchronizacji, AI, telemetrii i komunikacji z usługami zewnętrznymi.
- Opcjonalna analiza AI CV/oferty oraz generator listu motywacyjnego, po świadomej zgodzie użytkownika.

## Dokumentacja

- [Pomysł produktu](docs/PRODUCT-IDEA.md)
- [PRD](docs/PRD.md)
- [Roadmapa](docs/ROADMAP.md)
- [User stories](docs/USER-STORIES.md)

## Bezpieczeństwo konfiguracji

1. Skopiuj `.env.example` do `.env.local`.
2. Uzupełnij wartości wyłącznie w `.env.local`.
3. Nigdy nie commituj `.env.local`, kluczy dostawców, tokenów, plików CV ani danych Local Vault.

Plik [`.env.example`](.env.example) jest wyłącznie szablonem — celowo nie zawiera żadnych danych dostępowych. `.gitignore` wyklucza pliki środowiskowe oraz lokalne dane użytkownika.

> `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` i `GEMINI_API_KEY` są wyłącznie sekretami serwerowymi. Nie wolno używać dla nich prefiksu `NEXT_PUBLIC_` ani przesyłać ich do przeglądarki.

## Zasady prywatności

- AI jest opcjonalne i dostępne tylko w Cloud Mode.
- Frontend nie komunikuje się bezpośrednio z OpenAI ani Gemini.
- Prompty i robocze odpowiedzi AI nie są domyślnie zapisywane.
- Użytkownik może świadomie zapisać końcową analizę lub list motywacyjny do konkretnej Application.
- Local Vault nie wykonuje połączeń sieciowych związanych z danymi użytkownika.

## Status

Faza przygotowania produktu i dokumentacji. Implementacja rozpocznie się od fundamentów aplikacji, modelu danych oraz zabezpieczeń Cloud Mode i Local Vault Mode.
