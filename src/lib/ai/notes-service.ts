import { generateStructured, countTokens } from "./generate-structured";
import { MODELS, CHUNK_THRESHOLD_TOKENS, CHUNK_TARGET_TOKENS } from "./models";
import { NotesSchema, type NotesResult } from "./schemas/notes.schema";
import { NOTES_SYSTEM_PROMPT, buildNotesUserPrompt } from "./prompts/notes-extraction.prompt";
import { NOTES_REDUCE_SYSTEM_PROMPT, buildNotesReduceUserPrompt } from "./prompts/notes-reduce.prompt";
import { splitIntoChunks } from "./chunking";

async function extractNotesFromText(
  rawText: string,
  sourceMeta: Record<string, unknown>,
): Promise<{ data: NotesResult; model: string }> {
  return generateStructured({
    model: MODELS.notes,
    systemPrompt: NOTES_SYSTEM_PROMPT,
    content: buildNotesUserPrompt(rawText, sourceMeta),
    schema: NotesSchema,
    maxOutputTokens: 32000,
  });
}

/** For a single chunk in the map phase — same schema, chunk-scoped. */
async function extractPartialNotes(chunkText: string): Promise<{ data: NotesResult; model: string }> {
  return generateStructured({
    model: MODELS.notes,
    systemPrompt: NOTES_SYSTEM_PROMPT,
    content: `${buildNotesUserPrompt(chunkText, {})}\n\n(Note: this is one chunk of a longer source — extract only what's covered in this chunk.)`,
    schema: NotesSchema,
    maxOutputTokens: 16000,
  });
}

async function reduceNotes(partials: NotesResult[]): Promise<{ data: NotesResult; model: string }> {
  const partialSectionsJson = JSON.stringify(partials.map((p) => p.sections));
  return generateStructured({
    model: MODELS.notes,
    systemPrompt: NOTES_REDUCE_SYSTEM_PROMPT,
    content: buildNotesReduceUserPrompt(partialSectionsJson),
    schema: NotesSchema,
    maxOutputTokens: 32000,
  });
}

export async function generateNotesFromText(
  rawText: string,
  sourceMeta: Record<string, unknown>,
): Promise<{ notes: NotesResult; model: string }> {
  const totalTokens = await countTokens(MODELS.notes, buildNotesUserPrompt(rawText, sourceMeta));

  if (totalTokens > CHUNK_THRESHOLD_TOKENS) {
    const chunks = splitIntoChunks(rawText, CHUNK_TARGET_TOKENS);
    const partials = await Promise.all(chunks.map((chunk) => extractPartialNotes(chunk)));
    if (partials.length > 1) {
      const { data, model } = await reduceNotes(partials.map((p) => p.data));
      // The reduce prompt only sees `.sections`, not the map step's confidence
      // scores, so its own guess isn't meaningful — use the real average instead.
      const avgConfidence =
        partials.reduce((sum, p) => sum + p.data.confidenceScore, 0) / partials.length;
      return { notes: { ...data, confidenceScore: Math.round(avgConfidence) }, model };
    }
    return { notes: partials[0].data, model: partials[0].model };
  }

  const { data, model } = await extractNotesFromText(rawText, sourceMeta);
  return { notes: data, model };
}

export async function generateNotesFromPdf(
  pdfBase64: string,
  sourceMeta: Record<string, unknown>,
): Promise<{ notes: NotesResult; model: string }> {
  const { data, model } = await generateStructured({
    model: MODELS.notes,
    systemPrompt: NOTES_SYSTEM_PROMPT,
    content: [
      { inlineData: { data: pdfBase64, mimeType: "application/pdf" } },
      { text: buildNotesUserPrompt("(see attached PDF)", sourceMeta) },
    ],
    schema: NotesSchema,
    maxOutputTokens: 32000,
  });
  return { notes: data, model };
}
