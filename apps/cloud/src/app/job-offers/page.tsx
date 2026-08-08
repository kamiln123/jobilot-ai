"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient, isSupabaseBrowserConfigured } from "@/lib/supabase/browser-client";

type JobOffer = {
  id: string;
  company_name: string;
  position_title: string;
  location: string | null;
  work_mode: "remote" | "hybrid" | "onsite" | null;
  employment_type: string | null;
  created_at: string;
};

const workModeLabels = { remote: "Zdalnie", hybrid: "Hybrydowo", onsite: "Stacjonarnie" };

export default function JobOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function loadOffers() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("job_offers")
        .select("id, company_name, position_title, location, work_mode, employment_type, created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (error) {
        setState("error");
        return;
      }

      setOffers((data ?? []) as JobOffer[]);
      setState("ready");
    }

    void loadOffers();
    return () => { active = false; };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mt-5 flex flex-col justify-between gap-5 sm:mt-12 sm:flex-row sm:items-end">
          <div><p className="text-sm font-medium text-[#6c8b70]">Cloud Mode</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Oferty pracy</h1><p className="mt-2 text-sm text-[#687167]">Zapisuj ręcznie oferty znalezione na dowolnym portalu. Nie pobieramy ich automatycznie.</p></div>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#2d5034] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#203d27]" href="/job-offers/new">+ Dodaj ofertę</Link>
        </div>

        {state === "loading" ? <p className="mt-10 text-sm text-[#6c716b]">Ładowanie ofert...</p> : null}
        {state === "error" ? <p className="mt-10 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a63f2d]">Nie udało się pobrać ofert. Odśwież stronę i spróbuj ponownie.</p> : null}
        {state === "ready" && offers.length === 0 ? <section className="mt-8 rounded-2xl border border-dashed border-[#cfd7cb] bg-white p-8 text-center sm:p-12"><h2 className="text-lg font-semibold">Nie masz jeszcze zapisanych ofert.</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6c716b]">Dodaj pierwszą ofertę, aby później utworzyć dla niej Application, przypisać CV i śledzić status rekrutacji.</p><Link className="mt-6 inline-flex rounded-xl bg-[#2d5034] px-4 py-3 text-sm font-semibold text-white hover:bg-[#203d27]" href="/job-offers/new">Dodaj pierwszą ofertę</Link></section> : null}
        {state === "ready" && offers.length > 0 ? <section className="mt-8 overflow-hidden rounded-2xl border border-[#e5e7e0] bg-white"><ul className="divide-y divide-[#edf0e9]">{offers.map((offer) => <li key={offer.id}><Link className="flex items-center justify-between gap-5 p-5 transition hover:bg-[#f8faf6] sm:p-6" href={`/job-offers/${offer.id}`}><div className="min-w-0"><p className="truncate text-base font-semibold">{offer.position_title}</p><p className="mt-1 text-sm text-[#687167]">{offer.company_name}</p><div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-[#627160]">{offer.location ? <span className="rounded-full bg-[#f0f3ed] px-2.5 py-1">{offer.location}</span> : null}{offer.work_mode ? <span className="rounded-full bg-[#eaf4e8] px-2.5 py-1">{workModeLabels[offer.work_mode]}</span> : null}{offer.employment_type ? <span className="rounded-full bg-[#f0f3ed] px-2.5 py-1">{offer.employment_type}</span> : null}</div></div><time className="shrink-0 text-xs text-[#8b908a]" dateTime={offer.created_at}>{new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(offer.created_at))}</time></Link></li>)}</ul></section> : null}
      </div>
    </main>
  );
}
