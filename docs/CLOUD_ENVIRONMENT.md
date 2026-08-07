# Konfiguracja środowiska Cloud Mode

## Lokalnie

Next.js uruchamia się z katalogu `apps/cloud`, dlatego publiczne dane połączenia do Supabase muszą znaleźć się w pliku `apps/cloud/.env.local`.

1. Skopiuj `apps/cloud/.env.example` jako `apps/cloud/.env.local`.
2. Wklej do niego wyłącznie `Project URL` oraz `Publishable/anon key` z Supabase.
3. Nigdy nie wklejaj tam `SUPABASE_SERVICE_ROLE_KEY`, hasła do bazy ani tokenu dostawcy AI.

`apps/cloud/.env.local` jest ignorowany przez Git i nie trafia do publicznego repozytorium.

## Vercel

W projekcie Vercel wejdź do **Settings → Environment Variables** i dodaj dla środowisk Production oraz Preview:

| Nazwa | Wartość |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL z Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable/anon key z Supabase |

Po zapisaniu zmiennych wykonaj ponowne wdrożenie. Klucz `service_role` będzie potrzebny dopiero dla bezpiecznych operacji backendowych; nie dodawaj go teraz do Vercel ani do kodu frontendu.
