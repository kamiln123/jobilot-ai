"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getSupabaseBrowserClient, isSupabaseBrowserConfigured } from "@/lib/supabase/browser-client";

type FormValues = { title: string; artifactType: "link" | "case_study" | "presentation"; url: string; description: string };

const initialValues: FormValues = { title: "", artifactType: "link", url: "", description: "" };
const inputClass = "mt-2 w-full rounded-xl border border-[#dfe3da] bg-white px-3 py-3 text-sm outline-none transition placeholder:text-[#9ba39a] focus:border-[#6c8b70] focus:ring-2 focus:ring-[#dce9dc]";

export default function EditPortfolioPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [state, setState] = useState<"loading" | "ready" | "not-found">("loading");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let active = true;

    async function loadItem() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const { data, error: loadError } = await supabase
        .from("portfolio_artifacts")
        .select("title,artifact_type,url,description")
        .eq("id", id)
        .is("archived_at", null)
        .maybeSingle();

      if (!active) return;
      if (loadError || !data) {
        setState("not-found");
        return;
      }

      setValues({
        title: data.title ?? "",
        artifactType: data.artifact_type === "case_study" || data.artifact_type === "presentation" ? data.artifact_type : "link",
        url: data.url ?? "",
        description: data.description ?? "",
      });
      setState("ready");
    }

    void loadItem();
    return () => { active = false; };
  }, [id, router]);

  function updateValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.title.trim() || !values.url.trim()) {
      setError("Uzupełnij tytuł i adres linku.");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(values.url.trim());
    } catch {
      setError("Podaj pełny adres zaczynający się od https:// lub http://.");
      return;
    }
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      setError("Dozwolone są wyłącznie linki HTTP(S).");
      return;
    }

    setIsSubmitting(true);
    const { error: updateError } = await getSupabaseBrowserClient()
      .from("portfolio_artifacts")
      .update({ title: values.title.trim(), artifact_type: values.artifactType, url: parsedUrl.toString(), description: values.description.trim() || null })
      .eq("id", id)
      .is("archived_at", null);
    setIsSubmitting(false);

    if (updateError) {
      setError("Nie udało się zapisać zmian portfolio. Spróbuj ponownie.");
      return;
    }

    router.replace(`/portfolio/${id}`);
    router.refresh();
  }

  if (state === "loading") return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] text-sm text-[#687167]">Ładowanie portfolio...</main>;
  if (state === "not-found") return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] p-6 text-[#20241f]"><section className="max-w-md rounded-2xl border border-[#e5e7e0] bg-white p-6 text-center"><h1 className="text-xl font-semibold">Nie znaleziono portfolio</h1><p className="mt-2 text-sm text-[#687167]">Element nie istnieje, został zarchiwizowany albo nie masz do niego dostępu.</p><Link className="mt-5 inline-flex text-sm font-semibold text-[#456a4b]" href="/portfolio">Wróć do portfolio</Link></section></main>;

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link className="inline-flex text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href={`/portfolio/${id}`}>← Szczegóły portfolio</Link>
        <section className="mt-5 sm:mt-12">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Edytuj portfolio</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6c716b]">Zmień zapisane dane. Powrót bez zapisu nie wprowadzi zmian.</p>
        </section>

        <form className="mt-8 grid gap-5 rounded-2xl border border-[#e5e7e0] bg-white p-5 sm:grid-cols-2 sm:p-8" noValidate onSubmit={submit}>
          {error ? <p className="sm:col-span-2 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a63f2d]" role="alert">{error}</p> : null}
          <label className="block text-sm font-medium text-[#3d463d]">Tytuł *<input className={inputClass} maxLength={180} onChange={(event) => updateValue("title", event.target.value)} value={values.title} /></label>
          <label className="block text-sm font-medium text-[#3d463d]">Typ<select className={inputClass} onChange={(event) => updateValue("artifactType", event.target.value as FormValues["artifactType"])} value={values.artifactType}><option value="link">Link</option><option value="case_study">Case study</option><option value="presentation">Prezentacja</option></select></label>
          <label className="block text-sm font-medium text-[#3d463d] sm:col-span-2">Link *<input className={inputClass} inputMode="url" onChange={(event) => updateValue("url", event.target.value)} placeholder="https://..." type="text" value={values.url} /></label>
          <label className="block text-sm font-medium text-[#3d463d] sm:col-span-2">Opis<textarea className={`${inputClass} min-h-32 resize-y leading-6`} onChange={(event) => updateValue("description", event.target.value)} value={values.description} /></label>
          <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#edf0e9] pt-6 sm:col-span-2 sm:flex-row">
            <Link className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-[#546052] hover:bg-[#f0f3ed]" href={`/portfolio/${id}`}>Anuluj</Link>
            <button className="rounded-xl bg-[#2d5034] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#203d27] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}
