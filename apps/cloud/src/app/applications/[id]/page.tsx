"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type Application = {
  id: string;
  status: string;
  created_at: string;
  sent_at: string | null;
  cv_file_name_snapshot: string;
  cv_version_snapshot: number;
  cv_checksum_snapshot: string;
  job_offer_id: string;
  jobOffer?: JobOffer;
};
type JobOffer = { company_name: string; position_title: string; location: string | null; source_url: string | null };
type HistoryItem = { id: string; previous_status: string | null; new_status: string; changed_at: string; note: string | null };
type Note = { id: string; content: string; created_at: string };
type PortfolioItem = { id: string; title: string; url: string | null; artifact_type: string };

const statuses = [
  ["saved", "Zapisana"],
  ["preparing", "Przygotowywana"],
  ["applied", "Wysłana"],
  ["interview", "Rozmowa"],
  ["offer", "Oferta"],
  ["rejected", "Odrzucona"],
  ["withdrawn", "Wycofana"],
] as const;
const statusLabel = (value: string | null) => statuses.find(([key]) => key === value)?.[1] ?? value ?? "—";

function safeHttpUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function ApplicationDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const applicationId = typeof params.id === "string" ? params.id : "";
  const [application, setApplication] = useState<Application | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState("saved");
  const [noteContent, setNoteContent] = useState("");
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const load = useCallback(async () => {
    if (!applicationId) {
      setError("Adres aplikacji jest niekompletny.");
      setState("not-found");
      return;
    }
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.replace("/login");
      return;
    }

    const { data: ownedApplications, error: applicationError } = await supabase
      .from("applications")
      .select("id,status,created_at,sent_at,cv_file_name_snapshot,cv_version_snapshot,cv_checksum_snapshot,job_offer_id")
      .is("deleted_at", null);

    if (applicationError) {
      setState("error");
      return;
    }
    const baseApplication = (ownedApplications ?? []).find((item) => item.id === applicationId) as Application | undefined;
    if (!baseApplication) {
      setError("Nie udało się potwierdzić dostępu do tej aplikacji w aktywnej sesji.");
      setState("not-found");
      return;
    }

    const [historyResult, notesResult, portfolioResult] = await Promise.all([
      supabase.from("application_status_history").select("id,previous_status,new_status,changed_at,note").eq("application_id", baseApplication.id).order("changed_at", { ascending: false }),
      supabase.from("application_notes").select("id,content,created_at").eq("application_id", baseApplication.id).is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("application_portfolio_artifacts").select("portfolio_artifact_id").eq("application_id", baseApplication.id),
    ]);
    const portfolioRelations = portfolioResult.error ? [] : portfolioResult.data ?? [];
    const [jobOfferResult, portfolioItemsResult] = await Promise.all([
      supabase.from("job_offers").select("company_name,position_title,location,source_url").eq("id", baseApplication.job_offer_id).maybeSingle(),
      portfolioRelations.length === 0
        ? Promise.resolve({ data: [], error: null })
        : supabase.from("portfolio_artifacts").select("id,title,url,artifact_type").in("id", portfolioRelations.map((relation) => relation.portfolio_artifact_id)),
    ]);

    const nextApplication = { ...baseApplication, jobOffer: jobOfferResult.error ? undefined : jobOfferResult.data ?? undefined };
    setApplication(nextApplication);
    setSelectedStatus(nextApplication.status);
    setHistory(historyResult.error ? [] : (historyResult.data ?? []) as HistoryItem[]);
    setNotes(notesResult.error ? [] : (notesResult.data ?? []) as Note[]);
    setPortfolio(portfolioItemsResult.error ? [] : (portfolioItemsResult.data ?? []) as PortfolioItem[]);
    if (historyResult.error || notesResult.error || portfolioResult.error || jobOfferResult.error || portfolioItemsResult.error) {
      setError("Część dodatkowych danych nie została wczytana. Możesz nadal zmienić status lub dodać notatkę.");
    }
    setState("ready");
  }, [applicationId, router]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  async function updateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application || selectedStatus === application.status) return;
    setError("");
    setSavingStatus(true);

    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase
      .from("applications")
      .update({
        status: selectedStatus,
        sent_at: selectedStatus === "applied" && !application.sent_at ? new Date().toISOString() : application.sent_at,
      })
      .eq("id", application.id);

    if (updateError) setError("Nie udało się zmienić statusu.");
    else await load();
    setSavingStatus(false);
  }

  async function addNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!application) return;
    if (!noteContent.trim()) {
      setError("Wpisz treść notatki.");
      return;
    }

    setError("");
    setSavingNote(true);
    const { error: insertError } = await getSupabaseBrowserClient().from("application_notes").insert({
      application_id: application.id,
      content: noteContent.trim(),
    });
    if (insertError) setError("Nie udało się dodać notatki.");
    else {
      setNoteContent("");
      await load();
    }
    setSavingNote(false);
  }

  if (state === "loading") return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] text-sm text-[#687167]">Ładowanie aplikacji...</main>;
  if (state === "not-found") return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] p-6 text-[#20241f]"><section className="max-w-md rounded-2xl bg-white p-6 text-center"><h1 className="text-xl font-semibold">Nie znaleziono aplikacji</h1><p className="mt-2 text-sm text-[#687167]">Aplikacja nie istnieje, została usunięta albo nie masz do niej dostępu.</p>{error ? <p className="mt-3 rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a63f2d]" role="alert">{error}</p> : null}<Link className="mt-5 inline-flex text-sm font-semibold text-[#456a4b]" href="/applications">Wróć do aplikacji</Link></section></main>;
  if (state === "error" || !application) return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] p-6 text-[#20241f]"><section className="max-w-md rounded-2xl bg-white p-6 text-center"><h1 className="text-xl font-semibold">Nie udało się wczytać aplikacji</h1><p className="mt-2 text-sm text-[#687167]">Odśwież stronę i spróbuj ponownie.</p><Link className="mt-5 inline-flex text-sm font-semibold text-[#456a4b]" href="/applications">Wróć do aplikacji</Link></section></main>;

  const jobOffer = application.jobOffer;
  const sourceUrl = safeHttpUrl(jobOffer?.source_url ?? null);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link className="text-sm font-semibold text-[#456a4b]" href="/applications">← Aplikacje</Link>
        <header className="mt-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#6c8b70]">Application</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">{jobOffer?.company_name ?? "Oferta niedostępna"}</h1>
            <p className="mt-2 text-lg text-[#687167]">{jobOffer?.position_title ?? "Stanowisko niedostępne"}</p>
          </div>
          <span className="rounded-full bg-[#edf4eb] px-3 py-1 text-sm font-semibold text-[#315b3a]">{statusLabel(application.status)}</span>
        </header>
        {error ? <p className="mt-6 rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a63f2d]" role="alert">{error}</p> : null}

        <section className="mt-8 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#e5e7e0] bg-white p-6">
            <h2 className="text-lg font-semibold">Wysłane CV — snapshot</h2>
            <p className="mt-4 text-sm font-medium">{application.cv_file_name_snapshot}</p>
            <p className="mt-1 text-sm text-[#687167]">Wersja v{application.cv_version_snapshot}</p>
            <p className="mt-3 break-all text-xs text-[#8b908a]">Checksum: {application.cv_checksum_snapshot}</p>
          </article>

          <form className="rounded-2xl border border-[#e5e7e0] bg-white p-6" onSubmit={updateStatus}>
            <h2 className="text-lg font-semibold">Status aplikacji</h2>
            <select className="mt-4 w-full rounded-xl border border-[#dfe3da] p-3" onChange={(event) => setSelectedStatus(event.target.value)} value={selectedStatus}>
              {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <button className="mt-3 rounded-xl bg-[#2d5034] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={savingStatus || selectedStatus === application.status} type="submit">
              {savingStatus ? "Zapisywanie..." : "Zmień status"}
            </button>
            {application.sent_at ? <p className="mt-3 text-xs text-[#687167]">Data wysłania: {formatDate(application.sent_at)}</p> : null}
          </form>
        </section>

        <section className="mt-5 rounded-2xl border border-[#e5e7e0] bg-white p-6">
          <h2 className="text-lg font-semibold">Oferta i portfolio</h2>
          {jobOffer?.location ? <p className="mt-3 text-sm">Lokalizacja: {jobOffer.location}</p> : null}
          {sourceUrl ? <a className="mt-3 inline-block break-all text-sm font-semibold text-[#456a4b]" href={sourceUrl} rel="noreferrer" target="_blank">Otwórz źródło oferty</a> : null}
          <div className="mt-5 flex flex-wrap gap-2">
            {portfolio.map((item) => <span className="rounded-full bg-[#edf4eb] px-3 py-1 text-sm text-[#315b3a]" key={item.id}>{item.title}</span>)}
            {portfolio.length === 0 ? <p className="text-sm text-[#687167]">Nie przypisano portfolio.</p> : null}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-[#e5e7e0] bg-white p-6">
            <h2 className="text-lg font-semibold">Historia statusów</h2>
            <ol className="mt-5 space-y-4">
              {history.map((item) => <li className="border-l-2 border-[#c8dac5] pl-4" key={item.id}><p className="text-sm font-medium">{item.previous_status ? `${statusLabel(item.previous_status)} → ` : ""}{statusLabel(item.new_status)}</p><time className="mt-1 block text-xs text-[#8b908a]">{formatDate(item.changed_at)}</time></li>)}
            </ol>
          </article>

          <article className="rounded-2xl border border-[#e5e7e0] bg-white p-6">
            <h2 className="text-lg font-semibold">Notatki</h2>
            <form className="mt-4" onSubmit={addNote}>
              <textarea className="min-h-28 w-full rounded-xl border border-[#dfe3da] p-3 text-sm" maxLength={10000} onChange={(event) => setNoteContent(event.target.value)} placeholder="Dodaj prywatną notatkę..." value={noteContent} />
              <button className="mt-3 rounded-xl border border-[#2d5034] px-4 py-3 text-sm font-semibold text-[#294b30] disabled:opacity-60" disabled={savingNote} type="submit">{savingNote ? "Zapisywanie..." : "Dodaj notatkę"}</button>
            </form>
            <div className="mt-6 space-y-4">
              {notes.map((note) => <article className="rounded-xl bg-[#f7f7f4] p-4" key={note.id}><p className="whitespace-pre-wrap text-sm">{note.content}</p><time className="mt-2 block text-xs text-[#8b908a]">{formatDate(note.created_at)}</time></article>)}
              {notes.length === 0 ? <p className="text-sm text-[#687167]">Nie masz jeszcze notatek.</p> : null}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
