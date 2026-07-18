import { z, type ZodType } from "zod";
import type { PartUnion } from "@google/genai";
import { getGemini } from "./gemini-client";

// Free-tier Gemini occasionally returns 503 ("model overloaded") or 429
// (rate limit / daily quota exceeded) — the latter especially since the
// full "flash" model's free tier can be as low as 20 requests/day. Retrying
// briefly covers transient overload; falling back to a lighter model covers
// quota exhaustion, since lite models get much higher free-tier limits.
const RETRYABLE_STATUS_CODES = [429, 503];
const RETRY_DELAYS_MS = [1500, 4000, 9000];

// If the requested model is still failing after retrying, fall back to this
// lighter, less-contended, higher-quota model rather than failing outright.
const FALLBACK_MODEL = "gemini-flash-lite-latest";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Checking `instanceof ApiError` is unreliable here — Next.js's bundling can
// load two separate instances of the @google/genai module, so the SDK's
// thrown error and this file's imported ApiError class end up being
// different references even though they're "the same" class. Duck-typing
// the status code sidesteps that entirely.
function isRetryableError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof err.status === "number" &&
    RETRYABLE_STATUS_CODES.includes(err.status)
  );
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryableError(err) || attempt >= RETRY_DELAYS_MS.length) throw err;
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }
}

async function generateWithFallback<T>(model: string, call: (model: string) => Promise<T>): Promise<T> {
  try {
    return await withRetry(() => call(model));
  } catch (err) {
    if (!isRetryableError(err) || model === FALLBACK_MODEL) throw err;
    return await withRetry(() => call(FALLBACK_MODEL));
  }
}

export async function generateStructured<T>(params: {
  model: string;
  systemPrompt: string;
  content: string | PartUnion[];
  schema: ZodType<T>;
  maxOutputTokens?: number;
}): Promise<{ data: T; model: string }> {
  const jsonSchema = z.toJSONSchema(params.schema);

  const response = await generateWithFallback(params.model, (model) =>
    getGemini().models.generateContent({
      model,
      contents: params.content,
      config: {
        systemInstruction: params.systemPrompt,
        responseMimeType: "application/json",
        responseJsonSchema: jsonSchema,
        maxOutputTokens: params.maxOutputTokens,
      },
    }),
  );

  const text = response.text;
  if (!text) throw new Error("Gemini returned no text content.");
  return { data: params.schema.parse(JSON.parse(text)), model: response.modelVersion ?? params.model };
}

export async function countTokens(model: string, content: string | PartUnion[]): Promise<number> {
  const res = await generateWithFallback(model, (m) => getGemini().models.countTokens({ model: m, contents: content }));
  return res.totalTokens ?? 0;
}
