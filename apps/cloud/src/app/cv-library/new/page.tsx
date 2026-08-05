"use client";

import Link from "next/link";
import { FormEvent, Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type DocumentOption = {
  id: string;
  name: string;
  description: string | null;
  cv_versions: { version_number: number }[];
};

export default function NewCvPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f7f4] p-8 text-[#20241f]"><p>Ładowanie formularza CV...</p></main>}>
      <NewCvForm />
    </Suspense>
  );
}

function NewCvForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documents, setDocuments] = useState<DocumentOption[]>([]);
  const [documentId, setDocumentId] = useState(searchParams.get("document") ?? "new");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
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

      const { data } = await supabase
        .from("cv_documents")
        .select("id,name,description,cv_versions(version_number)")
        .is("deleted_at", null)
        .order("name");
      const options = (data ?? []) as DocumentOption[];
      setDocuments(options);

      const requestedDocument = options.find((document) => document.id === documentId);
      if (requestedDocument) setDescription(requestedDocument.description ?? "");
    })();
  }, [documentId, router]);

  function selectDocument(nextDocumentId: string) {
    setDocumentId(nextDocumentId);
    setError("");

    const selected = documents.find((document) => document.id === nextDocumentId);
    setDescription(selected?.description ?? "");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (documentId === "new" && !name.trim()) {
      setError("Podaj nazwę dokumentu CV.");
      return;
    }
    if (!file) {
      setError("Wybierz plik PDF.");
      return;
    }
    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Dozwolony jest wyłącznie plik PDF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Plik CV nie może przekraczać 5 MB.");
      return;
    }

    setSaving(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }

      let id = documentId;
      let version = 1;

      if (id === "new") {
        id = crypto.randomUUID();
        const { error: documentError } = await supabase.from("cv_documents").insert({
          id,
          user_id: userData.user.id,
          name: name.trim(),
          description: description.trim() || null,
        });
        if (documentError) throw documentError;
      } else {
        const selected = documents.find((document) => document.id === id);
        version = Math.max(0, ...(selected?.cv_versions.map((item) => item.version_number) ?? [])) + 1;
      }

      const checksum = await sha256(file);
      const storagePath = `${userData.user.id}/${id}/v${version}-${crypto.randomUUID()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("cv-files")
        .upload(storagePath, file, { contentType: "application/pdf", upsert: false });
      if (uploadError) throw uploadError;

      const { error: versionError } = await supabase.from("cv_versions").insert({
        cv_document_id: id,
        version_number: version,
        original_file_name: file.name,
        mime_type: "application/pdf",
        byte_size: file.size,
        checksum,
        storage_path: storagePath,
      });
      if (versionError) throw versionError;

      if (documentId !== "new") {
        const { error: descriptionError } = await supabase
          .from("cv_documents")
          .update({ description: description.trim() || null })
          .eq("id", id);
        if (descriptionError) throw descriptionError;
      }

      router.replace("/cv-library");
      router.refresh();
    } catch {
      setError("Nie udało się zapisać CV. Spróbuj ponownie.");
    } finally {
      setSaving(false);
    }
  }

  const selectedDocument = documents.find((document) => document.id === documentId);

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8">
      <div className="mx-auto max-w-2xl">
        <Link className="text-sm font-semibold text-[#456a4b]" href="/cv-library">
          ← Biblioteka CV
        </Link>
        <h1 className="mt-10 text-3xl font-semibold">Dodaj CV</h1>

        <form className="mt-8 space-y-6 rounded-2xl border border-[#e5e7e0] bg-white p-6" onSubmit={submit}>
          {error ? <p className="rounded-xl bg-[#fff0ed] p-3 text-sm text-[#a63f2d]">{error}</p> : null}

          <label className="block text-sm font-medium">
            Dokument
            <select className="mt-2 w-full rounded-xl border border-[#dfe3da] p-3" onChange={(event) => selectDocument(event.target.value)} value={documentId}>
              <option value="new">Nowy dokument CV</option>
              {documents.map((document) => <option key={document.id} value={document.id}>Nowa wersja: {document.name}</option>)}
            </select>
          </label>

          {documentId === "new" ? (
            <label className="block text-sm font-medium">
              Nazwa CV *
              <input className="mt-2 w-full rounded-xl border border-[#dfe3da] p-3" maxLength={120} onChange={(event) => setName(event.target.value)} value={name} />
            </label>
          ) : selectedDocument ? (
            <p className="rounded-xl bg-[#edf4eb] p-3 text-sm text-[#315b3a]">
              Dodajesz nową wersję dokumentu: <strong>{selectedDocument.name}</strong>.
            </p>
          ) : null}

          <label className="block text-sm font-medium">
            Opis dokumentu
            <textarea className="mt-2 min-h-24 w-full rounded-xl border border-[#dfe3da] p-3" onChange={(event) => setDescription(event.target.value)} value={description} />
          </label>

          <div>
            <p className="text-sm font-medium">Plik PDF *</p>
            <input accept="application/pdf,.pdf" className="sr-only" id="cv-file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} type="file" />
            <label className="mt-2 inline-flex min-h-12 cursor-pointer items-center rounded-xl border border-[#2d5034] bg-[#edf4eb] px-5 py-3 text-sm font-semibold text-[#294b30] transition hover:bg-[#dce9dc]" htmlFor="cv-file">
              Wybierz plik PDF
            </label>
            <p className="mt-2 text-sm text-[#687167]" aria-live="polite">
              {file ? `Wybrany plik: ${file.name}` : "Nie wybrano pliku."}
            </p>
          </div>
          <p className="text-xs leading-5 text-[#7b8179]">Maksymalnie 5 MB. Plik trafia do prywatnego storage Supabase i nie jest publicznie dostępny.</p>
          <button className="rounded-xl bg-[#2d5034] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60" disabled={saving} type="submit">
            {saving ? "Zapisywanie..." : "Zapisz CV"}
          </button>
        </form>
      </div>
    </main>
  );
}

async function sha256(file: File) {
  const hash = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(hash)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
