import { generateStructured } from "./generate-structured";
import { MODELS } from "./models";
import { AskVeloraSchema, type AskVeloraResult } from "./schemas/ask-velora.schema";
import { buildAskVeloraSystemPrompt, buildAskVeloraUserPrompt } from "./prompts/ask-velora.prompt";

export async function askVelora(params: {
  notesContext: string | null;
  attemptContext: string | null;
  history: { from: "user" | "assistant"; text: string }[];
  message: string;
}): Promise<AskVeloraResult> {
  const { data } = await generateStructured({
    model: MODELS.chat,
    systemPrompt: buildAskVeloraSystemPrompt(),
    content: buildAskVeloraUserPrompt(params),
    schema: AskVeloraSchema,
    maxOutputTokens: 4000,
  });
  return data;
}
