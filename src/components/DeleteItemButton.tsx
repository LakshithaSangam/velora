"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteItemButton({
  deleteUrl,
  confirmMessage,
  redirectTo,
  label = "Delete",
}: {
  /** A single URL, or an array to delete several items as one action
   * (e.g. every version of a retaken test at once). */
  deleteUrl: string | string[];
  confirmMessage: string;
  /** Navigate here after deleting instead of just refreshing — use this on
   * a detail page for the item being deleted, since refreshing there would
   * just 404 (the thing the page shows no longer exists). */
  redirectTo?: string;
  label?: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;
    setDeleting(true);
    setError(null);
    try {
      const urls = Array.isArray(deleteUrl) ? deleteUrl : [deleteUrl];
      const responses = await Promise.all(urls.map((url) => fetch(url, { method: "DELETE" })));
      const failed = responses.find((r) => !r.ok);
      if (failed) {
        const data = await failed.json().catch(() => null);
        throw new Error(data?.error ?? "Delete failed.");
      }
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:border-red-300 hover:text-red-600 disabled:opacity-50 dark:border-gray-700 dark:hover:border-red-800"
      >
        {deleting ? "Deleting..." : label}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
