"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { tabs } from "@/lib/navigation";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link href="/search" className="text-lg font-semibold tracking-normal text-slate-950">
          FieldFix
        </Link>

        <nav
          aria-label="Primary navigation"
          className="grid grid-cols-4 gap-1 rounded-md bg-slate-100 p-1 sm:flex sm:w-auto"
        >
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "min-h-10 rounded px-3 py-2 text-center text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-slate-950 shadow-sm"
                    : "text-slate-600 hover:bg-white/70 hover:text-slate-950",
                ].join(" ")}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
