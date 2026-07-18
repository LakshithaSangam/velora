import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

// Originally minted a short-lived, scoped Deepgram token via
// deepgram.auth.v1.tokens.grant() so the browser never saw the real key.
// That endpoint requires elevated account permissions that new/trial
// Deepgram accounts don't have by default (confirmed: an Owner-role key
// still gets 403 INSUFFICIENT_PERMISSIONS on it). Falling back to handing
// the browser the real key directly — acceptable for a personal project,
// revisit if this app ever has multiple real users.
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "DEEPGRAM_API_KEY is not configured." }, { status: 500 });
    }

    return NextResponse.json({ accessToken: apiKey, expiresIn: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create a transcription token.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
