import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import type { NotesResult } from "@/lib/ai/schemas/notes.schema";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordRuns(text: string, keywords: string[]): TextRun[] {
  const cleanKeywords = keywords.map(escapeRegExp).filter(Boolean);
  if (cleanKeywords.length === 0) return [new TextRun(text)];

  const pattern = new RegExp(`(${cleanKeywords.join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts
    .filter((part) => part.length > 0)
    .map((part) =>
      keywords.some((k) => k.toLowerCase() === part.toLowerCase())
        ? new TextRun({ text: part, bold: true })
        : new TextRun(part),
    );
}

export async function notesToDocxBuffer(notes: NotesResult): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: notes.title, heading: HeadingLevel.TITLE }),
          ...(notes.summary ? [new Paragraph({ children: [new TextRun(notes.summary)] })] : []),
          ...notes.sections.flatMap((section) => [
            new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_1, spacing: { before: 240 } }),
            ...section.bullets.map(
              (bullet) =>
                new Paragraph({
                  children: keywordRuns(bullet.text, bullet.keywords),
                  bullet: { level: 0 },
                }),
            ),
          ]),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
