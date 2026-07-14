const CHARS_PER_TOKEN_ESTIMATE = 4; // only used to size chunks; actual gating uses countTokens

export function splitIntoChunks(rawText: string, targetTokens: number): string[] {
  const targetChars = targetTokens * CHARS_PER_TOKEN_ESTIMATE;
  const paragraphs = rawText.split(/\n{2,}/);

  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (current.length + para.length > targetChars && current.length > 0) {
      chunks.push(current.trim());
      current = "";
    }
    current += (current ? "\n\n" : "") + para;
  }
  if (current.trim()) chunks.push(current.trim());

  return chunks;
}
