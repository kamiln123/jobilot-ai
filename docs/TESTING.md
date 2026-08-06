# Plan testów — Jobilot AI

## Zasady

- Nie zapisujemy w repozytorium haseł, kluczy API, adresów e-mail testowych ani danych z CV.
- Testy Cloud Mode prowadzimy na osobnych kontach testowych, nie na koncie produkcyjnym.
- Testy Local Vault wykonujemy bez połączenia z Supabase, OpenAI i Gemini.
- Każdy wynik trafia do `docs/TEST_RESULTS.md` z datą, środowiskiem i statusem.

## Środowiska

| Kod | Środowisko | Cel |
| --- | --- | --- |
| `LOCAL` | `http://localhost:3000` | szybka weryfikacja przed wdrożeniem |
| `PREVIEW` | Vercel Preview | kontrola przed produkcją |
| `PROD` | Vercel Production | końcowa demonstracja MVP |

## Testy krytyczne MVP

### AUTH — dostęp Cloud Mode

| ID | Scenariusz | Oczekiwany wynik |
| --- | --- | --- |
| AUTH-01 | Otwarcie pulpitu bez sesji | przekierowanie do `/login`; brak danych pulpitu |
| AUTH-02 | Rejestracja testowego konta | komunikat o potwierdzeniu e-mail; brak sekretów w UI |
| AUTH-03 | Potwierdzenie e-mail i logowanie | dostęp do chronionego pulpitu |
| AUTH-04 | Błędne hasło | bezpieczny komunikat bez ujawnienia danych konta |
| AUTH-05 | Wylogowanie | powrót do `/login`; ponowne wejście na `/` nie ujawnia pulpitu |
| AUTH-06 | Błędny format e-mail | przeglądarka blokuje wysłanie formularza przed żądaniem do Supabase |

### RLS — izolacja danych

| ID | Scenariusz | Oczekiwany wynik |
| --- | --- | --- |
| RLS-01 | Konto A zapisuje ofertę | oferta jest dostępna dla konta A |
| RLS-02 | Konto B otwiera własny pulpit | oferta konta A nie jest widoczna |
| RLS-03 | Próba odczytu zasobu innego użytkownika | Supabase odmawia dostępu |

### Dane rekrutacyjne

| ID | Scenariusz | Oczekiwany wynik |
| --- | --- | --- |
| DATA-00 | Pusta lista ofert | wyświetlony jasny stan pusty i przycisk dodania oferty |
| DATA-01A | Walidacja Job Offer | zapis bez firmy i stanowiska jest zablokowany |
| DATA-01B | Ręczne dodanie Job Offer | poprawne dane tworzą trwały zapis widoczny na liście |
| DATA-01C1 | Format wynagrodzenia | litery, zapis naukowy i więcej niż dwa miejsca dziesiętne są blokowane |
| DATA-01C2 | Spójność wynagrodzenia | gdy `do` jest niższe niż `od`, zapis jest zablokowany czytelnym komunikatem |
| DATA-01D | Ergonomia linku źródłowego | domena bez protokołu może zostać zapisana z nieblokującą sugestią `https://`; adres ze spacjami dostaje nieblokujący komunikat o nieklikalności; adresy inne niż HTTP(S) pozostają tekstem nieklikalnym |
| DATA-01E | Kolejność walidacji | przy kilku błędach użytkownik widzi wszystkie błędy pod polami w kolejności formularza |
| DATA-01F | Odświeżenie formularza | zachowanie niezapisanego formularza jest zgodne z podjętą decyzją produktową: reset albo lokalny szkic |
| DATA-02 | Szczegóły Job Offer | kliknięcie własnej oferty otwiera wszystkie zapisane dane; nieobsługiwany link nie jest klikalny |
| CV-01 | Pusta biblioteka CV | jasny stan pusty i możliwość dodania pierwszego CV |
| CV-02 | Dodanie CV PDF | plik PDF do 5 MB trafia do prywatnego storage i pojawia się jako wersja `v1` |
| CV-03 | Dodanie kolejnej wersji CV | kolejne numery wersji, brak nadpisania pierwszego pliku i metadanych |
| CV-04 | Walidacja pliku CV | plik inny niż PDF albo większy niż 5 MB nie jest wysyłany |
| CV-05 | Opis przy nowej wersji | wybór istniejącego dokumentu pokazuje jego opis; użytkownik może go zmienić, a po zapisie widzi nową wartość w bibliotece |
| CV-06 | Główny przycisk CV | w stanie pustym jest jeden, stale widoczny przycisk `Dodaj CV`; nie ma zduplikowanych CTA |
| CV-07 | Wybór fizycznego pliku CV | formularz ma wyraźny przycisk `Wybierz plik PDF`; po wyborze pokazuje nazwę pliku |
| PORT-01 | Dodanie elementu portfolio | link HTTP(S), typ i opcjonalny opis zapisują się oraz są widoczne tylko dla właściciela |
| PORT-02 | Walidacja linku portfolio | pusty, niepełny lub inny niż HTTP(S) adres nie jest zapisywany |
| PORT-03 | Zakres kliknięcia portfolio | tylko tekst bezpiecznego adresu jest klikalny; kliknięcie pozostałej części kafelka nie otwiera strony zewnętrznej |
| DATA-03 | Utworzenie Application | atomowy zapis własnej Job Offer, snapshotu CV, statusu początkowego i wybranego portfolio |
| DATA-03A | Routing Application | kliknięcie karty prowadzi do szczegółów po `applications.id`; identyfikator Job Offer nie może zastąpić identyfikatora Application w adresie |
| DATA-04 | Zmiana statusu Application | nowy wpis historii, brak nadpisania historii; ustawienie `applied` zapisuje datę wysłania |
| DATA-05 | Notatki Application | prywatna notatka zapisuje się tylko we własnej Application i pozostaje widoczna po odświeżeniu |
| DATA-06 | Duplikat Application | druga aktywna Application dla tej samej Job Offer jest zablokowana |

### Local Vault i AI

| ID | Scenariusz | Oczekiwany wynik |
| --- | --- | --- |
| LOCAL-01 | Uruchomienie Local Vault | brak rejestracji i logowania Cloud |
| LOCAL-02 | Zapis danych i restart aplikacji | dane pozostają lokalnie po restarcie |
| LOCAL-03 | Kontrola sieci | brak żądań do Supabase i dostawców AI |
| AI-01 | Pierwsze użycie AI w Cloud | wyświetlona zgoda, cel i zakres danych |
| AI-02 | Brak zgody AI | wywołanie zablokowane |
| AI-03 | Zapis wyniku AI | zapisany tylko świadomie wybrany wynik, nie pełen prompt ani historia |

## Procedura ręczna dla każdego testu

1. Użyj nowego, nieprodukcyjnego konta testowego.
2. Wykonaj tylko opisany scenariusz.
3. Porównaj wynik z kryterium oczekiwanym.
4. Zapisz status `PASS`, `FAIL` albo `BLOCKED` w pliku wyników.
5. Przy `FAIL` dopisz opis bez danych osobowych, popraw błąd i powtórz test.
