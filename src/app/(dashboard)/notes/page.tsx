import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { withMinDelay } from "@/lib/utils/min-delay";
import { DeleteItemButton } from "@/components/DeleteItemButton";

export default async function NotesListPage() {
  const session = await auth();
  const notes = await withMinDelay(
    prisma.notesDocument.findMany({
      where: { userId: session!.user.id },
      orderBy: { createdAt: "desc" },
      include: { source: true },
    }),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">📝 Notes</h1>
        <div className="flex gap-3">
          <Link
            href="/notes/live"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            🔴 Live meeting notes
          </Link>
          <Link
            href="/notes/new"
            className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            + New notes
          </Link>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-500">
          No notes yet. Generate your first set from a video, PDF, or article.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {notes.map((n) => (
            <li key={n.id} className="flex items-center justify-between py-3">
              <div>
                <Link href={`/notes/${n.id}`} className="font-medium hover:underline">
                  {n.title}
                </Link>
                <div className="text-sm text-gray-500">
                  {n.source.type} · {n.status}
                </div>
              </div>
              <DeleteItemButton
                deleteUrl={`/api/notes/${n.id}`}
                confirmMessage={`Delete "${n.title}"? This can't be undone.`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
