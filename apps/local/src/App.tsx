import { FormEvent, useEffect, useState } from "react";
import "./App.css";
import {
  addApplicationNote,
  Application,
  ApplicationDetails,
  ApplicationStatus,
  createApplication,
  createCvDocument,
  createCvVersion,
  createJobOffer,
  createPortfolio,
  CvDocument,
  exportVault,
  getApplication,
  getJobOffer,
  getPortfolio,
  initializeVault,
  JobOffer,
  listApplications,
  listCvDocuments,
  listJobOffers,
  listPortfolio,
  PortfolioArtifact,
  updateApplicationStatus,
  updateApplicationPortfolio,
  updateJobOffer,
  updatePortfolio,
} from "./lib/vault-db";

type View = "overview" | "offers" | "cv" | "portfolio" | "applications";
const statuses: Array<[ApplicationStatus, string]> = [["saved", "Zapisana"], ["preparing", "Przygotowywana"], ["applied", "Wysłana"], ["interview", "Rozmowa"], ["offer", "Oferta"], ["rejected", "Odrzucona"], ["withdrawn", "Wycofana"]];
const labelStatus = (status: ApplicationStatus) => statuses.find(([value]) => value === status)?.[1] ?? status;
const formatDate = (value: string) => new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

function App() {
  const [view, setView] = useState<View>("overview");
  const [offers, setOffers] = useState<JobOffer[]>([]);
  const [cvs, setCvs] = useState<CvDocument[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioArtifact[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [offerDetails, setOfferDetails] = useState<JobOffer | null>(null);
  const [portfolioDetails, setPortfolioDetails] = useState<PortfolioArtifact | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  async function refresh() {
    setState("loading");
    try {
      await initializeVault();
      const [nextOffers, nextCvs, nextPortfolio, nextApplications] = await Promise.all([listJobOffers(), listCvDocuments(), listPortfolio(), listApplications()]);
      setOffers(nextOffers); setCvs(nextCvs); setPortfolio(nextPortfolio); setApplications(nextApplications);
      if (details) setDetails(await getApplication(details.id));
      if (offerDetails) setOfferDetails(await getJobOffer(offerDetails.id));
      if (portfolioDetails) setPortfolioDetails(await getPortfolio(portfolioDetails.id));
      setState("ready");
    } catch {
      setMessage("Nie udało się otworzyć lokalnego sejfu danych.");
      setState("error");
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function afterWrite(success: string) {
    await refresh();
    setMessage(success);
  }

  async function openApplication(applicationId: string) {
    const result = await getApplication(applicationId);
    setDetails(result);
    setView("applications");
  }

  async function openOffer(offerId: string) {
    setOfferDetails(await getJobOffer(offerId));
    setDetails(null);
    setView("offers");
  }

  async function refreshOffer(offerId: string) {
    setOfferDetails(await getJobOffer(offerId));
  }
  async function openPortfolio(portfolioId: string) { setPortfolioDetails(await getPortfolio(portfolioId)); setDetails(null); setOfferDetails(null); setView("portfolio"); }
  async function refreshPortfolio(portfolioId: string) { setPortfolioDetails(await getPortfolio(portfolioId)); }

  async function downloadExport() {
    const content = await exportVault();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([content], { type: "application/json" }));
    link.download = `jobilot-local-vault-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setMessage("Eksport JSON został przygotowany lokalnie.");
  }

  return (
    <main className="vault-shell">
      <aside className="sidebar">
        <div className="brand"><span>J</span><div><strong>Jobilot AI</strong><small>Local Vault</small></div></div>
        <nav aria-label="Nawigacja Local Vault">
          <NavButton active={view === "overview"} onClick={() => { setView("overview"); setDetails(null); setOfferDetails(null); setPortfolioDetails(null); }}>Pulpit</NavButton>
          <NavButton active={view === "offers"} onClick={() => { setView("offers"); setDetails(null); setOfferDetails(null); setPortfolioDetails(null); }}>Oferty pracy</NavButton>
          <NavButton active={view === "cv"} onClick={() => { setView("cv"); setDetails(null); setOfferDetails(null); setPortfolioDetails(null); }}>Biblioteka CV</NavButton>
          <NavButton active={view === "portfolio"} onClick={() => { setView("portfolio"); setDetails(null); setOfferDetails(null); setPortfolioDetails(null); }}>Portfolio</NavButton>
          <NavButton active={view === "applications"} onClick={() => { setView("applications"); setDetails(null); setOfferDetails(null); setPortfolioDetails(null); }}>Aplikacje</NavButton>
        </nav>
        <p className="privacy-note">Tryb offline. Brak konta, telemetrii, Supabase i funkcji AI.</p>
        <button className="secondary-button" onClick={() => void downloadExport()} type="button">Eksportuj dane JSON</button>
      </aside>

      <section className="content">
        <header className="topbar"><div><p>Local Vault</p><h1>{details ? "Szczegóły aplikacji" : offerDetails ? "Szczegóły oferty" : portfolioDetails ? "Szczegóły portfolio" : titles[view]}</h1></div><span className="local-badge">Dane na tym komputerze</span></header>
        {message ? <div className="notice" role="status"><span>{message}</span><button aria-label="Zamknij komunikat" onClick={() => setMessage("")} type="button">×</button></div> : null}
        {state === "loading" ? <p className="muted">Otwieranie lokalnej bazy danych…</p> : null}
        {state === "error" ? <p className="error">Nie można otworzyć Local Vault. Spróbuj ponownie uruchomić aplikację.</p> : null}
        {state === "ready" && !details && !offerDetails && !portfolioDetails ? <VaultView view={view} offers={offers} cvs={cvs} portfolio={portfolio} applications={applications} onWrite={afterWrite} onOpenApplication={openApplication} onOpenOffer={openOffer} onOpenPortfolio={openPortfolio} setMessage={setMessage} /> : null}
        {state === "ready" && details ? <ApplicationDetailsView availablePortfolio={portfolio} details={details} onBack={() => setDetails(null)} onWrite={afterWrite} /> : null}
        {state === "ready" && offerDetails ? <JobOfferDetailsView offer={offerDetails} onBack={() => setOfferDetails(null)} onWrite={afterWrite} onUpdated={refreshOffer} /> : null}
        {state === "ready" && portfolioDetails ? <PortfolioDetailsView item={portfolioDetails} onBack={() => setPortfolioDetails(null)} onWrite={afterWrite} onUpdated={refreshPortfolio} /> : null}
      </section>
    </main>
  );
}

const titles: Record<View, string> = { overview: "Twój lokalny sejf", offers: "Oferty pracy", cv: "Biblioteka CV", portfolio: "Portfolio", applications: "Aplikacje" };

function NavButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return <button className={active ? "nav-button active" : "nav-button"} onClick={onClick} type="button">{children}</button>;
}

function VaultView({ view, offers, cvs, portfolio, applications, onWrite, onOpenApplication, onOpenOffer, onOpenPortfolio, setMessage }: {
  view: View; offers: JobOffer[]; cvs: CvDocument[]; portfolio: PortfolioArtifact[]; applications: Application[];
  onWrite: (message: string) => Promise<void>; onOpenApplication: (id: string) => Promise<void>; onOpenOffer: (id: string) => Promise<void>; onOpenPortfolio: (id: string) => Promise<void>; setMessage: (message: string) => void;
}) {
  if (view === "overview") return <section className="overview-grid">
    <article><strong>{offers.length}</strong><span>ofert pracy</span></article><article><strong>{cvs.length}</strong><span>wersji CV</span></article><article><strong>{portfolio.length}</strong><span>elementów portfolio</span></article><article><strong>{applications.length}</strong><span>aplikacji</span></article>
    <div className="info-card"><h2>Prywatność Local Vault</h2><p>Wszystkie dane zapisują się w lokalnej bazie SQLite. Aplikacja nie loguje się do chmury i nie wysyła danych do usług AI.</p></div>
  </section>;
  if (view === "offers") return <DomainLayout title="Dodaj ofertę" form={<JobOfferForm onWrite={onWrite} />} list={<OfferList offers={offers} onOpen={onOpenOffer} />} />;
  if (view === "cv") return <DomainLayout title="Dodaj CV" form={<CvForm cvs={cvs} onWrite={onWrite} />} list={<CvList cvs={cvs} />} />;
  if (view === "portfolio") return <DomainLayout title="Dodaj portfolio" form={<PortfolioForm onWrite={onWrite} />} list={<PortfolioList portfolio={portfolio} onOpen={onOpenPortfolio} />} />;
  return <DomainLayout title="Utwórz aplikację" form={<ApplicationForm offers={offers} cvs={cvs} portfolio={portfolio} onWrite={onWrite} setMessage={setMessage} />} list={<ApplicationList applications={applications} onOpen={onOpenApplication} />} />;
}

function DomainLayout({ title, form, list }: { title: string; form: React.ReactNode; list: React.ReactNode }) { return <div className="domain-grid"><section className="form-card"><h2>{title}</h2>{form}</section><section className="list-card"><h2>Zapisane dane</h2>{list}</section></div>; }

function JobOfferForm({ onWrite, offer, onDone }: { onWrite: (message: string) => Promise<void>; offer?: JobOffer; onDone?: () => Promise<void> }) {
  const [companyName, setCompanyName] = useState(offer?.companyName ?? ""); const [positionTitle, setPositionTitle] = useState(offer?.positionTitle ?? ""); const [description, setDescription] = useState(offer?.description ?? ""); const [requirements, setRequirements] = useState(offer?.requirements ?? ""); const [location, setLocation] = useState(offer?.location ?? ""); const [workMode, setWorkMode] = useState(offer?.workMode ?? ""); const [employmentType, setEmploymentType] = useState(offer?.employmentType ?? ""); const [salaryMin, setSalaryMin] = useState(offer?.salaryMin?.toString() ?? ""); const [salaryMax, setSalaryMax] = useState(offer?.salaryMax?.toString() ?? ""); const [currency, setCurrency] = useState(offer?.currency ?? "PLN"); const [sourceUrl, setSourceUrl] = useState(offer?.sourceUrl ?? ""); const [privateNote, setPrivateNote] = useState(offer?.privateNote ?? ""); const [error, setError] = useState(""); const [linkHint, setLinkHint] = useState("");
  const parseSalary = (value: string) => value ? Number(value) : null;
  const validSalary = (value: string) => !value || /^\d+(\.\d{1,2})?$/.test(value);
  function validateLink(value: string) { if (!value) return ""; if (/^https?:\/\//i.test(value)) return ""; if (/\s/.test(value)) return "Adres zawiera spacje lub jest niekompletny. Możesz go zapisać jako link, ale nie będzie klikalny."; return "Dodaj https://, aby link był później klikalny. Możesz jednak zapisać ofertę bez tej zmiany."; }
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); if (!companyName.trim() || !positionTitle.trim()) return; if (!validSalary(salaryMin) || !validSalary(salaryMax)) { setError("Podaj liczbę nieujemną z maksymalnie dwoma miejscami po przecinku."); return; } const min = parseSalary(salaryMin); const max = parseSalary(salaryMax); if (min !== null && max !== null && max < min) { setError("Maksymalne wynagrodzenie nie może być niższe niż minimalne."); return; } const input = { companyName, positionTitle, description, requirements, location, workMode, employmentType, salaryMin: min, salaryMax: max, currency, sourceUrl, privateNote }; if (offer) await updateJobOffer(offer.id, input); else await createJobOffer(input); if (!offer) { setCompanyName(""); setPositionTitle(""); setDescription(""); setRequirements(""); setLocation(""); setWorkMode(""); setEmploymentType(""); setSalaryMin(""); setSalaryMax(""); setSourceUrl(""); setPrivateNote(""); setLinkHint(""); } await onWrite(offer ? "Oferta została zaktualizowana lokalnie." : "Oferta została zapisana lokalnie."); if (onDone) await onDone(); }
  return <form onSubmit={(event) => void submit(event)}><label>Firma *<input value={companyName} onChange={(event) => setCompanyName(event.target.value)} required /></label><label>Stanowisko *<input value={positionTitle} onChange={(event) => setPositionTitle(event.target.value)} required /></label><label>Opis oferty<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label><label>Wymagania<textarea value={requirements} onChange={(event) => setRequirements(event.target.value)} /></label><label>Lokalizacja<input value={location} onChange={(event) => setLocation(event.target.value)} /></label><label>Tryb pracy<select value={workMode} onChange={(event) => setWorkMode(event.target.value)}><option value="">Nie podano</option><option value="remote">Zdalnie</option><option value="hybrid">Hybrydowo</option><option value="onsite">Stacjonarnie</option></select></label><label>Rodzaj zatrudnienia<input value={employmentType} onChange={(event) => setEmploymentType(event.target.value)} placeholder="np. UOP, B2B" /></label><div className="salary-row"><label>Wynagrodzenie od<input inputMode="decimal" value={salaryMin} onChange={(event) => setSalaryMin(event.target.value)} /></label><label>do<input inputMode="decimal" value={salaryMax} onChange={(event) => setSalaryMax(event.target.value)} /></label><label>Waluta<input value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} maxLength={12} placeholder="np. PLN" /></label></div><label>Link źródłowy<input value={sourceUrl} onChange={(event) => { setSourceUrl(event.target.value); setLinkHint(validateLink(event.target.value)); }} /></label>{linkHint ? <p className="field-help">{linkHint}</p> : null}<label>Notatka prywatna<textarea value={privateNote} onChange={(event) => setPrivateNote(event.target.value)} /></label>{error ? <p className="error">{error}</p> : null}<button className="primary-button">{offer ? "Zapisz zmiany" : "Zapisz ofertę"}</button></form>;
}
function OfferList({ offers, onOpen }: { offers: JobOffer[]; onOpen: (id: string) => Promise<void> }) { return <ItemList empty="Nie masz jeszcze ofert." items={offers.map((offer) => <button className="application-row" key={offer.id} onClick={() => void onOpen(offer.id)} type="button"><span><strong>{offer.companyName}</strong><small>{offer.positionTitle}{offer.location ? ` · ${offer.location}` : ""}</small></span><em>Otwórz</em></button>)} />; }

function JobOfferDetailsView({ offer, onBack, onWrite, onUpdated }: { offer: JobOffer; onBack: () => void; onWrite: (message: string) => Promise<void>; onUpdated: (id: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const workMode = offer.workMode === "remote" ? "Zdalnie" : offer.workMode === "hybrid" ? "Hybrydowo" : offer.workMode === "onsite" ? "Stacjonarnie" : null;
  const salary = offer.salaryMin === null && offer.salaryMax === null ? null : offer.salaryMin !== null && offer.salaryMax !== null ? `${offer.salaryMin}–${offer.salaryMax} ${offer.currency ?? ""}` : offer.salaryMin !== null ? `od ${offer.salaryMin} ${offer.currency ?? ""}` : `do ${offer.salaryMax} ${offer.currency ?? ""}`;
  if (editing) return <section><button className="back-button" onClick={() => setEditing(false)} type="button">← Wróć do szczegółów</button><div className="form-card"><h2>Edytuj ofertę</h2><JobOfferForm key={offer.id} offer={offer} onWrite={onWrite} onDone={async () => { await onUpdated(offer.id); setEditing(false); }} /></div></section>;
  return <section><button className="back-button" onClick={onBack} type="button">← Wróć do ofert</button><div className="details-header"><div><p>{offer.companyName}</p><h2>{offer.positionTitle}</h2></div><button className="secondary-button" onClick={() => setEditing(true)} type="button">Edytuj ofertę</button></div><div className="details-grid"><article><h3>Opis oferty</h3><p>{offer.description || "Nie dodano opisu."}</p></article><article><h3>Wymagania</h3><p>{offer.requirements || "Nie dodano wymagań."}</p></article><article><h3>Prywatna notatka</h3><p>{offer.privateNote || "Nie dodano prywatnej notatki."}</p></article><article><h3>Szczegóły</h3><dl className="detail-list"><div><dt>Wynagrodzenie</dt><dd>{salary || "Nie podano"}</dd></div><div><dt>Lokalizacja</dt><dd>{offer.location || "Nie podano"}</dd></div><div><dt>Tryb pracy</dt><dd>{workMode || "Nie podano"}</dd></div><div><dt>Zatrudnienie</dt><dd>{offer.employmentType || "Nie podano"}</dd></div></dl></article><article className="details-wide"><h3>Link źródłowy</h3><p className="break-text">{offer.sourceUrl || "Nie dodano linku źródłowego."}</p><p className="field-help">Local Vault nie otwiera linków automatycznie, aby nie inicjować połączeń zewnętrznych.</p></article></div></section>;
}

function CvForm({ cvs, onWrite }: { cvs: CvDocument[]; onWrite: (message: string) => Promise<void> }) {
  const documents = Array.from(new Map(cvs.map((cv) => [cv.documentId, cv])).values());
  const [selectedDocumentId, setSelectedDocumentId] = useState(""); const [name, setName] = useState(""); const [description, setDescription] = useState(""); const [file, setFile] = useState<File | null>(null); const [error, setError] = useState(""); const [inputKey, setInputKey] = useState(0);
  const selectedDocument = documents.find((document) => document.documentId === selectedDocumentId);
  function selectDocument(value: string) { setSelectedDocumentId(value); const document = documents.find((item) => item.documentId === value); setDescription(document?.description ?? ""); }
  async function submit(event: FormEvent) { event.preventDefault(); if ((!selectedDocumentId && !name.trim()) || !file) return; let phase = "SAVE"; try { setError(""); if (selectedDocumentId) await createCvVersion({ documentId: selectedDocumentId, description, file }); else await createCvDocument({ name, description, file }); phase = "REFRESH"; setName(""); setDescription(""); setFile(null); setInputKey((current) => current + 1); await onWrite(selectedDocumentId ? "Nowa wersja CV została skopiowana do Local Vault." : "CV zostało skopiowane do prywatnego katalogu Local Vault."); } catch (cause) { const message = typeof cause === "string" ? cause : cause && typeof cause === "object" && "message" in cause ? String(cause.message) : ""; if (message === "CV_FILE_TOO_LARGE") setError("Plik CV nie może przekraczać 5 MB."); else if (message === "INVALID_CV_FILE") setError("Wybierz prawidłowy plik PDF."); else if (["LV-CV-DB-INIT", "LV-CV-PREPARE", "LV-CV-READ", "LV-CV-HASH", "LV-CV-DIRECTORY", "LV-CV-WRITE", "LV-CV-DATABASE", "CV_DOCUMENT_NOT_FOUND"].includes(message)) setError(`Kod ${message}: zapis CV zatrzymał się na tym etapie Local Vault.`); else setError(`Kod LV-CV-${phase}: nie udało się dokończyć zapisu CV.`); } }
  return <form onSubmit={(event) => void submit(event)}>{documents.length ? <label>Dodaj do istniejącego CV<select value={selectedDocumentId} onChange={(event) => selectDocument(event.target.value)}><option value="">Nowy dokument CV</option>{documents.map((document) => <option key={document.documentId} value={document.documentId}>{document.name}</option>)}</select></label> : null}{!selectedDocumentId ? <label>Nazwa CV *<input value={name} onChange={(event) => setName(event.target.value)} required placeholder="np. Frontend CV" /></label> : <p className="field-help">Dodajesz kolejną wersję: <strong>{selectedDocument?.name}</strong>.</p>}<label>Opis CV<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="np. CV dla stanowisk frontendowych" /></label><label>Plik PDF *<input accept="application/pdf,.pdf" key={inputKey} onChange={(event) => setFile(event.target.files?.[0] ?? null)} required type="file" /></label>{file ? <p className="field-help">Wybrano: {file.name} ({Math.ceil(file.size / 1024)} KB). Plik zostanie skopiowany wyłącznie do Local Vault.</p> : null}{error ? <p className="error">{error}</p> : null}<button className="primary-button">{selectedDocumentId ? "Dodaj nową wersję" : "Dodaj CV"}</button></form>;
}
function CvList({ cvs }: { cvs: CvDocument[] }) { const documents = Array.from(new Map(cvs.map((cv) => [cv.documentId, { name: cv.name, description: cv.description, versions: cvs.filter((item) => item.documentId === cv.documentId).sort((first, second) => second.versionNumber - first.versionNumber) }])).values()); return <ItemList empty="Nie masz jeszcze CV." items={documents.map((document) => <article key={document.versions[0].documentId}><strong>{document.name}</strong><span>{document.description || "Brak opisu"}</span>{document.versions.map((version) => <small key={version.id}>v{version.versionNumber} · {version.fileName}</small>)}</article>)} />; }

function PortfolioForm({ onWrite, item, onDone }: { onWrite: (message: string) => Promise<void>; item?: PortfolioArtifact; onDone?: () => Promise<void> }) {
  const [title, setTitle] = useState(item?.title ?? ""); const [artifactType, setArtifactType] = useState(item?.artifactType ?? "link"); const [url, setUrl] = useState(item?.url ?? ""); const [description, setDescription] = useState(item?.description ?? ""); const [error, setError] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); setError(""); if (!title.trim()) return; if (url && !/^https?:\/\//i.test(url)) { setError("Podaj pełny adres zaczynający się od https:// lub http://."); return; } if (item) await updatePortfolio(item.id, { title, artifactType, url, description }); else await createPortfolio({ title, artifactType, url, description }); if (!item) { setTitle(""); setArtifactType("link"); setUrl(""); setDescription(""); } await onWrite(item ? "Portfolio zostało zaktualizowane lokalnie." : "Portfolio zostało zapisane lokalnie."); if (onDone) await onDone(); }
  return <form onSubmit={(event) => void submit(event)}><label>Nazwa *<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label><label>Typ artefaktu<select value={artifactType} onChange={(event) => setArtifactType(event.target.value)}><option value="link">Link</option><option value="github">GitHub</option><option value="website">Strona internetowa</option><option value="behance">Behance</option><option value="dribbble">Dribbble</option><option value="case-study">Case study</option><option value="presentation">Prezentacja</option><option value="other">Inny</option></select></label><label>Link opcjonalny<input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" /></label><label>Opis opcjonalny<textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>{error ? <p className="error">{error}</p> : null}<button className="primary-button">{item ? "Zapisz zmiany" : "Dodaj portfolio"}</button></form>;
}
function PortfolioList({ portfolio, onOpen }: { portfolio: PortfolioArtifact[]; onOpen: (id: string) => Promise<void> }) { return <ItemList empty="Nie masz jeszcze portfolio." items={portfolio.map((item) => <button className="application-row" key={item.id} onClick={() => void onOpen(item.id)} type="button"><span><strong>{item.title}</strong><small>{item.artifactType}</small></span><em>Otwórz</em></button>)} />; }
function PortfolioDetailsView({ item, onBack, onWrite, onUpdated }: { item: PortfolioArtifact; onBack: () => void; onWrite: (message: string) => Promise<void>; onUpdated: (id: string) => Promise<void> }) { const [editing, setEditing] = useState(false); if (editing) return <section><button className="back-button" onClick={() => setEditing(false)} type="button">← Wróć do szczegółów</button><div className="form-card"><h2>Edytuj portfolio</h2><PortfolioForm key={item.id} item={item} onWrite={onWrite} onDone={async () => { await onUpdated(item.id); setEditing(false); }} /></div></section>; return <section><button className="back-button" onClick={onBack} type="button">← Wróć do portfolio</button><div className="details-header"><div><p>{item.artifactType}</p><h2>{item.title}</h2></div><button className="secondary-button" onClick={() => setEditing(true)} type="button">Edytuj portfolio</button></div><div className="details-grid"><article><h3>Opis</h3><p>{item.description || "Nie dodano opisu."}</p></article><article><h3>Link</h3><p className="break-text">{item.url || "Nie dodano linku."}</p><p className="field-help">Local Vault nie otwiera linków automatycznie.</p></article></div></section>; }

function ApplicationForm({ offers, cvs, portfolio, onWrite, setMessage }: { offers: JobOffer[]; cvs: CvDocument[]; portfolio: PortfolioArtifact[]; onWrite: (message: string) => Promise<void>; setMessage: (message: string) => void }) {
  const [jobOfferId, setJobOfferId] = useState(""); const [cvVersionId, setCvVersionId] = useState(""); const [status, setStatus] = useState<ApplicationStatus>("saved"); const [portfolioIds, setPortfolioIds] = useState<string[]>([]);
  async function submit(event: FormEvent) { event.preventDefault(); if (!jobOfferId || !cvVersionId) return; try { await createApplication({ jobOfferId, cvVersionId, status, portfolioIds }); setJobOfferId(""); setCvVersionId(""); setStatus("saved"); setPortfolioIds([]); await onWrite("Aplikacja została zapisana lokalnie."); } catch (error) { setMessage(error instanceof Error && error.message === "DUPLICATE_APPLICATION" ? "Masz już aktywną aplikację do tej oferty." : "Nie udało się zapisać aplikacji."); } }
  return <form onSubmit={(event) => void submit(event)}><label>Oferta pracy *<select value={jobOfferId} onChange={(event) => setJobOfferId(event.target.value)} required><option value="">Wybierz ofertę</option>{offers.map((offer) => <option key={offer.id} value={offer.id}>{offer.companyName} — {offer.positionTitle}</option>)}</select></label><label>Wersja CV *<select value={cvVersionId} onChange={(event) => setCvVersionId(event.target.value)} required><option value="">Wybierz CV</option>{cvs.map((cv) => <option key={cv.id} value={cv.id}>{cv.name} · v{cv.versionNumber}</option>)}</select></label><label>Status początkowy<select value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)}>{statuses.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>{portfolio.length ? <fieldset><legend>Portfolio opcjonalne</legend>{portfolio.map((item) => <label className="checkbox" key={item.id}><input checked={portfolioIds.includes(item.id)} onChange={() => setPortfolioIds((current) => current.includes(item.id) ? current.filter((value) => value !== item.id) : [...current, item.id])} type="checkbox" />{item.title} ({item.artifactType})</label>)}</fieldset> : null}<button className="primary-button">Utwórz aplikację</button></form>;
}
function ApplicationList({ applications, onOpen }: { applications: Application[]; onOpen: (id: string) => Promise<void> }) { return <ItemList empty="Nie masz jeszcze aplikacji." items={applications.map((application) => <button className="application-row" key={application.id} onClick={() => void onOpen(application.id)} type="button"><span><strong>{application.companyName}</strong><small>{application.positionTitle} · {application.cvFileName} v{application.cvVersion}</small></span><em>{labelStatus(application.status)}</em></button>)} />; }

function ApplicationDetailsView({ details, availablePortfolio, onBack, onWrite }: { details: ApplicationDetails; availablePortfolio: PortfolioArtifact[]; onBack: () => void; onWrite: (message: string) => Promise<void> }) {
  const [status, setStatus] = useState<ApplicationStatus>(details.status); const [note, setNote] = useState("");
  const [editingPortfolio, setEditingPortfolio] = useState(false); const [portfolioIds, setPortfolioIds] = useState(details.portfolio.map((item) => item.id));
  async function changeStatus(event: FormEvent) { event.preventDefault(); await updateApplicationStatus(details.id, status); await onWrite("Status aplikacji został zapisany lokalnie."); }
  async function addNote(event: FormEvent) { event.preventDefault(); if (!note.trim()) return; await addApplicationNote(details.id, note); setNote(""); await onWrite("Notatka została zapisana lokalnie."); }
  async function savePortfolio(event: FormEvent) { event.preventDefault(); await updateApplicationPortfolio(details.id, portfolioIds); await onWrite("Portfolio przypisane do aplikacji zostało zaktualizowane lokalnie."); setEditingPortfolio(false); }
  return <section><button className="back-button" onClick={onBack} type="button">← Wróć do aplikacji</button><div className="details-header"><div><h2>{details.companyName}</h2><p>{details.positionTitle}</p>{details.sentAt ? <p>Data wysłania: {formatDate(details.sentAt)}</p> : null}</div><span className="local-badge">{labelStatus(details.status)}</span></div><div className="details-grid"><article><h3>Wersja CV użyta w aplikacji</h3><p>{details.cvFileName} · wersja v{details.cvVersion}</p></article><article><h3>Portfolio</h3>{editingPortfolio ? <form onSubmit={(event) => void savePortfolio(event)}>{availablePortfolio.map((item) => <label className="checkbox" key={item.id}><input checked={portfolioIds.includes(item.id)} onChange={() => setPortfolioIds((current) => current.includes(item.id) ? current.filter((value) => value !== item.id) : [...current, item.id])} type="checkbox" />{item.title} ({item.artifactType})</label>)}<button className="primary-button">Zapisz portfolio</button><button className="secondary-button" onClick={() => { setPortfolioIds(details.portfolio.map((item) => item.id)); setEditingPortfolio(false); }} type="button">Anuluj</button></form> : <>{details.portfolio.length ? details.portfolio.map((item) => <p key={item.id}>{item.title} <small>({item.artifactType})</small></p>) : <p>Nie wybrano portfolio.</p>}<button className="secondary-button" onClick={() => setEditingPortfolio(true)} type="button">Edytuj portfolio aplikacji</button></>}</article><form onSubmit={(event) => void changeStatus(event)}><h3>Status</h3><select value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)}>{statuses.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select><button className="primary-button">Zmień status</button></form><article><h3>Historia</h3>{details.history.map((item) => <p className="timeline" key={item.id}>{item.previousStatus ? `${labelStatus(item.previousStatus)} → ` : ""}{labelStatus(item.newStatus)}<small>{formatDate(item.changedAt)}</small></p>)}</article><article><h3>Notatki</h3><form onSubmit={(event) => void addNote(event)}><textarea value={note} onChange={(event) => setNote(event.target.value)} maxLength={10000} placeholder="Dodaj prywatną notatkę…" /><button className="secondary-button">Dodaj notatkę</button></form>{details.notes.map((item) => <p className="note" key={item.id}>{item.content}<small>{formatDate(item.createdAt)}</small></p>)}</article></div></section>;
}

function ItemList({ empty, items }: { empty: string; items: React.ReactNode[] }) { return <div className="item-list">{items.length ? items : <p className="muted">{empty}</p>}</div>; }

export default App;
