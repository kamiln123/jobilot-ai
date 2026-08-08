"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type CvDocument = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  cv_versions: {
    id: string;
    version_number: number;
    original_file_name: string;
    byte_size: number;
    created_at: string;
  }[];
};

export default function CvLibraryPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<CvDocument[]>([]);
  const [state, setState] = useState("loading");

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    let active = true;

    void (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("cv_documents")
        .select("id, name, description, created_at, cv_versions(id, version_number, original_file_name, byte_size, created_at)")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (!active) return;
      if (error) {
        setState("error");
        return;
      }

      setDocuments((data ?? []) as CvDocument[]);
      setState("ready");
    })();

    return () => { active = false; };
  }, [router]);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mt-5 flex flex-col justify-between gap-5 sm:mt-12 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium text-[#6c8b70]">Cloud Mode</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Biblioteka CV</h1>
            <p className="mt-2 text-sm text-[#687167]">Każda nowa wersja CV pozostaje oddzielnym dokumentem.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#2d5034] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203d27]" href="/cv-library/new">
            + Dodaj CV
          </Link>
        </div>

        {state === "loading" ? <p className="mt-10 text-sm text-[#687167]">Ładowanie CV...</p> : null}
        {state === "error" ? <p className="mt-8 rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a63f2d]">Nie udało się pobrać CV.</p> : null}
        {state === "ready" && documents.length === 0 ? (
          <section className="mt-8 rounded-2xl border border-dashed border-[#cfd7cb] bg-white p-10 text-center">
            <h2 className="font-semibold">Nie masz jeszcze CV w bibliotece.</h2>
            <p className="mt-2 text-sm text-[#687167]">Zacznij od dodania pierwszej wersji swojego dokumentu.</p>
          </section>
        ) : null}
        {state === "ready" && documents.length > 0 ? (
          <section className="mt-8 space-y-5">
            {documents.map((document) => (
              <article className="rounded-2xl border border-[#e5e7e0] bg-white p-5 sm:p-6" key={document.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{document.name}</h2>
                    {document.description ? <p className="mt-1 text-sm text-[#687167]">{document.description}</p> : null}
                  </div>
                  <Link className="text-sm font-semibold text-[#456a4b]" href={`/cv-library/new?document=${document.id}`}>+ Nowa wersja</Link>
                </div>
                <ul className="mt-5 divide-y divide-[#edf0e9]">
                  {[...document.cv_versions].sort((first, second) => second.version_number - first.version_number).map((version) => (
                    <li className="flex items-center justify-between gap-4 py-3" key={version.id}>
                      <div>
                        <p className="text-sm font-medium">v{version.version_number} · {version.original_file_name}</p>
                        <p className="mt-1 text-xs text-[#8b908a]">{formatBytes(version.byte_size)}</p>
                      </div>
                      <time className="text-xs text-[#8b908a]">{new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(version.created_at))}</time>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
