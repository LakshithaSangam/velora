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
});

export type NotesResult = z.infer<typeof NotesSchema>;
