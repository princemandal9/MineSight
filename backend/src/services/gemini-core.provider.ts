import { GoogleGenerativeAI, SchemaType, Part } from "@google/generative-ai";

// ─────────────────────────────────────────────
// Configuration (read from env, never hardcoded)
// ─────────────────────────────────────────────
const API_KEY = process.env.GEMINI_API_KEY;
export const PRIMARY_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash-lite";
const REQUEST_TIMEOUT_MS = 55_000; // 55 second hard timeout per attempt

if (!API_KEY && process.env.NODE_ENV !== "test") {
  console.warn("[GeminiCore] GEMINI_API_KEY is not set. Extraction/Analysis will fail.");
}

const genAI = new GoogleGenerativeAI(API_KEY || "dummy-key");

// ─────────────────────────────────────────────
// Failure Classification
// ─────────────────────────────────────────────
export type AIFailureCode =
  | "AI_PROVIDER_UNAVAILABLE"   // Transient: retryable
  | "AI_PROVIDER_TIMEOUT"       // Timeout: retryable
  | "AI_INVALID_API_KEY"        // Permanent: do not retry
  | "AI_UNSUPPORTED_FORMAT"     // Permanent: do not retry
  | "AI_MALFORMED_RESPONSE";    // Permanent: do not retry

export class AIProviderError extends Error {
  public code: AIFailureCode;
  public retryable: boolean;
  public provider = "gemini";
  public model: string;

  constructor(code: AIFailureCode, message: string, model: string) {
    super(message);
    this.name = "AIProviderError";
    this.code = code;
    this.model = model;
    this.retryable =
      code === "AI_PROVIDER_UNAVAILABLE" || code === "AI_PROVIDER_TIMEOUT";
  }
}

// ─────────────────────────────────────────────
// Transient error detection
// ─────────────────────────────────────────────
export function isTransient(err: any): boolean {
  if (!err) return false;
  const status = err.status ?? err.httpStatus ?? 0;
  if ([429, 500, 502, 503, 504].includes(status)) return true;
  const msg = String(err.message || "").toLowerCase();
  return (
    msg.includes("overloaded") ||
    msg.includes("rate limit") ||
    msg.includes("temporarily unavailable") ||
    msg.includes("service unavailable") ||
    msg.includes("timeout") ||
    msg.includes("try again")
  );
}

export function isPermanent(err: any): boolean {
  if (!err) return false;
  const status = err.status ?? err.httpStatus ?? 0;
  if ([400, 401, 403].includes(status)) return true;
  const msg = String(err.message || "").toLowerCase();
  return (
    msg.includes("api key") ||
    msg.includes("invalid") ||
    msg.includes("unsupported") ||
    msg.includes("not supported")
  );
}

// ─────────────────────────────────────────────
// Generic single-model attempt with timeout
// ─────────────────────────────────────────────
async function attemptExecution(
  contents: Array<string | Part>,
  schema: any,
  modelName: string
): Promise<any> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("Request timed out after 55 seconds")),
      REQUEST_TIMEOUT_MS
    )
  );

  const extractionPromise = model.generateContent(contents);
  const result = await Promise.race([extractionPromise, timeoutPromise]);
  const rawText = (result as any).response.text();

  // ─── Defensive markdown-fence cleanup ────────────────────────────────────
  // Gemini occasionally wraps structured JSON in ```json ... ``` fences even
  // when responseMimeType: "application/json" is set.  Strip them before
  // parsing so they never leak into the API response.
  let cleanText = rawText.trim();
  if (cleanText.startsWith("```")) {
    // Remove leading fence line (```json or just ```)
    cleanText = cleanText.replace(/^```[a-zA-Z]*\r?\n?/, "");
    // Remove trailing fence
    cleanText = cleanText.replace(/\r?\n?```\s*$/, "");
    cleanText = cleanText.trim();
  }

  try {
    return JSON.parse(cleanText);
  } catch {
    console.error("[GeminiCore] JSON.parse failed after fence cleanup. Raw text snippet:", rawText.slice(0, 200));
    throw new AIProviderError(
      "AI_MALFORMED_RESPONSE",
      "Gemini returned a response that could not be parsed as valid JSON.",
      modelName
    );
  }

}

// ─────────────────────────────────────────────
// Generic Retry loop (with exponential backoff)
// ─────────────────────────────────────────────
export async function attemptWithRetry(
  contents: Array<string | Part>,
  schema: any,
  modelName: string,
  maxAttempts: number,
  contextName: string = "GeminiCore"
): Promise<{ data: any; model: string }> {
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`[${contextName}] provider=gemini model=${modelName} attempt=${attempt}/${maxAttempts}`);
      const data = await attemptExecution(contents, schema, modelName);
      console.log(`[${contextName}] provider=gemini model=${modelName} attempt=${attempt} status=success`);
      return { data, model: modelName };
    } catch (err: any) {
      lastError = err;
      console.error("[GeminiCore] Underlying Error:", err);

      const msg = String(err.message || "").toLowerCase();
      const isTimeout = msg.includes("timed out");

      if (isPermanent(err)) {
        const status = err.status ?? 0;
        const code: AIFailureCode =
          status === 401 || status === 403 ? "AI_INVALID_API_KEY" : "AI_UNSUPPORTED_FORMAT";
        console.error(`[${contextName}] provider=gemini model=${modelName} attempt=${attempt} status=permanent_error code=${code}`);
        throw new AIProviderError(code, err.message, modelName);
      }

      const failCode: AIFailureCode = isTimeout ? "AI_PROVIDER_TIMEOUT" : "AI_PROVIDER_UNAVAILABLE";
      const delayMs = Math.pow(2, attempt - 1) * 500; // 500ms, 1s, 2s
      console.warn(
        `[${contextName}] provider=gemini model=${modelName} attempt=${attempt} status=${failCode} retrying_in=${delayMs}ms`
      );

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }
  }

  throw new AIProviderError(
    "AI_PROVIDER_UNAVAILABLE",
    `All ${maxAttempts} attempts failed on model ${modelName}.`,
    modelName
  );
}

// ─────────────────────────────────────────────
// Shared Executor Abstraction
// ─────────────────────────────────────────────
export class GeminiAIExecutor {
  public static async executeStructured(
    contents: Array<string | Part>,
    schema: any,
    contextName: string
  ): Promise<{ data: any; model: string; usedFallback: boolean }> {
    if (!API_KEY) {
      throw new AIProviderError(
        "AI_INVALID_API_KEY",
        "GEMINI_API_KEY is not configured on the server.",
        PRIMARY_MODEL
      );
    }

    // --- Primary: up to 3 attempts ---
    try {
      const result = await attemptWithRetry(contents, schema, PRIMARY_MODEL, 3, contextName);
      return { ...result, usedFallback: false };
    } catch (primaryErr: any) {
      if (!primaryErr.retryable) throw primaryErr; // Permanent errors propagate immediately

      console.warn(
        `[${contextName}] Primary model exhausted. action=fallback model=${FALLBACK_MODEL}`
      );
    }

    // --- Fallback: up to 2 attempts ---
    try {
      const result = await attemptWithRetry(contents, schema, FALLBACK_MODEL, 2, contextName);
      return { ...result, usedFallback: true };
    } catch (fallbackErr: any) {
      if (!fallbackErr.retryable) throw fallbackErr;

      console.error(
        `[${contextName}] Both primary and fallback exhausted. action=cache_or_fail`
      );
      throw new AIProviderError(
        "AI_PROVIDER_UNAVAILABLE",
        "All AI extraction attempts failed. Both primary and fallback models are unavailable.",
        FALLBACK_MODEL
      );
    }
  }
}
