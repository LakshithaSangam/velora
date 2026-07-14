import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import type { NotesResult } from "@/lib/ai/schemas/notes.schema";

export default async function NotesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const notesDoc = await prisma.notesDocument.findUnique({ where: { id }, include: { source: true } });

  if (!notesDoc || notesDoc.userId !== session!.user.id) notFound();

  if (notesDoc.status === "GENERATING") {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{notesDoc.title}</h1>
        <p className="text-gray-500">Generating notes... refresh in a moment.</p>
      </div>
    );
  }

  if (notesDoc.status === "FAILED") {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{notesDoc.title}</h1>
        <p className="text-red-600">Generation failed: {notesDoc.errorMessage}</p>
        <Link href="/notes/new" className="text-sm underline">
          Try again
        </Link>
      </div>
    );
  }

  const notes = notesDoc.sectionsJson as unknown as NotesResult;

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{notes.title}</h1>
          <p className="text-sm text-gray-500">
            From {notesDoc.source.type} · generated with {notesDoc.model}
          </p>
        </div>
        <a
          href={`/api/notes/${notesDoc.id}/export?format=markdown`}
          className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Download .md
        </a>
      </div>

      <p className="text-gray-700 dark:text-gray-300">{notes.summary}</p>

      <div className="space-y-6">
        {notes.sections.map((section, i) => (
          <div key={i}>
            <h2 className="mb-2 text-lg font-semibold">{section.heading}</h2>
            <ul className="list-disc space-y-1 pl-5">
              {section.bullets.map((bullet, j) => (
                <li key={j}>{renderWithKeywords(bullet.text, bullet.keywords)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderWithKeywords(text: string, keywords: string[]) {
  if (keywords.length === 0) return text;
  const pattern = new RegExp(`(${keywords.map(escapeRegExp).filter(Boolean).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    keywords.some((k) => k.toLowerCase() === part.toLowerCase()) ? (
      <strong key={i}>{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
