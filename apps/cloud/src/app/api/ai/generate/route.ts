import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { GeminiProviderError, generateWithGemini, type AiOperation } from "@/lib/ai/gemini";

export const runtime = "nodejs";

const MAX_CV_BYTES = 5 * 1024 * 1024;
const GEMINI_POLICY_VERSION = "mvp-gemini-free-2026-08-07";

function response(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function getDailyLimit() {
  const configured = Number.parseInt(process.env.AI_DAILY_LIMIT ?? "10", 10);
  return Number.isInteger(configured) && configured >= 1 && configured <= 100 ? configured : 10;
}

function quotaDiagnosticCode(error: { code?: string | null } | null) {
  const code = error?.code ?? "UNKNOWN";
  if (code === "PGRST202") return "FUNCTION_MISSING";
  if (code === "42501") return "PERMISSION";
  if (code === "42P01") return "TABLE_MISSING";
  if (code === "PGRST301") return "AUTH";
  return `RPC_${code.replace(/[^A-Z0-9_]/gi, "").slice(0, 24) || "UNKNOWN"}`;
}

export async function POST(request: NextRequest) {
  if (process.env.AI_GLOBAL_ENABLED !== "true") {
    return response("Funkcje AI są obecnie wyłączone.", 503);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return response("Brakuje konfiguracji dostawcy AI.", 503);

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  if (!token) return response("Zaloguj się ponownie, aby użyć AI.", 401);

  let body: { applicationId?: unknown; operation?: unknown };
  try {
    body = await request.json();
  } catch {
    return response("Nieprawidłowe dane żądania AI.", 400);
  }
  const applicationId = typeof body.applicationId === "string" ? body.applicationId : "";
  const operation: AiOperation | null = body.operation === "analysis" || body.operation === "cover-letter" ? body.operation : null;
  if (!applicationId || !operation) return response("Nieprawidłowe dane żądania AI.", 400);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return response("Brakuje konfiguracji aplikacji.", 503);
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user;
  if (userError || !user) return response("Zaloguj się ponownie, aby użyć AI.", 401);

  const { data: consent } = await supabase
    .from("ai_consents")
    .select("provider,policy_version")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .eq("provider", "gemini")
    .maybeSingle();
  if (!consent || consent.policy_version !== GEMINI_POLICY_VERSION) {
    return response("Wymagana jest aktualna, świadoma zgoda na użycie Gemini.", 403);
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id,job_offer_id,cv_version_id")
    .eq("id", applicationId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!application) return response("Nie znaleziono aplikacji lub nie masz do niej dostępu.", 404);

  const [{ data: offer }, { data: cvVersion }] = await Promise.all([
    supabase
      .from("job_offers")
      .select("company_name,position_title,description,requirements")
      .eq("id", application.job_offer_id)
      .is("deleted_at", null)
      .maybeSingle(),
    supabase
      .from("cv_versions")
      .select("storage_path,mime_type,byte_size")
      .eq("id", application.cv_version_id)
      .maybeSingle(),
  ]);
  if (!offer || !cvVersion || cvVersion.mime_type !== "application/pdf" || cvVersion.byte_size > MAX_CV_BYTES) {
    return response("Nie udało się przygotować bezpiecznych danych do analizy.", 422);
  }

  const { data: cvBlob, error: downloadError } = await supabase.storage.from("cv-files").download(cvVersion.storage_path);
  if (downloadError || !cvBlob || cvBlob.size > MAX_CV_BYTES) {
    return response("Nie udało się odczytać pliku CV do analizy.", 422);
  }

  const { data: quota, error: quotaError } = await supabase
    .rpc("reserve_ai_operation", { p_daily_limit: getDailyLimit() })
    .maybeSingle<{ allowed: boolean; operation_count: number }>();
  if (quotaError || !quota) {
    const diagnostic = quotaDiagnosticCode(quotaError);
    console.error("AI_QUOTA_RPC", { diagnostic });
    return response(`Nie udało się sprawdzić limitu AI. Kod: AI-QUOTA-${diagnostic}.`, 503);
  }
  if (!quota.allowed) return response(`Wykorzystano dzienny limit ${getDailyLimit()} operacji AI.`, 429);

  try {
    const cvPdfBase64 = Buffer.from(await cvBlob.arrayBuffer()).toString("base64");
    const generated = await generateWithGemini({
      apiKey,
      model: process.env.GEMINI_MODEL ?? "gemini-3-flash-preview",
      operation,
      cvPdfBase64,
      companyName: offer.company_name,
      positionTitle: offer.position_title,
      jobDescription: offer.description,
      jobRequirements: offer.requirements,
    });
    await supabase.rpc("record_ai_usage", {
      p_input_tokens: generated.usage.inputTokens,
      p_output_tokens: generated.usage.outputTokens,
    });

    return NextResponse.json({
      result: generated.result,
      operation,
      remaining: Math.max(0, getDailyLimit() - quota.operation_count),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "AI_LIMIT") {
      return response("Gemini osiągnął tymczasowy limit. Spróbuj później.", 429);
    }
    if (error instanceof GeminiProviderError) {
      console.error("AI_PROVIDER", { diagnostic: error.diagnostic });
      return response(`Nie udało się połączyć z dostawcą AI. Kod: AI-PROVIDER-${error.diagnostic}.`, 502);
    }
    if (error instanceof Error && error.message === "AI_RESPONSE") {
      return response("AI zwróciło nieprawidłową odpowiedź. Spróbuj ponownie.", 502);
    }
    return response("Nie udało się połączyć z dostawcą AI. Spróbuj później.", 502);
  }
}
