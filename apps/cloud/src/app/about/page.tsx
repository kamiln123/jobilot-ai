import type { Metadata } from "next";
import Link from "next/link";

import { PRODUCT_AUTHOR, PRODUCT_GITHUB_URL, PRODUCT_VERSION } from "@/lib/product";

export const metadata: Metadata = {
  title: "O projekcie | Jobilot AI",
  description: "Cel, tryby działania i zasady prywatności projektu Jobilot AI.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/login">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#263b2c] text-lg font-bold text-white">J</span>
            <span className="text-lg font-semibold tracking-tight">Jobilot <em className="font-medium text-[#5e7863]">AI</em></span>
          </Link>
          <Link className="text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href="/login">Przejdź do Cloud Mode</Link>
        </header>

        <section className="mt-12 rounded-3xl border border-[#c9d8c6] bg-[#eef4eb] p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold text-[#5e7863]">{PRODUCT_VERSION}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">O projekcie Jobilot AI</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-[#566054] sm:text-base">
            Jobilot AI pomaga samodzielnie prowadzić proces poszukiwania pracy: od zapisanej oferty, przez wybrane CV i portfolio, aż po status, notatki i historię konkretnej aplikacji rekrutacyjnej.
          </p>
        </section>

        <section className="mt-7 grid gap-7 md:grid-cols-2">
          <article className="rounded-2xl border border-[#c5d6c2] bg-[#f1f6ee] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#5e7863]">Cloud Mode</p>
            <h2 className="mt-2 text-xl font-semibold">Wygodna praca w chmurze</h2>
            <p className="mt-3 text-sm leading-6 text-[#566054]">Konto, prywatne dane użytkownika, biblioteka CV, oferty, portfolio i aplikacje rekrutacyjne. Wgląd do Twoich aplikacji jest możliwy w każdym czasie i z każdego miejsca. Funkcje AI są opcjonalne i wymagają świadomej zgody.</p>
          </article>
          <article className="rounded-2xl border border-[#b9d0b5] bg-[#e7f0e4] p-6 shadow-sm">
            <p className="text-sm font-semibold text-[#5e7863]">Local Vault</p>
            <h2 className="mt-2 text-xl font-semibold">Lokalny sejf danych</h2>
            <p className="mt-3 text-sm leading-6 text-[#566054]">Oddzielna aplikacja Windows bez konta, synchronizacji, telemetrii i funkcji AI. Dane pozostają w prywatnym katalogu aplikacji na urządzeniu.</p>
            <Link className="mt-5 inline-flex text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href="/local-vault">Pobierz Local Vault →</Link>
          </article>
        </section>

        <section className="mt-7 rounded-2xl border border-[#d4ded0] bg-[#f9fbf7] p-6 sm:p-8">
          <h2 className="text-xl font-semibold">Prywatność i odpowiedzialne AI</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#687167]">Wyniki AI nie są zapisywane automatycznie. W Cloud Mode użytkownik decyduje, czy zapisać końcową analizę albo list motywacyjny. Aktualny wariant MVP korzysta z Gemini Free Tier wyłącznie po wyrażeniu zgody; dostawca może wykorzystywać przesłaną treść do ulepszania swoich produktów.</p>
        </section>

        <section className="mt-7 rounded-2xl border border-[#d4ded0] bg-[#f9fbf7] p-6 text-sm text-[#687167] sm:p-8">
          <h2 className="font-semibold text-[#2f4031]">Autor</h2>
          <p className="mt-2">{PRODUCT_AUTHOR}</p>
          <a className="mt-3 inline-flex font-semibold text-[#456a4b] hover:text-[#294b30]" href={PRODUCT_GITHUB_URL} rel="noreferrer" target="_blank">GitHub ↗</a>
        </section>
      </div>
    </main>
  );
}
