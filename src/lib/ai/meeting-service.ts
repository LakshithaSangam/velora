import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "./client";
import { MODELS } from "./models";
import { NotesSchema, type NotesResult } from "./schemas/notes.schema";
import { MEETING_CHUNK_SYSTEM_PROMPT, buildMeetingChunkUserPrompt } from "./prompts/meeting-chunk.prompt";
import { NOTES_REDUCE_SYSTEM_PROMPT, buildNotesReduceUserPrompt } from "./prompts/notes-reduce.prompt";

function extractText(message: { content: Array<{ type: string; text?: string }> }): string {
  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock?.text) throw new Error("Claude returned no text content.");
  return textBlock.text;
}

const EMPTY_NOTES: NotesResult = { title: "Live meeting", summary: "", sections: [] };

/** Merges a new live-transcript chunk into the running notes document. */
export async function mergeMeetingChunk(
  existingNotes: NotesResult | null,
  transcriptChunk: string,
): Promise<{ notes: NotesResult; model: string }> {
  const base = existingNotes ?? EMPTY_NOTES;

  const stream = anthropic.messages.stream({
    model: MODELS.notes,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: MEETING_CHUNK_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { format: zodOutputFormat(NotesSchema), effort: "medium" },
    messages: [{ role: "user", content: buildMeetingChunkUserPrompt(JSON.stringify(base), transcriptChunk) }],
  });
  const message = await stream.finalMessage();
  const notes = NotesSchema.parse(JSON.parse(extractText(message)));
  return { notes, model: MODELS.notes };
}

/** Final polish pass once the live session ends — dedupe/reorder accumulated sections. */
export async function polishMeetingNotes(notes: NotesResult): Promise<{ notes: NotesResult; model: string }> {
  if (notes.sections.length === 0) return { notes, model: MODELS.notes };

  const stream = anthropic.messages.stream({
    model: MODELS.notes,
    max_tokens: 32000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: NOTES_REDUCE_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { format: zodOutputFormat(NotesSchema), effort: "high" },
    messages: [{ role: "user", content: buildNotesReduceUserPrompt(JSON.stringify([notes.sections])) }],
  });
  const message = await stream.finalMessage();
  const polished = NotesSchema.parse(JSON.parse(extractText(message)));
  return { notes: { ...polished, title: notes.title }, model: MODELS.notes };
}
