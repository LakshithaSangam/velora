"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VeloraLogo } from "@/components/VeloraLogo";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notes", label: "Notes", icon: "📝" },
  { href: "/tests", label: "Tests", icon: "🧪" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function DashboardNav({ userLabel }: { userLabel: string }) {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-800">
      <div className="flex items-center gap-6">
        <Link href="/dashboard">
          <VeloraLogo scale={0.62} />
        </Link>
        <nav className="flex gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname.startsWith(link.href)
                  ? "font-medium text-black dark:text-white"
                  : "text-gray-500 hover:text-black dark:hover:text-white"
              }
            >
              {link.icon && <span aria-hidden>{link.icon} </span>}
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <ThemeToggle />
        <span className="text-gray-500">{userLabel}</span>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
