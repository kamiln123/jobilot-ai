# User stories — Jobilot AI

## Kryteria wspólne

Wszystkie historie Cloud Mode zakładają, że użytkownik widzi wyłącznie własne dane. Wszystkie historie Local Vault zakładają brak komunikacji z usługami zewnętrznymi. Dane AI są zapisywane wyłącznie po wyraźnym działaniu użytkownika.

## Dostęp i tryby

### US-01 — niezależne produkty

Jako osoba szukająca pracy chcę uruchomić osobno Jobilot AI Cloud lub Jobilot AI Local Vault, abym mogła zdecydować pomiędzy wygodą synchronizacji a pełną lokalnością danych bez wyboru trybu wewnątrz aplikacji.

**Akceptacja:** Cloud jest dostępny jako aplikacja webowa, Local Vault jako aplikacja desktopowa; żadna aplikacja nie pyta o wybór trybu; Local Vault nie wymaga rejestracji.

### US-02 — konto Cloud Mode

Jako użytkownik Cloud Mode chcę utworzyć konto i zalogować się e-mailem oraz hasłem, abym miał dostęp do swoich danych z konta.

**Akceptacja:** poprawne dane umożliwiają logowanie; błędne dane dają bezpieczny komunikat; po wylogowaniu chronione dane są niedostępne.

### US-03 — lokalny sejf

Jako użytkownik dbający o prywatność chcę rozpocząć pracę w Local Vault bez konta, abym nie przekazywał danych do chmury.

**Akceptacja:** dane pozostają po odświeżeniu; AI jest niedostępne; nie są wykonywane żądania do Supabase ani dostawców AI.

## CV i portfolio

### US-04 — biblioteka CV

Jako użytkownik chcę dodać CV do biblioteki, abym mógł użyć go w aplikacjach.

**Akceptacja:** widzę nazwę i metadane dokumentu; mogę otworzyć listę swoich CV; nie widzę CV innych użytkowników.

### US-05 — wersjonowanie CV

Jako użytkownik chcę utworzyć nową wersję CV bez usuwania starej, abym znał dokument wysłany do konkretnej firmy.

**Akceptacja:** nowa wersja ma kolejny numer; poprzednia pozostaje dostępna; Application zachowuje snapshot użytej wersji.

### US-06 — portfolio wielokrotnego użycia

Jako użytkownik chcę zachować link lub plik portfolio i przypisać go do wielu aplikacji, abym nie wprowadzał danych ponownie.

**Akceptacja:** artefakt ma typ link/plik; można przypisać kilka artefaktów do jednej Application; ten sam artefakt może należeć do wielu Application.

## Oferty i aplikacje

### US-07 — ręczne zapisanie oferty

Jako użytkownik chcę ręcznie zapisać ofertę pracy, abym mógł śledzić pozycje znalezione na różnych portalach.

**Akceptacja:** formularz zawiera firmę i stanowisko oraz opcjonalnie opis, wymagania, lokalizację, wynagrodzenie, link i notatki; zapis jest możliwy w obu trybach; użytkownik może otworzyć szczegóły własnej oferty. Link HTTP(S) jest klikalny, a nieobsługiwany lub niekompletny adres pozostaje bezpiecznym tekstem nieklikalnym.

### US-08 — utworzenie Application

Jako użytkownik chcę utworzyć Application dla oferty i wybrać CV, abym zarządzał kompletną aplikacją w jednym miejscu.

**Akceptacja:** Application ma dokładnie jedną Job Offer, aktualny status i snapshot CV; pokazuje przypisane portfolio, notatki i historię.

### US-09 — historia statusu

Jako użytkownik chcę zmieniać status Application i widzieć pełną historię, abym wiedział, jak przebiega rekrutacja.

**Akceptacja:** każda zmiana tworzy wpis z poprzednim i nowym statusem oraz datą; stary wpis nie jest nadpisywany.

### US-10 — notatki z procesu

Jako użytkownik chcę dopisywać notatki do Application, abym zapamiętał ustalenia i przygotowanie do rozmowy.

**Akceptacja:** notatka ma treść i datę utworzenia; jest widoczna tylko w danej Application; można ją archiwizować bez niszczenia historii.

## AI i prywatność

### US-11 — świadoma zgoda AI

Jako użytkownik Cloud Mode chcę przed pierwszym użyciem AI poznać zakres przekazywanych danych, dostawcę i ograniczenia, abym świadomie decydował o prywatności.

**Akceptacja:** komunikat wymienia cel, dostawcę, zakres danych i możliwość błędu; operacja AI wymaga akceptacji; zgoda może zostać wycofana.

### US-12 — analiza CV względem oferty

Jako użytkownik Cloud Mode chcę porównać CV z wybraną ofertą, abym zobaczył dopasowanie, mocne strony i braki.

**Akceptacja:** analiza działa tylko dla zalogowanego użytkownika ze zgodą; wynik zawiera dopasowanie, mocne strony, braki i rekomendacje; prompty nie są domyślnie zapisywane; użytkownik może zapisać wynik do Application.

### US-13 — list motywacyjny

Jako użytkownik Cloud Mode chcę wygenerować i edytować list motywacyjny dla Application, abym szybciej przygotował spersonalizowaną aplikację.

**Akceptacja:** wygenerowany tekst można edytować; świadomy zapis tworzy Cover Letter z `created_at` i `updated_at`; zapisana wersja jest widoczna po odświeżeniu, można ją później edytować bez tworzenia duplikatu; soft delete nie usuwa danych historycznych bez potrzeby.

### US-14 — limity AI

Jako właściciel produktu chcę limitować operacje AI na użytkownika, abym ograniczał koszty i nadużycia.

**Akceptacja:** limit jest sprawdzany przed wywołaniem dostawcy; po przekroczeniu użytkownik otrzymuje komunikat; request ma limit rozmiaru i timeout.

## Eksport i kontrola danych

### US-15 — eksport Local Vault

Jako użytkownik Local Vault chcę wyeksportować swoje dane do pliku JSON, abym zachował nad nimi kontrolę.

**Akceptacja:** eksport zawiera dane użytkownika z lokalnego sejfu bez sekretów; nie wysyła danych do serwera; użytkownik świadomie pobiera plik.

## Po MVP

### US-16 — CV w formacie Word

Jako użytkownik chcę wgrać CV w formacie Word (`.docx`), abym nie musiał przed zapisem ręcznie konwertować go do PDF.

**Akceptacja:** funkcja jest dostępna po MVP; plik `.docx` przechodzi walidację rozszerzenia, MIME i rozmiaru; tworzy niezmienną wersję CV tak jak PDF; plik nie jest automatycznie wysyłany do AI.
