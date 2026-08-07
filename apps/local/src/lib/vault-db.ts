import Database from "@tauri-apps/plugin-sql";
import { BaseDirectory, mkdir, remove, writeFile } from "@tauri-apps/plugin-fs";

export type JobOffer = {
  id: string; companyName: string; positionTitle: string; description: string | null; requirements: string | null;
  location: string | null; workMode: string | null; employmentType: string | null; salaryMin: number | null;
  salaryMax: number | null; currency: string | null; sourceUrl: string | null; privateNote: string | null; createdAt: string;
};
export type CvDocument = { id: string; documentId: string; name: string; description: string | null; fileName: string; versionNumber: number; createdAt: string };
export type PortfolioArtifact = { id: string; title: string; artifactType: string; url: string | null; description: string | null; createdAt: string };
export type Application = {
  id: string;
  companyName: string;
  positionTitle: string;
  cvFileName: string;
  cvVersion: number;
  status: ApplicationStatus;
  sentAt: string | null;
  createdAt: string;
};
export type ApplicationStatus = "saved" | "preparing" | "applied" | "interview" | "offer" | "rejected" | "withdrawn";
export type ApplicationDetails = Application & {
  jobOfferId: string;
  cvVersionId: string;
  notes: Array<{ id: string; content: string; createdAt: string }>;
  history: Array<{ id: string; previousStatus: ApplicationStatus | null; newStatus: ApplicationStatus; changedAt: string }>;
  portfolio: Array<{ id: string; title: string; artifactType: string }>;
};

type SqlDatabase = Awaited<ReturnType<typeof Database.load>>;
let databasePromise: Promise<SqlDatabase> | null = null;
const now = () => new Date().toISOString();

const schema = [
  `CREATE TABLE IF NOT EXISTS job_offers (
    id TEXT PRIMARY KEY NOT NULL, company_name TEXT NOT NULL, position_title TEXT NOT NULL,
    location TEXT, description TEXT, requirements TEXT, work_mode TEXT, employment_type TEXT, salary_min REAL,
    salary_max REAL, currency TEXT, source_url TEXT, private_note TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS cv_documents (
    id TEXT PRIMARY KEY NOT NULL, name TEXT NOT NULL, description TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, archived_at TEXT, deleted_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS cv_versions (
    id TEXT PRIMARY KEY NOT NULL, cv_document_id TEXT NOT NULL REFERENCES cv_documents(id) ON DELETE RESTRICT,
    version_number INTEGER NOT NULL, original_file_name TEXT NOT NULL, storage_path TEXT NOT NULL, byte_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL, checksum TEXT, created_at TEXT NOT NULL, UNIQUE(cv_document_id, version_number)
  )`,
  `CREATE TABLE IF NOT EXISTS portfolio_artifacts (
    id TEXT PRIMARY KEY NOT NULL, title TEXT NOT NULL, url TEXT, description TEXT, created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL, archived_at TEXT, deleted_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY NOT NULL, job_offer_id TEXT NOT NULL REFERENCES job_offers(id) ON DELETE RESTRICT,
    cv_version_id TEXT NOT NULL REFERENCES cv_versions(id) ON DELETE RESTRICT, status TEXT NOT NULL,
    created_at TEXT NOT NULL, updated_at TEXT NOT NULL, sent_at TEXT, deleted_at TEXT,
    cv_file_name_snapshot TEXT NOT NULL, cv_version_snapshot INTEGER NOT NULL, cv_checksum_snapshot TEXT,
    UNIQUE(job_offer_id, deleted_at)
  )`,
  `CREATE TABLE IF NOT EXISTS application_status_history (
    id TEXT PRIMARY KEY NOT NULL, application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    previous_status TEXT, new_status TEXT NOT NULL, changed_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS application_notes (
    id TEXT PRIMARY KEY NOT NULL, application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    content TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL, deleted_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS application_portfolio_artifacts (
    application_id TEXT NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    portfolio_artifact_id TEXT NOT NULL REFERENCES portfolio_artifacts(id) ON DELETE RESTRICT,
    PRIMARY KEY(application_id, portfolio_artifact_id)
  )`,
  "CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC)",
  "CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_application_per_offer ON applications(job_offer_id) WHERE deleted_at IS NULL",
  "CREATE INDEX IF NOT EXISTS idx_application_history ON application_status_history(application_id, changed_at DESC)",
];

async function db() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const connection = await Database.load("sqlite:jobilot-local-vault.db");
      await connection.execute("PRAGMA foreign_keys = ON");
      for (const statement of schema) await connection.execute(statement);
      await migrateJobOffers(connection);
      await migrateCvVersions(connection);
      await migratePortfolio(connection);
      await migrateApplications(connection);
      return connection;
    })();
  }
  return databasePromise;
}

async function migrateJobOffers(connection: SqlDatabase) {
  const columns = await connection.select<Array<{ name: string }>>("PRAGMA table_info(job_offers)");
  const known = new Set(columns.map((column) => column.name));
  const additions = [
    ["description", "TEXT"], ["requirements", "TEXT"], ["work_mode", "TEXT"], ["employment_type", "TEXT"],
    ["salary_min", "REAL"], ["salary_max", "REAL"], ["currency", "TEXT"], ["source_url", "TEXT"], ["private_note", "TEXT"],
  ];
  for (const [name, sqlType] of additions) if (!known.has(name)) await connection.execute(`ALTER TABLE job_offers ADD COLUMN ${name} ${sqlType}`);
}

async function migrateCvVersions(connection: SqlDatabase) {
  const columns = await connection.select<Array<{ name: string }>>("PRAGMA table_info(cv_versions)");
  const known = new Set(columns.map((column) => column.name));
  const additions = [["storage_path", "TEXT"], ["byte_size", "INTEGER"], ["mime_type", "TEXT"], ["checksum", "TEXT"]];
  for (const [name, sqlType] of additions) if (!known.has(name)) await connection.execute(`ALTER TABLE cv_versions ADD COLUMN ${name} ${sqlType}`);
}

async function migratePortfolio(connection: SqlDatabase) {
  const columns = await connection.select<Array<{ name: string }>>("PRAGMA table_info(portfolio_artifacts)");
  const known = new Set(columns.map((column) => column.name));
  if (!known.has("artifact_type")) await connection.execute("ALTER TABLE portfolio_artifacts ADD COLUMN artifact_type TEXT");
  await connection.execute("UPDATE portfolio_artifacts SET artifact_type = 'link' WHERE artifact_type IS NULL OR artifact_type = ''");
}

async function migrateApplications(connection: SqlDatabase) {
  const columns = await connection.select<Array<{ name: string }>>("PRAGMA table_info(applications)");
  const known = new Set(columns.map((column) => column.name));
  const additions = [["cv_file_name_snapshot", "TEXT"], ["cv_version_snapshot", "INTEGER"], ["cv_checksum_snapshot", "TEXT"]];
  for (const [name, sqlType] of additions) if (!known.has(name)) await connection.execute(`ALTER TABLE applications ADD COLUMN ${name} ${sqlType}`);
}

function id() { return crypto.randomUUID(); }

export async function initializeVault() { await db(); }

export async function listJobOffers(): Promise<JobOffer[]> {
  const connection = await db();
  const rows = await connection.select<Array<{ id: string; company_name: string; position_title: string; description: string | null; requirements: string | null; location: string | null; work_mode: string | null; employment_type: string | null; salary_min: number | null; salary_max: number | null; currency: string | null; source_url: string | null; private_note: string | null; created_at: string }>>(
    "SELECT id, company_name, position_title, description, requirements, location, work_mode, employment_type, salary_min, salary_max, currency, source_url, private_note, created_at FROM job_offers WHERE deleted_at IS NULL ORDER BY created_at DESC",
  );
  return rows.map((row) => ({ id: row.id, companyName: row.company_name, positionTitle: row.position_title, description: row.description, requirements: row.requirements, location: row.location, workMode: row.work_mode, employmentType: row.employment_type, salaryMin: row.salary_min, salaryMax: row.salary_max, currency: row.currency, sourceUrl: row.source_url, privateNote: row.private_note, createdAt: row.created_at }));
}

export async function createJobOffer(input: Omit<JobOffer, "id" | "createdAt">) {
  const connection = await db();
  const createdAt = now();
  await connection.execute(
    `INSERT INTO job_offers (id, company_name, position_title, description, requirements, location, work_mode, employment_type, salary_min, salary_max, currency, source_url, private_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id(), input.companyName.trim(), input.positionTitle.trim(), input.description?.trim() || null, input.requirements?.trim() || null, input.location?.trim() || null, input.workMode || null, input.employmentType?.trim() || null, input.salaryMin, input.salaryMax, input.currency || null, input.sourceUrl?.trim() || null, input.privateNote?.trim() || null, createdAt, createdAt],
  );
}

export async function getJobOffer(idValue: string): Promise<JobOffer | null> {
  const connection = await db();
  const rows = await connection.select<Array<{ id: string; company_name: string; position_title: string; description: string | null; requirements: string | null; location: string | null; work_mode: string | null; employment_type: string | null; salary_min: number | null; salary_max: number | null; currency: string | null; source_url: string | null; private_note: string | null; created_at: string }>>(
    "SELECT id, company_name, position_title, description, requirements, location, work_mode, employment_type, salary_min, salary_max, currency, source_url, private_note, created_at FROM job_offers WHERE id = ? AND deleted_at IS NULL LIMIT 1",
    [idValue],
  );
  if (!rows.length) return null;
  const row = rows[0];
  return { id: row.id, companyName: row.company_name, positionTitle: row.position_title, description: row.description, requirements: row.requirements, location: row.location, workMode: row.work_mode, employmentType: row.employment_type, salaryMin: row.salary_min, salaryMax: row.salary_max, currency: row.currency, sourceUrl: row.source_url, privateNote: row.private_note, createdAt: row.created_at };
}

export async function updateJobOffer(idValue: string, input: Omit<JobOffer, "id" | "createdAt">) {
  const connection = await db();
  await connection.execute(
    `UPDATE job_offers SET company_name = ?, position_title = ?, description = ?, requirements = ?, location = ?, work_mode = ?, employment_type = ?, salary_min = ?, salary_max = ?, currency = ?, source_url = ?, private_note = ?, updated_at = ?
     WHERE id = ? AND deleted_at IS NULL`,
    [input.companyName.trim(), input.positionTitle.trim(), input.description?.trim() || null, input.requirements?.trim() || null, input.location?.trim() || null, input.workMode || null, input.employmentType?.trim() || null, input.salaryMin, input.salaryMax, input.currency || null, input.sourceUrl?.trim() || null, input.privateNote?.trim() || null, now(), idValue],
  );
}

export async function listCvDocuments(): Promise<CvDocument[]> {
  const connection = await db();
  const rows = await connection.select<Array<{ id: string; document_id: string; name: string; description: string | null; original_file_name: string; version_number: number; created_at: string }>>(
    `SELECT cv_versions.id, cv_documents.id AS document_id, cv_documents.name, cv_documents.description, cv_versions.original_file_name, cv_versions.version_number, cv_versions.created_at
     FROM cv_versions JOIN cv_documents ON cv_documents.id = cv_versions.cv_document_id
     WHERE cv_documents.deleted_at IS NULL AND cv_documents.archived_at IS NULL ORDER BY cv_versions.created_at DESC`,
  );
  return rows.map((row) => ({ id: row.id, documentId: row.document_id, name: row.name, description: row.description, fileName: row.original_file_name, versionNumber: row.version_number, createdAt: row.created_at }));
}

async function saveCvVersion(input: { file: File; documentId: string; versionNumber: number; createDocument?: { name: string; description: string }; updateDescription?: string }) {
  const isPdf = input.file.type === "application/pdf" || input.file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) throw new Error("INVALID_CV_FILE");
  if (input.file.size > 5 * 1024 * 1024) throw new Error("CV_FILE_TOO_LARGE");
  let connection: SqlDatabase;
  try {
    connection = await db();
  } catch {
    throw new Error("LV-CV-DB-INIT");
  }
  let versionId: string;
  let createdAt: string;
  let storagePath: string;
  try {
    versionId = id();
    createdAt = now();
    const safeFileName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    storagePath = `cv-files/${versionId}-${safeFileName}`;
  } catch {
    throw new Error("LV-CV-PREPARE");
  }
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await input.file.arrayBuffer());
  } catch {
    throw new Error("LV-CV-READ");
  }
  let checksum: string;
  try {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    checksum = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch {
    throw new Error("LV-CV-HASH");
  }
  try {
    await mkdir("cv-files", { baseDir: BaseDirectory.AppLocalData, recursive: true });
  } catch {
    throw new Error("LV-CV-DIRECTORY");
  }
  try {
    await writeFile(storagePath, bytes, { baseDir: BaseDirectory.AppLocalData });
  } catch {
    throw new Error("LV-CV-WRITE");
  }
  let documentInserted = false;
  let versionInserted = false;
  try {
    if (input.createDocument) {
      await connection.execute(
        "INSERT INTO cv_documents (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
        [input.documentId, input.createDocument.name.trim(), input.createDocument.description.trim() || null, createdAt, createdAt],
      );
      documentInserted = true;
    }
    await connection.execute(
      "INSERT INTO cv_versions (id, cv_document_id, version_number, original_file_name, storage_path, byte_size, mime_type, checksum, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [versionId, input.documentId, input.versionNumber, input.file.name, storagePath, input.file.size, input.file.type || "application/pdf", checksum, createdAt],
    );
    versionInserted = true;
    if (input.updateDescription !== undefined) await connection.execute("UPDATE cv_documents SET description = ?, updated_at = ? WHERE id = ?", [input.updateDescription.trim() || null, createdAt, input.documentId]);
  } catch {
    if (versionInserted) await connection.execute("DELETE FROM cv_versions WHERE id = ?", [versionId]).catch(() => undefined);
    if (documentInserted) await connection.execute("DELETE FROM cv_documents WHERE id = ?", [input.documentId]).catch(() => undefined);
    await remove(storagePath, { baseDir: BaseDirectory.AppLocalData }).catch(() => undefined);
    throw new Error("LV-CV-DATABASE");
  }
}

export async function createCvDocument(input: { name: string; description?: string; file: File }) {
  await saveCvVersion({ file: input.file, documentId: id(), versionNumber: 1, createDocument: { name: input.name, description: input.description ?? "" } });
}

export async function createCvVersion(input: { documentId: string; description?: string; file: File }) {
  const connection = await db();
  const rows = await connection.select<Array<{ version_number: number }>>("SELECT version_number FROM cv_versions WHERE cv_document_id = ? ORDER BY version_number DESC LIMIT 1", [input.documentId]);
  if (!rows.length) throw new Error("CV_DOCUMENT_NOT_FOUND");
  await saveCvVersion({ file: input.file, documentId: input.documentId, versionNumber: rows[0].version_number + 1, updateDescription: input.description });
}

export async function listPortfolio(): Promise<PortfolioArtifact[]> {
  const connection = await db();
  const rows = await connection.select<Array<{ id: string; title: string; artifact_type: string | null; url: string | null; description: string | null; created_at: string }>>(
    "SELECT id, title, artifact_type, url, description, created_at FROM portfolio_artifacts WHERE deleted_at IS NULL AND archived_at IS NULL ORDER BY created_at DESC",
  );
  return rows.map((row) => ({ id: row.id, title: row.title, artifactType: row.artifact_type || "link", url: row.url, description: row.description, createdAt: row.created_at }));
}

export async function createPortfolio(input: { title: string; artifactType: string; url?: string; description?: string }) {
  const connection = await db();
  const createdAt = now();
  await connection.execute(
    "INSERT INTO portfolio_artifacts (id, title, artifact_type, url, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [id(), input.title.trim(), input.artifactType, input.url?.trim() || null, input.description?.trim() || null, createdAt, createdAt],
  );
}

export async function getPortfolio(idValue: string): Promise<PortfolioArtifact | null> {
  const connection = await db();
  const rows = await connection.select<Array<{ id: string; title: string; artifact_type: string | null; url: string | null; description: string | null; created_at: string }>>(
    "SELECT id, title, artifact_type, url, description, created_at FROM portfolio_artifacts WHERE id = ? AND deleted_at IS NULL AND archived_at IS NULL LIMIT 1",
    [idValue],
  );
  if (!rows.length) return null;
  const row = rows[0];
  return { id: row.id, title: row.title, artifactType: row.artifact_type || "link", url: row.url, description: row.description, createdAt: row.created_at };
}

export async function updatePortfolio(idValue: string, input: { title: string; artifactType: string; url?: string; description?: string }) {
  const connection = await db();
  await connection.execute(
    "UPDATE portfolio_artifacts SET title = ?, artifact_type = ?, url = ?, description = ?, updated_at = ? WHERE id = ? AND deleted_at IS NULL AND archived_at IS NULL",
    [input.title.trim(), input.artifactType, input.url?.trim() || null, input.description?.trim() || null, now(), idValue],
  );
}

export async function listApplications(): Promise<Application[]> {
  const connection = await db();
  const rows = await connection.select<Array<{ id: string; company_name: string; position_title: string; cv_file_name_snapshot: string; cv_version_snapshot: number; status: ApplicationStatus; sent_at: string | null; created_at: string }>>(
    `SELECT applications.id, job_offers.company_name, job_offers.position_title, applications.cv_file_name_snapshot, applications.cv_version_snapshot,
      applications.status, applications.sent_at, applications.created_at
     FROM applications JOIN job_offers ON job_offers.id = applications.job_offer_id
     WHERE applications.deleted_at IS NULL ORDER BY applications.created_at DESC`,
  );
  return rows.map((row) => ({ id: row.id, companyName: row.company_name, positionTitle: row.position_title, cvFileName: row.cv_file_name_snapshot, cvVersion: row.cv_version_snapshot, status: row.status, sentAt: row.sent_at, createdAt: row.created_at }));
}

export async function createApplication(input: { jobOfferId: string; cvVersionId: string; status: ApplicationStatus; portfolioIds: string[] }) {
  const connection = await db();
  const existing = await connection.select<Array<{ id: string }>>("SELECT id FROM applications WHERE job_offer_id = ? AND deleted_at IS NULL LIMIT 1", [input.jobOfferId]);
  if (existing.length) throw new Error("DUPLICATE_APPLICATION");
  const cvSnapshot = await connection.select<Array<{ original_file_name: string; version_number: number; checksum: string | null }>>("SELECT original_file_name, version_number, checksum FROM cv_versions WHERE id = ?", [input.cvVersionId]);
  if (!cvSnapshot.length) throw new Error("CV_VERSION_NOT_FOUND");
  const applicationId = id();
  const createdAt = now();
  let applicationInserted = false;
  try {
    const sentAt = input.status === "applied" ? createdAt : null;
    await connection.execute(
      "INSERT INTO applications (id, job_offer_id, cv_version_id, status, created_at, updated_at, sent_at, cv_file_name_snapshot, cv_version_snapshot, cv_checksum_snapshot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [applicationId, input.jobOfferId, input.cvVersionId, input.status, createdAt, createdAt, sentAt, cvSnapshot[0].original_file_name, cvSnapshot[0].version_number, cvSnapshot[0].checksum],
    );
    applicationInserted = true;
    await connection.execute(
      "INSERT INTO application_status_history (id, application_id, previous_status, new_status, changed_at) VALUES (?, ?, NULL, ?, ?)",
      [id(), applicationId, input.status, createdAt],
    );
    for (const portfolioId of input.portfolioIds) {
      await connection.execute("INSERT INTO application_portfolio_artifacts (application_id, portfolio_artifact_id) VALUES (?, ?)", [applicationId, portfolioId]);
    }
  } catch {
    if (applicationInserted) await connection.execute("DELETE FROM applications WHERE id = ?", [applicationId]).catch(() => undefined);
    throw new Error("APPLICATION_SAVE_FAILED");
  }
}

export async function getApplication(idValue: string): Promise<ApplicationDetails | null> {
  const applications = await listApplications();
  const summary = applications.find((item) => item.id === idValue);
  if (!summary) return null;
  const connection = await db();
  const relation = await connection.select<Array<{ job_offer_id: string; cv_version_id: string }>>("SELECT job_offer_id, cv_version_id FROM applications WHERE id = ?", [idValue]);
  const notes = await connection.select<Array<{ id: string; content: string; created_at: string }>>("SELECT id, content, created_at FROM application_notes WHERE application_id = ? AND deleted_at IS NULL ORDER BY created_at DESC", [idValue]);
  const history = await connection.select<Array<{ id: string; previous_status: ApplicationStatus | null; new_status: ApplicationStatus; changed_at: string }>>("SELECT id, previous_status, new_status, changed_at FROM application_status_history WHERE application_id = ? ORDER BY changed_at DESC", [idValue]);
  const portfolio = await connection.select<Array<{ id: string; title: string; artifact_type: string | null }>>("SELECT portfolio_artifacts.id, portfolio_artifacts.title, portfolio_artifacts.artifact_type FROM application_portfolio_artifacts JOIN portfolio_artifacts ON portfolio_artifacts.id = application_portfolio_artifacts.portfolio_artifact_id WHERE application_portfolio_artifacts.application_id = ?", [idValue]);
  return { ...summary, jobOfferId: relation[0].job_offer_id, cvVersionId: relation[0].cv_version_id, notes: notes.map((item) => ({ id: item.id, content: item.content, createdAt: item.created_at })), history: history.map((item) => ({ id: item.id, previousStatus: item.previous_status, newStatus: item.new_status, changedAt: item.changed_at })), portfolio: portfolio.map((item) => ({ id: item.id, title: item.title, artifactType: item.artifact_type || "link" })) };
}

export async function updateApplicationStatus(idValue: string, status: ApplicationStatus) {
  const connection = await db();
  const current = await connection.select<Array<{ status: ApplicationStatus; sent_at: string | null }>>("SELECT status, sent_at FROM applications WHERE id = ? AND deleted_at IS NULL", [idValue]);
  if (!current.length || current[0].status === status) return;
  const changedAt = now();
  const sentAt = status === "applied" && !current[0].sent_at ? changedAt : current[0].sent_at;
  let statusUpdated = false;
  try {
    await connection.execute("UPDATE applications SET status = ?, sent_at = ?, updated_at = ? WHERE id = ?", [status, sentAt, changedAt, idValue]);
    statusUpdated = true;
    await connection.execute("INSERT INTO application_status_history (id, application_id, previous_status, new_status, changed_at) VALUES (?, ?, ?, ?, ?)", [id(), idValue, current[0].status, status, changedAt]);
  } catch {
    if (statusUpdated) await connection.execute("UPDATE applications SET status = ?, sent_at = ?, updated_at = ? WHERE id = ?", [current[0].status, current[0].sent_at, now(), idValue]).catch(() => undefined);
    throw new Error("APPLICATION_STATUS_SAVE_FAILED");
  }
}

export async function updateApplicationPortfolio(applicationId: string, portfolioIds: string[]) {
  const connection = await db();
  const previous = await connection.select<Array<{ portfolio_artifact_id: string }>>("SELECT portfolio_artifact_id FROM application_portfolio_artifacts WHERE application_id = ?", [applicationId]);
  try {
    await connection.execute("DELETE FROM application_portfolio_artifacts WHERE application_id = ?", [applicationId]);
    for (const portfolioId of portfolioIds) await connection.execute("INSERT INTO application_portfolio_artifacts (application_id, portfolio_artifact_id) VALUES (?, ?)", [applicationId, portfolioId]);
  } catch {
    await connection.execute("DELETE FROM application_portfolio_artifacts WHERE application_id = ?", [applicationId]).catch(() => undefined);
    for (const item of previous) await connection.execute("INSERT INTO application_portfolio_artifacts (application_id, portfolio_artifact_id) VALUES (?, ?)", [applicationId, item.portfolio_artifact_id]).catch(() => undefined);
    throw new Error("APPLICATION_PORTFOLIO_SAVE_FAILED");
  }
}

export async function addApplicationNote(applicationId: string, content: string) {
  const connection = await db();
  const createdAt = now();
  await connection.execute("INSERT INTO application_notes (id, application_id, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)", [id(), applicationId, content.trim(), createdAt, createdAt]);
}

export async function exportVault() {
  const connection = await db();
  const tables = ["job_offers", "cv_documents", "cv_versions", "portfolio_artifacts", "applications", "application_status_history", "application_notes", "application_portfolio_artifacts"];
  const data = Object.fromEntries(await Promise.all(tables.map(async (table) => [table, await connection.select(`SELECT * FROM ${table}`)])));
  return JSON.stringify({ format: "jobilot-local-vault", version: 1, exportedAt: now(), data }, null, 2);
}
