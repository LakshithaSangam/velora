import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { NewTestWizard } from "@/components/tests/NewTestWizard";

export default async function NewTestPage() {
  const session = await auth();
  const existingNotes = await prisma.notesDocument.findMany({
    where: { userId: session!.user.id, status: "READY" },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">New test</h1>
      <NewTestWizard existingNotes={existingNotes} />
    </div>
  );
}
