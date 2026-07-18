import { z } from "zod";

export const AskVeloraSchema = z.object({
  reply: z.string().describe("Conversational reply shown directly to the user in the chat."),
  flashcards: z
    .array(
      z.object({
        front: z.string().describe("The question or prompt side of the flashcard."),
        back: z.string().describe("The answer side of the flashcard."),
      }),
    )
    .optional()
    .describe("Only include this field if the user asked for flashcards — omit it otherwise."),
});

export type AskVeloraResult = z.infer<typeof AskVeloraSchema>;
