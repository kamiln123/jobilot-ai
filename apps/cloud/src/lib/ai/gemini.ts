export type AiOperation = "analysis" | "cover-letter";

export type MatchAnalysis = {
  score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
};

export type GeminiUsage = { inputTokens: number; outputTokens: number };

const MAX_OUTPUT_TOKENS = 1400;
const REQUEST_TIMEOUT_MS = 55_000;

const analysisSchema = {
  type: "object",
  properties: {
    score: { type: "integer", minimum: 0, maximum: 100, description: "Ocena dopasowania CV do oferty." },
    strengths: { type: "array", items: { type: "string" }, maxItems: 5, description: "Mocne strony kandydata." },
    gaps: { type: "array", items: { type: "string" }, maxItems: 5, description: "Braki lub ryzyka względem oferty." },
    recommendations: { type: "array", items: { type: "string" }, maxItems: 5, description: "Konkretne rekomendacje." },
  },
  required: ["score", "strengths", "gaps", "recommendations"],
};

const coverLetterSchema = {
  type: "object",
  properties: {
    content: { type: "string", description: "Profesjonalny list motywacyjny po polsku, maksymalnie 350 słów." },
  },
  required: ["content"],
};

export class GeminiProviderError extends Error {
  constructor(public readonly diagnostic: string) {
    super("AI_PROVIDER");
    this.name = "GeminiProviderError";
  }
}

export class GeminiResponseError extends Error {
  constructor(public readonly diagnostic: string) {
    super("AI_RESPONSE");
    this.name = "GeminiResponseError";
  }
}

export async function generateWithGemini({
  apiKey,
  model,
  operation,
  cvPdfBase64,
  companyName,
  positionTitle,
  jobDescription,
  jobRequirements,
}: {
  apiKey: string;
  model: string;
  operation: AiOperation;
  cvPdfBase64: string;
  companyName: string;
  positionTitle: string;
  jobDescription: string | null;
  jobRequirements: string | null;
}): Promise<{ result: MatchAnalysis | { content: string }; usage: GeminiUsage }> {
  const task = operation === "analysis"
    ? "Porównaj CV z ofertą. Zwróć wyłącznie poprawny JSON: {\"score\": liczba 0-100, \"strengths\": [maks. 5 krótkich punktów], \"gaps\": [maks. 5 krótkich punktów], \"recommendations\": [maks. 5 konkretnych rekomendacji]}. Nie wymyślaj faktów spoza CV i oferty."
    : "Napisz profesjonalny, konkretny list motywacyjny po polsku na podstawie CV i oferty. Nie wymyślaj doświadczenia. Zwróć wyłącznie poprawny JSON: {\"content\": \"treść listu\"}. Maksymalnie 350 słów.";

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [
              { text: `${task}\n\nFirma: ${companyName}\nStanowisko: ${positionTitle}\nOpis oferty: ${jobDescription ?? "brak"}\nWymagania: ${jobRequirements ?? "brak"}` },
              { inlineData: { mimeType: "application/pdf", data: cvPdfBase64 } },
            ],
          }],
          generationConfig: {
            responseFormat: {
              text: {
                mimeType: "application/json",
                schema: operation === "analysis" ? analysisSchema : coverLetterSchema,
              },
            },
            maxOutputTokens: MAX_OUTPUT_TOKENS,
            temperature: 0.25,
          },
        }),
      },
    );
  } catch (error) {
    const diagnostic = error instanceof DOMException && error.name === "TimeoutError" ? "TIMEOUT" : "NETWORK";
    throw new GeminiProviderError(diagnostic);
  }

  if (!response.ok) {
    if (response.status === 429) throw new Error("AI_LIMIT");
    throw new GeminiProviderError(`HTTP_${response.status}`);
  }

  const payload = await response.json() as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string; thought?: boolean }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
  };
  const text = payload.candidates?.[0]?.content?.parts
    ?.filter((part) => !part.thought)
    .map((part) => part.text ?? "")
    .join("")
    .trim();
  if (!text) throw new GeminiResponseError("EMPTY");

  const jsonText = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new GeminiResponseError("INVALID_JSON");
  }

  const usage = {
    inputTokens: Math.max(0, payload.usageMetadata?.promptTokenCount ?? 0),
    outputTokens: Math.max(0, payload.usageMetadata?.candidatesTokenCount ?? 0),
  };

  try {
    if (operation === "analysis") return { result: validateAnalysis(parsed), usage };
    return { result: validateCoverLetter(parsed), usage };
  } catch {
    throw new GeminiResponseError("INVALID_SCHEMA");
  }
}

function shortTextList(value: unknown) {
  if (!Array.isArray(value)) throw new Error("AI_RESPONSE");
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function validateAnalysis(value: unknown): MatchAnalysis {
  if (!value || typeof value !== "object") throw new Error("AI_RESPONSE");
  const data = value as Record<string, unknown>;
  const score = typeof data.score === "number" ? Math.round(data.score) : Number.NaN;
  if (!Number.isFinite(score)) throw new Error("AI_RESPONSE");
  return {
    score: Math.min(100, Math.max(0, score)),
    strengths: shortTextList(data.strengths),
    gaps: shortTextList(data.gaps),
    recommendations: shortTextList(data.recommendations),
  };
}

function validateCoverLetter(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("AI_RESPONSE");
  const content = (value as Record<string, unknown>).content;
  if (typeof content !== "string" || content.trim().length < 40 || content.trim().length > 20_000) {
    throw new Error("AI_RESPONSE");
  }
  return { content: content.trim() };
}
