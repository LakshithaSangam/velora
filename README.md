# Velora

Turn video lectures, PDFs, and articles into structured, section-wise study notes with an AI agent — then generate a practice test (MCQ, short answer, or mixed) from those notes, take it in-app with a timer, and get graded automatically.

## Features

- **Notes generation** — paste a YouTube URL, a direct video-caption (.vtt/.srt) link, upload a PDF/Word/Excel file, upload an audio/video recording (transcribed via Whisper), paste a web article URL, or paste a transcript directly. The app previews the extracted content and asks you to confirm before sending anything to Gemini.
- **Structured output** — notes come back as headed sections with bullet points and highlighted keywords, renderable and downloadable as Markdown.
- **Test generation** — pick a notes document (or generate one on the spot), choose how many questions and what style (multiple choice / short answer / mixed), and get a test with a suggested time limit.
- **Test-taking** — countdown timer, MCQ auto-grading, short-answer grading via Gemini with per-question feedback.
- **Live meeting notes** — capture a meeting (Zoom, Google Meet, anything) by sharing a browser tab/screen's audio. No bot joins the call — it's local audio capture only, transcribed live via Deepgram and summarized incrementally by Gemini. Requires an explicit, unskippable disclosure step confirming you've told the other participants before it starts (see [Legal note](#legal-note-on-live-meeting-notes)).

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Prisma + Postgres, NextAuth.js (Credentials + Google), `@google/genai` (Gemini, free tier), `@deepgram/sdk` (live transcription), `openai` (Whisper transcription for uploaded audio/video, optional).

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Get a Postgres database** — two options:

   - **Neon (recommended)** — sign up free at [neon.com](https://neon.com) (no credit card), create a project, and copy the connection string it gives you. No local install, no Docker.
   - **Local Postgres via Docker** — if you'd rather run it yourself: `docker compose up -d` (requires Docker Desktop running).

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in:

   - `DATABASE_URL` — your Neon connection string, or leave the docker-compose default if using local Postgres.
   - `AUTH_SECRET` — generate with `npx auth secret`.
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — optional, only needed for Google sign-in.
   - `GEMINI_API_KEY` — required for notes/test generation and grading. Get a free key (no credit card) at [aistudio.google.com](https://aistudio.google.com) → "Get API key" → "Create API key".
   - `DEEPGRAM_API_KEY` — required for the live meeting notes feature. Get a free key (with $200 in free credit) at [console.deepgram.com](https://console.deepgram.com/signup?jump=keys). Everything else works fine without this — it only gates the live-meeting feature.
   - `OPENAI_API_KEY` — optional, only needed for the audio/video file upload feature (Whisper transcription, small per-minute cost). Everything else works fine without this.

4. **Run the database migration**

   ```bash
   npx prisma migrate dev
   ```

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/lib/ingestion/` — per-source-type adapters (YouTube, generic video captions, PDF, Word/Excel, audio/video, web article, pasted transcript), all converging on a common `{ rawText, title, sourceMeta }` shape.
- `src/lib/ai/` — Gemini API integration: `notes-service.ts`, `test-service.ts`, `grading-service.ts`, their Zod schemas, and prompts.
- `src/app/api/` — REST routes for sources, notes, and tests.
- `src/app/(dashboard)/` — the authenticated app (notes, tests, settings).
- `src/lib/meetings/`, `src/components/meetings/` — live meeting capture (Deepgram client, consent gate, live session UI).

## Legal note on live meeting notes

The live meeting feature does not join Zoom/Google Meet as a bot or interact with those platforms at all — it captures audio locally from a browser tab/screen you choose to share, the same category of thing as recording your screen. This does **not** remove the legal requirement to disclose recording to other participants (most jurisdictions require all-party or one-party consent, regardless of the recording method). The app enforces an explicit disclosure checkbox before any capture can start, both in the UI and server-side — but actual compliance depends on you actually telling the other participants, which the app has no way to verify.

## Known limitations

- PDF uploads are stored on local disk (`.uploads/`) — fine for local dev, but won't persist on a serverless deploy (Vercel etc.). Swap `src/lib/storage/files.ts` for Vercel Blob or S3 before deploying.
- YouTube transcript fetching uses an unofficial library — it can fail if a video has no captions, is region-restricted, or the library needs updating.
- No per-user rate limiting or cost caps on Gemini/Deepgram API calls yet — add before any public deployment.
- Live meeting audio capture (`getDisplayMedia`) works reliably in Chrome/Edge on Windows. macOS system-audio capture is more limited depending on OS version.
