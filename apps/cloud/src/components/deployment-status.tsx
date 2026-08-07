const builtAt = new Date().toISOString();

function formatDeploymentTime(value: string) {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "medium",
    timeZone: "Europe/Warsaw",
  }).format(new Date(value));
}

export function DeploymentStatus() {
  const commit = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "lokalna";

  return (
    <aside
      aria-label="Informacja o wdrożeniu MVP"
      className="fixed right-3 top-3 z-50 rounded-xl border border-[#d7e1d4] bg-white/95 px-3 py-2 text-right text-[11px] leading-4 text-[#526052] shadow-sm backdrop-blur"
    >
      <p className="font-semibold text-[#2d5034]">MVP · wersja {commit}</p>
      <p>Wdrożono: {formatDeploymentTime(builtAt)}</p>
    </aside>
  );
}
