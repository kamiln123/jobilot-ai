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
7. Przy kolejnych zmianach uruchamiaj nowe migracje w kolejności ich nazw. Dla modułu Application uruchom również [`../supabase/migrations/20260805120000_create_application_with_portfolio.sql`](../supabase/migrations/20260805120000_create_application_with_portfolio.sql). Ta migracja dodaje bezpieczną, atomową funkcję zapisu Application.

## 2. Co zapewnia migracja

- Każdy rekord ma właściciela powiązanego z `auth.users`.
- Row Level Security ogranicza odczyt i zapis do `auth.uid()`.
- CV mogą być wyłącznie PDF i maksymalnie 5 MB.
- Obiekt w Storage musi zaczynać się od identyfikatora właściciela, np. `USER_ID/cv/VERSION_ID.pdf`.
- Application nie może wskazywać oferty, CV ani portfolio innego użytkownika.
- Snapshot nazwy pliku, numeru wersji i checksumy CV jest wyprowadzany w bazie, nie przekazywany przez przeglądarkę.
- Application oraz przypisane portfolio zapisują się atomowo: przy błędzie nie powstaje częściowy rekord.
- Historia statusów jest tylko do odczytu i dopisywania — nie można jej zmienić ani usunąć bezpośrednio z klienta.
- Tabela limitów AI nie ma polityki klienckiej; późniejszy AI Gateway będzie zarządzać nią po stronie serwera.

## 3. Sprawdzenie RLS

Po wdrożeniu utwórz dwa konta testowe w Cloud Mode. Dane utworzone przez pierwsze konto nie mogą być widoczne ani modyfikowalne przez drugie konto.

## 4. Dalsze migracje

Nie uruchamiaj ponownie migracji początkowej w projekcie, który już ją ma. Wykonuj tylko nowe pliki migracji, zaczynając od najniższego znacznika czasu.
