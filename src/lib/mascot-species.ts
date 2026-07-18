"use client";

import { useEffect, useState } from "react";

export type MascotSpecies = "cat" | "dog" | "hamster" | "rabbit" | "koala" | "panda" | "owl";

const STORAGE_KEY = "velora-mascot-species";
const EVENT_NAME = "velora-mascot-species";
const VALID_SPECIES: MascotSpecies[] = ["cat", "dog", "hamster", "rabbit", "koala", "panda", "owl"];

export function getMascotSpecies(): MascotSpecies {
  if (typeof window === "undefined") return "cat";
  const saved = localStorage.getItem(STORAGE_KEY);
  return VALID_SPECIES.includes(saved as MascotSpecies) ? (saved as MascotSpecies) : "cat";
}

export function setMascotSpecies(species: MascotSpecies) {
  localStorage.setItem(STORAGE_KEY, species);
  window.dispatchEvent(new CustomEvent<MascotSpecies>(EVENT_NAME, { detail: species }));
}

export function onMascotSpeciesChange(callback: (species: MascotSpecies) => void): () => void {
  const handler = (e: Event) => callback((e as CustomEvent<MascotSpecies>).detail);
  window.addEventListener(EVENT_NAME, handler);
  return () => window.removeEventListener(EVENT_NAME, handler);
}

/**
 * SSR-safe: always starts as "cat" during the initial render (no window to
 * read from), then syncs from localStorage after mount and stays in sync
 * with changes made elsewhere (e.g. the Settings page) via the event above.
 */
export function useMascotSpecies(): MascotSpecies {
  const [species, setSpecies] = useState<MascotSpecies>("cat");
  useEffect(() => {
    setSpecies(getMascotSpecies());
    return onMascotSpeciesChange(setSpecies);
  }, []);
  return species;
}
