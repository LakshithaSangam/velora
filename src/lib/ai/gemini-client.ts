import { GoogleGenAI } from "@google/genai";

const globalForGemini = globalThis as unknown as { gemini: GoogleGenAI | undefined };

// Constructed lazily, not at module import time: an eager `new` here already
// caused one bug (see the OPENAI_API_KEY incident) where a missing key
// crashed every route that transitively imported this file, not just the
// ones that actually use it.
export function getGemini(): GoogleGenAI {
  if (!globalForGemini.gemini) {
    globalForGemini.gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return globalForGemini.gemini;
}
