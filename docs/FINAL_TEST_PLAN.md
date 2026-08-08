# Finalny plan testów — Jobilot AI MVP

## Cel i zasady

Potwierdzić wygląd, polską treść, nawigację oraz każdą akcję dostępną w MVP. Testy wykonujemy najpierw na Vercel Preview, a po akceptacji na Production. Używamy wyłącznie syntetycznych danych. Nie zapisujemy w wynikach haseł, e-maili, prawdziwych CV, kluczy API ani tokenów.

## Testy interfejsu Cloud Mode

| ID | Obszar | Kroki | Oczekiwany wynik |
| --- | --- | --- | --- |
| UI-01 | Strony publiczne | Otwórz `/login`, `/about`, `/local-vault`, `/privacy-policy` i `/terms`. | Każda trasa otwiera się bez 404/500, ma polski tytuł i czytelną treść. Strony polityki i regulaminu komunikują wyłącznie, że ich treść pojawi się wkrótce. |
| UI-02 | Stopka | Na stronie publicznej i po zalogowaniu kliknij: O projekcie, Local Vault, Polityka prywatności, Regulamin i GitHub. | Cztery linki wewnętrzne otwierają właściwe strony, GitHub otwiera się w nowej karcie; wersja MVP, autor oraz informacja o wersji demonstracyjnej są czytelne. |
| UI-03 | Logowanie i rejestracja | Sprawdź pusty formularz, błędny e-mail, celowo błędne hasło, poprawne logowanie oraz wylogowanie. | Walidacja i komunikaty są po polsku; nie ujawniają informacji o koncie; pulpit jest niedostępny po wylogowaniu. |
| UI-04 | Logo i nawigacja | Z każdej chronionej sekcji kliknij logo oraz wszystkie pozycje głównej nawigacji. | Logo zawsze prowadzi do pulpitu; Oferty pracy, Biblioteka CV, Portfolio i Aplikacje otwierają prawidłowe listy. |
| UI-05 | Pulpit | Sprawdź liczby i ostatnie elementy po dodaniu syntetycznej oferty, CV, portfolio i Application. | Statystyki odpowiadają zapisanym danym, a interfejs nie wykracza poza ekran. |
| UI-06 | Oferta — formularz | Dodaj ofertę z kompletem danych, potem sprawdź: brak firmy, brak stanowiska, błędne wynagrodzenie, `do < od`, link bez protokołu, link ze spacjami i niebezpieczny protokół. | Wymagane i blokujące błędy są przy właściwych polach w kolejności formularza; ostrzeżenia linku nie blokują zapisu; niebezpieczny adres nie staje się klikalny. |
| UI-07 | Oferta — szczegóły i edycja | Otwórz kartę oferty, sprawdź wszystkie pola, edytuj jedno pole, zapisz; osobno wróć bez zapisu. | Wszystkie dane są widoczne; zapis jest trwały po odświeżeniu, a powrót bez zapisu nie zmienia danych. |
| UI-08 | Biblioteka CV | Sprawdź pusty stan, przycisk dodania, wybór PDF do 5 MB, brak pliku, inny format, plik ponad limitem oraz dodanie `v2` do istniejącego dokumentu. | CTA jest czytelne; tylko poprawny PDF do 5 MB można zapisać; wersje i opis są zachowane bez nadpisania `v1`. |
| UI-09 | Portfolio | Dodaj poprawny element, sprawdź niepoprawny adres, otwórz szczegóły, edytuj go i kliknij link. | Walidacja jest po polsku; link otwiera się wyłącznie po kliknięciu jego tekstu; edycja pozostaje po odświeżeniu. |
| UI-10 | Utworzenie Application | Wybierz ofertę, konkretną wersję CV, zero/jeden/kilka elementów portfolio i status początkowy; spróbuj utworzyć duplikat dla tej samej oferty. | Formularz pokazuje wszystkie dane właściciela; Application zapisuje powiązania; duplikat aktywnej aplikacji jest blokowany. |
| UI-11 | Szczegóły Application | Otwórz kartę z listy, zmień status na Wysłana, dodaj notatkę, przypnij i odepnij portfolio, odśwież stronę. | Routing korzysta z `applications.id`; historia statusów, data wysłania, notatka i portfolio pozostają trwałe. |
| UI-12 | AI — granice i wynik | Sprawdź brak zgody, nadaj zgodę, uruchom jedną akcję tylko jeśli limit pozwala, sprawdź wynik bez zapisu, zapisz go oraz wycofaj zgodę. | Dane nie są wysyłane przed zgodą; niezapisany wynik znika po odświeżeniu; zapisany pozostaje; wycofanie zgody blokuje nowe akcje, ale nie usuwa zapisanego rezultatu. |
| UI-13 | Responsywność | Powtórz UI-01, UI-02, UI-04 i UI-10 przy szerokości około 360 px, 768 px i 1440 px. | Brak poziomego przewijania, nakładającego się tekstu lub niewidocznych przycisków; nawigacja zmienia układ czytelnie. |
| UI-14 | Regresja produkcyjna | Po zaakceptowaniu Preview powtórz UI-01, UI-02, UI-03, UI-04, UI-07, UI-11 i UI-12 na Production. | Produkcja ma ten sam zatwierdzony wygląd i zachowanie co Preview; wynik i adres wdrożenia zostają zapisane w `TEST_RESULTS.md`. |

## Ręczny test RLS — konto A i konto B

1. Konto A zapisuje syntetyczną ofertę, CV, portfolio i Application.
2. Wyloguj konto A, następnie zaloguj konto B w osobnej przeglądarce albo profilu incognito.
3. Konto B otwiera każdą listę i pulpit: nie widzi żadnych danych konta A.
4. Skopiuj adres szczegółów oferty i Application konta A, otwórz go w sesji konta B.
5. Oczekiwany wynik: komunikat braku dostępu albo bezpieczny pusty wynik; bez nazwy firmy, CV, notatki i metadanych konta A.
6. Konto B tworzy własną ofertę; konto A nie widzi jej po ponownym zalogowaniu.
7. W Network potwierdź, że odrzucone zapytania nie zwracają danych A. Zapisz wyłącznie statusy HTTP i PASS/FAIL, bez identyfikatorów rekordów.

## Dane syntetyczne — scenariusz case study

1. Zapisz ofertę `Northstar Labs`, stanowisko `Junior Frontend Developer`, lokalizacja `Warszawa / hybrydowo`, wynagrodzenie `7 000–9 000 PLN`. Opis i wymagania mają zawierać tylko przykładowe technologie.
2. Dodaj sztuczny PDF `CV Frontend — Demo` z fikcyjną personą i bez danych kontaktowych; dodaj też wersję `v2` z innym opisem.
3. Dodaj portfolio `Demo GitHub`, typ GitHub, adres `https://example.com/demo-github`.
4. Utwórz Application dla `Northstar Labs`, wybierz `CV Frontend — Demo v2`, przypnij portfolio i ustaw status `Przygotowywana`.
5. Zmień status na `Wysłana`, dodaj neutralną notatkę testową i sprawdź historię oraz dane po odświeżeniu.
6. Test AI wykonuj wyłącznie na tym sztucznym CV i tylko, gdy limit jest dostępny. Zapisz jeden wynik tylko wtedy, gdy potwierdzamy przepływ zapisu; w przeciwnym razie odśwież stronę i potwierdź brak automatycznego zapisu.
