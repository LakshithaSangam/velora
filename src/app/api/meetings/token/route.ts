import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { deepgram } from "@/lib/meetings/deepgram-client";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { access_token, expires_in } = await deepgram.auth.v1.tokens.grant({ ttl_seconds: 30 });
    return NextResponse.json({ accessToken: access_token, expiresIn: expires_in });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create a transcription token.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
