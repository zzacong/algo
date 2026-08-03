import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";

interface SiteHeaderProps {
  /** Content rendered on the left side of the header. */
  left?: ReactNode;
  /** Content rendered in the center of the header. */
  center?: ReactNode;
  /** Content rendered on the right side — defaults to ThemeToggle. */
  right?: ReactNode;
}

export function SiteHeader({ left, center, right }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">{left}</div>
        {center && (
          <span className="text-sm font-bold tracking-tight text-foreground">{center}</span>
        )}
        {right ?? <ThemeToggle />}
      </div>
    </header>
  );
}
