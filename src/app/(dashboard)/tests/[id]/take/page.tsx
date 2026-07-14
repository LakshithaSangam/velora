import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { TakeTestClient } from "@/components/tests/TakeTestClient";

export default async function TakeTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const test = await prisma.test.findUnique({ where: { id } });

  if (!test || test.userId !== session!.user.id) notFound();
  if (test.status !== "READY") notFound();

  return <TakeTestClient testId={id} />;
}
