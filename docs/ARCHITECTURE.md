# Architektura — Jobilot AI

## Dwa niezależne produkty

Jobilot AI nie ma ekranu przełączającego tryby. Użytkownik wybiera produkt przed uruchomieniem:

```text
GitHub
├── apps/cloud  → Vercel → Jobilot AI Cloud (przeglądarka)
│                             ├── Supabase Auth
│                             ├── Supabase PostgreSQL + RLS
│                             ├── Supabase private Storage
│                             └── Next.js AI Gateway → OpenAI
│
└── apps/local  → instalator Windows → Jobilot AI Local Vault
                                  ├── Tauri shell
                                  ├── React UI
                                  └── SQLite + lokalny magazyn plików
```

Kod może współdzielić modele domenowe, schematy walidacji i komponenty prezentacyjne przez katalog `packages/`. Nie współdzielimy klientów Supabase, kodu AI, zmiennych środowiskowych ani magazynów danych.

## Jobilot AI Cloud

- Aplikacja Next.js dostępna przez HTTPS, wdrażana z GitHuba na Vercel.
- Gałąź `main` wdraża produkcję; gałęzie funkcjonalne otrzymują Preview Deployment.
- Supabase realizuje konta, relacyjną bazę danych, RLS i prywatny storage plików.
- Endpointy Next.js tworzą AI Gateway. Tylko one odczytują klucze OpenAI/Gemini.
- Vercel przechowuje sekrety oddzielnie dla Development, Preview i Production. Sekrety nie trafiają do GitHuba.

## Jobilot AI Local Vault

- Instalowalna aplikacja Windows zbudowana w Tauri.
- Tauri uruchamia lokalny interfejs React; użytkownik nie wybiera trybu pracy.
- SQLite przechowuje metadane, historię, notatki i relacje. Pliki są zapisywane w katalogu danych aplikacji użytkownika.
- Aplikacja nie zawiera OpenAI, Gemini, Supabase ani modułów analitycznych; zaplanowane żądania sieciowe są niedozwolone.
- Local Vault ma osobny identyfikator aplikacji i osobny pipeline budowania instalatora.

## Granice bezpieczeństwa

| Obszar | Cloud | Local Vault |
| --- | --- | --- |
| Uwierzytelnianie | Supabase Auth | Brak konta chmurowego |
| Dane | Supabase, RLS per użytkownik | SQLite na komputerze użytkownika |
| Pliki | Prywatny Storage, signed URL | Lokalny katalog aplikacji |
| AI | Tylko przez server-side AI Gateway | Niedostępne |
| Telemetria | Brak danych wrażliwych | Brak telemetrii |
| Sekrety dostawców | Vercel Environment Variables | Nie istnieją |

## Strategia GitHub i wdrożenia

1. Repozytorium GitHub zawiera kod, dokumentację i szablony konfiguracji bez wartości.
2. Po utworzeniu aplikacji Cloud łączymy repozytorium z projektem Vercel.
3. W dashboardzie Vercel ręcznie ustawiamy wartości z `.env.example`; nigdy nie importujemy prawdziwego `.env.local` do Gita.
4. Każdy pull request dostaje adres testowy Preview; publikacja na produkcję następuje z `main`.
5. Local Vault budujemy jako instalator Windows i publikujemy wydanie GitHub Release dopiero po testach.

## Zasada kosztowa

Projekt działa w modelu **zero kosztów bez osobnej zgody właściciela**.

- Cloud wykorzystuje wyłącznie Vercel Hobby i Supabase Free, dopóki właściciel nie zatwierdzi zmiany planu.
- `AI_GLOBAL_ENABLED=false` jest bezpieczną wartością domyślną dla każdego środowiska.
- Klucze OpenAI i Gemini nie są dodawane do Vercel ani `.env.local` bez osobnej zgody właściciela.
- Przed pierwszym użyciem płatnego API ustalamy limit finansowy, limit operacji na użytkownika oraz mechanizm zatrzymania po przekroczeniu budżetu.
- Local Vault nie korzysta z płatnych ani zewnętrznych usług.
