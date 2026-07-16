import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js's built-in dev toolbar (the floating "N" badge, the
  // "Rendering..." indicator, its Preferences panel) is dev-only debug UI,
  // not part of the app. Turning it off avoids it being mistaken for
  // something we built.
  devIndicators: false,
};

export default nextConfig;
