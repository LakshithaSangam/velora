import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js's built-in dev toolbar (the floating "N" badge, the
  // "Rendering..." indicator, its Preferences panel) is dev-only debug UI,
  // not part of the app. Turning it off avoids it being mistaken for
  // something we built.
  devIndicators: false,
  // pdf-parse pulls in pdfjs-dist's legacy build, which isn't compatible
  // with webpack's Server Components bundling (crashes with "Object.
  // defineProperty called on non-object"). Marking it external makes Next.js
  // load it via plain Node `require` at runtime instead of bundling it.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
