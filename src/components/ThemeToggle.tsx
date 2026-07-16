"use client";

import { useEffect, useState } from "react";

// Keep in sync with the inline script in layout.tsx.
function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  if (!theme) return <div className="h-8 w-8" />; // avoid layout shift before hydration

  return (
    <button
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        applyTheme(next);
        setTheme(next);
      }}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
