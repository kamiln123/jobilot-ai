"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getSupabaseBrowserClient, isSupabaseBrowserConfigured } from "@/lib/supabase/browser-client";

type PortfolioItem = {
  id: string;
  title: string;
  artifact_type: string;
  url: string | null;
  description: string | null;
  created_at: string;
};

export default function PortfolioDetailsPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<PortfolioItem | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "not-found" | "error">("loading");

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

      const { data, error } = await supabase
        .from("portfolio_artifacts")
        .select("id,title,artifact_type,url,description,created_at")
        .eq("id", id)
        .is("archived_at", null)
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

      setItem(data as PortfolioItem);
      setState("ready");
    }

    void loadItem();
    return () => { active = false; };
  }, [id, router]);

  if (state === "loading") return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] text-sm text-[#687167]">Ładowanie portfolio...</main>;
  if (state === "not-found") return <MessagePage title="Nie znaleziono portfolio" text="Element nie istnieje, został zarchiwizowany albo nie masz do niego dostępu." />;
  if (state === "error" || !item) return <MessagePage title="Nie udało się wczytać portfolio" text="Odśwież stronę i spróbuj ponownie." />;

  const safeUrl = safeHttpUrl(item.url);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link className="inline-flex text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href="/portfolio">← Portfolio</Link>
        <section className="mt-5 rounded-2xl border border-[#e5e7e0] bg-white p-6 sm:mt-12 sm:p-9">
          <p className="text-sm font-medium text-[#6c8b70]">{artifactTypeLabel(item.artifact_type)}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{item.title}</h1>
          <p className="mt-3 text-sm text-[#687167]">Dodano {formatDate(item.created_at)}</p>
          <Link className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-[#c9d8c6] bg-[#eef4eb] px-4 py-2 text-sm font-semibold text-[#315b3a] hover:bg-[#dce9dc]" href={`/portfolio/${item.id}/edit`}>Edytuj portfolio</Link>
        </section>

        <section className="mt-7 rounded-2xl border border-[#e5e7e0] bg-white p-5 sm:p-6">
          <h2 className="font-semibold">Link</h2>
          {safeUrl ? <a className="mt-4 inline-block break-all text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href={safeUrl} rel="noreferrer" target="_blank">{item.url}</a> : item.url ? <p className="mt-4 break-all text-sm text-[#626b61]">{item.url}</p> : <p className="mt-4 text-sm text-[#8b908a]">Nie dodano linku.</p>}
        </section>

        <section className="mt-5 rounded-2xl border border-[#e5e7e0] bg-white p-5 sm:p-6">
          <h2 className="font-semibold">Opis</h2>
          {item.description ? <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[#50584f]">{item.description}</p> : <p className="mt-4 text-sm text-[#8b908a]">Nie dodano opisu.</p>}
        </section>
      </div>
    </main>
  );
}

function MessagePage({ text, title }: { text: string; title: string }) {
  return <main className="grid min-h-screen place-items-center bg-[#f7f7f4] p-6 text-[#20241f]"><section className="max-w-lg rounded-2xl border border-[#e5e7e0] bg-white p-7 text-center"><h1 className="text-xl font-semibold">{title}</h1><p className="mt-3 text-sm leading-6 text-[#687167]">{text}</p><Link className="mt-6 inline-flex rounded-xl bg-[#2d5034] px-4 py-3 text-sm font-semibold text-white hover:bg-[#203d27]" href="/portfolio">Wróć do portfolio</Link></section></main>;
}

function safeHttpUrl(value: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function artifactTypeLabel(value: string) {
  return value === "case_study" ? "Case study" : value === "presentation" ? "Prezentacja" : "Link";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
}
