import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import type { IngestResult, SourceAdapter, SourceAdapterInput } from "./types";

export const webArticleAdapter: SourceAdapter = {
  async ingest(input: SourceAdapterInput): Promise<IngestResult> {
    if (!input.url) throw new Error("Web article ingestion requires a URL.");

    let url: URL;
    try {
      url = new URL(input.url);
    } catch {
      throw new Error("Invalid URL.");
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Only http/https URLs are supported.");
    }

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StudyNotesAI/1.0)" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch the article (HTTP ${res.status}).`);
    }
    const html = await res.text();

    const dom = new JSDOM(html, { url: url.toString() });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent?.trim()) {
      throw new Error("Could not extract readable article content from this page.");
    }

    const rawText = article.textContent.trim();

    return {
      rawText,
      title: article.title || url.hostname,
      sourceMeta: {
        byline: article.byline ?? null,
        siteName: article.siteName ?? null,
        wordCount: rawText.split(/\s+/).length,
        excerpt: article.excerpt ?? null,
      },
    };
  },
};
