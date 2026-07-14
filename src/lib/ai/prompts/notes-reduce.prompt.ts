export const NOTES_REDUCE_SYSTEM_PROMPT = `You are merging partial study-notes extracted independently from consecutive chunks of one longer source. Combine them into a single coherent, non-redundant set of structured notes covering the whole source, in original order. Merge sections that clearly belong together, deduplicate repeated points, and write one overall summary.`;

export function buildNotesReduceUserPrompt(partialSectionsJson: string): string {
  return `Here are the partial notes sections extracted from sequential chunks of one source (in order). Merge them into one final structured notes document:\n\n${partialSectionsJson}`;
}
