"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getSupabaseBrowserClient, isSupabaseBrowserConfigured } from "@/lib/supabase/browser-client";

type JobOfferDetail = {
  id: string;
  company_name: string;
  position_title: string;
  description: string | null;
  requirements: string | null;
  location: string | null;
  work_mode: "remote" | "hybrid" | "onsite" | null;
  employment_type: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  source_url: string | null;
  notes: string | null;
  created_at: string;
};

const workModeLabels = { remote: "Zdalnie", hybrid: "Hybrydowo", onsite: "Stacjonarnie" };

export default function JobOfferDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [offer, setOffer] = useState<JobOfferDetail | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "not-found" | "error">("loading");

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function loadOffer() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("job_offers")
        .select("id, company_name, position_title, description, requirements, location, work_mode, employment_type, salary_min, salary_max, salary_currency, source_url, notes, created_at")
        .eq("id", id)
        .is("deleted_at", null)
        .maybeSingle();

      if (!active) return;
      if (error) {
        setState("error");
        return;
      }
      if (!data) {
        setState("not-found");
        return;
      }

      setOffer(data as JobOfferDetail);
      setState("ready");
    }

    void loadOffer();
    return () => { active = false; };
  }, [id, router]);

  if (state === "loading") return <LoadingPage />;
  if (state === "not-found") return <MessagePage title="Nie znaleziono oferty" text="Oferta nie istnieje, została zarchiwizowana lub nie masz do niej dostępu." />;
  if (state === "error" || !offer) return <MessagePage title="Nie udało się wczytać oferty" text="Odśwież stronę i spróbuj ponownie." />;

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link className="inline-flex text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href="/job-offers">← Oferty pracy</Link>
        <section className="mt-5 rounded-2xl border border-[#e5e7e0] bg-white p-6 sm:mt-12 sm:p-9">
          <p className="text-sm font-medium text-[#6c8b70]">{offer.company_name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{offer.position_title}</h1>
          <div className="mt-5 flex flex-wrap gap-2 text-sm font-medium text-[#627160]">
            {offer.location ? <span className="rounded-full bg-[#f0f3ed] px-3 py-1.5">{offer.location}</span> : null}
            {offer.work_mode ? <span className="rounded-full bg-[#eaf4e8] px-3 py-1.5">{workModeLabels[offer.work_mode]}</span> : null}
            {offer.employment_type ? <span className="rounded-full bg-[#f0f3ed] px-3 py-1.5">{offer.employment_type}</span> : null}
          </div>
          <p className="mt-6 text-xs text-[#8b908a]">Dodano {formatDate(offer.created_at)}</p>
          <Link className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[#c9d8c6] bg-[#eef4eb] px-4 py-2 text-sm font-semibold text-[#315b3a] hover:bg-[#dce9dc]" href={`/job-offers/${id}/edit`}>Edytuj ofertę</Link>
        </section>

        <div className="mt-7 grid gap-7 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-7">
            <DetailCard title="Opis oferty" value={offer.description} />
            <DetailCard title="Wymagania" value={offer.requirements} />
            <DetailCard privateNote title="Prywatna notatka" value={offer.notes} />
          </div>
          <aside className="space-y-7">
            <section className="rounded-2xl border border-[#e5e7e0] bg-white p-5">
              <h2 className="font-semibold">Szczegóły</h2>
              <dl className="mt-4 space-y-4 text-sm">
                <DetailRow label="Wynagrodzenie" value={formatSalary(offer)} />
                <DetailRow label="Lokalizacja" value={offer.location} />
                <DetailRow label="Tryb pracy" value={offer.work_mode ? workModeLabels[offer.work_mode] : null} />
                <DetailRow label="Zatrudnienie" value={offer.employment_type} />
              </dl>
            </section>
            <section className="rounded-2xl border border-[#e5e7e0] bg-white p-5">
              <h2 className="font-semibold">Źródło</h2>
              {offer.source_url ? <p className="mt-3 break-all text-sm text-[#626b61]">{offer.source_url}</p> : <p className="mt-3 text-sm text-[#7b8179]">Nie dodano linku źródłowego.</p>}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function DetailCard({ privateNote = false, title, value }: { privateNote?: boolean; title: string; value: string | null }) {
  return <section className="rounded-2xl border border-[#e5e7e0] bg-white p-5 sm:p-6"><h2 className="font-semibold">{title}</h2>{value ? <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#50584f]">{value}</p> : <p className="mt-4 text-sm text-[#8b908a]">{privateNote ? "Nie dodano prywatnej notatki." : "Nie dodano danych."}</p>}</section>;
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return <div><dt className="text-xs font-medium uppercase tracking-wide text-[#8b908a]">{label}</dt><dd className="mt-1 text-[#3d463d]">{value ?? "Nie podano"}</dd></div>;
}

function LoadingPage() {
  return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] text-sm text-[#5d665c]">Ładowanie oferty...</main>;
}

function MessagePage({ text, title }: { text: string; title: string }) {
  return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] p-6 text-[#20241f]"><section className="max-w-lg rounded-2xl border border-[#e5e7e0] bg-white p-7 text-center"><h1 className="text-xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-6 text-[#687167]">{text}</p><Link className="mt-6 inline-flex rounded-xl bg-[#2d5034] px-4 py-3 text-sm font-semibold text-white hover:bg-[#203d27]" href="/job-offers">Wróć do ofert</Link></section></main>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}

function formatSalary(offer: JobOfferDetail) {
  if (offer.salary_min === null && offer.salary_max === null) return null;
  const currency = offer.salary_currency ? ` ${offer.salary_currency}` : "";
  if (offer.salary_min !== null && offer.salary_max !== null) return `${offer.salary_min}–${offer.salary_max}${currency}`;
  return offer.salary_min !== null ? `od ${offer.salary_min}${currency}` : `do ${offer.salary_max}${currency}`;
}
