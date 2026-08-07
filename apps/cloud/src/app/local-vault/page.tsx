import Link from "next/link";

const installerUrl = "https://github.com/kamiln123/jobilot-ai/releases/download/local-vault-v0.1.0/Jobilot%20AI%20Local%20Vault_0.1.0_x64-setup.exe";

export default function LocalVaultDownloadPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <section className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/login">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#263b2c] text-lg font-bold text-white">J</span>
            <span className="text-lg font-semibold tracking-tight">Jobilot <em className="font-medium text-[#5e7863]">AI</em></span>
          </Link>
          <Link className="text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href="/login">Cloud Mode</Link>
        </header>

        <section className="mt-14 rounded-2xl border border-[#e5e7e0] bg-white p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold text-[#5e7863]">Aplikacja desktopowa · Windows</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Jobilot AI Local Vault</h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#687167]">
            Lokalny sejf do organizacji procesu rekrutacji. Nie wymaga konta, logowania ani połączenia z Jobilot Cloud.
          </p>
          <a className="mt-7 inline-flex rounded-xl bg-[#2d5034] px-5 py-3 text-sm font-semibold text-white hover:bg-[#203d27]" href={installerUrl}>
            Pobierz instalator dla Windows
          </a>
          <p className="mt-3 text-xs text-[#7b8179]">Wersja 0.1.0 · Windows 64-bit · pobranie bez logowania</p>
        </section>

        <section className="mt-7 grid gap-5 sm:grid-cols-3">
          <article className="rounded-2xl border border-[#e5e7e0] bg-white p-5"><h2 className="font-semibold">Offline</h2><p className="mt-2 text-sm leading-6 text-[#687167]">Dane pozostają na komputerze użytkownika.</p></article>
          <article className="rounded-2xl border border-[#e5e7e0] bg-white p-5"><h2 className="font-semibold">Bez konta</h2><p className="mt-2 text-sm leading-6 text-[#687167]">Brak rejestracji, synchronizacji i telemetrii.</p></article>
          <article className="rounded-2xl border border-[#e5e7e0] bg-white p-5"><h2 className="font-semibold">Oddzielna aplikacja</h2><p className="mt-2 text-sm leading-6 text-[#687167]">Nie jest to przełącznik trybu Cloud Mode.</p></article>
        </section>
      </section>
    </main>
  );
}
