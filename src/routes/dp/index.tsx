import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowIcon } from "@/components/arrow-icon";
import { DPVisualizer } from "@/components/dp-visualizer";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { DP_ALGORITHMS, type DPAlgorithm } from "@/data/dp";

export const Route = createFileRoute("/dp/")({
  component: DPGalleryPage,
});

function AlgorithmCard({ algo }: { algo: DPAlgorithm }) {
  return (
    <Link
      to="/dp/$id"
      params={{ id: algo.id }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* Animated preview */}
      <div className="border-b border-border bg-muted/40 px-3 pt-3 pb-2">
        <DPVisualizer frames={algo.frames} variant={algo.variant} fps={4} size="sm" />
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
          {algo.stats.slice(0, 3).map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="font-mono font-medium text-foreground">{s.value}</span>
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}

function DPGalleryPage() {
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
        center="Dynamic Programming"
      />

      <main id="main-content">
        {/* Hero */}
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Dynamic programming
          </p>
          <h1 className="text-3xl leading-[1.1] font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Overlapping subproblems,{" "}
            <span className="font-light text-muted-foreground italic">solved once.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">
            Watch tables fill cell by cell as DP builds optimal solutions from the bottom up. Each
            card shows both the DP table and the key insight — dependency arrows, recursion trees,
            and more.
          </p>
        </div>

        {/* Cards grid */}
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DP_ALGORITHMS.map((algo) => (
              <AlgorithmCard key={algo.id} algo={algo} />
            ))}
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
