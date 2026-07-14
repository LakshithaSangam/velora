// All default to claude-opus-4-8. Sonnet/Haiku are an explicit, user-chosen
// cost tradeoff via env var — never a silent downgrade.
export const MODELS = {
  notes: process.env.ANTHROPIC_MODEL_NOTES || "claude-opus-4-8",
  testGen: process.env.ANTHROPIC_MODEL_TEST_GEN || "claude-opus-4-8",
  grading: process.env.ANTHROPIC_MODEL_GRADING || "claude-opus-4-8",
} as const;

// Source text longer than this triggers map-reduce chunking for notes generation.
export const CHUNK_THRESHOLD_TOKENS = 50_000;
export const CHUNK_TARGET_TOKENS = 35_000;

// Server-side caps to bound worst-case Claude API cost per request.
export const MAX_SOURCE_CHARS = 400_000; // ~100k tokens ballpark, hard ceiling before chunking even considered
export const MAX_QUESTION_COUNT = 50;
export const MIN_QUESTION_COUNT = 1;
