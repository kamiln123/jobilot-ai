# Wyniki testów — Jobilot AI

## Konwencja

- `PASS` — wynik zgodny z kryterium.
- `FAIL` — wykryto błąd wymagający poprawy.
- `BLOCKED` — test czeka na zależność lub decyzję użytkownika.
- W tym pliku nie zapisujemy danych osobowych, haseł, tokenów ani kluczy.

## 3 sierpnia 2026 — Sprint 1: dostęp Cloud Mode

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| BUILD-01 | LOCAL | PASS | `npm run lint` zakończony pomyślnie. |
| BUILD-02 | LOCAL | PASS | Produkcyjny build Next.js wygenerował artefakty stron `/` i `/login`. |
| AUTH-01 | LOCAL | PASS | Otwarcie `/` bez sesji wyświetliło formularz logowania, bez dostępu do pulpitu. |
| AUTH-02 | LOCAL | PASS | Rejestracja wyświetliła komunikat o konieczności potwierdzenia e-mail. Dane konta nie zostały zapisane w dokumentacji. |
| AUTH-03 | LOCAL | PASS | Link potwierdzający z e-maila przekierował do Jobilot AI, utworzył sesję i pokazał chroniony pulpit z powitaniem. |
| AUTH-04 | LOCAL | PASS | Błędne hasło wyświetliło bezpieczny komunikat po polsku: „Nieprawidłowy adres e-mail lub hasło.” |
| AUTH-05 | LOCAL | PASS | Wylogowanie przekierowało do strony logowania; bezpośrednie wejście na `/` bez sesji również nie ujawniło pulpitu. |
| AUTH-06 | LOCAL | PASS | Celowo błędny format e-mail został zablokowany przez walidację przeglądarki przed wysłaniem formularza. |

## Otwarte ryzyka

| Ryzyko | Działanie |
| --- | --- |
| Termin MVP: 8 sierpnia | Priorytet: Job Offer, CV, Application, Local Vault, minimalne AI i testy krytyczne. Funkcje 1.1 pozostają poza zakresem. |
| Test potwierdzania e-mail | Wymaga dostępu do skrzynki testowej użytkownika; nie przechowujemy danych konta. |
| Komunikaty dostawcy Auth | Interfejs mapuje błędy logowania na bezpieczne komunikaty po polsku; AUTH-04 przeszedł retest. |

## 3 sierpnia 2026 — Sprint 2: Job Offer

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| BUILD-03 | LOCAL | PASS | Produkcyjny build wygenerował trasy `/job-offers` i `/job-offers/new`. |
| DATA-00 | LOCAL | PASS | Zalogowany użytkownik zobaczył pustą listę ofert i przycisk dodania pierwszej oferty. |
| DATA-01A | LOCAL | PASS | Zapis pustego formularza został zablokowany na polu „Firma”; po uzupełnieniu firmy został zablokowany na polu „Stanowisko”. |
| DATA-01B | LOCAL | PASS | Poprawne dane zapisały ofertę, przekierowały do listy i pokazały firmę, stanowisko oraz lokalizację, tryb pracy i rodzaj zatrudnienia. |
| DATA-01C1 | LOCAL | PASS | Wartości z literami i więcej niż dwoma miejscami po przecinku zostały zablokowane komunikatem o prawidłowym formacie wynagrodzenia. |
| DATA-01C2 | LOCAL | PASS | Wartość `od: 3000`, `do: 2313,00` została zablokowana komunikatem o maksymalnym wynagrodzeniu niższym od minimalnego. |
| DATA-01D | LOCAL | PASS | Link bez protokołu nie blokuje zapisu. Tekst ze spacjami wyświetla uzgodniony komunikat: „Adres zawiera spacje lub jest niekompletny. Możesz go zapisać jako link, ale nie będzie klikalny.” |
| DATA-01E | LOCAL | PASS | Jednocześnie pokazano blokujący błąd wynagrodzenia oraz nieblokującą wskazówkę linku w kolejności formularza. |
| DATA-01F | LOCAL | PASS | Odświeżenie wyczyściło niezapisane dane formularza zgodnie z decyzją produktową: w MVP nie zapisujemy automatycznie szkicu. |
| DATA-02 | LOCAL | PASS | Kliknięcie zapisanej oferty otworzyło poprawny ekran szczegółów z firmą, stanowiskiem i zapisanymi atrybutami. |

## 5 sierpnia 2026 — Sprint 2: CV Library i Portfolio (gotowe do testów ręcznych)

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| BUILD-04 | LOCAL | PASS | `npm run lint` oraz produkcyjny `npm run build` zakończone pomyślnie; sprawdzone trasy CV Library i Portfolio. |
| BUILD-05 | LOCAL | PASS | Po usprawnieniu biblioteki CV lint i pełny produkcyjny build ponownie zakończone pomyślnie. |
| BUILD-06 | LOCAL | PASS | Po korekcie CTA CV i obszaru kliknięcia portfolio lint oraz produkcyjny build zakończone pomyślnie. |
| BUILD-07 | LOCAL | PASS | Po dodaniu wyraźnego przycisku wyboru PDF lint oraz produkcyjny build zakończone pomyślnie. |
| SMOKE-01 | LOCAL | PASS | Lokalny serwer zwrócił HTTP 200 dla `/`, `/cv-library`, `/cv-library/new` i `/portfolio`. |
| CV-01 | LOCAL | PASS | Pusta biblioteka CV otwiera się prawidłowo. Następnie poprawiono interfejs, aby nie dublował przycisków dodawania. |
| CV-02 | LOCAL | PASS | Testowy plik PDF został dodany jako pierwsza wersja CV. |
| CV-03 | LOCAL | PASS | Dodanie kolejnej wersji utworzyło niezależne wpisy `v1` i `v2`. |
| CV-04 | LOCAL | PASS | Brak pliku, plik inny niż PDF oraz plik 20 MB zostały zablokowane poprawnymi komunikatami po polsku. |
| CV-05 | LOCAL | PASS | Wybór istniejącego CV pokazał opis; jego zmiana i zapis nowej wersji działają poprawnie. |
| CV-06 | LOCAL | PASS | Pusty stan nie zawiera dwóch przycisków dodawania. Następnie CTA zostało dodatkowo powiększone i umieszczone pod opisem biblioteki. |
| CV-07 | LOCAL | PASS | Wyraźny przycisk `Wybierz plik PDF` jest czytelny. Ręczny retest potwierdził również dalsze blokowanie pliku innego niż PDF i pliku większego niż 5 MB. |
| PORT-01 | LOCAL | PASS | Poprawny link HTTP(S) można zapisać; można dodać kilka elementów portfolio, a tekst adresu otwiera stronę zewnętrzną. |
| PORT-02 | LOCAL | PASS | Niepełny adres `asd.pl` został zablokowany komunikatem o wymaganym `https://` lub `http://`. |
| PORT-03 | LOCAL | PASS | Po poprawce adres otwiera się wyłącznie po kliknięciu tekstu linku; pozostała część kafelka nie jest klikalna. |
