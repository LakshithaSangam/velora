import { z } from "zod";

export const NotesSchema = z.object({
  title: z.string(),
  summary: z.string(),
  sections: z.array(
    z.object({
      heading: z.string(),
      bullets: z.array(
        z.object({
          text: z.string(),
          keywords: z.array(z.string()),
        }),
      ),
    }),
  ),
  confidenceScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "Your own confidence (0-100) that these notes accurately and completely capture the source's important content — lower it for garbled transcripts, missing context, or ambiguous material.",
    ),
});

export type NotesResult = z.infer<typeof NotesSchema>;
