"use client";

import { useEffect } from "react";

export type MascotMood = "idle" | "thinking" | "test" | "listening" | "surprised";

const EVENT_NAME = "velora-mascot-mood";

export function setMascotMood(mood: MascotMood) {
  window.dispatchEvent(new CustomEvent<MascotMood>(EVENT_NAME, { detail: mood }));
}

export function onMascotMood(callback: (mood: MascotMood) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent<MascotMood>).detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

/** Broadcasts "thinking" while `loading` is true, and back to "idle" once it finishes. */
export function useMascotLoadingMood(loading: boolean) {
  useEffect(() => {
    if (loading) {
      setMascotMood("thinking");
      return () => setMascotMood("idle");
    }
  }, [loading]);
}

/** Briefly broadcasts "surprised" whenever `error` newly becomes truthy. */
export function useMascotErrorMood(error: string | null | undefined) {
  useEffect(() => {
    if (error) {
      setMascotMood("surprised");
      const timeout = setTimeout(() => setMascotMood("idle"), 2500);
      return () => clearTimeout(timeout);
    }
  }, [error]);
}
