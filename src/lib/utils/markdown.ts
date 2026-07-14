import type { NotesResult } from "@/lib/ai/schemas/notes.schema";

export function notesToMarkdown(notes: NotesResult): string {
  const lines: string[] = [`# ${notes.title}`, "", notes.summary, ""];

  for (const section of notes.sections) {
    lines.push(`## ${section.heading}`, "");
    for (const bullet of section.bullets) {
      const highlighted = highlightKeywords(bullet.text, bullet.keywords);
      lines.push(`- ${highlighted}`);
    }
    lines.push("");
  }

  return lines.join("\n").trim() + "\n";
}

function highlightKeywords(text: string, keywords: string[]): string {
  let result = text;
  for (const keyword of keywords) {
    if (!keyword.trim()) continue;
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(${escaped})`, "i");
    if (pattern.test(result) && !result.includes(`**${keyword}**`)) {
      result = result.replace(pattern, "**$1**");
    }
  }
  return result;
}
