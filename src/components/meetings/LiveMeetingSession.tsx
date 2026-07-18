"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { NotesResult } from "@/lib/ai/schemas/notes.schema";

const FLUSH_INTERVAL_MS = 45_000;

type Phase = "idle" | "requesting-permission" | "connecting" | "recording" | "stopping" | "error";

export function LiveMeetingSession() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NotesResult | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isWritingNotes, setIsWritingNotes] = useState(false);

  const notesDocumentIdRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pendingTranscriptRef = useRef("");
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppingRef = useRef(false);
  const cancelledRef = useRef(false);

  // Must be called directly from a user click (e.g. a button's onClick) —
  // getDisplayMedia() requires an unbroken user-gesture chain, and browsers
  // silently deny it with no picker shown if it's invoked from a useEffect,
  // a timer, or after an earlier unrelated await.
  async function begin() {
    try {
      setPhase("requesting-permission");
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      if (cancelledRef.current) {
        displayStream.getTracks().forEach((t) => t.stop());
        return;
      }
      if (displayStream.getAudioTracks().length === 0) {
        displayStream.getTracks().forEach((t) => t.stop());
        throw new Error(
          "No audio was shared. When picking what to share, make sure to check \"Share audio\" / \"Share tab audio\".",
        );
      }
      // Deliberately NOT stopping the video track here, even though we only
      // read audio: Chrome's native "you are sharing your screen — Stop
      // sharing" indicator (the one Google Meet also relies on) is tied to
      // that video track staying alive. Killing it early makes the native
      // stop-sharing control disappear along with it. Both tracks get
      // stopped together in stopSession() when the user actually stops.
      streamRef.current = displayStream;
      displayStream.getVideoTracks()[0]?.addEventListener("ended", () => stopSession());
      displayStream.getAudioTracks()[0].addEventListener("ended", () => stopSession());

      setPhase("connecting");
      const startRes = await fetch("/api/meetings/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consentConfirmed: true }),
      });
      const startData = await startRes.json();
      if (!startRes.ok) throw new Error(startData.error ?? "Could not start the session.");
      notesDocumentIdRef.current = startData.notesDocumentId;

      const tokenRes = await fetch("/api/meetings/token", { method: "POST" });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error ?? "Could not get a transcription token.");

      // Connecting directly with the native browser WebSocket, bypassing
      // @deepgram/sdk's client wrapper entirely — its internal auth
      // resolution turned out to be too fragile/opaque to rely on here.
      // Browsers can't set custom headers on a WebSocket handshake, so the
      // key goes in the subprotocol list instead — Deepgram's documented
      // method for browser clients, and verified working directly against
      // their server beforehand.
      const params = new URLSearchParams({
        model: "nova-3",
        language: "en",
        punctuate: "true",
        interim_results: "true",
        smart_format: "true",
      });
      const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?${params}`, ["token", tokenData.accessToken]);
      socketRef.current = ws;

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "Results" && data.is_final) {
          const text = data.channel?.alternatives?.[0]?.transcript ?? "";
          if (text.trim()) pendingTranscriptRef.current += (pendingTranscriptRef.current ? " " : "") + text.trim();
        }
      };
      ws.onerror = () => {
        if (!cancelledRef.current) setError("Lost connection to the transcription service.");
      };

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => resolve();
        ws.addEventListener("error", () => reject(new Error("Could not connect to the transcription service.")), {
          once: true,
        });
      });
      if (cancelledRef.current) return;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      // Recording must come from an audio-only stream — MediaRecorder
      // rejects an audio-only mimeType when the source stream also has a
      // video track (which we deliberately keep alive so Chrome's native
      // "Stop sharing" indicator stays visible).
      const audioOnlyStream = new MediaStream([displayStream.getAudioTracks()[0]]);
      const recorder = new MediaRecorder(audioOnlyStream, { mimeType });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(e.data);
        }
      };
      recorder.start(250);
      recorderRef.current = recorder;

      flushIntervalRef.current = setInterval(flushPendingTranscript, FLUSH_INTERVAL_MS);
      timerIntervalRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);

      setPhase("recording");
    } catch (err) {
      if (!cancelledRef.current) {
        const message = err instanceof Error ? err.message : "Could not start the live session.";
        // NotAllowedError fires both when the user clicks "Cancel" in the
        // picker and (confusingly) when the browser blocks the call outright.
        setError(
          message.includes("NotAllowedError") || message.includes("Permission denied")
            ? "Screen-share permission was denied or cancelled. Click \"Share your screen\" and pick a tab/window/screen with audio to try again."
            : message,
        );
        setPhase("error");
      }
    }
  }

  async function flushPendingTranscript() {
    const chunk = pendingTranscriptRef.current;
    const notesDocumentId = notesDocumentIdRef.current;
    if (!chunk.trim() || !notesDocumentId) return;
    pendingTranscriptRef.current = "";

    setIsWritingNotes(true);
    try {
      const res = await fetch(`/api/meetings/${notesDocumentId}/append-chunk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptChunk: chunk }),
      });
      const data = await res.json();
      if (res.ok) setNotes(data.notes);
    } catch {
      // Non-fatal — this chunk is lost, but the live session keeps running for the next one.
    } finally {
      setIsWritingNotes(false);
    }
  }

  async function stopSession() {
    if (stoppingRef.current) return;
    stoppingRef.current = true;
    setPhase("stopping");

    if (flushIntervalRef.current) clearInterval(flushIntervalRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    recorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    socketRef.current?.close();

    await flushPendingTranscript();

    const notesDocumentId = notesDocumentIdRef.current;
    if (!notesDocumentId) return;

    try {
      const res = await fetch(`/api/meetings/${notesDocumentId}/finish`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not finalize the session.");
      router.push(`/notes/${notesDocumentId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not finalize the session.");
      setPhase("error");
    }
  }

  useEffect(() => {
    // Reset on every (re)run of this effect, not just on the initial ref
    // value — React's development-mode double-invoke (mount, cleanup,
    // mount again) otherwise leaves this permanently `true` after the
    // "practice" cleanup, silently blocking begin() forever with no error.
    cancelledRef.current = false;
    return () => {
      cancelledRef.current = true;
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      socketRef.current?.close();
      if (flushIntervalRef.current) clearInterval(flushIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Warn before an accidental refresh/close/navigation mid-recording — a
  // silent stop would leave the user unsure whether they're still being
  // recorded. If they leave anyway, best-effort finalize the session so it
  // doesn't get stuck "GENERATING" forever with no way to view it.
  useEffect(() => {
    if (phase !== "recording") return;

    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    function handlePageHide() {
      const notesDocumentId = notesDocumentIdRef.current;
      if (notesDocumentId) {
        navigator.sendBeacon(`/api/meetings/${notesDocumentId}/finish`, new Blob());
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [phase]);

  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const secs = String(elapsedSec % 60).padStart(2, "0");

  if (phase === "idle") {
    return (
      <div className="space-y-3">
        <p className="text-gray-600 dark:text-gray-400">
          When you click below, your browser will ask which tab, window, or screen to share. Pick the one
          with your meeting, and make sure "Share audio" is checked.
        </p>
        <button
          onClick={begin}
          className="rounded-md bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          Share your screen and start
        </button>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error}</p>
        <button
          onClick={begin}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Try again
        </button>
      </div>
    );
  }

  if (phase !== "recording" && phase !== "stopping") {
    const label =
      phase === "requesting-permission"
        ? "Waiting for you to pick what to share..."
        : "Connecting...";
    return <p className="text-gray-500">{label}</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="sticky top-0 z-10 -mx-6 flex items-center justify-between border-b border-red-200 bg-red-50 px-6 py-3 dark:border-red-900 dark:bg-red-950">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="font-medium text-red-900 dark:text-red-100">
            {phase === "stopping"
              ? "Finishing up..."
              : "Recording, this tab's shared audio is being transcribed"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="tabular-nums text-red-900 dark:text-red-100">
            {mins}:{secs}
          </span>
          <div
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isWritingNotes ? "text-red-900 dark:text-red-100" : "text-red-700/70 dark:text-red-300/70"
            }`}
          >
            <span className={`text-base ${isWritingNotes ? "animate-bounce" : ""}`} aria-hidden>
              {isWritingNotes ? "✍️" : "👂"}
            </span>
            <span>{isWritingNotes ? "Taking notes..." : "Listening..."}</span>
          </div>
          <button
            onClick={stopSession}
            disabled={phase === "stopping"}
            className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {phase === "stopping" ? "Finishing up..." : "Stop sharing"}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-6 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
        {!notes || notes.sections.length === 0 ? (
          <p className="text-gray-500">Notes will appear here as the meeting progresses.</p>
        ) : (
          notes.sections.map((section, i) => (
            <div key={i}>
              <h3 className="mb-1 font-semibold">{section.heading}</h3>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {section.bullets.map((b, j) => (
                  <li key={j}>{b.text}</li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
