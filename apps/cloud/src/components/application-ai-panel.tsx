"use client";

import { useEffect, useState } from "react";

import { getSupabaseBrowserClient } from "@/lib/supabase/browser-client";

type MatchAnalysis = {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
};

const policyVersion = "mvp-gemini-free-2026-08-07";

export function ApplicationAiPanel({ applicationId, cvVersionId }: { applicationId: string; cvVersionId: string }) {
  const [consented, setConsented] = useState<boolean | null>(null);
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [busy, setBusy] = useState<"analysis" | "cover-letter" | "save-analysis" | "save-letter" | "consent" | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadConsent() {
      const supabase = getSupabaseBrowserClient();
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !active) return;
      const { data } = await supabase
        .from("ai_consents")
        .select("provider,policy_version,revoked_at")
        .eq("user_id", sessionData.session.user.id)
        .eq("provider", "gemini")
        .maybeSingle();
      if (active) setConsented(Boolean(data && !data.revoked_at && data.policy_version === policyVersion));
    }
    void loadConsent();
    return () => { active = false; };
  }, []);

  async function grantConsent() {
    setBusy("consent");
    setError("");
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Zaloguj się ponownie, aby wyrazić zgodę.");
      setBusy(null);
      return;
    }
    const { error: consentError } = await supabase.from("ai_consents").upsert({
      user_id: sessionData.session.user.id,
      provider: "gemini",
      policy_version: policyVersion,
      consented_at: new Date().toISOString(),
      revoked_at: null,
    });
    if (consentError) setError("Nie udało się zapisać zgody AI.");
    else {
      setConsented(true);
      setMessage("Zgoda AI została zapisana. Możesz ją wycofać w dowolnym momencie.");
    }
    setBusy(null);
  }

  async function revokeConsent() {
    setBusy("consent");
    setError("");
    const { error: revokeError } = await getSupabaseBrowserClient()
      .from("ai_consents")
      .update({ revoked_at: new Date().toISOString() })
      .eq("provider", "gemini");
    if (revokeError) setError("Nie udało się wycofać zgody AI.");
    else {
      setConsented(false);
      setMessage("Zgoda AI została wycofana. Kolejne dane nie będą wysyłane do Gemini.");
    }
    setBusy(null);
  }

  async function run(operation: "analysis" | "cover-letter") {
    setBusy(operation);
    setError("");
    setMessage("");
    const { data: sessionData } = await getSupabaseBrowserClient().auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) {
      setError("Zaloguj się ponownie, aby użyć AI.");
      setBusy(null);
      return;
    }
    try {
      const result = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
        body: JSON.stringify({ applicationId, operation }),
      });
      const payload = await result.json() as { error?: string; result?: MatchAnalysis | { content: string }; remaining?: number };
      if (!result.ok || !payload.result) throw new Error(payload.error ?? "Nie udało się wykonać operacji AI.");
      if (operation === "analysis") setAnalysis(payload.result as MatchAnalysis);
      else setCoverLetter((payload.result as { content: string }).content);
      setMessage(`Wynik nie został jeszcze zapisany. Pozostało dziś operacji AI: ${payload.remaining ?? "—"}.`);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : "Nie udało się wykonać operacji AI.");
    }
    setBusy(null);
  }

  async function saveAnalysis() {
    if (!analysis) return;
    setBusy("save-analysis");
    setError("");
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setError("Zaloguj się ponownie, aby zapisać analizę.");
      setBusy(null);
      return;
    }
    const { error: saveError } = await supabase.from("ai_analyses").insert({
      user_id: sessionData.session.user.id,
      application_id: applicationId,
      cv_version_id: cvVersionId,
      provider: "gemini",
      analysis_type: "cv_job_match",
      result: analysis,
    });
    if (saveError) setError("Nie udało się zapisać analizy.");
    else setMessage("Analiza została zapisana przy tej aplikacji.");
    setBusy(null);
  }

  async function saveCoverLetter() {
    if (coverLetter.trim().length < 40) {
      setError("List motywacyjny jest zbyt krótki, aby go zapisać.");
      return;
    }
    setBusy("save-letter");
    setError("");
    const { error: saveError } = await getSupabaseBrowserClient().from("cover_letters").insert({
      application_id: applicationId,
      content: coverLetter.trim(),
    });
    if (saveError) setError("Nie udało się zapisać listu motywacyjnego.");
    else setMessage("List motywacyjny został zapisany przy tej aplikacji.");
    setBusy(null);
  }

  return (
    <section className="mt-5 rounded-2xl border border-[#d7e1d4] bg-[#fbfdf9] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#456a4b]">AI w Cloud Mode</p>
          <h2 className="mt-1 text-lg font-semibold">Analiza CV i listu motywacyjnego</h2>
        </div>
        <span className="rounded-full bg-[#edf4eb] px-3 py-1 text-xs font-semibold text-[#315b3a]">Gemini 3 Flash Preview · Free Tier MVP</span>
      </div>

      {consented === null ? <p className="mt-4 text-sm text-[#687167]">Sprawdzanie zgody AI…</p> : null}
      {consented === false ? (
        <div className="mt-4 rounded-xl border border-[#ead8a6] bg-[#fff8e7] p-4 text-sm leading-6 text-[#584819]">
          <p className="font-semibold">Świadoma zgoda przed użyciem AI</p>
          <p className="mt-2">Do Gemini zostaną wysłane: wybrane CV w PDF oraz nazwa firmy, stanowisko, opis i wymagania oferty. Dostawcą jest Google Gemini w bezpłatnym wariancie MVP.</p>
          <p className="mt-2 font-medium">W Free Tier Google może wykorzystywać przesłaną treść do ulepszania swoich produktów. AI może się mylić i nie gwarantuje zatrudnienia — zweryfikuj wynik przed użyciem.</p>
          <button className="mt-4 rounded-xl bg-[#2d5034] px-4 py-3 font-semibold text-white disabled:opacity-60" disabled={busy === "consent"} onClick={grantConsent} type="button">
            {busy === "consent" ? "Zapisywanie…" : "Wyrażam świadomą zgodę"}
          </button>
        </div>
      ) : null}

      {consented ? (
        <div className="mt-4">
          <p className="text-sm leading-6 text-[#687167]">Wynik pozostaje tylko na ekranie, dopóki świadomie nie klikniesz zapisu. Nie zapisujemy promptów ani historii rozmowy.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="rounded-xl bg-[#2d5034] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={busy !== null} onClick={() => void run("analysis")} type="button">
              {busy === "analysis" ? "Analizowanie…" : "Analizuj CV względem oferty"}
            </button>
            <button className="rounded-xl border border-[#2d5034] px-4 py-3 text-sm font-semibold text-[#294b30] disabled:opacity-60" disabled={busy !== null} onClick={() => void run("cover-letter")} type="button">
              {busy === "cover-letter" ? "Generowanie…" : "Wygeneruj list motywacyjny"}
            </button>
            <button className="px-2 py-3 text-sm font-semibold text-[#687167] underline disabled:opacity-60" disabled={busy !== null} onClick={() => void revokeConsent()} type="button">Wycofaj zgodę AI</button>
          </div>
        </div>
      ) : null}

      {error ? <p className="mt-4 rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a63f2d]" role="alert">{error}</p> : null}
      {message ? <p className="mt-4 rounded-xl bg-[#edf7eb] p-3 text-sm text-[#315b3a]" role="status">{message}</p> : null}

      {analysis ? (
        <article className="mt-5 rounded-xl border border-[#dfe7dc] bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="font-semibold">Dopasowanie CV do oferty</h3><span className="rounded-full bg-[#edf4eb] px-3 py-1 text-sm font-semibold text-[#315b3a]">{analysis.score}/100</span></div>
          <AnalysisList label="Mocne strony" items={analysis.strengths} />
          <AnalysisList label="Braki lub ryzyka" items={analysis.gaps} />
          <AnalysisList label="Rekomendacje" items={analysis.recommendations} />
          <button className="mt-4 rounded-xl border border-[#2d5034] px-4 py-3 text-sm font-semibold text-[#294b30] disabled:opacity-60" disabled={busy !== null} onClick={() => void saveAnalysis()} type="button">{busy === "save-analysis" ? "Zapisywanie…" : "Zapisz analizę"}</button>
        </article>
      ) : null}

      {coverLetter ? (
        <article className="mt-5 rounded-xl border border-[#dfe7dc] bg-white p-5">
          <h3 className="font-semibold">Roboczy list motywacyjny</h3>
          <textarea className="mt-4 min-h-64 w-full rounded-xl border border-[#dfe3da] p-3 text-sm leading-6" maxLength={20000} onChange={(event) => setCoverLetter(event.target.value)} value={coverLetter} />
          <button className="mt-4 rounded-xl border border-[#2d5034] px-4 py-3 text-sm font-semibold text-[#294b30] disabled:opacity-60" disabled={busy !== null} onClick={() => void saveCoverLetter()} type="button">{busy === "save-letter" ? "Zapisywanie…" : "Zapisz list motywacyjny"}</button>
        </article>
      ) : null}
    </section>
  );
}

function AnalysisList({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return <div className="mt-4"><h4 className="text-sm font-semibold">{label}</h4><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#4d564c]">{items.map((item) => <li key={item}>{item}</li>)}</ul></div>;
}
