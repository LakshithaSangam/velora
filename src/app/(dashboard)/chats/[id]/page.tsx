import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { DeleteItemButton } from "@/components/DeleteItemButton";

type Flashcard = { front: string; back: string };

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const notesDoc = await prisma.notesDocument.findUnique({ where: { id }, select: { id: true, title: true, userId: true } });

  if (!notesDoc || notesDoc.userId !== session!.user.id) notFound();

  const messages = await prisma.askVeloraMessage.findMany({
    where: { notesDocumentId: id, userId: session!.user.id },
    orderBy: { createdAt: "asc" },
  });

  if (messages.length === 0) notFound();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">💬 {notesDoc.title}</h1>
          <Link href={`/notes/${notesDoc.id}`} className="text-sm text-gray-500 hover:underline">
            View notes
          </Link>
        </div>
        <DeleteItemButton
          deleteUrl={`/api/ask-velora/history?notesId=${notesDoc.id}`}
          confirmMessage="Clear this conversation? This can't be undone."
          redirectTo="/chats"
          label="Clear conversation"
        />
      </div>

      <div className="space-y-3">
        {messages.map((m) => {
          const flashcards = (m.flashcardsJson as Flashcard[] | null) ?? [];
          return (
            <div key={m.id} className={m.role === "USER" ? "ml-auto max-w-[85%]" : "max-w-[90%]"}>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  m.role === "ASSISTANT"
                    ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                    : "bg-[#d68989] text-white"
                }`}
              >
                {m.text}
              </div>
              <div className="mt-1 text-xs text-gray-400">{m.createdAt.toLocaleString("en-US")}</div>
              {flashcards.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {flashcards.map((card, j) => (
                    <div
                      key={j}
                      className="rounded-md border border-[#d68989] bg-white px-3 py-2 text-sm dark:bg-gray-900"
                    >
                      <div className="text-[10px] font-medium tracking-wide text-[#b3615f] uppercase">Flashcard</div>
                      <div className="mt-1">
                        <span className="font-medium">{card.front}</span> {card.back}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
