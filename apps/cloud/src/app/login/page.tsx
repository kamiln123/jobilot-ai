"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  getSupabaseBrowserClient,
  isSupabaseBrowserConfigured,
} from "@/lib/supabase/browser-client";

type FormMode = "sign-in" | "sign-up";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f7f7f4] p-8 text-[#20241f]"><p>Ładowanie...</p></main>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<FormMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) return;

    const supabase = getSupabaseBrowserClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    });
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseBrowserClient();

      if (mode === "sign-in") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?verified=1`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }

      setMessage("Sprawdź skrzynkę e-mail i potwierdź utworzenie konta.");
    } catch (caughtError) {
      setError(getAuthErrorMessage(caughtError, mode));
    } finally {
      setIsSubmitting(false);
    }
  }

  const configured = isSupabaseBrowserConfigured();
  const verificationMessage =
    searchParams.get("verified") === "1"
      ? "Adres e-mail został potwierdzony. Możesz się zalogować."
      : "";
  const visibleMessage = message || verificationMessage;

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f7f4] px-5 py-10 text-[#20241f]">
      <section className="w-full max-w-md rounded-3xl border border-[#e4e6de] bg-white p-7 shadow-sm sm:p-9">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#263b2c] text-lg font-bold text-white">
            J
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Jobilot <em className="font-medium text-[#5e7863]">AI</em>
          </span>
        </Link>

        <div className="mt-9">
          <p className="text-sm font-medium text-[#6c8b70]">Cloud Mode</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {mode === "sign-in" ? "Zaloguj się do Jobilot AI" : "Załóż konto"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#6c716b]">
            {mode === "sign-in"
              ? "Zaloguj się, aby bezpiecznie zarządzać swoimi aplikacjami."
              : "Twoje dane będą dostępne wyłącznie na Twoim koncie."}
          </p>
        </div>

        {!configured ? (
          <div className="mt-7 rounded-xl border border-[#efd39e] bg-[#fff8e9] p-4 text-sm leading-6 text-[#75520e]">
            Brakuje konfiguracji Supabase dla tej wersji aplikacji. Uzupełnij
            zmienne środowiskowe przed uruchomieniem logowania.
          </div>
        ) : null}

        {visibleMessage ? (
          <p className="mt-6 rounded-xl bg-[#eaf4e8] px-4 py-3 text-sm text-[#315b3a]" role="status">
            {visibleMessage}
          </p>
        ) : null}
        {error ? (
          <p className="mt-6 rounded-xl bg-[#fff0ed] px-4 py-3 text-sm text-[#a63f2d]" role="alert">
            {error}
          </p>
        ) : null}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-[#3d463d]">
            Adres e-mail
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-xl border border-[#dfe3da] px-3 py-3 outline-none transition focus:border-[#6c8b70] focus:ring-2 focus:ring-[#dce9dc]"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block text-sm font-medium text-[#3d463d]">
            Hasło
            <input
              autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              className="mt-2 w-full rounded-xl border border-[#dfe3da] px-3 py-3 outline-none transition focus:border-[#6c8b70] focus:ring-2 focus:ring-[#dce9dc]"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
            {mode === "sign-up" ? (
              <span className="mt-1.5 block text-xs font-normal text-[#7b8179]">Co najmniej 8 znaków.</span>
            ) : null}
          </label>
          <button
            className="w-full rounded-xl bg-[#2d5034] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#203d27] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!configured || isSubmitting}
            type="submit"
          >
            {isSubmitting
              ? "Trwa przetwarzanie..."
              : mode === "sign-in"
                ? "Zaloguj się"
                : "Utwórz konto"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6c716b]">
          {mode === "sign-in" ? "Nie masz jeszcze konta?" : "Masz już konto?"}{" "}
          <button
            className="font-semibold text-[#456a4b] hover:text-[#294b30]"
            onClick={() => {
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
              setError("");
              setMessage("");
            }}
            type="button"
          >
            {mode === "sign-in" ? "Załóż konto" : "Zaloguj się"}
          </button>
        </p>

        <p className="mt-8 border-t border-[#edf0e9] pt-5 text-xs leading-5 text-[#858b83]">
          Local Vault Mode jest osobną aplikacją desktopową i nie korzysta z tego logowania. <Link className="font-semibold text-[#456a4b] hover:text-[#294b30]" href="/local-vault">Pobierz Local Vault dla Windows</Link>.
        </p>
      </section>
    </main>
  );
}

function getAuthErrorMessage(error: unknown, mode: FormMode) {
  const providerMessage = error instanceof Error ? error.message : "";

  if (providerMessage === "Invalid login credentials") {
    return "Nieprawidłowy adres e-mail lub hasło.";
  }

  if (providerMessage === "Email not confirmed") {
    return "Potwierdź adres e-mail, a następnie spróbuj się zalogować.";
  }

  if (providerMessage.toLowerCase().includes("password")) {
    return "Hasło nie spełnia wymagań bezpieczeństwa. Użyj co najmniej 8 znaków.";
  }

  return mode === "sign-up"
    ? "Nie udało się utworzyć konta. Sprawdź dane i spróbuj ponownie."
    : "Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.";
}
