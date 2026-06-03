"use client";

import { useEffect, useState } from "react";
import { checkHealth } from "@/lib/api";

export function Header() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    void checkHealth().then(setOnline);
    const interval = setInterval(() => {
      void checkHealth().then(setOnline);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 12h6M9 16h6M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-stone-900">
              PDF Analyser
            </h1>
            <p className="text-xs text-stone-500">Upload · Index · Ask</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span
            className={[
              "h-2 w-2 rounded-full",
              online === null
                ? "bg-stone-300"
                : online
                  ? "bg-emerald-500"
                  : "bg-red-400",
            ].join(" ")}
          />
          {online === null
            ? "Checking API…"
            : online
              ? "API connected"
              : "API offline"}
        </div>
      </div>
    </header>
  );
}
