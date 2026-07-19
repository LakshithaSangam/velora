import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { withMinDelay } from "@/lib/utils/min-delay";

export default async function ChatsListPage() {
  const session = await auth();
  const notesWithChats = await withMinDelay(
    prisma.notesDocument.findMany({
      where: { userId: session!.user.id, askVeloraMessages: { some: {} } },
      include: {
        _count: { select: { askVeloraMessages: true } },
        askVeloraMessages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    }),
  );

  // Ordering by a relation's latest timestamp isn't something Prisma can do
  // directly in the query, so sort the (small, per-user) result in memory
  // instead, most recently active conversation first.
  const sorted = [...notesWithChats].sort(
    (a, b) => b.askVeloraMessages[0].createdAt.getTime() - a.askVeloraMessages[0].createdAt.getTime(),
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">💬 Chats</h1>

      {sorted.length === 0 ? (
        <p className="text-gray-500">
          No saved conversations yet. Ask Velora a question while viewing a notes document and it'll show up here.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-800">
          {sorted.map((n) => {
            const last = n.askVeloraMessages[0];
            return (
              <li key={n.id} className="py-3">
                <Link href={`/chats/${n.id}`} className="font-medium hover:underline">
                  {n.title}
                </Link>
                <div className="text-sm text-gray-500">
                  {n._count.askVeloraMessages} message{n._count.askVeloraMessages === 1 ? "" : "s"} · last active{" "}
                  {last.createdAt.toLocaleDateString("en-US")}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
