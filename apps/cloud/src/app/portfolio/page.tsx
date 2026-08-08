"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type PortfolioItem = {
  id: string;
  title: string;
  artifact_type: string;
  url: string | null;
  description: string | null;
};

function safeHttpUrl(value: string | null): string | null {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export default function PortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("link");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const loadItems = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("portfolio_artifacts")
      .select("id,title,artifact_type,url,description")
      .is("archived_at", null)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as PortfolioItem[]);
  };

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }

    void getSupabaseBrowserClient().auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else void loadItems();
    });
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !url.trim()) {
      setError("Uzupełnij tytuł i adres linku.");
      return;
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.trim());
    } catch {
      setError("Podaj pełny adres zaczynający się od https:// lub http://.");
      return;
    }

    if (!['https:', 'http:'].includes(parsedUrl.protocol)) {
      setError("Dozwolone są wyłącznie linki HTTP(S).");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      router.replace("/login");
      return;
    }

    const { error: insertError } = await supabase.from("portfolio_artifacts").insert({
      user_id: userData.user.id,
      title: title.trim(),
      artifact_type: type,
      url: parsedUrl.toString(),
      description: description.trim() || null,
    });

    if (insertError) {
      setError("Nie udało się zapisać portfolio.");
      return;
    }

    setTitle("");
    setUrl("");
    setDescription("");
    await loadItems();
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <section className="mt-5 sm:mt-12">
          <p className="text-sm font-medium text-[#6c8b70]">Cloud Mode</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Portfolio</h1>
          <p className="mt-2 text-sm text-[#687167]">Zapisuj linki i materiały, które chcesz przypisać do aplikacji rekrutacyjnej.</p>
        </section>

        <form className="mt-8 grid gap-4 rounded-2xl border border-[#e5e7e0] bg-white p-5 sm:grid-cols-2" onSubmit={submit}>
          {error ? <p className="sm:col-span-2 text-sm text-red-700">{error}</p> : null}
          <input className="rounded-xl border border-[#dfe3da] p-3" onChange={(event) => setTitle(event.target.value)} placeholder="Tytuł *" value={title} />
          <select className="rounded-xl border border-[#dfe3da] p-3" onChange={(event) => setType(event.target.value)} value={type}>
            <option value="link">Link</option>
            <option value="case_study">Case study</option>
            <option value="presentation">Prezentacja</option>
          </select>
          <input className="rounded-xl border border-[#dfe3da] p-3 sm:col-span-2" onChange={(event) => setUrl(event.target.value)} placeholder="https://... *" value={url} />
          <textarea className="rounded-xl border border-[#dfe3da] p-3 sm:col-span-2" onChange={(event) => setDescription(event.target.value)} placeholder="Opis (opcjonalnie)" value={description} />
          <button className="rounded-xl bg-[#2d5034] p-3 font-semibold text-white sm:col-span-2">Zapisz element portfolio</button>
        </form>

        <section className="mt-7 space-y-3">
          {items.map((item) => {
            const itemUrl = safeHttpUrl(item.url);
            return (
              <article className="rounded-2xl border border-[#e5e7e0] bg-white p-5" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-[#7b8179]">{artifactTypeLabel(item.artifact_type)}</p>
                  </div>
                  <Link className="rounded-lg border border-[#c9d8c6] bg-[#eef4eb] px-3 py-2 text-xs font-semibold text-[#315b3a] hover:bg-[#dce9dc]" href={`/portfolio/${item.id}`}>Szczegóły</Link>
                </div>
                {itemUrl ? (
                  <a className="mt-2 inline-block max-w-full break-all text-sm text-[#456a4b]" href={itemUrl} rel="noreferrer" target="_blank">
                    {item.url}
                  </a>
                ) : item.url ? (
                  <p className="mt-2 break-all text-sm text-[#687167]">{item.url}</p>
                ) : null}
                {item.description ? <p className="mt-2 text-sm">{item.description}</p> : null}
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}

function artifactTypeLabel(value: string) {
  return value === "case_study" ? "Case study" : value === "presentation" ? "Prezentacja" : "Link";
}
