# Supabase — konfiguracja Cloud Mode

## Zasada bezpieczeństwa

Do Git trafia tylko migracja i `.env.example`. Nigdy nie zapisujemy w repozytorium `.env.local`, hasła bazy, `SUPABASE_SERVICE_ROLE_KEY` ani tokenów osobistych.

## 1. Zastosowanie migracji

1. W panelu projektu `jobilot-ai` otwórz **SQL Editor**.
2. Utwórz nowy zapytanie SQL.
3. Wklej całą zawartość pliku [`../supabase/migrations/20260802194000_initial_schema.sql`](../supabase/migrations/20260802194000_initial_schema.sql).
4. Uruchom zapytanie przyciskiem **Run**.
5. W **Table Editor** sprawdź, czy widoczne są tabele `job_offers`, `applications`, `cv_documents` i `application_status_history`.
6. W **Storage** sprawdź bucket `cv-files`; jego widoczność musi pozostać **Private**.

## 2. Co zapewnia migracja

- Każdy rekord ma właściciela powiązanego z `auth.users`.
- Row Level Security ogranicza odczyt i zapis do `auth.uid()`.
- CV mogą być wyłącznie PDF i maksymalnie 5 MB.
- Obiekt w Storage musi zaczynać się od identyfikatora właściciela, np. `USER_ID/cv/VERSION_ID.pdf`.
- Application nie może wskazywać oferty, CV ani portfolio innego użytkownika.
- Historia statusów jest tylko do odczytu i dopisywania — nie można jej zmienić ani usunąć bezpośrednio z klienta.
- Tabela limitów AI nie ma polityki klienckiej; późniejszy AI Gateway będzie zarządzać nią po stronie serwera.

## 3. Sprawdzenie RLS

Po wdrożeniu utwórz dwa konta testowe w Cloud Mode. Dane utworzone przez pierwsze konto nie mogą być widoczne ani modyfikowalne przez drugie konto.

## 4. Następny krok

Po udanym uruchomieniu migracji dodamy do Next.js klienta Supabase, ekran logowania oraz pierwszy formularz ręcznego dodawania Job Offer.
