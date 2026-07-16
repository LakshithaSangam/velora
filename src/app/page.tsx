import Link from "next/link";
import { auth } from "@/lib/auth/auth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">StudyNotes AI</h1>
      <p className="max-w-xl text-balance text-gray-600 dark:text-gray-400">
        Turn video lectures, PDFs, and articles into structured, section-wise notes —
        then generate a practice test from them, on your schedule.
      </p>
      <div className="flex gap-3">
        {session?.user ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-black px-5 py-2.5 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-md bg-black px-5 py-2.5 text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md border border-gray-300 px-5 py-2.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
            >
              Create account
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
