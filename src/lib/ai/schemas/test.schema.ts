import { z } from "zod";

export const QuestionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("MCQ"),
    prompt: z.string(),
    options: z.array(z.string()).length(4),
    correctOptionIndex: z.number().int().min(0).max(3),
  }),
  z.object({
    type: z.literal("SHORT_ANSWER"),
    prompt: z.string(),
    modelAnswer: z.string(),
  }),
]);

export const TestGenerationSchema = z.object({
  questions: z.array(QuestionSchema),
});

export type GeneratedQuestion = z.infer<typeof QuestionSchema>;
export type TestGenerationResult = z.infer<typeof TestGenerationSchema>;
