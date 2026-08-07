# Roadmapa — Jobilot AI

## Termin nadrzędny

**MVP do oddania: 8 sierpnia 2026.** Roadmapa ogranicza zakres do elementów, które można pokazać jako działający, bezpieczny produkt portfolio.

## Plan MVP: 2–8 sierpnia 2026

| Termin | Sprint | Rezultat demonstracyjny | Priorytet | Status 5 sierpnia |
| --- | --- | --- | --- | --- |
| 2 sierpnia | 0. Fundament produktu | Dokumentacja, repozytorium, konfiguracja bez sekretów, model danych i decyzje architektoniczne. | Must | Ukończony |
| 3 sierpnia | 1. Szkielet i dostęp | Monorepo, Next.js Cloud, Tauri Local Vault, Cloud Auth oraz zabezpieczone schematy/RLS. | Must | Ukończony; testy Auth PASS |
| 4 sierpnia | 2. Dane rekrutacyjne | CV Library z wersjami, Job Offer i Portfolio Artifact. | Must | Ukończony; Job Offer, CV PDF do 5 MB z wersjami i Portfolio przetestowane ręcznie |
| 5–6 sierpnia | 3. Application first | Tworzenie Application, snapshot CV, statusy, historia i notatki. | Must | Ukończony; migracja Supabase zastosowana, testy tworzenia, routingu, statusów, historii, notatek i blokady duplikatu PASS |
| 6 sierpnia | 4. Local Vault | SQLite, lokalne ścieżki CRUD, brak usług zewnętrznych, eksport JSON oraz build Windows. | Must | Ukończony; ręczne testy ofert, CV, Portfolio, Application, relacji, eksportu i trwałości danych PASS |
| 7 sierpnia | 5. AI bezpiecznie | Zgoda AI, AI Gateway, limity, analiza CV/oferty i Cover Letter. | Must | W realizacji; gotowy adapter Gemini Free Tier, oczekuje na migrację Supabase i test integracyjny. Docelowy dostawca pozostaje OpenAI. |
| 8 sierpnia | 6. Jakość i prezentacja | Testy krytycznych przepływów, kontrola RLS, kontrola sekretów, README, dane demo i wdrożenie. | Must | Zaplanowany |

## Minimalny zakres prezentacji na oddanie

1. Uruchomienie niezależnie aplikacji Cloud i aplikacji Local Vault.
2. Dodanie CV i kolejnej wersji.
3. Dodanie oferty, portfolio i utworzenie Application.
4. Zmiana statusu z widoczną historią i notatką.
5. Przypisanie CV do Application z widocznym snapshotem.
6. W Cloud Mode: uzyskanie zgody AI i działający przykład analizy albo listu motywacyjnego.
7. W Local Vault Mode: odświeżenie strony bez utraty danych i potwierdzenie braku AI.

## Reguła cięcia zakresu

Jeżeli termin jest zagrożony, nie usuwamy bezpieczeństwa, RLS, Local Vault, historii aplikacji ani podstawowego AI. W tej kolejności odraczamy: rozbudowany design, eksport, upload binarnych portfolio, wiele typów filtrów oraz dodatkowe statystyki. AI Job Discovery i Interview Coach nie są częścią prac do 8 sierpnia.

## Po MVP

### Wersja 1.1

- AI Job Discovery z ręcznym zapisaniem wyniku jako Job Offer.
- Statystyki procesu i dashboard.
- Szyfrowane kopie Local Vault oraz import/eksport.
- Opcjonalna blokada Local Vault i szyfrowanie danych lokalnych po osobnym modelu zagrożeń; nie wprowadzamy pozornego „szyfrowania” bez ochrony bazy i plików PDF.
- Dopracowany mechanizm cache, circuit breaker i monitoring kosztów AI.
- Motyw jasny, ciemny i zgodny z ustawieniem systemu wraz z zapamiętaniem preferencji użytkownika.
- Obsługa CV w formacie Word (`.docx`) po analizie bezpieczeństwa plików; MVP pozostaje przy PDF do 5 MB.
- Ostrzeżenie przed opuszczeniem formularza z niezapisanymi zmianami.

### Wersja 2.0

- Interview Coach: symulacje, odpowiedzi tekstowe/głosowe, ocena i raport.
- Zaawansowane rekomendacje na podstawie historii użytkownika, wyłącznie po zgodzie.
