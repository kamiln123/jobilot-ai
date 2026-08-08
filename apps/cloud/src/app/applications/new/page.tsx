"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type JobOffer = { id: string; company_name: string; position_title: string };
type CvVersion = {
  id: string;
  cv_document_id: string;
  version_number: number;
  original_file_name: string;
  documentName?: string;
};
type PortfolioItem = { id: string; title: string; artifact_type: string };

const statuses = [
  ["saved", "Zapisana"],
  ["preparing", "Przygotowywana"],
  ["applied", "Wysłana"],
  ["interview", "Rozmowa"],
  ["offer", "Oferta"],
  ["rejected", "Odrzucona"],
  ["withdrawn", "Wycofana"],
] as const;

export default function NewApplicationPage() {
  const router = useRouter();
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [cvVersions, setCvVersions] = useState<CvVersion[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [jobOfferId, setJobOfferId] = useState("");
  const [cvVersionId, setCvVersionId] = useState("");
  const [status, setStatus] = useState("saved");
  const [portfolioIds, setPortfolioIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const [offersResult, versionsResult, documentsResult, portfolioResult] = await Promise.all([
        supabase.from("job_offers").select("id,company_name,position_title").is("deleted_at", null).order("created_at", { ascending: false }),
        supabase.from("cv_versions").select("id,cv_document_id,version_number,original_file_name").order("created_at", { ascending: false }),
        supabase.from("cv_documents").select("id,name").is("deleted_at", null),
        supabase.from("portfolio_artifacts").select("id,title,artifact_type").is("archived_at", null).order("created_at", { ascending: false }),
      ]);

      if (offersResult.error || versionsResult.error || documentsResult.error || portfolioResult.error) {
        setError("Nie udało się przygotować danych do utworzenia aplikacji.");
      } else {
        setJobOffers((offersResult.data ?? []) as JobOffer[]);
        const documentsById = new Map((documentsResult.data ?? []).map((document) => [document.id, document.name]));
        setCvVersions(((versionsResult.data ?? []) as CvVersion[]).map((version) => ({ ...version, documentName: documentsById.get(version.cv_document_id) })));
        setPortfolioItems((portfolioResult.data ?? []) as PortfolioItem[]);
      }
      setLoading(false);
    })();
  }, [router]);

  function togglePortfolio(itemId: string) {
    setPortfolioIds((current) => current.includes(itemId) ? current.filter((id) => id !== itemId) : [...current, itemId]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!jobOfferId || !cvVersionId) {
      setError("Wybierz ofertę pracy i konkretną wersję CV.");
      return;
    }

    setSaving(true);
    const supabase = getSupabaseBrowserClient();
    const { data, error: rpcError } = await supabase.rpc("create_application_with_portfolio", {
      p_job_offer_id: jobOfferId,
      p_cv_version_id: cvVersionId,
      p_status: status,
      p_portfolio_artifact_ids: portfolioIds,
    });

    if (rpcError) {
      const message = rpcError.message.toLowerCase();
      if (message.includes("applications_one_active_per_offer") || message.includes("duplicate")) {
        setError("Masz już aktywną aplikację do tej oferty.");
      } else if (message.includes("could not find the function")) {
        setError("Brakuje aktualizacji bazy danych dla modułu Application.");
      } else {
        setError("Nie udało się utworzyć aplikacji. Sprawdź dane i spróbuj ponownie.");
      }
      setSaving(false);
      return;
    }

    router.replace(`/applications/${data}`);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mt-5 text-3xl font-semibold sm:mt-12">Utwórz aplikację</h1>
        <p className="mt-2 text-sm text-[#687167]">Zapis zostanie wykonany atomowo: oferta, snapshot CV i portfolio powstaną razem albo wcale.</p>

        {loading ? <p className="mt-8 text-sm text-[#687167]">Ładowanie dostępnych ofert i dokumentów...</p> : null}
        {!loading ? (
          <form className="mt-8 space-y-6 rounded-2xl border border-[#e5e7e0] bg-white p-6" onSubmit={submit}>
            {error ? <p className="rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a63f2d]" role="alert">{error}</p> : null}

            <label className="block text-sm font-medium">
              Oferta pracy *
              <select className="mt-2 w-full rounded-xl border border-[#dfe3da] p-3" onChange={(event) => setJobOfferId(event.target.value)} value={jobOfferId}>
                <option value="">Wybierz ofertę</option>
                {jobOffers.map((offer) => <option key={offer.id} value={offer.id}>{offer.company_name} — {offer.position_title}</option>)}
              </select>
            </label>
            {jobOffers.length === 0 ? <p className="-mt-3 text-xs text-[#a63f2d]">Brakuje zapisanej oferty. <Link className="font-semibold underline" href="/job-offers/new">Dodaj ofertę pracy</Link>.</p> : null}

            <label className="block text-sm font-medium">
              Wersja CV *
              <select className="mt-2 w-full rounded-xl border border-[#dfe3da] p-3" onChange={(event) => setCvVersionId(event.target.value)} value={cvVersionId}>
                <option value="">Wybierz wersję CV</option>
                {cvVersions.map((version) => <option key={version.id} value={version.id}>{version.documentName ?? "CV"} — v{version.version_number} ({version.original_file_name})</option>)}
              </select>
            </label>
            {cvVersions.length === 0 ? <p className="-mt-3 text-xs text-[#a63f2d]">Brakuje CV. <Link className="font-semibold underline" href="/cv-library/new">Dodaj CV</Link>.</p> : null}

            <label className="block text-sm font-medium">
              Początkowy status
              <select className="mt-2 w-full rounded-xl border border-[#dfe3da] p-3" onChange={(event) => setStatus(event.target.value)} value={status}>
                {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>

            <fieldset>
              <legend className="text-sm font-medium">Portfolio (opcjonalnie)</legend>
              {portfolioItems.length === 0 ? <p className="mt-2 text-sm text-[#687167]">Nie masz jeszcze elementów portfolio.</p> : (
                <div className="mt-3 space-y-2">
                  {portfolioItems.map((item) => (
                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#e5e7e0] p-3 text-sm" key={item.id}>
                      <input checked={portfolioIds.includes(item.id)} onChange={() => togglePortfolio(item.id)} type="checkbox" />
                      <span>{item.title} <span className="text-xs text-[#687167]">({item.artifact_type})</span></span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <button className="rounded-xl bg-[#2d5034] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={saving || jobOffers.length === 0 || cvVersions.length === 0} type="submit">
              {saving ? "Tworzenie aplikacji..." : "Utwórz aplikację"}
            </button>
          </form>
        ) : null}
      </div>
    </main>
  );
}
