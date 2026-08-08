# Jobilot AI

> Projekt portfolio · MVP ukończone · używaj wyłącznie danych testowych

[![Status](https://img.shields.io/badge/status-MVP%20completed-2d5034?style=flat-square)](docs/FINAL_TEST_RESULTS.md)
[![Cloud](https://img.shields.io/badge/Cloud-Vercel-000000?style=flat-square)](https://jobilot-ai-cloud.vercel.app)
[![Local Vault](https://img.shields.io/badge/Local%20Vault-Windows-2d5034?style=flat-square)](https://jobilot-ai-cloud.vercel.app/local-vault)
[![License](https://img.shields.io/badge/license-MIT-315b3a?style=flat-square)](LICENSE)

[English version](README.en.md) · [Cloud Mode](https://jobilot-ai-cloud.vercel.app) · [Pobierz Local Vault](https://jobilot-ai-cloud.vercel.app/local-vault) · [Dokumentacja](#dokumentacja)

Jobilot AI to system zarządzania poszukiwaniem pracy z opcjonalnym wsparciem AI. Łączy oferty pracy, aplikacje rekrutacyjne, wersje CV, portfolio, notatki i historię statusów w jednym miejscu. Projekt został przygotowany jako działająca aplikacja portfolio z naciskiem na prywatność, bezpieczeństwo i kontrolę użytkownika nad danymi.

## Dlaczego powstał

W procesie rekrutacji trudno później ustalić, które CV, portfolio i materiały zostały wysłane do konkretnej firmy. Jobilot AI buduje ten kontekst wokół **aplikacji rekrutacyjnej** — połączenia oferty pracy, wybranej wersji CV, portfolio, statusu, notatek i opcjonalnych wyników AI.

## Dwa niezależne produkty

| Produkt | Zastosowanie | Dane i AI |
| --- | --- | --- |
| [Cloud Mode](https://jobilot-ai-cloud.vercel.app) | Wygodna aplikacja webowa dostępna po zalogowaniu. | Supabase, izolacja danych przez RLS, opcjonalne AI po zgodzie. |
| [Local Vault](https://jobilot-ai-cloud.vercel.app/local-vault) | Aplikacja Windows do pracy lokalnej. | Bez konta, synchronizacji, telemetrii i funkcji AI. |

Nie ma ekranu wyboru trybu po uruchomieniu — Cloud Mode i Local Vault są oddzielnymi aplikacjami.

## Najważniejsze funkcje MVP

- ręczne zapisywanie ofert pracy wraz z walidacją danych;
- biblioteka CV w PDF, wersjonowanie i bezpieczne pobieranie każdej wersji;
- portfolio jako linki, szczegóły i edycja;
- aplikacje rekrutacyjne łączące ofertę, konkretną wersję CV i wiele elementów portfolio;
- statusy, trwała historia zmian, data wysłania i notatki;
- blokada drugiej aktywnej aplikacji dla tej samej oferty;
- AI Gateway: analiza CV/oferty i generowanie listu motywacyjnego po świadomej zgodzie;
- Local Vault z lokalną bazą SQLite, plikami na urządzeniu i eksportem JSON.

## Bezpieczeństwo i prywatność

- Każdy użytkownik Cloud Mode widzi wyłącznie własne dane; mechanizm RLS został ręcznie przetestowany na dwóch kontach.
- Pliki CV są przechowywane prywatnie; pobieranie używa krótkotrwałych, podpisanych adresów.
- Klucze dostawców AI są wyłącznie po stronie serwera. Frontend nie komunikuje się bezpośrednio z dostawcą.
- AI jest wyłączone do czasu świadomej zgody dla konkretnej aplikacji rekrutacyjnej. Prompty i robocze odpowiedzi nie są domyślnie zapisywane.
- W MVP dostawcą wdrożeniowym AI jest `gemini-3-flash-preview` w wariancie Free Tier. Interfejs ostrzega, że Google może wykorzystywać przesłaną treść do ulepszania produktów. Docelowa zmiana dostawcy na OpenAI odbywa się za tym samym AI Gateway.

> Wersja publiczna służy demonstracji portfolio. Nie używaj prawdziwych danych osobowych ani poufnych dokumentów.

## Technologie

- **Cloud:** Next.js, TypeScript, Tailwind CSS, Supabase Auth/PostgreSQL/Storage/RLS, Vercel.
- **Local Vault:** Tauri, React, TypeScript, SQLite, Vite.
- **AI:** Next.js Route Handlers jako AI Gateway, Google Gemini w MVP.
- **Kontrola jakości:** ESLint, TypeScript, ręczne scenariusze UI, RLS i case study.

## Uruchomienie lokalne

### Cloud Mode

Wymagane są Node.js, projekt Supabase oraz wartości w lokalnym pliku środowiskowym.

```powershell
git clone https://github.com/kamiln123/jobilot-ai.git
cd jobilot-ai/apps/cloud
Copy-Item .env.example .env.local
npm install
npm run dev
```

Uzupełnij `.env.local` własnymi wartościami Supabase. Schemat i migracje znajdują się w [`supabase/migrations`](supabase/migrations), a instrukcja konfiguracji w [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

### Local Vault

Wymagane są Node.js, Rust oraz narzędzia wymagane przez Tauri dla Windows.

```powershell
cd jobilot-ai/apps/local
npm install
npm run tauri dev
```

Do zwykłego korzystania z Local Vault nie są potrzebne Node.js, Rust ani Tauri — wystarczy [instalator Windows](https://jobilot-ai-cloud.vercel.app/local-vault).

## Testy i wynik MVP

```powershell
cd apps/cloud
npm run lint
npx tsc --noEmit
npm run build
```

Końcowe wyniki obejmują testy interfejsu, RLS z drugim kontem oraz scenariusz case study. Wszystkie udokumentowane kryteria MVP mają status PASS: [wyniki testów](docs/FINAL_TEST_RESULTS.md).

## Dokumentacja

- [Pomysł produktu](docs/PRODUCT-IDEA.md)
- [PRD](docs/PRD.md)
- [Roadmapa](docs/ROADMAP.md)
- [User stories](docs/USER-STORIES.md)
- [Plan testów](docs/FINAL_TEST_PLAN.md)
- [Wyniki testów](docs/FINAL_TEST_RESULTS.md)
- [Konfiguracja Supabase](docs/SUPABASE_SETUP.md)

## Dalszy rozwój

### Wersja 1.1

- pełna polityka prywatności i regulamin;
- tryb demonstracyjny z danymi syntetycznymi;
- certyfikaty i szkolenia wraz z plikiem, pobieraniem i linkiem;
- obsługa CV w formacie `.docx`;
- motyw jasny i ciemny;
- AI Job Discovery.

### Wersja 2.0

- Interview Coach z symulacją rozmowy rekrutacyjnej;
- odpowiedzi tekstowe i głosowe;
- ocena odpowiedzi, wskazanie mocnych stron i obszarów do poprawy;
- raport końcowy z rekomendacjami.

## Autor i licencja

Autor: [Kamil Napora](https://github.com/kamiln123)

Licencja: [MIT](LICENSE)
