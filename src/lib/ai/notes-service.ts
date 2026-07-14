import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "./client";
import { MODELS, CHUNK_THRESHOLD_TOKENS, CHUNK_TARGET_TOKENS } from "./models";
import { NotesSchema, type NotesResult } from "./schemas/notes.schema";
import { NOTES_SYSTEM_PROMPT, buildNotesUserPrompt } from "./prompts/notes-extraction.prompt";
import { NOTES_REDUCE_SYSTEM_PROMPT, buildNotesReduceUserPrompt } from "./prompts/notes-reduce.prompt";
import { splitIntoChunks } from "./chunking";

function extractText(message: { content: Array<{ type: string; text?: string }> }): string {
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock?.text) throw new Error("Claude returned no text content.");
  return textBlock.text;
}

async function extractNotesFromText(rawText: string, sourceMeta: Record<string, unknown>): Promise<NotesResult> {
  const stream = anthropic.messages.stream({
    model: MODELS.notes,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: NOTES_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { format: zodOutputFormat(NotesSchema), effort: "high" },
    messages: [{ role: "user", content: buildNotesUserPrompt(rawText, sourceMeta) }],
  });
  const message = await stream.finalMessage();
  return NotesSchema.parse(JSON.parse(extractText(message)));
}

/** For a single chunk in the map phase — same schema, chunk-scoped, lighter effort. */
async function extractPartialNotes(chunkText: string): Promise<NotesResult> {
  const stream = anthropic.messages.stream({
    model: MODELS.notes,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: NOTES_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { format: zodOutputFormat(NotesSchema), effort: "medium" },
    messages: [
      {
        role: "user",
        content: `${buildNotesUserPrompt(chunkText, {})}\n\n(Note: this is one chunk of a longer source — extract only what's covered in this chunk.)`,
      },
    ],
  });
  const message = await stream.finalMessage();
  return NotesSchema.parse(JSON.parse(extractText(message)));
}

async function reduceNotes(partials: NotesResult[]): Promise<NotesResult> {
  const partialSectionsJson = JSON.stringify(partials.map((p) => p.sections));
  const stream = anthropic.messages.stream({
    model: MODELS.notes,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: NOTES_REDUCE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { format: zodOutputFormat(NotesSchema), effort: "high" },
    messages: [{ role: "user", content: buildNotesReduceUserPrompt(partialSectionsJson) }],
  });
  const message = await stream.finalMessage();
  return NotesSchema.parse(JSON.parse(extractText(message)));
}

export async function generateNotesFromText(
  rawText: string,
  sourceMeta: Record<string, unknown>,
): Promise<{ notes: NotesResult; model: string }> {
  const countRes = await anthropic.messages.countTokens({
    model: MODELS.notes,
    messages: [{ role: "user", content: buildNotesUserPrompt(rawText, sourceMeta) }],
  });

  let notes: NotesResult;
  if (countRes.input_tokens > CHUNK_THRESHOLD_TOKENS) {
    const chunks = splitIntoChunks(rawText, CHUNK_TARGET_TOKENS);
    const partials = await Promise.all(chunks.map((chunk) => extractPartialNotes(chunk)));
    notes = partials.length > 1 ? await reduceNotes(partials) : partials[0];
  } else {
    notes = await extractNotesFromText(rawText, sourceMeta);
  }

  return { notes, model: MODELS.notes };
}

export async function generateNotesFromPdf(
  pdfBase64: string,
  sourceMeta: Record<string, unknown>,
): Promise<{ notes: NotesResult; model: string }> {
  const stream = anthropic.messages.stream({
    model: MODELS.notes,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: NOTES_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { format: zodOutputFormat(NotesSchema), effort: "high" },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
          },
          {
            type: "text",
            text: buildNotesUserPrompt("(see attached PDF)", sourceMeta),
          },
        ],
      },
    ],
  });
  const message = await stream.finalMessage();
  const notes = NotesSchema.parse(JSON.parse(extractText(message)));
  return { notes, model: MODELS.notes };
}
