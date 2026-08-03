# PRD — Jobilot AI

**Wersja:** 0.2
**Data:** 3 sierpnia 2026
**Termin MVP:** 8 sierpnia 2026
**Status:** MVP w realizacji

## 1. Cel i miara sukcesu

Celem jest dostarczenie działającej aplikacji portfolio, która pozwala użytkownikowi samodzielnie kontrolować proces poszukiwania pracy i bezpiecznie korzystać z opcjonalnego wsparcia AI.

MVP uznajemy za gotowe, gdy użytkownik potrafi w wybranym trybie utworzyć ofertę, aplikację z przypisanym CV i portfolio, zmienić status, dodać notatkę, zobaczyć historię, a w Cloud Mode — po wyrażeniu zgody — uruchomić analizę AI i wygenerować list motywacyjny.

## 2. Zakres MVP

### Cloud Mode

- Rejestracja, logowanie i wylogowanie przez e-mail oraz hasło.
- Własne, odseparowane dane użytkownika dzięki Supabase RLS.
- Biblioteka CV z wersjami; poprzednia wersja nigdy nie jest nadpisywana.
- Ręczne dodawanie, edycja i archiwizacja Job Offer.
- Tworzenie Application z ofertą, CV, portfolio i bieżącym statusem.
- Portfolio jako plik lub link; wiele elementów w jednej Application.
- Notatki, oś czasu i nieedytowalna historia zmian statusu.
- AI: analiza CV względem oferty i generowanie Cover Letter.
- Jednorazowa zgoda AI, informacja o dostawcy i możliwość rezygnacji.
- Dzienne limity i walidacja zapytań AI.

### Local Vault Mode

- Lokalne rozpoczęcie pracy bez konta chmurowego.
- Lokalne dane: oferty, aplikacje, wersje CV, portfolio jako referencje/metadane, notatki i historia statusów.
- Ekran jasno pokazujący tryb Local Vault i wyłączenie funkcji AI.
- Brak wywołań do Supabase, OpenAI, Gemini, analityki lub telemetrii podczas używania Local Vault.
- Lokalny eksport danych w formacie JSON jako funkcja pomocnicza MVP (bez automatycznego backupu).

## 3. Poza MVP

- AI Job Discovery (wersja 1.1).
- Rozbudowane statystyki i analityka (1.1).
- Szyfrowane lokalne kopie zapasowe (1.1).
- Interview Coach z głosem i raportami (2.0).
- Integracje LinkedIn, automatyczne pobieranie ogłoszeń, automatyczne aplikowanie.

## 4. Kluczowe przepływy

1. Użytkownik uruchamia Jobilot AI Cloud w przeglądarce albo osobną aplikację Jobilot AI Local Vault na komputerze.
2. W Cloud zakłada konto/loguje się; w Local Vault tworzy lokalny sejf bez rejestracji.
3. Dodaje CV do biblioteki lub kolejną wersję istniejącego CV.
4. Ręcznie zapisuje ofertę pracy.
5. Tworzy Application, wybiera wersję CV oraz opcjonalne elementy portfolio.
6. Zmienia status, uzupełnia notatki i przegląda oś czasu.
7. W Cloud Mode potwierdza zgodę AI, wybiera zakres danych i uruchamia analizę lub generator listu.
8. Zapisuje tylko wybrany końcowy rezultat AI.

## 5. Wymagania funkcjonalne

| ID | Wymaganie | Priorytet |
| --- | --- | --- |
| FR-01 | Cloud i Local Vault są odrębnymi aplikacjami uruchamianymi niezależnie; żadna z nich nie pokazuje ekranu wyboru trybu. | Must |
| FR-02 | Cloud Mode zapewnia rejestrację i logowanie e-mail/hasło. | Must |
| FR-03 | Użytkownik może tworzyć CV i kolejne wersje bez nadpisywania poprzednich. | Must |
| FR-04 | Job Offer przechowuje firmę, stanowisko, opis, wymagania, lokalizację, wynagrodzenie, link i notatki; użytkownik może otworzyć widok szczegółów własnej oferty. Link jest klikalny wyłącznie dla HTTP(S); inne wartości pozostają tekstem nieklikalnym. | Must |
| FR-05 | Application jest powiązana z jedną ofertą, aktualnym statusem i snapshotem wybranego CV. | Must |
| FR-06 | Do Application można przypisać wiele Portfolio Artifact. | Must |
| FR-07 | Każda zmiana statusu tworzy trwały wpis historii z datą. | Must |
| FR-08 | Użytkownik może dodawać notatki do Application. | Must |
| FR-09 | AI wymaga zgody i pokazuje komunikat o danych, dostawcy, celu oraz ograniczeniach AI. | Must |
| FR-10 | AI Gateway analizuje CV względem Job Offer oraz generuje Cover Letter. | Must |
| FR-11 | Wyniki AI są zapisywane dopiero po działaniu użytkownika. | Must |
| FR-12 | Local Vault działa lokalnie i nie oferuje AI ani synchronizacji. | Must |
| FR-13 | Użytkownik może wyeksportować lokalne dane. | Should |

## 6. Model domenowy

```text
User / LocalVault
├── CVDocument
│   └── CVVersion
├── JobOffer
├── PortfolioArtifact
└── Application
    ├── JobOffer (1)
    ├── CVVersionSnapshot (1)
    ├── PortfolioArtifact (0..n)
    ├── CoverLetter (0..1 aktywny; soft delete)
    ├── AIAnalysis (0..n, tylko świadomie zapisane)
    ├── Note (0..n)
    └── StatusHistory (1..n)
```

Minimalne statusy: `saved`, `preparing`, `applied`, `interview`, `offer`, `rejected`, `withdrawn`.

Snapshot CV w Application zawiera co najmniej: `cv_version_id`, nazwę pliku, numer wersji, checksum oraz datę przypisania. Usunięcie lub archiwizacja źródłowego CV nie może zmienić historii aplikacji.

## 7. Wymagania niefunkcjonalne i bezpieczeństwo

- Cloud Mode: RLS dla każdej tabeli biznesowej; zapytania są ograniczone do `auth.uid()`.
- Storage jest prywatny. Pliki udostępniamy wyłącznie przez krótkotrwałe podpisane URL-e.
- Klucze dostawców AI istnieją tylko w zmiennych serwerowych, bez prefiksu `NEXT_PUBLIC_`.
- Frontend komunikuje się tylko z własnym AI Gateway; nigdy bezpośrednio z OpenAI lub Gemini.
- Gateway wykonuje autoryzację, kontrolę zgody, kontrolę trybu, walidację wejścia, limit dzienny, timeout i walidację odpowiedzi.
- Nie logujemy treści CV, promptów, pełnych odpowiedzi AI, tokenów dostępu ani kluczy API.
- AI jest globalnie wyłączone domyślnie (`AI_GLOBAL_ENABLED=false`); aktywacja płatnego dostawcy wymaga osobnej zgody właściciela i ustawienia limitu budżetowego.
- Local Vault jest aplikacją Tauri z lokalną bazą SQLite; blokuje inicjalizację klientów zewnętrznych i nie zawiera telemetrii.
- Walidujemy formularze po stronie klienta i serwera; pliki ograniczamy typem oraz rozmiarem.
- Wrażliwe zasoby są dostępne wyłącznie właścicielowi; stosujemy soft delete, gdy zachowanie historii ma znaczenie.

## 8. Kryteria akceptacji MVP

- Dwa konta Cloud Mode nie mogą odczytać ani modyfikować wzajemnych danych.
- Użytkownik może otworzyć szczegóły wyłącznie własnej Job Offer; bezpieczny link HTTP(S) jest klikalny, a nieobsługiwany protokół nie tworzy aktywnego odnośnika.
- Po wybraniu wcześniejszej wersji CV dla Application późniejsze dodanie wersji nie zmienia snapshotu tej aplikacji.
- Po zmianie statusu istnieje nowy wpis historii, a wcześniejszy wpis pozostaje widoczny.
- Przed pierwszą operacją AI aplikacja wymaga potwierdzenia zgody i wskazuje, jakie dane zostaną wysłane.
- Przekroczenie limitu AI zwraca zrozumiały komunikat i nie wywołuje dostawcy.
- Local Vault nie ma żądań do usług chmurowych ani konta użytkownika; dane pozostają po ponownym uruchomieniu aplikacji desktopowej.
- Sekrety nie są śledzone przez Git; repozytorium zawiera tylko `.env.example`.

## 9. Otwarte decyzje implementacyjne

- Limit darmowy: domyślnie 10 operacji AI dziennie; można zmienić konfiguracją serwera.
- Maksymalny rozmiar i format pliku CV należy ustalić przed implementacją uploadu (propozycja: PDF, maks. 5 MB).
- Local Vault MVP korzysta z IndexedDB; model szyfrowania lokalnego backupu zostaje odłożony do 1.1.
