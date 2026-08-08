"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type DashboardState =
  | { kind: "loading" }
  | { kind: "configuration-error" }
  | { kind: "ready"; email: string; applicationCount: number; cvCount: number; portfolioCount: number };

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

      const [applicationsResult, cvResult, portfolioResult] = await Promise.all([
        supabase
          .from("applications")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null),
        supabase
          .from("cv_documents")
          .select("id", { count: "exact", head: true })
          .is("deleted_at", null),
        supabase
          .from("portfolio_artifacts")
          .select("id", { count: "exact", head: true })
          .is("archived_at", null),
      ]);

      if (!active) return;

      setState({
        kind: "ready",
        email: session.user.email ?? "Użytkowniku",
        applicationCount: applicationsResult.count ?? 0,
        cvCount: cvResult.count ?? 0,
        portfolioCount: portfolioResult.count ?? 0,
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
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-5 text-[#20241f] sm:px-8 sm:py-7 lg:px-12">
      <section className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4">
          <p className="flex-1 text-sm text-[#6c716b]">Twoje prywatne centrum procesu rekrutacyjnego.</p>
          <button className="rounded-xl border border-[#e4e6de] bg-white px-3 py-2 text-sm font-medium text-[#3d463d] hover:bg-[#f1f4ee]" onClick={handleSignOut} type="button">
            Wyloguj się
          </button>
        </header>

        <div className="mt-12">
          <p className="text-sm font-medium text-[#6c8b70]">Cloud Mode</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Dzień dobry, {displayName}.</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[#6c716b]">Pulpit korzysta z zabezpieczeń Supabase RLS: widzisz wyłącznie własne dane.</p>
        </div>

        <section aria-label="Podsumowanie procesu" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Aktywne aplikacje" value={String(state.applicationCount)} />
          <StatCard label="Dokumenty CV" value={String(state.cvCount)} />
          <StatCard label="Portfolio" value={String(state.portfolioCount)} />
          <StatCard label="AI" note="Włączane osobno po świadomej zgodzie w wybranej aplikacji na ofertę pracy" value="Opcjonalne" />
          <section className="rounded-2xl border border-[#e5e7e0] bg-white p-5 xl:col-span-2">
            <h2 className="text-sm font-semibold text-[#456a4b]">Zarządzaj aplikacjami</h2>
            <p className="mt-2 text-xs leading-5 text-[#6c716b]">Połącz ofertę, wersję CV i portfolio w jedną aplikację rekrutacyjną.</p>
            <Link className="mt-4 inline-flex min-h-10 items-center rounded-xl bg-[#2d5034] px-4 py-2 text-sm font-semibold text-white hover:bg-[#203d27]" href="/applications">Przejdź do aplikacji</Link>
          </section>
        </section>
      </section>
    </main>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="rounded-2xl border border-[#e5e7e0] bg-white p-5">
      <p className="text-sm font-medium text-[#737a70]">{label}</p>
      <p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p>
      {note ? <p className="mt-2 text-xs text-[#8b908a]">{note}</p> : null}
    </article>
  );
}
