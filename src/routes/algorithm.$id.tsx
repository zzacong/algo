import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { SortVisualizer } from "@/components/SortVisualizer";
import { useTheme } from "@/components/theme-provider";
import { getAlgorithm, SEED_INPUT } from "@/data/algorithms";

export const Route = createFileRoute("/algorithm/$id")({
  component: AlgorithmDetailPage,
});

function ComplexityRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-2.5 pr-4 text-xs text-muted-foreground">{label}</td>
      <td className="py-2.5 font-mono text-sm font-medium text-foreground">{value}</td>
    </tr>
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

function AlgorithmDetailPage() {
  const { id } = Route.useParams();
  const algo = getAlgorithm(id);

  const frames = useMemo(() => {
    if (!algo) return [];
    return algo.sort(SEED_INPUT);
  }, [algo]);

  if (!algo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-lg font-semibold text-foreground">Algorithm not found</p>
        <p className="text-sm text-muted-foreground">
          There's no algorithm with the id <code className="font-mono">{id}</code>.
        </p>
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Back to Gallery
        </Link>
      </div>
    );
  }

  return (
    <div className="page-fade-in min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <svg
              className="size-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Gallery
          </Link>
          <span className="text-sm font-bold tracking-tight text-foreground">sort.</span>
          <ThemeToggle />
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Text column */}
          <div className="flex flex-col gap-6 lg:w-80 lg:shrink-0">
            <div>
              <p className="mb-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Algorithm
              </p>
              <h1 className="text-2xl leading-tight font-bold tracking-tight text-foreground sm:text-3xl">
                {algo.name}
              </h1>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground">{algo.description}</p>

            {/* Complexity table */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Complexity
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full">
                  <tbody>
                    <ComplexityRow label="Best case" value={algo.complexity.best} />
                    <ComplexityRow label="Average case" value={algo.complexity.average} />
                    <ComplexityRow label="Worst case" value={algo.complexity.worst} />
                    <ComplexityRow label="Space" value={algo.complexity.space} />
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Visualizer column */}
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Live Animation — {frames.length} frames
            </p>
            <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-6">
              <SortVisualizer frames={frames} fps={10} size="lg" />
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              Input: <code className="font-mono">[7, 3, 11, 1, 9, 4, 12, 6, 2, 10, 5, 8]</code> —
              loops continuously
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground/50">
        Made with IBM Bob
      </footer>
    </div>
  );
}
