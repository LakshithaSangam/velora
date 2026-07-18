import { z } from "zod";

// Gemini's structured output doesn't reliably honor Zod discriminated unions
// (JSON Schema oneOf/const) — it can substitute a paraphrase like
// "multiple-choice" for the literal "MCQ". A flat schema with a plain enum
// field is respected exactly, so we accept this looser shape from the model
// and validate/narrow it into GeneratedQuestion afterward in test-service.ts.
export const RawQuestionSchema = z.object({
  type: z.enum(["MCQ", "SHORT_ANSWER"]),
  prompt: z.string(),
  options: z.array(z.string()).optional(),
  correctOptionIndex: z.number().int().optional(),
  modelAnswer: z.string().optional(),
});

export const TestGenerationSchema = z.object({
  questions: z.array(RawQuestionSchema),
});

export type RawQuestion = z.infer<typeof RawQuestionSchema>;

export type GeneratedQuestion =
  | { type: "MCQ"; prompt: string; options: string[]; correctOptionIndex: number }
  | { type: "SHORT_ANSWER"; prompt: string; modelAnswer: string };
