import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Regulamin | Jobilot AI",
  description: "Informacja o planowanym regulaminie Jobilot AI.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] px-5 py-7 text-[#20241f] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <header className="flex items-center justify-between gap-4">
          <Link className="flex items-center gap-3" href="/login">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#263b2c] text-lg font-bold text-white">J</span>
            <span className="text-lg font-semibold tracking-tight">Jobilot <em className="font-medium text-[#5e7863]">AI</em></span>
          </Link>
          <Link className="text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href="/about">O projekcie</Link>
        </header>

        <section className="mt-12 rounded-3xl border border-[#c9d8c6] bg-[#eef4eb] p-7 shadow-sm sm:p-10">
          <p className="text-sm font-semibold text-[#5e7863]">Jobilot AI</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Regulamin</h1>
          <p className="mt-5 text-sm leading-7 text-[#566054] sm:text-base">
            Wkrótce pojawi się regulamin.
          </p>
        </section>
      </div>
    </main>
  );
}
