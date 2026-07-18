// Default to Gemini's "flash-lite" model — the full "flash" model's free
// tier can be as low as 20 requests/day (easy to exhaust with normal use,
// since a single action can involve several calls), while flash-lite has a
// much higher free daily quota. Overridable per task via env var.
export const MODELS = {
  notes: process.env.GEMINI_MODEL_NOTES || "gemini-flash-lite-latest",
  testGen: process.env.GEMINI_MODEL_TEST_GEN || "gemini-flash-lite-latest",
  grading: process.env.GEMINI_MODEL_GRADING || "gemini-flash-lite-latest",
  chat: process.env.GEMINI_MODEL_CHAT || "gemini-flash-lite-latest",
} as const;

// Source text longer than this triggers map-reduce chunking for notes generation.
export const CHUNK_THRESHOLD_TOKENS = 50_000;
export const CHUNK_TARGET_TOKENS = 35_000;

// Server-side caps to bound worst-case cost/latency per request.
export const MAX_SOURCE_CHARS = 400_000; // ~100k tokens ballpark, hard ceiling before chunking even considered
export const MAX_QUESTION_COUNT = 50;
export const MIN_QUESTION_COUNT = 1;
