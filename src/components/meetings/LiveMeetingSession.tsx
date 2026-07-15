"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { DeepgramClient } from "@deepgram/sdk";
import type { NotesResult } from "@/lib/ai/schemas/notes.schema";

const FLUSH_INTERVAL_MS = 45_000;

type Phase = "starting" | "requesting-permission" | "connecting" | "recording" | "stopping" | "error";

export function LiveMeetingSession() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("starting");
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<NotesResult | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const notesDocumentIdRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const socketRef = useRef<any>(null);
  const pendingTranscriptRef = useRef("");
  const flushIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stoppingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function begin() {
      try {
        setPhase("requesting-permission");
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        if (cancelled) {
          displayStream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (displayStream.getAudioTracks().length === 0) {
          displayStream.getTracks().forEach((t) => t.stop());
          throw new Error(
            "No audio was shared. When picking what to share, make sure to check \"Share audio\" / \"Share tab audio\".",
          );
        }
        displayStream.getVideoTracks().forEach((t) => t.stop());
        streamRef.current = displayStream;
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

        const dg = new DeepgramClient({ accessToken: tokenData.accessToken });
        const connection = await dg.listen.v1.connect({
          model: "nova-3",
          language: "en",
          punctuate: "true",
          interim_results: "true",
          smart_format: "true",
        });
        socketRef.current = connection;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        connection.on("message", (data: any) => {
          if (data.type === "Results" && data.is_final) {
            const text = data.channel?.alternatives?.[0]?.transcript ?? "";
            if (text.trim()) pendingTranscriptRef.current += (pendingTranscriptRef.current ? " " : "") + text.trim();
          }
        });
        connection.on("error", () => {
          if (!cancelled) setError("Lost connection to the transcription service.");
        });

        connection.connect();
        await connection.waitForOpen();
        if (cancelled) return;

        const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm";
        const recorder = new MediaRecorder(displayStream, { mimeType });
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0 && socketRef.current) socketRef.current.sendMedia(e.data);
        };
        recorder.start(250);
        recorderRef.current = recorder;

        flushIntervalRef.current = setInterval(flushPendingTranscript, FLUSH_INTERVAL_MS);
        timerIntervalRef.current = setInterval(() => setElapsedSec((s) => s + 1), 1000);

        setPhase("recording");
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not start the live session.");
          setPhase("error");
        }
      }
    }

    begin();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function flushPendingTranscript() {
    const chunk = pendingTranscriptRef.current;
    const notesDocumentId = notesDocumentIdRef.current;
    if (!chunk.trim() || !notesDocumentId) return;
    pendingTranscriptRef.current = "";

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
    return () => {
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      socketRef.current?.close();
      if (flushIntervalRef.current) clearInterval(flushIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const mins = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const secs = String(elapsedSec % 60).padStart(2, "0");

  if (phase === "error") {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (phase !== "recording" && phase !== "stopping") {
    const label =
      phase === "requesting-permission"
        ? "Waiting for you to pick what to share..."
        : phase === "connecting"
          ? "Connecting..."
          : "Starting...";
    return <p className="text-gray-500">{label}</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
          <span className="font-medium">{phase === "stopping" ? "Finishing up..." : "Recording"}</span>
        </div>
        <span className="tabular-nums text-gray-500">
          {mins}:{secs}
        </span>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-6 rounded-lg border border-gray-200 p-5 dark:border-gray-800">
        {!notes || notes.sections.length === 0 ? (
          <p className="text-gray-500">Listening... notes will appear here as the meeting progresses.</p>
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

      <button
        onClick={stopSession}
        disabled={phase === "stopping"}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-900"
      >
        {phase === "stopping" ? "Finishing up..." : "Stop session"}
      </button>
    </div>
  );
}
