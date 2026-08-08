"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type FormValues = {
  companyName: string;
  positionTitle: string;
  description: string;
  requirements: string;
  location: string;
  workMode: "" | "remote" | "hybrid" | "onsite";
  employmentType: string;
  salaryMin: string;
  salaryMax: string;
  salaryCurrency: string;
  sourceUrl: string;
  notes: string;
};

type FieldName = "companyName" | "positionTitle" | "salaryMin" | "salaryMax" | "salaryCurrency";
type FieldErrors = Partial<Record<FieldName, string>>;

const initialValues: FormValues = {
  companyName: "",
  positionTitle: "",
  description: "",
  requirements: "",
  location: "",
  workMode: "",
  employmentType: "",
  salaryMin: "",
  salaryMax: "",
  salaryCurrency: "PLN",
  sourceUrl: "",
  notes: "",
};

const inputClass = "mt-2 w-full rounded-xl border border-[#dfe3da] bg-white px-3 py-3 text-sm outline-none transition placeholder:text-[#9ba39a] focus:border-[#6c8b70] focus:ring-2 focus:ring-[#dce9dc]";
const textareaClass = `${inputClass} resize-y leading-6`;

export default function NewJobOfferPage() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [sourceWarning, setSourceWarning] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) {
      router.replace("/login");
      return;
    }

    void getSupabaseBrowserClient().auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
    });
  }, [router]);

  function updateValue<Key extends keyof FormValues>(key: Key, value: FormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key in errors) {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
    if (key === "sourceUrl") setSourceWarning("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    const companyName = values.companyName.trim();
    const positionTitle = values.positionTitle.trim();
    const validation = validateOffer(values);
    setErrors(validation.errors);
    setSourceWarning(validation.sourceWarning);

    if (Object.keys(validation.errors).length > 0) return;

    setIsSubmitting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { error: insertError } = await supabase.from("job_offers").insert({
        user_id: userData.user.id,
        company_name: companyName,
        position_title: positionTitle,
        description: optionalText(values.description),
        requirements: optionalText(values.requirements),
        location: optionalText(values.location),
        work_mode: values.workMode || null,
        employment_type: optionalText(values.employmentType),
        salary_min: validation.salaryMin,
        salary_max: validation.salaryMax,
        salary_currency: validation.salaryMin === null && validation.salaryMax === null
          ? null
          : validation.currency || null,
        source_url: optionalText(values.sourceUrl),
        notes: optionalText(values.notes),
      });

      if (insertError) {
        setSubmitError("Nie udało się zapisać oferty. Sprawdź dane i spróbuj ponownie.");
        return;
      }

      router.replace("/job-offers");
      router.refresh();
    } catch {
      setSubmitError("Nie udało się zapisać oferty. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mt-5 sm:mt-12">
          <p className="text-sm font-medium text-[#6c8b70]">Ręczny zapis</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Dodaj ofertę pracy</h1>
        </div>

        <form className="mt-8 space-y-7 rounded-2xl border border-[#e5e7e0] bg-white p-5 sm:p-8" noValidate onSubmit={handleSubmit}>
          {submitError ? <p className="rounded-xl bg-[#fff0ed] p-4 text-sm text-[#a63f2d]" role="alert">{submitError}</p> : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field error={errors.companyName} label="Firma *">
              <input aria-invalid={Boolean(errors.companyName)} autoComplete="organization" className={inputClass} maxLength={160} onChange={(event) => updateValue("companyName", event.target.value)} value={values.companyName} />
            </Field>
            <Field error={errors.positionTitle} label="Stanowisko *">
              <input aria-invalid={Boolean(errors.positionTitle)} className={inputClass} maxLength={180} onChange={(event) => updateValue("positionTitle", event.target.value)} value={values.positionTitle} />
            </Field>
          </div>

          <Field label="Opis oferty"><textarea className={textareaClass} onChange={(event) => updateValue("description", event.target.value)} rows={6} value={values.description} /></Field>
          <Field label="Wymagania"><textarea className={textareaClass} onChange={(event) => updateValue("requirements", event.target.value)} rows={5} value={values.requirements} /></Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Lokalizacja"><input className={inputClass} onChange={(event) => updateValue("location", event.target.value)} value={values.location} /></Field>
            <Field label="Tryb pracy"><select className={inputClass} onChange={(event) => updateValue("workMode", event.target.value as FormValues["workMode"])} value={values.workMode}><option value="">Nie podano</option><option value="remote">Zdalnie</option><option value="hybrid">Hybrydowo</option><option value="onsite">Stacjonarnie</option></select></Field>
            <Field label="Rodzaj zatrudnienia"><input className={inputClass} onChange={(event) => updateValue("employmentType", event.target.value)} placeholder="np. UoP, B2B" value={values.employmentType} /></Field>
          </div>

          <fieldset>
            <legend className="text-sm font-medium text-[#3d463d]">Wynagrodzenie</legend>
            <div className="mt-2 grid gap-5 sm:grid-cols-3">
              <Field error={errors.salaryMin} label="Od"><input aria-invalid={Boolean(errors.salaryMin)} className={inputClass} inputMode="decimal" onChange={(event) => updateValue("salaryMin", event.target.value)} placeholder="Od" type="text" value={values.salaryMin} /></Field>
              <Field error={errors.salaryMax} label="Do"><input aria-invalid={Boolean(errors.salaryMax)} className={inputClass} inputMode="decimal" onChange={(event) => updateValue("salaryMax", event.target.value)} placeholder="Do" type="text" value={values.salaryMax} /></Field>
              <Field error={errors.salaryCurrency} label="Waluta"><input aria-invalid={Boolean(errors.salaryCurrency)} className={inputClass} maxLength={3} onChange={(event) => updateValue("salaryCurrency", event.target.value.toUpperCase())} placeholder="Waluta" value={values.salaryCurrency} /></Field>
            </div>
            <p className="mt-2 text-xs text-[#7b8179]">Podaj liczbę nieujemną z maksymalnie dwoma miejscami po przecinku; akceptujemy przecinek lub kropkę.</p>
          </fieldset>

          <Field label="Link źródłowy" note={sourceWarning}>
            <input className={inputClass} inputMode="url" onChange={(event) => updateValue("sourceUrl", event.target.value)} placeholder="https://..." type="text" value={values.sourceUrl} />
          </Field>
          <Field label="Prywatna notatka"><textarea className={textareaClass} onChange={(event) => updateValue("notes", event.target.value)} placeholder="Np. osoba kontaktowa, termin aplikacji, obserwacje." rows={4} value={values.notes} /></Field>

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#edf0e9] pt-6 sm:flex-row">
            <Link className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-[#546052] hover:bg-[#f0f3ed]" href="/job-offers">Anuluj</Link>
            <button className="rounded-xl bg-[#2d5034] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#203d27] disabled:cursor-not-allowed disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? "Zapisywanie..." : "Zapisz ofertę"}</button>
          </div>
        </form>
      </div>
    </main>
  );
}

function validateOffer(values: FormValues) {
  const errors: FieldErrors = {};
  const companyName = values.companyName.trim();
  const positionTitle = values.positionTitle.trim();
  const salaryMin = parseMoney(values.salaryMin);
  const salaryMax = parseMoney(values.salaryMax);
  const currency = values.salaryCurrency.trim().toUpperCase();

  if (!companyName) errors.companyName = "Uzupełnij nazwę firmy.";
  else if (companyName.length > 160) errors.companyName = "Nazwa firmy jest zbyt długa.";
  if (!positionTitle) errors.positionTitle = "Uzupełnij nazwę stanowiska.";
  else if (positionTitle.length > 180) errors.positionTitle = "Nazwa stanowiska jest zbyt długa.";
  if (salaryMin.error) errors.salaryMin = salaryMin.error;
  if (salaryMax.error) errors.salaryMax = salaryMax.error;
  if (!salaryMin.error && !salaryMax.error && salaryMin.value !== null && salaryMax.value !== null && salaryMax.value < salaryMin.value) {
    errors.salaryMax = "Maksymalne wynagrodzenie nie może być niższe niż minimalne.";
  }
  if ((salaryMin.value !== null || salaryMax.value !== null) && !/^[A-Z]{3}$/.test(currency)) {
    errors.salaryCurrency = "Kod waluty powinien mieć trzy litery, np. PLN.";
  }

  return { errors, salaryMin: salaryMin.value, salaryMax: salaryMax.value, currency, sourceWarning: getSourceWarning(values.sourceUrl) };
}

function parseMoney(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return { value: null, error: "" };
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(trimmed)) {
    return { value: null, error: "Podaj liczbę nieujemną z maksymalnie dwoma miejscami po przecinku." };
  }
  return { value: Number(trimmed.replace(",", ".")), error: "" };
}

function getSourceWarning(value: string) {
  const sourceUrl = value.trim();
  if (!sourceUrl) return "";
  if (/\s/.test(sourceUrl)) {
    return "Adres zawiera spacje lub jest niekompletny. Możesz go zapisać jako link, ale nie będzie klikalny.";
  }
  if (!/^https?:\/\//i.test(sourceUrl)) {
    if (/^[a-z][a-z\d+.-]*:/i.test(sourceUrl)) {
      return "Ten typ adresu zostanie zapisany jako tekst i nie będzie klikalny.";
    }
    return "Dodaj https://, aby link był później klikalny. Możesz jednak zapisać ofertę bez tej zmiany.";
  }
  try {
    const parsed = new URL(sourceUrl);
    return parsed.hostname ? "" : "Adres wygląda na niepełny i nie będzie później klikalny.";
  } catch {
    return "Adres wygląda na niepełny i nie będzie później klikalny.";
  }
}

function Field({ children, error, label, note }: { children: ReactNode; error?: string; label: string; note?: string }) {
  return <label className="block text-sm font-medium text-[#3d463d]">{label}{children}{error ? <span className="mt-2 block text-xs font-medium text-[#a63f2d]" role="alert">{error}</span> : null}{note ? <span className="mt-2 block text-xs font-medium text-[#8a611a]" role="status">{note}</span> : null}</label>;
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}
