# Pomysł produktu — Jobilot AI

## Jednozdaniowy opis

Jobilot AI to prywatny system zarządzania poszukiwaniem pracy, który łączy oferty, aplikacje, wersje CV, portfolio i notatki w jednym miejscu, a opcjonalne AI pomaga podejmować lepsze decyzje bez przejmowania kontroli nad danymi użytkownika.

## Problem

Osoba szukająca pracy korzysta zwykle z wielu kart przeglądarki, dokumentów CV, linków do portfolio i notatek. Z czasem traci odpowiedzi na pytania: do której firmy wysłano dane CV, na jakim etapie jest proces oraz co wymaga poprawy. Narzędzia AI pomagają pisać tekst, ale rzadko porządkują cały proces i mogą budzić uzasadnione obawy o prywatność dokumentów.

## Rozwiązanie

Centralnym elementem Jobilot AI jest **Application** — pojedyncza aplikacja do konkretnej oferty i firmy. Łączy ona ofertę pracy z wybraną, niezmienną wersją CV, wybranymi materiałami portfolio, listem motywacyjnym, notatkami, analizami AI oraz historią statusów.

Użytkownik ręcznie zapisuje interesujące oferty, tworzy z nich aplikacje i śledzi kolejne kroki. AI jest uruchamiane tylko na żądanie, po świadomej zgodzie, a wyniki są zapisywane wyłącznie wtedy, gdy użytkownik wyraźnie je zapisze.

## Wartość dla użytkownika

- Jedno wiarygodne źródło historii każdej aplikacji.
- Pewność, które CV i portfolio zostały wysłane.
- Przejrzysta oś czasu oraz historia zmian statusu, bez nadpisywania danych.
- Wsparcie AI przy analizie dopasowania CV i przygotowaniu listu motywacyjnego.
- Dwa tryby pracy: wygodny Cloud Mode i prywatny, offline-first Local Vault Mode.

## Persony

### Marta — junior frontend developer

Wysyła wiele aplikacji na podobne stanowiska. Potrzebuje różnych wersji CV i szybkiego porównania wymagań z umiejętnościami.

### Adam — osoba zmieniająca branżę

Buduje portfolio i potrzebuje zapanować nad materiałami wysłanymi do każdej firmy. Ceni notatki z rozmów oraz historię procesu.

### Ola — konsultantka dbająca o prywatność

Nie chce, by CV i historia rekrutacji opuszczały jej komputer. Wybiera Local Vault Mode bez konta, synchronizacji, telemetrii i funkcji AI.

## Zasady produktu

1. **Application first** — widok aplikacji jest głównym miejscem pracy użytkownika.
2. **Użytkownik decyduje** — AI proponuje, nie wysyła aplikacji, nie tworzy ofert ani nie zmienia statusów automatycznie.
3. **Privacy by default** — przechowujemy tylko dane konieczne; prywatne rozmowy i prompty AI nie są domyślnie zapisywane.
4. **Historia jest trwała** — nowe wersje dokumentów nie niszczą powiązań z wcześniejszymi aplikacjami.
5. **Dwa niezależne produkty, wspólne zasady** — Cloud i Local Vault są uruchamiane osobno. Mogą współdzielić modele domenowe i komponenty UI, ale nie dzielą granicy zaufania ani danych.

## Zakres MVP do 8 sierpnia 2026

MVP obejmuje dwa niezależne artefakty: Jobilot AI Cloud wdrożony na Vercel oraz instalowalny Jobilot AI Local Vault na Windows. Oba zarządzają CV, ofertami, aplikacjami, portfolio, notatkami i historią statusów. AI jest wyłącznie funkcją Cloud; AI Job Discovery i Interview Coach pozostają poza MVP.

## Proponowany stack

| Warstwa | Wybór | Uzasadnienie |
| --- | --- | --- |
| Cloud app | Next.js, TypeScript, App Router, Vercel | Nowoczesna aplikacja full-stack, endpointy serwerowe dla AI Gateway i automatyczne wdrożenia z GitHuba. |
| Interfejs | Tailwind CSS + komponenty dostępne przez shadcn/ui | Szybkie tworzenie spójnego i dostępnego UI. |
| Cloud Mode | Supabase: Auth, PostgreSQL, Storage, RLS | Szybkie, bezpieczne uwierzytelnianie i kontrola dostępu na poziomie danych. |
| Local Vault app | Tauri + React/TypeScript + SQLite | Instalowalna aplikacja desktopowa Windows; dane i pliki pozostają na komputerze użytkownika. |
| Walidacja | Zod + React Hook Form | Walidacja po stronie klienta i serwera. |
| AI Gateway | Route Handlers Next.js + OpenAI SDK | Klucze wyłącznie na serwerze, kontrola zgody, limitów i walidacji. |
| Testy | Vitest + Playwright | Testy logiki oraz kluczowych ścieżek użytkownika. |

Local Vault w MVP nie zapewnia automatycznej synchronizacji ani szyfrowanego backupu. Oferuje lokalne przechowywanie w SQLite, wyłączenie AI i brak zaplanowanych połączeń z dostawcami zewnętrznymi; eksport zaszyfrowany jest funkcją wersji 1.1.
