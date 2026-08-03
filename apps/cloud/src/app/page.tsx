"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type DashboardState =
  | { kind: "loading" }
  | { kind: "configuration-error" }
  | { kind: "ready"; email: string; applicationCount: number; cvCount: number };

export default function Home() {
  const router = useRouter();
  const configured = isSupabaseBrowserConfigured();
  const [state, setState] = useState<DashboardState>(() =>
    configured ? { kind: "loading" } : { kind: "configuration-error" },
  );

  useEffect(() => {
    if (!configured) return;

    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function loadDashboard() {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.replace("/login");
        return;
      }

      const [applicationsResult, cvResult] = await Promise.all([
        supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null),
        supabase
          .from("cv_documents")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null),
      ]);

      if (!active) return;

      setState({
        kind: "ready",
        email: session.user.email ?? "Użytkowniku",
        applicationCount: applicationsResult.count ?? 0,
        cvCount: cvResult.count ?? 0,
      });
    }

    void loadDashboard();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.replace("/login");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [configured, router]);

  async function handleSignOut() {
    if (!isSupabaseBrowserConfigured()) return;
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (state.kind === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f4] text-sm text-[#5d665c]">
        Bezpieczne ładowanie Twojego pulpitu...
      </main>
    );
  }

  if (state.kind === "configuration-error") {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f4] p-6 text-[#20241f]">
        <section className="max-w-lg rounded-2xl border border-[#e4e6de] bg-white p-7 shadow-sm">
          <p className="text-sm font-semibold text-[#6c8b70]">Cloud Mode</p>
          <h1 className="mt-2 text-2xl font-semibold">Brakuje konfiguracji Supabase</h1>
          <p className="mt-3 text-sm leading-6 text-[#687167]">
            Dodaj publiczne zmienne środowiskowe aplikacji Cloud, a potem odśwież stronę.
          </p>
        </section>
      </main>
    );
  }

  const displayName = state.email.split("@")[0];

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#20241f]">
      <div className="mx-auto flex min-h-screen max-w-[1540px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e6e7df] bg-[#fbfbf8] px-5 py-7 lg:flex">
          <a className="mb-12 flex items-center gap-3 px-2" href="#pulpit">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#263b2c] text-lg font-bold text-white">J</span>
            <span className="text-lg font-semibold tracking-tight">Jobilot <em className="font-medium text-[#5e7863]">AI</em></span>
          </a>
          <nav aria-label="Główna nawigacja" className="space-y-1">
            <a className="flex items-center gap-3 rounded-xl bg-[#e7efe5] px-3 py-2.5 text-sm font-medium text-[#26432c]" href="#pulpit">Pulpit</a>
            <span className="block rounded-xl px-3 py-2.5 text-sm text-[#98a098]">Aplikacje — w przygotowaniu</span>
            <Link className="block rounded-xl px-3 py-2.5 text-sm font-medium text-[#687167] hover:bg-[#f0f2ec] hover:text-[#263b2c]" href="/job-offers">Oferty pracy</Link>
            <span className="block rounded-xl px-3 py-2.5 text-sm text-[#98a098]">Biblioteka CV — w przygotowaniu</span>
          </nav>
          <div className="mt-auto rounded-2xl bg-[#263b2c] p-4 text-[#f8fbf6]">
            <p className="text-xs font-medium text-[#c7d8c5]">Cloud Mode</p>
            <p className="mt-1 text-sm font-semibold">Twoje dane są prywatne</p>
            <p className="mt-2 text-xs leading-5 text-[#c7d8c5]">AI pozostaje wyłączone do czasu świadomego uruchomienia.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
          <header className="flex items-center justify-between gap-4">
            <a className="flex items-center gap-2 lg:hidden" href="#pulpit">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#263b2c] text-sm font-bold text-white">J</span>
              <span className="font-semibold">Jobilot AI</span>
            </a>
            <p className="hidden flex-1 text-sm text-[#6c716b] sm:block">Twoje prywatne centrum procesu rekrutacyjnego.</p>
            <button className="rounded-xl border border-[#e4e6de] bg-white px-3 py-2 text-sm font-medium text-[#3d463d] hover:bg-[#f1f4ee]" onClick={handleSignOut} type="button">
              Wyloguj się
            </button>
          </header>

          <div id="pulpit" className="mt-12">
            <p className="text-sm font-medium text-[#6c8b70]">Cloud Mode · bezpieczna sesja</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Dzień dobry, {displayName}.</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#6c716b]">Pulpit korzysta z zabezpieczeń Supabase RLS: widzisz wyłącznie własne dane.</p>
          </div>

          <section aria-label="Podsumowanie procesu" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Aktywne aplikacje" note="Wczytane z Twojego konta" value={String(state.applicationCount)} />
            <StatCard label="Dokumenty CV" note="Aktywne dokumenty w bibliotece" value={String(state.cvCount)} />
            <StatCard label="AI" note="Nie wykonano żadnej operacji" value="Wyłączone" />
          </section>

          <section className="mt-8 rounded-2xl border border-[#e5e7e0] bg-white p-6 sm:p-8">
            <p className="text-sm font-semibold text-[#456a4b]">Następny krok</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight">Dodawanie ofert pracy</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6c716b]">
              Ręczny zapis ofert jest już dostępny. Application utworzymy w kolejnym kroku — decyzja o aplikowaniu zawsze pozostaje po Twojej stronie.
            </p>
            <Link className="mt-5 inline-flex rounded-xl bg-[#2d5034] px-4 py-3 text-sm font-semibold text-white hover:bg-[#203d27]" href="/job-offers">Przejdź do ofert pracy</Link>
          </section>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="rounded-2xl border border-[#e5e7e0] bg-white p-5">
      <p className="text-sm font-medium text-[#737a70]">{label}</p>
      <p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-[#8b908a]">{note}</p>
    </article>
  );
}
