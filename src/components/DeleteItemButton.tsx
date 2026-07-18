"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteItemButton({
  deleteUrl,
  confirmMessage,
}: {
  deleteUrl: string;
  confirmMessage: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(deleteUrl, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed.");
      router.refresh();
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
        {deleting ? "Deleting..." : "Delete"}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
