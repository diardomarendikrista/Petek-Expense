"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PieChart } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-background border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.8)] pb-safe pointer-events-auto">
        <div className="flex h-16 items-center justify-around px-2">
          <Link
            href="/"
            replace
            className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-colors ${
              pathname === "/"
                ? "text-brand-500"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Beranda</span>
          </Link>
          <Link
            href="/history"
            replace
            className={`flex flex-1 flex-col items-center justify-center gap-1 h-full transition-colors ${
              pathname === "/history"
                ? "text-brand-500"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <PieChart className="h-5 w-5" />
            <span className="text-[10px] font-medium">Riwayat</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
