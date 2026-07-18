"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useMascotErrorMood, useMascotLoadingMood } from "@/lib/mascot-bus";

const SUGGESTIONS = ["Summarize this", "Generate flashcards", "Explain this simply"];

type Flashcard = { front: string; back: string };
type Message = { from: "assistant" | "user"; text: string; flashcards?: Flashcard[] };

function initialMessage(hasNotesContext: boolean): Message {
  return {
    from: "assistant",
    text: hasNotesContext
      ? "Hi! Ask me to summarize these notes, explain a part of them, or generate flashcards to quiz yourself."
      : "Hi! Open a specific notes document for grounded answers, or ask me a general study question here.",
  };
}

function FlashcardView({ card }: { card: Flashcard }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className="w-full rounded-md border border-[#d68989] bg-white px-3 py-2 text-left text-sm dark:bg-gray-900"
    >
      <div className="text-[10px] font-medium tracking-wide text-[#b3615f] uppercase">
        {flipped ? "Answer" : "Question"} · tap to flip
      </div>
      <div className="mt-1">{flipped ? card.back : card.front}</div>
    </button>
  );
}

export function AskVelora() {
  const pathname = usePathname();
  const notesMatch = pathname.match(/^\/notes\/([^/]+)$/);
  const notesId = notesMatch && notesMatch[1] !== "new" && notesMatch[1] !== "live" ? notesMatch[1] : undefined;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage(!!notesId)]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useMascotLoadingMood(loading);
  useMascotErrorMood(error);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    setError(null);
    const history = messages.map((m) => ({ from: m.from, text: m.text }));
    setMessages((prev) => [...prev, { from: "user", text }]);
    setDraft("");
    setLoading(true);
    try {
      const res = await fetch("/api/ask-velora", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, notesId, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Ask Velora couldn't answer that.");
      setMessages((prev) => [...prev, { from: "assistant", text: data.reply, flashcards: data.flashcards }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      setMessages((prev) => [...prev, { from: "assistant", text: `⚠️ ${message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Ask Velora"
        aria-label="Open Ask Velora chat"
        className="fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full border border-[#d68989] bg-white px-4 py-3 text-sm font-medium shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl dark:bg-gray-900"
      >
        <span aria-hidden>✨</span> Ask Velora
      </button>

      {open && (
        <div className="fixed right-6 bottom-24 z-40 flex h-[28rem] w-80 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">
            <span className="font-medium">✨ Ask Velora</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {!notesId && (
            <p className="border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              Not viewing a specific notes document. Open one for grounded answers.
            </p>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "ml-auto max-w-[85%]" : "max-w-[90%]"}>
                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    m.from === "assistant"
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      : "bg-[#d68989] text-white"
                  }`}
                >
                  {m.text}
                </div>
                {m.flashcards && m.flashcards.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {m.flashcards.map((card, j) => (
                      <FlashcardView key={j} card={card} />
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="max-w-[85%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                Thinking...
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 border-t border-gray-200 px-3 py-2 dark:border-gray-800">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                disabled={loading}
                className="rounded-full border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
              >
                {s}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(draft);
            }}
            className="flex items-center gap-2 border-t border-gray-200 p-2 dark:border-gray-800"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about your notes..."
              disabled={loading}
              className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50 dark:border-gray-700 dark:bg-transparent"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
