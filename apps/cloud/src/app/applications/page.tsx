"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type Application = {
  id: string;
  status: string;
  created_at: string;
  cv_file_name_snapshot: string;
  cv_version_snapshot: number;
  job_offer_id: string;
  company_name?: string;
  position_title?: string;
};

const statusLabels: Record<string, string> = {
  saved: "Zapisana",
  preparing: "Przygotowywana",
  applied: "Wysłana",
  interview: "Rozmowa",
  offer: "Oferta",
  rejected: "Odrzucona",
  withdrawn: "Wycofana",
};

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("applications")
        .select("id,status,created_at,cv_file_name_snapshot,cv_version_snapshot,job_offer_id")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) {
        setState("error");
        return;
      }

      const applicationRows = (data ?? []) as Application[];
      const offerIds = applicationRows.map((application) => application.job_offer_id);
      const { data: offers, error: offersError } = offerIds.length === 0
        ? { data: [], error: null }
        : await supabase.from("job_offers").select("id,company_name,position_title").in("id", offerIds);
      if (offersError) {
        setState("error");
        return;
      }

      const offersById = new Map((offers ?? []).map((offer) => [offer.id, offer]));
      setApplications(applicationRows.map((application) => {
        const offer = offersById.get(application.job_offer_id);
        return {
          ...application,
          company_name: offer?.company_name,
          position_title: offer?.position_title,
        };
      }));
      setState("ready");
    })();
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <section className="mt-5 flex flex-col justify-between gap-5 sm:mt-12 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#6c8b70]">Cloud Mode</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Aplikacje</h1>
            <p className="mt-2 text-sm text-[#687167]">Każda pozycja łączy ofertę, konkretny snapshot CV i wybrane portfolio.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#2d5034] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203d27]" href="/applications/new">
            + Utwórz aplikację
          </Link>
        </section>

        {state === "loading" ? <p className="mt-10 text-sm text-[#687167]">Ładowanie aplikacji...</p> : null}
        {state === "error" ? <p className="mt-8 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a63f2d]">Nie udało się pobrać aplikacji.</p> : null}
        {state === "ready" && applications.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-[#cfd7cb] bg-white p-10 text-center">
            <h2 className="font-semibold">Nie masz jeszcze żadnej aplikacji.</h2>
            <p className="mt-2 text-sm text-[#687167]">Najpierw zapisz ofertę i przynajmniej jedną wersję CV.</p>
          </section>
        ) : null}
        {state === "ready" && applications.length > 0 ? (
          <section className="mt-8 space-y-4">
            {applications.map((application) => (
              <Link className="block rounded-2xl border border-[#e5e7e0] bg-white p-5 transition hover:border-[#aebda9]" href={`/applications/${application.id}`} key={application.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{application.company_name ?? "Oferta niedostępna"}</p>
                    <p className="mt-1 text-sm text-[#687167]">{application.position_title ?? "Stanowisko niedostępne"}</p>
                  </div>
                  <span className="rounded-full bg-[#edf4eb] px-3 py-1 text-xs font-semibold text-[#315b3a]">{statusLabels[application.status] ?? application.status}</span>
                </div>
                <p className="mt-4 text-xs text-[#8b908a]">CV: {application.cv_file_name_snapshot}, v{application.cv_version_snapshot}</p>
              </Link>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
