const applications = [
  {
    company: "Allegro",
    role: "Junior Frontend Developer",
    status: "Rozmowa",
    statusClass: "bg-violet-50 text-violet-700 ring-violet-200",
    date: "Rozmowa jutro, 10:00",
    initials: "A",
    color: "bg-orange-100 text-orange-700",
  },
  {
    company: "DocPlanner",
    role: "Frontend Intern",
    status: "Wysłano",
    statusClass: "bg-sky-50 text-sky-700 ring-sky-200",
    date: "Wysłano 28 lipca",
    initials: "D",
    color: "bg-cyan-100 text-cyan-700",
  },
  {
    company: "Ramp",
    role: "React Developer",
    status: "Przygotowanie",
    statusClass: "bg-amber-50 text-amber-700 ring-amber-200",
    date: "Termin aplikacji: 5 sierpnia",
    initials: "R",
    color: "bg-rose-100 text-rose-700",
  },
];

const menu = ["Pulpit", "Aplikacje", "Oferty pracy", "Biblioteka CV", "Portfolio"];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-[#20241f]">
      <div className="mx-auto flex min-h-screen max-w-[1540px]">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e6e7df] bg-[#fbfbf8] px-5 py-7 lg:flex">
          <a className="mb-12 flex items-center gap-3 px-2" href="#pulpit">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#263b2c] text-lg font-bold text-white">J</span>
            <span className="text-lg font-semibold tracking-tight">Jobilot <em className="font-medium text-[#5e7863]">AI</em></span>
          </a>

          <nav aria-label="Główna nawigacja" className="space-y-1">
            {menu.map((item, index) => (
              <a
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${index === 0 ? "bg-[#e7efe5] text-[#26432c]" : "text-[#687167] hover:bg-[#f0f2ec] hover:text-[#263b2c]"}`}
                href={`#${item.toLowerCase().replaceAll(" ", "-")}`}
                key={item}
              >
                <span className="grid h-5 w-5 place-items-center rounded-md border border-current/20 text-[10px]">{index + 1}</span>
                {item}
              </a>
            ))}
          </nav>

          <div className="mt-8 border-t border-[#e6e7df] pt-6">
            <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9a9f98]">Wsparcie</p>
            <a className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#687167] hover:bg-[#f0f2ec]" href="#ustawienia">
              <span className="text-base">⚙</span> Ustawienia
            </a>
          </div>

          <div className="mt-auto rounded-2xl bg-[#263b2c] p-4 text-[#f8fbf6]">
            <p className="text-xs font-medium text-[#c7d8c5]">Cloud Mode</p>
            <p className="mt-1 text-sm font-semibold">Twoje dane są prywatne</p>
            <p className="mt-2 text-xs leading-5 text-[#c7d8c5]">AI jest wyłączone do czasu świadomego uruchomienia.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
          <header className="flex items-center justify-between gap-4">
            <a className="flex items-center gap-2 lg:hidden" href="#pulpit">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#263b2c] text-sm font-bold text-white">J</span>
              <span className="font-semibold">Jobilot AI</span>
            </a>
            <div className="hidden flex-1 sm:block">
              <label className="relative block max-w-sm">
                <span className="sr-only">Szukaj w aplikacji</span>
                <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-[#a2a79f]">⌕</span>
                <input className="w-full rounded-xl border border-[#e4e6de] bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-[#a2a79f] focus:border-[#6c8b70] focus:ring-2 focus:ring-[#dce9dc]" placeholder="Szukaj aplikacji, firmy..." />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button aria-label="Powiadomienia" className="grid h-10 w-10 place-items-center rounded-xl border border-[#e4e6de] bg-white text-[#596157] transition hover:bg-[#f1f4ee]">◌</button>
              <button className="flex items-center gap-2 rounded-xl bg-white py-1.5 pl-1.5 pr-3 text-sm font-medium ring-1 ring-[#e4e6de]">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#dce9dc] text-xs font-bold text-[#35543c]">KN</span>
                Kamil
              </button>
            </div>
          </header>

          <div id="pulpit" className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-medium text-[#6c8b70]">Poniedziałek, 3 sierpnia</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#20241f] sm:text-4xl">Dzień dobry, Kamil.</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-[#6c716b]">Masz 3 aktywne aplikacje. Jedna rozmowa wymaga przygotowania.</p>
            </div>
            <a className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2d5034] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#203d27]" href="#nowa-aplikacja">
              <span className="text-lg leading-none">+</span> Nowa aplikacja
            </a>
          </div>

          <section aria-label="Podsumowanie procesu" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Aktywne aplikacje" value="3" note="+1 w tym tygodniu" tone="bg-[#edf5ed] text-[#335e3b]" />
            <StatCard label="Do wysłania" value="2" note="Najbliższy termin: 5 sie" tone="bg-[#fff6df] text-[#8a611a]" />
            <StatCard label="Rozmowy" value="1" note="Allegro · jutro 10:00" tone="bg-[#f1effd] text-[#6352ae]" />
            <StatCard label="Wersje CV" value="4" note="Ostatnia zmiana: dziś" tone="bg-[#ebf4f8] text-[#2d667c]" />
          </section>

          <div className="mt-8 grid gap-7 xl:grid-cols-[minmax(0,1fr)_330px]">
            <section id="aplikacje" className="rounded-2xl border border-[#e5e7e0] bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">Twoje aplikacje</h2>
                  <p className="mt-1 text-sm text-[#767c74]">Ostatnio aktualizowane rekordy procesu.</p>
                </div>
                <a className="text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href="#wszystkie">Zobacz wszystkie →</a>
              </div>
              <div className="mt-5 divide-y divide-[#edf0e9]">
                {applications.map((application) => (
                  <article className="flex items-center gap-3 py-4 first:pt-0 last:pb-0 sm:gap-4" key={application.company}>
                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold ${application.color}`}>{application.initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#2c322c]">{application.company}</p>
                      <p className="truncate text-sm text-[#747a72]">{application.role}</p>
                    </div>
                    <div className="hidden text-right sm:block">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${application.statusClass}`}>{application.status}</span>
                      <p className="mt-1.5 text-xs text-[#8b908a]">{application.date}</p>
                    </div>
                    <a className="text-[#829081] hover:text-[#35543c]" href="#szczegoly" aria-label={`Otwórz aplikację ${application.company}`}>→</a>
                  </article>
                ))}
              </div>
            </section>

            <div className="space-y-7">
              <section className="rounded-2xl border border-[#e5e7e0] bg-white p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold tracking-tight">Na dziś</h2>
                  <span className="rounded-full bg-[#fff1e8] px-2 py-1 text-xs font-semibold text-[#9b542e]">2 zadania</span>
                </div>
                <div className="mt-4 space-y-3">
                  <Task label="Przygotuj się do rozmowy z Allegro" time="jutro, 10:00" checked />
                  <Task label="Dopasuj CV do oferty Ramp" time="do 5 sierpnia" />
                </div>
                <a className="mt-5 block text-sm font-semibold text-[#456a4b] hover:text-[#294b30]" href="#zadania">+ Dodaj zadanie</a>
              </section>

              <section className="rounded-2xl bg-[#e7efe5] p-5">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#55775b]">AI z kontrolą użytkownika</p>
                <h2 className="mt-2 text-lg font-semibold tracking-tight text-[#294430]">Decyzja należy do Ciebie.</h2>
                <p className="mt-2 text-sm leading-6 text-[#527058]">Analiza CV i generator listu są opcjonalne. Przed użyciem pokażemy, jakie dane opuszczą aplikację.</p>
                <a className="mt-4 inline-flex text-sm font-semibold text-[#315b3a] hover:text-[#203d27]" href="#ai">Dowiedz się więcej →</a>
              </section>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return (
    <article className="rounded-2xl border border-[#e5e7e0] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-[#737a70]">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold ${tone}`}>↗</span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-xs text-[#8b908a]">{note}</p>
    </article>
  );
}

function Task({ label, time, checked = false }: { label: string; time: string; checked?: boolean }) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-xl p-2 transition hover:bg-[#f7f9f5]">
      <input defaultChecked={checked} className="mt-0.5 h-4 w-4 rounded border-[#c6cec3] accent-[#3d6845]" type="checkbox" />
      <span>
        <span className={`block text-sm font-medium ${checked ? "text-[#727a71] line-through" : "text-[#353a34]"}`}>{label}</span>
        <span className="mt-0.5 block text-xs text-[#8b908a]">{time}</span>
      </span>
    </label>
  );
}
