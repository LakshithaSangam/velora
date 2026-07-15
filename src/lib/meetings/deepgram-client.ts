import { DeepgramClient } from "@deepgram/sdk";

const globalForDeepgram = globalThis as unknown as { deepgram: DeepgramClient | undefined };

export const deepgram = globalForDeepgram.deepgram ?? new DeepgramClient();

if (process.env.NODE_ENV !== "production") {
  globalForDeepgram.deepgram = deepgram;
}
