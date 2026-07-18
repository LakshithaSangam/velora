import { generateStructured } from "./generate-structured";
import { MODELS } from "./models";
import { NotesSchema, type NotesResult } from "./schemas/notes.schema";
import { MEETING_CHUNK_SYSTEM_PROMPT, buildMeetingChunkUserPrompt } from "./prompts/meeting-chunk.prompt";
import { NOTES_REDUCE_SYSTEM_PROMPT, buildNotesReduceUserPrompt } from "./prompts/notes-reduce.prompt";

const EMPTY_NOTES: NotesResult = { title: "Live meeting", summary: "", sections: [], confidenceScore: 100 };

/** Merges a new live-transcript chunk into the running notes document. */
export async function mergeMeetingChunk(
  existingNotes: NotesResult | null,
  transcriptChunk: string,
): Promise<{ notes: NotesResult; model: string }> {
  const base = existingNotes ?? EMPTY_NOTES;

  const { data, model } = await generateStructured({
    model: MODELS.notes,
    systemPrompt: MEETING_CHUNK_SYSTEM_PROMPT,
    content: buildMeetingChunkUserPrompt(JSON.stringify(base), transcriptChunk),
    schema: NotesSchema,
    maxOutputTokens: 16000,
  });
  return { notes: data, model };
}

/** Final polish pass once the live session ends — dedupe/reorder accumulated sections. */
export async function polishMeetingNotes(notes: NotesResult): Promise<{ notes: NotesResult; model: string }> {
  if (notes.sections.length === 0) return { notes, model: MODELS.notes };

  const { data, model } = await generateStructured({
    model: MODELS.notes,
    systemPrompt: NOTES_REDUCE_SYSTEM_PROMPT,
    content: buildNotesReduceUserPrompt(JSON.stringify([notes.sections])),
    schema: NotesSchema,
    maxOutputTokens: 32000,
  });
  return { notes: { ...data, title: notes.title }, model };
}
