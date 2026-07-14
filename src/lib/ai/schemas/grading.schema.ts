import { z } from "zod";

export const GradingSchema = z.object({
  results: z.array(
    z.object({
      questionId: z.string(),
      score: z.number().min(0).max(1),
      feedback: z.string(),
    }),
  ),
});

export type GradingResult = z.infer<typeof GradingSchema>;
