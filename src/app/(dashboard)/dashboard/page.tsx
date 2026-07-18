import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { withMinDelay } from "@/lib/utils/min-delay";
import type { NotesResult } from "@/lib/ai/schemas/notes.schema";

function timeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const STATUS_DOT: Record<string, string> = {
  GENERATING: "bg-amber-400",
  READY: "bg-emerald-500",
  FAILED: "bg-red-500",
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const WORDS_PER_MINUTE = 200; // for estimating notes reading time — not tracked directly

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Current streak of consecutive days with at least one note or test attempt,
 * ending today or yesterday (a gap of a full day with no activity breaks
 * it), plus the longest streak ever — used to show something more useful
 * than a bare "0" once the current streak has broken.
 */
function computeStreaks(activityDays: Set<string>): { current: number; longest: number } {
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  if (!activityDays.has(dateKey(cursor))) {
    cursor = new Date(cursor.getTime() - ONE_DAY_MS);
  }
  let current = 0;
  while (activityDays.has(dateKey(cursor))) {
    current++;
    cursor = new Date(cursor.getTime() - ONE_DAY_MS);
  }

  let longest = 0;
  let run = 0;
  let prevTime: number | null = null;
  for (const key of [...activityDays].sort()) {
    const t = new Date(`${key}T00:00:00.000Z`).getTime();
    run = prevTime !== null && t - prevTime === ONE_DAY_MS ? run + 1 : 1;
    longest = Math.max(longest, run);
    prevTime = t;
  }

  return { current, longest };
}

function notesToConfidence(sectionsJson: unknown): number | null {
  const notes = sectionsJson as Partial<NotesResult> | null;
  return typeof notes?.confidenceScore === "number" ? Math.round(notes.confidenceScore) : null;
}

function notesToCounts(sectionsJson: unknown): { sections: number; keywords: number } {
  const notes = sectionsJson as Partial<NotesResult> | null;
  const sections = notes?.sections ?? [];
  const keywords = sections.reduce(
    (sum, s) => sum + s.bullets.reduce((bSum, b) => bSum + b.keywords.length, 0),
    0,
  );
  return { sections: sections.length, keywords };
}

const ACTION_CARDS = [
  { href: "/notes/new?tab=PDF", icon: "📄", label: "Upload PDF", hint: "Lecture slides, readings, textbooks" },
  { href: "/notes/new?tab=WEB_ARTICLE", icon: "🌐", label: "Website URL", hint: "Any article or blog post" },
  { href: "/notes/new?tab=VIDEO", icon: "📺", label: "Import YouTube", hint: "Paste a link with captions" },
  { href: "/notes/live", icon: "🎙️", label: "Join live meeting", hint: "Live transcription + notes" },
] as const;

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user.id;
  const sevenDaysAgo = new Date(Date.now() - 7 * ONE_DAY_MS);

  // Fetch each table once (this app runs at personal-portfolio scale, so
  // "all rows" is cheap) and derive counts/streak/stats in JS, rather than
  // firing ~10 separate parallel queries that were contending for Prisma's
  // small dev connection pool and occasionally stalling the whole page.
  const [allNotes, allTests, allAttempts] = await withMinDelay(
    Promise.all([
      prisma.notesDocument.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true, sectionsJson: true, markdown: true },
      }),
      prisma.test.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, status: true, createdAt: true },
      }),
      prisma.testAttempt.findMany({
        where: { userId },
        select: { startedAt: true, submittedAt: true, timeLimitMinutes: true, score: true, maxScore: true },
      }),
    ]),
  );

  const notesCount = allNotes.length;
  const testsCount = allTests.length;
  const attemptsCount = allAttempts.length;
  const recentNotes = allNotes.slice(0, 5);
  const recentTests = allTests.slice(0, 5);

  const activityDays = new Set<string>([
    ...allNotes.map((n) => dateKey(n.createdAt)),
    ...allAttempts.map((a) => dateKey(a.startedAt)),
  ]);
  const { current: currentStreak, longest: longestStreak } = computeStreaks(activityDays);

  const scoredAttempts = allAttempts.filter((a) => a.score !== null && a.maxScore !== null && a.maxScore > 0);
  const avgScorePct =
    scoredAttempts.length > 0
      ? Math.round(
          (scoredAttempts.reduce((sum, a) => sum + a.score! / a.maxScore!, 0) / scoredAttempts.length) * 100,
        )
      : null;

  const notesReadingMinutes = allNotes
    .filter((n) => n.createdAt >= sevenDaysAgo)
    .reduce((sum, n) => {
      const words = n.markdown ? n.markdown.trim().split(/\s+/).length : 0;
      return sum + words / WORDS_PER_MINUTE;
    }, 0);
  const testMinutes = allAttempts
    .filter((a) => a.submittedAt && a.submittedAt >= sevenDaysAgo)
    .reduce((sum, a) => {
      const elapsedMin = (a.submittedAt!.getTime() - a.startedAt.getTime()) / 60000;
      return sum + Math.max(0, Math.min(elapsedMin, a.timeLimitMinutes));
    }, 0);
  const hoursThisWeek = Math.round(((notesReadingMinutes + testMinutes) / 60) * 10) / 10;

  const recentActivity = [
    ...recentNotes.map((n) => ({ ...n, kind: "notes" as const, href: `/notes/${n.id}`, icon: "📝" })),
    ...recentTests.map((t) => ({ ...t, kind: "test" as const, href: `/tests/${t.id}`, icon: "🧪" })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const isNewUser = notesCount === 0 && testsCount === 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {timeOfDayGreeting()}
          {session?.user.name ? `, ${session.user.name}` : ""}. What would you like to learn today?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ACTION_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group relative block overflow-hidden rounded-lg border border-gray-200 p-5 shadow-sm transition duration-150 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800"
          >
            <span
              className="absolute top-0 left-0 h-full w-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
              style={{ backgroundColor: "#d68989" }}
            />
            <div className="text-3xl transition-transform duration-150 group-hover:scale-110" aria-hidden>
              {card.icon}
            </div>
            <div className="mt-3 font-medium">{card.label}</div>
            <div className="text-sm text-gray-500">{card.hint}</div>
          </Link>
        ))}
      </div>

      <Link
        href="/tests/new"
        className="inline-block rounded-md border border-gray-300 px-4 py-2 text-sm shadow-sm transition duration-150 hover:-translate-y-1 hover:bg-gray-50 hover:shadow-lg dark:border-gray-700 dark:hover:bg-gray-900"
      >
        + New test
      </Link>

      <div>
        <h2 className="mb-3 text-lg font-medium">Your progress</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Notes documents" value={notesCount} href="/notes" icon="📝" />
          <StatCard label="Tests generated" value={testsCount} href="/tests" icon="🧪" />
          <StatCard
            label="Avg test score"
            value={avgScorePct !== null ? `${avgScorePct}%` : "—"}
            href="/tests"
            icon="✅"
          />
          <StatCard
            label="Day streak"
            value={currentStreak}
            href="/notes"
            icon={currentStreak > 0 ? "🔥" : longestStreak > 0 ? "🧊" : "💤"}
            hint={
              currentStreak > 0
                ? undefined
                : longestStreak > 0
                  ? `Best: ${longestStreak}-day streak — start a new one!`
                  : "Start your first streak today!"
            }
          />
        </div>
        <p className="mt-1 text-xs text-gray-400">{attemptsCount} test attempts so far.</p>
      </div>

      {hoursThisWeek > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-medium">Learning insights</h2>
          <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-black dark:text-white">{hoursThisWeek}</span> hours studied
              this week
            </div>
            <p className="mt-1 text-xs text-gray-400">
              Estimated from test-taking time and notes reading length.
            </p>
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-lg font-medium">Recent activity</h2>
        {isNewUser ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
            <span className="text-4xl" role="img" aria-label="sprout">
              🌱
            </span>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Nothing here yet — generate your first set of notes to get started.
            </p>
          </div>
        ) : recentActivity.length === 0 ? (
          <p className="text-gray-500">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
            {recentActivity.map((item) => {
              const isNotes = item.kind === "notes";
              const confidence = isNotes ? notesToConfidence(item.sectionsJson) : null;
              const counts = isNotes ? notesToCounts(item.sectionsJson) : null;
              return (
                <li key={`${item.kind}-${item.id}`}>
                  <Link
                    href={item.href}
                    className="flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="text-lg" aria-hidden>
                        {item.icon}
                      </span>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{item.title}</div>
                        {counts && item.status === "READY" && (
                          <div className="text-xs text-gray-400">
                            {counts.sections} sections · {counts.keywords} keywords
                            {confidence !== null && ` · ${confidence}% confidence`}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-xs text-gray-500">
                      <span className={`h-2 w-2 rounded-full ${STATUS_DOT[item.status] ?? "bg-gray-400"}`} />
                      {item.status}
                      <span className="hidden sm:inline">· {item.createdAt.toLocaleDateString()}</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  icon,
  hint,
}: {
  label: string;
  value: number | string;
  href: string;
  icon: string;
  hint?: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block overflow-hidden rounded-lg border border-gray-200 p-4 shadow-sm transition duration-150 hover:-translate-y-1 hover:shadow-lg dark:border-gray-800"
    >
      <span
        className="absolute top-0 left-0 h-full w-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{ backgroundColor: "#d68989" }}
      />
      <div className="flex items-center justify-between">
        <div className="text-3xl font-semibold transition-transform duration-150 group-hover:scale-110">
          {value}
        </div>
        <span className="text-xl opacity-70 transition-transform duration-150 group-hover:scale-125" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="text-sm text-gray-500">{label}</div>
      {hint && <div className="mt-0.5 text-xs text-[#b3615f]">{hint}</div>}
    </Link>
  );
}
