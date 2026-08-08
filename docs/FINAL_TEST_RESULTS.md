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
| UI-04 | PROD | FAIL → poprawka weryfikowana | Logo działało poprawnie w pozostałych głównych sekcjach, ale ekran Portfolio używał starszego linku „Pulpit” bez logo. Ujednolicono nagłówek Portfolio; test końcowy nastąpi na Preview przed oznaczeniem PASS. |
