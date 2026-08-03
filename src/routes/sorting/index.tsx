import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { ArrowIcon } from "@/components/arrow-icon";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { SortVisualizer } from "@/components/sort-visualizer";
import { ALGORITHMS, SEED_INPUT, type Algorithm, type SortFrame } from "@/data/algorithms";

export const Route = createFileRoute("/sorting/")({
  component: SortingGalleryPage,
});

const FRAMES_CACHE = new Map<string, SortFrame[]>();

function getFrames(algo: Algorithm): SortFrame[] {
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
      to="/sorting/$id"
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
          <ArrowIcon
            direction="right"
            className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
          />
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

function SortingGalleryPage() {
  return (
    <div className="page-fade-in min-h-screen bg-background">
      <SiteHeader
        left={
          <Link
            to="/"
            className="flex items-center gap-1.5 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowIcon direction="left" className="size-3.5" />
            algo.
          </Link>
        }
        center="Sorting"
      />

      <main id="main-content">
        {/* Hero */}
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Sorting algorithms
          </p>
          <h1 className="text-3xl leading-[1.1] font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Sort, step by step.{" "}
            <span className="font-light text-muted-foreground italic">Visualised.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">
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
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ALGORITHMS.map((algo) => (
              <AlgorithmCard key={algo.id} algo={algo} />
            ))}
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
