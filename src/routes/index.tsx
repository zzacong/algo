import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { SortVisualizer } from "@/components/SortVisualizer";
import { useTheme } from "@/components/theme-provider";
import { ALGORITHMS, SEED_INPUT, type Algorithm } from "@/data/algorithms";

export const Route = createFileRoute("/")({
  component: GalleryPage,
});

const FRAMES_CACHE = new Map<string, number[][]>();

function getFrames(algo: Algorithm): number[][] {
  if (!FRAMES_CACHE.has(algo.id)) {
    FRAMES_CACHE.set(algo.id, algo.sort(SEED_INPUT));
  }
  return FRAMES_CACHE.get(algo.id)!;
}

function ComplexityBadge({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium text-foreground">{value}</span>
    </span>
  );
}

function AlgorithmCard({ algo }: { algo: Algorithm }) {
  const frames = useMemo(() => getFrames(algo), [algo]);

  return (
    <Link
      to="/algorithm/$id"
      params={{ id: algo.id }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* Animated preview */}
      <div className="border-b border-border bg-muted/40 px-3 pt-3 pb-2">
        <SortVisualizer frames={frames} fps={8} size="sm" />
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm leading-tight font-semibold text-foreground">{algo.name}</h2>
          <svg
            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {algo.description}
        </p>

        <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 border-t border-border/60 pt-2">
          <ComplexityBadge label="avg" value={algo.complexity.average} />
          <ComplexityBadge label="worst" value={algo.complexity.worst} />
          <ComplexityBadge label="space" value={algo.complexity.space} />
        </div>
      </div>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-primary"
      aria-label="Toggle dark mode"
      title="Toggle dark mode (D)"
    >
      {isDark ? (
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
      <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

function GalleryPage() {
  return (
    <div className="page-fade-in min-h-screen bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-foreground">sort.</span>
            <span className="hidden rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              8 algorithms
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
        <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Visual learning
        </p>
        <h1 className="text-3xl leading-[1.1] font-bold tracking-tight text-foreground sm:text-4xl">
          Sorting algorithms,{" "}
          <span className="font-light text-muted-foreground italic">visualised.</span>
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Watch eight classic sorting algorithms sort the same 12-element array — step by step,
          frame by frame. Click any card to explore the full animation and complexity breakdown.
        </p>
        <p className="mt-3 text-xs text-muted-foreground/60">
          Press{" "}
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
            D
          </kbd>{" "}
          to toggle dark mode
        </p>
      </div>

      {/* Cards grid */}
      <main className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ALGORITHMS.map((algo) => (
            <AlgorithmCard key={algo.id} algo={algo} />
          ))}
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground/50">
        Made with IBM Bob
      </footer>
    </div>
  );
}
