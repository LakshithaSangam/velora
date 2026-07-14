import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [notesCount, testsCount, attemptsCount] = await Promise.all([
    prisma.notesDocument.count({ where: { userId } }),
    prisma.test.count({ where: { userId } }),
    prisma.testAttempt.count({ where: { userId } }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back{session?.user.name ? `, ${session.user.name}` : ""}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Notes documents" value={notesCount} href="/notes" />
        <StatCard label="Tests generated" value={testsCount} href="/tests" />
        <StatCard label="Test attempts" value={attemptsCount} href="/tests" />
      </div>

      <div className="flex gap-3">
        <Link
          href="/notes/new"
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          + New notes from a source
        </Link>
        <Link
          href="/tests/new"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          + New test
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
    >
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </Link>
  );
}
