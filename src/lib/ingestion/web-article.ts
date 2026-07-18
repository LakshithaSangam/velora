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
    if (/drive\.google\.com|docs\.google\.com/.test(url.hostname)) {
      throw new Error(
        "Google Drive/Docs links can't be read directly — they need you to be signed in and load " +
          "JavaScript, which this app can't do. Instead, download the file and upload it using the " +
          "PDF, Word/Excel, or Audio/video tab, or use \"Paste transcript\" to paste the text directly.",
      );
    }

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Velora/1.0)" },
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

    // Some sites (JS-only apps, login walls) return a near-empty shell page
    // that Readability still technically "extracts" — catch the common
    // tells so we fail clearly instead of generating notes from garbage.
    if (
      rawText.length < 200 ||
      /this browser (version )?is no longer supported|please enable javascript|sign in to continue/i.test(
        rawText,
      )
    ) {
      throw new Error(
        "This page doesn't seem to have readable article content — it may require JavaScript or " +
          "signing in to view. Try a different link, or use \"Paste transcript\" to paste the text directly.",
      );
    }

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
