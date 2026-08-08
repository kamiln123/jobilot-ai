# Finalne wyniki testów — Jobilot AI MVP

## Konwencja

- `PASS` — wynik zgodny z kryterium.
- `FAIL` — wykryto błąd wymagający poprawy i ponownego testu.
- `BLOCKED` — test czeka na zależność lub decyzję.
- Nie zapisujemy tu haseł, adresów e-mail, identyfikatorów rekordów ani prawdziwych danych rekrutacyjnych.

## 8 sierpnia 2026 — Cloud Mode, finalna walidacja interfejsu

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| UI-01 | PROD | PASS | Otwarto `/login`, `/about`, `/local-vault`, `/privacy-policy` i `/terms`. Wszystkie strony działają bez błędów 404/500, tekst jest po polsku i czytelny, a stopka jest widoczna. Strony Polityka prywatności i Regulamin pokazują wyłącznie zaakceptowaną informację o treści, która pojawi się wkrótce. |
| UI-02 | PROD | PASS | Stopka działa prawidłowo przed i po logowaniu. Linki do O projekcie, Local Vault, Polityki prywatności i Regulaminu otwierają właściwe strony; link autora otwiera GitHub w nowej karcie. Wersja MVP, autor i informacja o wersji demonstracyjnej są czytelne, a stopka nie zasłania treści. |
| UI-03 | PROD | PASS | Przełączanie między logowaniem a rejestracją działa. Walidacja e-maila blokuje brak `@` i nieprawidłową część domeny; hasło krótsze niż 8 znaków jest blokowane. Błędne hasło pokazuje bezpieczny polski komunikat. Poprawne dane otwierają pulpit, a wylogowanie wraca do logowania. Bezpośrednie wejście na `/applications` po wylogowaniu może krótko pokazać pusty stan ładowania, następnie przekierowuje do logowania bez ujawnienia danych. |
| UI-04 | PROD | PASS | Wspólny panel Cloud Mode pozostaje dostępny na ekranach list, formularzy i szczegółów. Oznacza aktywną sekcję, logo prowadzi do pulpitu, a widok mobilny zachowuje kompaktową poziomą nawigację. Nagłówki, przyciski, marginesy i szerokość list oraz formularzy zostały ujednolicone. Panel AI działa po wyrażeniu zgody dla konkretnej aplikacji na ofertę pracy; wycofanie i ponowne nadanie zgody potwierdzono ręcznie. |
| JOB-EDIT-01 | PROD | PASS | Szczegóły oferty otwierają edycję z wczytanymi danymi. Zmiana syntetycznego pola zapisuje się, pozostaje po odświeżeniu i aktualizuje nazwę w powiązanej Application bez tworzenia duplikatu. Anulowanie edycji nie zapisuje ostatniej zmiany. |
| UI-05 | PROD | PASS | Pulpit otwiera się poprawnie. Liczniki aplikacji, dokumentów CV i portfolio odpowiadają zakładkom; licznik CV oznacza dokumenty, a nie sumę ich wersji. Oba komunikaty AI są spójne, karta prowadząca do Aplikacji działa, oznaczenie aktywnej pozycji nawigacji aktualizuje się, a liczniki nie zmieniają się bez operacji na danych. |
| UI-13 | PREVIEW | PASS | Widok responsywny zachowuje czytelność bez poziomego przewijania, uciętych tekstów, nakładających się elementów i niewidocznych przycisków. Długie nazwy wersji CV łamią się, a akcja pobrania pozostaje dostępna. |
| UI-06 | PROD | PASS | Formularz oferty poprawnie waliduje wymagane pola i wynagrodzenie. Ostrzeżenia dotyczące niepełnego lub niebezpiecznego adresu nie blokują zapisu tekstu, a adres źródłowy nie jest prezentowany jako klikalny w szczegółach. |
| UI-07 | PROD | PASS | Szczegóły i edycja oferty działają: zapis pozostaje po odświeżeniu i aktualizuje powiązaną aplikację, a anulowanie nie zapisuje zmian. |
| UI-08 | PROD | PASS | Biblioteka CV blokuje format inny niż PDF oraz pliki większe niż 5 MB. Nowe wersje i opis pozostają rozdzielone od v1, a każdy zapisany PDF można bezpiecznie pobrać. |
| UI-09 | PROD | PASS | Portfolio można dodać, otworzyć w szczegółach i edytować. Zmiany pozostają po odświeżeniu, a link otwiera się wyłącznie po kliknięciu tekstu. |
| UI-10 | PROD | PASS | Formularz Application pokazuje dane należące do użytkownika, pozwala wybrać konkretną wersję CV i portfolio oraz blokuje drugą aktywną aplikację do tej samej oferty. |
| UI-11 | PROD | PASS | Szczegóły Application pokazują wersję CV, portfolio i pełne dane oferty. Status, data wysłania, historia i notatki pozostają po odświeżeniu. |
| UI-12 | PROD | PASS | Zgoda AI jest wymagana przed wysłaniem danych. Niezapisane wyniki znikają po odświeżeniu, zapisane analiza i list motywacyjny pozostają, a wycofanie zgody blokuje kolejne użycie AI bez usuwania zapisanych rezultatów. Testy limitu i braku żądania do dostawcy po wyczerpaniu limitu przeszły. |
| UI-14 | PROD | PASS | Regresja po ostatnich wdrożeniach: strony publiczne, stopka, nawigacja, dane case study, anulowanie formularzy i panel AI działają prawidłowo. Local Vault prowadzi do strony O projekcie. |

## 8 sierpnia 2026 — Cloud Mode, ręczny test RLS z drugim kontem

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| RLS-01 | PROD | PASS | Konto B po zalogowaniu widzi puste listy i pulpit bez danych konta A. Konto B zapisało własną syntetyczną ofertę i widzi ją po odświeżeniu; konto A nie widzi tej oferty. |
| RLS-02 | PROD | PASS | Bezpośrednie adresy szczegółów oferty i aplikacji konta A otwarte w sesji konta B nie ujawniają danych. Pokazują bezpieczne komunikaty braku dostępu, a odpowiedź danych jest pusta (`[]`). |
| RLS-03 | PROD | PASS | Bezpośredni adres szczegółów portfolio konta B otwarty w sesji konta A pokazuje bezpieczny komunikat braku dostępu i nie ujawnia tytułu, opisu ani linku. |

## 8 sierpnia 2026 — Cloud Mode, case study danych testowych

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| CASE-01 | PROD | PASS | Na koncie B zapisano ofertę testową, dokument CV z wersjami v1 i v2 oraz portfolio. Utworzona aplikacja rekrutacyjna poprawnie wiąże ofertę, CV v2 i portfolio. Zmiana statusu na „Wysłana” oraz notatka z datą i godziną pozostają po odświeżeniu; pulpit aktualizuje liczniki. Nie uruchamiano AI dla oferty zawierającej treść pochodzącą z ogłoszenia. |
