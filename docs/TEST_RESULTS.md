# Wyniki testów — Jobilot AI

## Sprint 5 — AI Gateway (test przed pull requestem)

- Status: IN PROGRESS.
- Migracja `20260807190000_add_ai_usage_functions.sql` została zastosowana w Supabase.
- Sekret `GEMINI_API_KEY` jest skonfigurowany w Vercel i nie znajduje się w repozytorium.
- Plan przypadków testowych: `docs/TESTING.md`, pozycje `AI-01` do `AI-08`.

### 7 sierpnia 2026 — kontrola automatyczna i Vercel Preview

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| BUILD-12 | LOCAL | PASS | `npm run lint` zakończył się bez błędów. |
| BUILD-13 | LOCAL | PASS | Pełny `npm run build`, kontrola TypeScript i generowanie tras, w tym `/api/ai/generate`, zakończyły się kodem 0. |
| PREVIEW-01 | PREVIEW | PASS | Wdrożenie Preview osiągnęło status `Ready`; strona `/login` zwraca HTTP 200. Produkcja nie została zmieniona. |
| AI-CONFIG-01 | PREVIEW | FAIL → PASS | Pierwsze wdrożenie nie widziało zmiennej dodanej po buildzie i zwracało 503. Po ponownym wdrożeniu Preview endpoint AI bez sesji zwraca prawidłowe HTTP 401. |
| AI-01 | PREVIEW | PASS | Po otwarciu Application użytkownik zobaczył sekcję AI, dostawcę i wariant modelu, zakres przesyłanych danych, informację o Free Tier, ostrzeżenie o błędach AI oraz przycisk świadomej zgody. Przed zgodą nie można uruchomić analizy. |
| AI-02 | PREVIEW | PASS | Świadoma zgoda zapisała się prawidłowo. Interfejs pokazał komunikat sukcesu, akcje analizy, generowania listu i wycofania zgody oraz informację o braku automatycznego zapisu wyników. Przycisk wycofania zgody poprawiono na osobny kafelek ostrzegawczy. |
| AI-04 | PREVIEW | PASS | Po poprawkach limitu, timeoutu i struktury `generateContent` Gemini zwróciło analizę z oceną `25/100`, sekcjami mocnych stron, braków i rekomendacji oraz informacją o pozostałych operacjach. Niezapisany wynik zniknął po odświeżeniu. Końcowy test zgodności licznika Jobilot z panelem Gemini wykonamy podczas finalnej walidacji MVP. |
| AI-03 | PREVIEW | PASS | Przycisk świadomego zapisu działa. Zapis potwierdzono komunikatem sukcesu; „Ostatnio zapisana analiza” z wynikiem, datą i godziną jest widoczna także po odświeżeniu. Nie zapisujemy promptu ani historii rozmowy. |
| AI-05 | PREVIEW | PASS | Gemini wygenerowało edytowalny list motywacyjny. Użytkownik zmienił treść, zapisał ją świadomie i otrzymał komunikat sukcesu. „Ostatnio zapisany list motywacyjny” pozostaje widoczny po odświeżeniu. Późniejsza edycja zapisanej wersji, zapis aktualizacji oraz trwałość zmienionej treści po odświeżeniu zostały potwierdzone bez nowego użycia AI i bez tworzenia duplikatu. |
| AI-06 | PREVIEW | PASS | Wycofanie zgody ukryło akcje analizy i generowania oraz przywróciło ekran świadomej zgody. Stan pozostał wycofany po odświeżeniu. Zapisane wcześniej analiza i list motywacyjny pozostały dostępne lokalnie w Application, bez uruchamiania AI i bez wysyłania danych do Gemini. |
| AI-07 | PREVIEW | PASS | Po nadaniu zgody pięć kolejnych udanych operacji zmniejszyło licznik z 4 do 0. Kolejna próba wyświetliła komunikat „Wykorzystano dzienny limit 10 operacji AI.” i nie zwróciła nowego wyniku. Podczas testu nie było błędów; licznik użycia w panelu Gemini nie zwiększył się po zablokowanych próbach, co potwierdza blokadę przed wysłaniem danych do dostawcy. |
| AI-08 | PREVIEW | PASS | Network pokazał dokładnie jedno żądanie `fetch` do własnego endpointu Jobilot `/api/ai/generate` ze statusem 429; nie było żądań do `generativelanguage.googleapis.com`, `googleapis.com` ani adresów Gemini. Ręczne otwarcie adresu endpointu w karcie zwróciło 405 dla `GET`, co jest oczekiwane — gateway obsługuje wyłącznie `POST`. |

## Sprint 6 — jakość i prezentacja (przed pull requestem)

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| QA-01 | LOCAL | PASS | `npm.cmd run lint`, `npx.cmd tsc --noEmit` oraz produkcyjny `npx.cmd next build` dla `apps/cloud` zakończyły się poprawnie. Build utworzył artefakt `.next/BUILD_ID`. |
| QA-02 | LOCAL | PASS | Kontrola śledzonych przez Git plików konfiguracji wykazała wyłącznie szablon `.env.example`; wyszukiwanie typowych wzorców kluczy Gemini, OpenAI i Supabase nie znalazło sekretów poza wartościami zastępczymi. |

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

## 5 sierpnia 2026 — Sprint 3: Application first

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| BUILD-08 | LOCAL | PASS | Lint oraz produkcyjny build wygenerowały trasy `/applications`, `/applications/new` i `/applications/[id]`. |
| DATA-03 | LOCAL | BLOCKED | Wymaga zastosowania migracji `20260805120000_create_application_with_portfolio.sql` w Supabase i utworzenia Application przez użytkownika. |
| DATA-04 | LOCAL | BLOCKED | Wymaga ręcznej zmiany statusu utworzonej Application. |
| DATA-05 | LOCAL | BLOCKED | Wymaga ręcznego dodania notatki do utworzonej Application. |
| DATA-06 | LOCAL | BLOCKED | Wymaga ponownej próby utworzenia Application dla tej samej oferty. |

## 6 sierpnia 2026 — Sprint 3: Application first (retest)

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| BUILD-09 | LOCAL | PASS | `npm run lint` zakończony pomyślnie po poprawie routingu Application. |
| BUILD-10 | LOCAL | PASS | Pełny produkcyjny `npm run build` zakończony kodem 0; wygenerowano trasy Application, CV, Job Offer i Portfolio. |
| SMOKE-02 | LOCAL | PASS | Lokalny serwer zwrócił HTTP 200 dla `/applications`, `/applications/new` oraz dynamicznej trasy `/applications/{id}`. |
| DATA-03 | LOCAL | PASS | Utworzenie Application i otwarcie jej szczegółów zostały potwierdzone ręcznie. Poprawka rozdzieliła `applications.id` od `job_offers.id` w linku karty. |
| DATA-03A | LOCAL | PASS | Kliknięcie karty Application otwiera jej właściwy ekran szczegółów po poprawie nadpisywania ID przez dane Job Offer. |
| DATA-04 | LOCAL | PASS | Status zmieniono na `applied` („Wysłana”). Pojawiła się data wysłania i nowy wpis historii; po odświeżeniu i powrocie do listy dane pozostały widoczne. |
| DATA-05 | LOCAL | PASS | Prywatna notatka Application zapisała się prawidłowo i pozostała widoczna po odświeżeniu. |
| DATA-06 | LOCAL | PASS | Ponowna próba utworzenia aktywnej Application dla tej samej oferty została zablokowana komunikatem: „Masz już aktywną aplikację do tej oferty.” |

## 6 sierpnia 2026 — Sprint 4: Local Vault (pierwszy test)

| ID | Środowisko | Status | Wynik |
| --- | --- | --- | --- |
| BUILD-11 | LOCAL VAULT | PASS | `npm run build` dla interfejsu Vite oraz `cargo check` dla Tauri z SQLite i lokalnym systemem plików zakończone pomyślnie. |
| LOCAL-01 | LOCAL VAULT | PASS | Natywna aplikacja `appslocal.exe` uruchamia się bez logowania Cloud i bez wyboru trybu. Interfejs jasno oznacza „Local Vault”. |
| LOCAL-04 | LOCAL VAULT | PASS | Pierwsze uruchomienie otworzyło lokalną bazę SQLite; testowa oferta została zapisana i pojawiła się na lokalnej liście. |
| LOCAL-05A | LOCAL VAULT | PASS | Lokalny formularz Job Offer obsługuje opis, wymagania, lokalizację, tryb pracy, zatrudnienie, wynagrodzenie, link i notatkę. Wynagrodzenie `do` niższe niż `od` blokuje zapis; równe wartości są dozwolone. |
| LOCAL-05B | LOCAL VAULT | PASS | Link bez `https://` oraz adres ze spacją wyświetlają nieblokujące wskazówki. Poprawna oferta zapisuje się lokalnie. |
| LOCAL-05C | LOCAL VAULT | PASS | Retest prawidłowego PDF zakończony powodzeniem: plik został skopiowany do prywatnego katalogu Local Vault, rekord CV pojawił się na liście. Przyczyną poprzedniej awarii była ręczna transakcja `BEGIN … COMMIT` uruchamiana przez wiele wywołań wtyczki SQLite; zastąpiono ją zapisem sekwencyjnym z kompensacją częściowego zapisu. |
| LOCAL-05D | LOCAL VAULT | PASS | Plik 20 MB został zablokowany komunikatem o limicie 5 MB; plik `.msi` został odrzucony jako nieprawidłowy PDF; pusta nazwa CV zablokowała zapis przez walidację pola wymaganej nazwy. Drugi prawidłowy PDF został zapisany z komunikatem sukcesu i pojawił się na liście. |
| LOCAL-05E | LOCAL VAULT | PASS | Po zamknięciu i ręcznym ponownym uruchomieniu Local Vault oba zapisane CV pozostały widoczne w bibliotece. Potwierdza to trwałość rekordów SQLite i lokalnego magazynu plików. |
| LOCAL-05F | LOCAL VAULT | PASS | Otwieranie szczegółów Job Offer, edycja danych, walidacja błędnego wynagrodzenia oraz trwałość poprawionej oferty po restarcie zostały potwierdzone ręcznie. Powrót z edycji bez zapisu nie zapisuje zmian. |
| LOCAL-05G | LOCAL VAULT | PASS | Ręczna zmiana waluty została zapisana, widoczna w szczegółach Job Offer, odzwierciedlona w statystykach pulpitu oraz zachowana po restarcie Local Vault. |
| LOCAL-05H | LOCAL VAULT | PASS | CV są grupowane według dokumentu. Dodanie kolejnej wersji z opisem utworzyło `v2` bez nadpisania `v1`; walidacja limitu 5 MB zadziałała, a opis oraz obie wersje pozostały po restarcie aplikacji. |
| LOCAL-05I | LOCAL VAULT | PASS | Nowe Portfolio z typem `github`, poprawnym linkiem i opisem zapisało się lokalnie; niepełny link został zablokowany poprawnym komunikatem. Element był dostępny w formularzu Application, zwiększył statystyki pulpitu i pozostał po restarcie. |
| LOCAL-05J | LOCAL VAULT | PASS | Portfolio otwiera szczegóły i edycję; zapisano zmieniony opis, potwierdzono komunikat sukcesu, widoczność danych w Application oraz trwałość po restarcie. |
| LOCAL-05K | LOCAL VAULT | PASS | Utworzono Application z lokalną ofertą, CV `v2` i portfolio. Zmiana na status „Wysłana” dodała historię i datę wysłania; notatka, dane i licznik pulpitu pozostały po restarcie. Druga aktywna Application dla tej samej oferty została zablokowana; ponowny wybór tej samej wersji CV jest dozwolony. |
| LOCAL-06 | LOCAL VAULT | PASS | Eksport JSON został przygotowany lokalnie w folderze Pobrane. Zawiera dane ofert, dokumentów CV, osobnej tabeli wersji CV, portfolio i Application; nie zawiera binarnej treści PDF ani pełnej ścieżki systemowej użytkownika. |
| LOCAL-08 | LOCAL VAULT | PASS | Utworzono instalator NSIS Windows 64-bit (3 183 109 B). Publiczny GitHub Release `local-vault-v0.1.0` zawiera asset ze zweryfikowaną sumą SHA-256 `716E315597ADA3F59E52CE8BECFF780A10391FE0C606CD16EB0EE92D641B2B79`. Ręczny test instalacji potwierdził uruchomienie aplikacji bez Tauri, Rust, Node.js i kompilatora C++; zainstalowana aplikacja odczytała istniejący Local Vault bieżącego konta Windows. |
| LOCAL-05L | LOCAL VAULT | PASS | Portfolio można odpiąć i ponownie przypiąć do istniejącej Application bez tworzenia duplikatu. Komunikat sukcesu i trwałość relacji po restarcie zostały potwierdzone ręcznie. |
