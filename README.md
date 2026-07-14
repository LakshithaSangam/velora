# StudyNotes AI

Turn video lectures, PDFs, and articles into structured, section-wise study notes with an AI agent — then generate a practice test (MCQ, short answer, or mixed) from those notes, take it in-app with a timer, and get graded automatically.

## Features

- **Notes generation** — paste a YouTube URL, a direct video-caption (.vtt/.srt) link, upload a PDF, paste a web article URL, or paste a transcript directly. The app previews the extracted content and asks you to confirm before sending anything to Claude.
- **Structured output** — notes come back as headed sections with bullet points and highlighted keywords, renderable and downloadable as Markdown.
- **Test generation** — pick a notes document (or generate one on the spot), choose how many questions and what style (multiple choice / short answer / mixed), and get a test with a suggested time limit.
- **Test-taking** — countdown timer, MCQ auto-grading, short-answer grading via Claude with per-question feedback.

## Stack

Next.js 14 (App Router) + TypeScript + Tailwind CSS, Prisma + Postgres, NextAuth.js (Credentials + Google), `@anthropic-ai/sdk`.

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start a local Postgres**

   ```bash
   docker compose up -d
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in:

   - `DATABASE_URL` — already points at the docker-compose Postgres by default.
   - `AUTH_SECRET` — generate with `npx auth secret`.
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — optional, only needed for Google sign-in.
   - `ANTHROPIC_API_KEY` — required for notes/test generation and grading. Get one at [console.anthropic.com](https://console.anthropic.com) → API Keys.

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

- `src/lib/ingestion/` — per-source-type adapters (YouTube, generic video captions, PDF, web article, pasted transcript), all converging on a common `{ rawText, title, sourceMeta }` shape.
- `src/lib/ai/` — Claude API integration: `notes-service.ts`, `test-service.ts`, `grading-service.ts`, their Zod schemas, and prompts.
- `src/app/api/` — REST routes for sources, notes, and tests.
- `src/app/(dashboard)/` — the authenticated app (notes, tests, settings).

## Known limitations

- PDF uploads are stored on local disk (`.uploads/`) — fine for local dev, but won't persist on a serverless deploy (Vercel etc.). Swap `src/lib/storage/files.ts` for Vercel Blob or S3 before deploying.
- YouTube transcript fetching uses an unofficial library — it can fail if a video has no captions, is region-restricted, or the library needs updating.
- No per-user rate limiting or cost caps on Claude API calls yet — add before any public deployment.
