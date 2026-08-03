import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";

import { ArrowIcon } from "@/components/arrow-icon";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { TreeVisualizer } from "@/components/tree-visualizer";
import { getTreeAlgorithm } from "@/data/trees";

export const Route = createFileRoute("/trees/$id")({
  component: TreesDetailPage,
});

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <th
        scope="row"
        className="py-2.5 pr-4 pl-3 text-left text-xs font-normal text-muted-foreground"
      >
        {label}
      </th>
      <td className="py-2.5 pr-3 font-mono text-sm font-medium text-foreground">{value}</td>
    </tr>
  );
}

function NodeLegend() {
  const items: Array<{ color: string; label: string }> = [
    { color: "#6366f1", label: "Default" },
    { color: "#f59e0b", label: "Comparing" },
    { color: "#10b981", label: "Inserted / Found" },
    { color: "#ef4444", label: "Deleted" },
    { color: "#a78bfa", label: "Rotated" },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {items.map(({ color, label }) => (
        <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block size-2.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function TreesDetailPage() {
  const { id } = Route.useParams();
  const algo = getTreeAlgorithm(id);

  const frames = useMemo(() => {
    if (!algo) return [];
    return algo.run();
  }, [algo]);

  if (!algo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-lg font-semibold text-foreground">Operation not found</p>
        <p className="text-sm text-muted-foreground">
          There's no tree operation with the id <code className="font-mono">{id}</code>.
        </p>
        <Link
          to="/trees"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowIcon direction="left" className="size-4" />
          Back to Trees
        </Link>
      </div>
    );
  }

  return (
    <div className="page-fade-in min-h-screen bg-background">
      <SiteHeader
        left={
          <Link
            to="/trees"
            className="flex items-center gap-1.5 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowIcon direction="left" className="size-3.5" />
            Trees
          </Link>
        }
        center="algo."
      />

      {/* Page content */}
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Text column */}
          <div className="flex flex-col gap-6 lg:w-80 lg:shrink-0">
            <div>
              <p className="mb-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Trees
              </p>
              <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance text-foreground sm:text-3xl">
                {algo.name}
              </h1>
            </div>

            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              {algo.description}
            </p>

            {/* Stats table */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Properties
              </p>
              <div className="overflow-hidden rounded-lg border border-border">
                <table className="w-full" aria-label={`${algo.name} properties`}>
                  <thead className="sr-only">
                    <tr>
                      <th scope="col">Property</th>
                      <th scope="col">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {algo.stats.map((s) => (
                      <StatRow key={s.label} label={s.label} value={s.value} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Legend */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Legend
              </p>
              <NodeLegend />
            </div>
          </div>

          {/* Visualizer column */}
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Live Animation — <span className="tabular-nums">{frames.length}</span> frames
            </p>
            <div className="rounded-xl border border-border bg-muted/30 p-4 sm:p-6">
              <TreeVisualizer frames={frames} fps={5} size="lg" />
            </div>
            <p className="text-[11px] text-muted-foreground/60">
              BST seeded with [50, 30, 70, 20, 40, 60, 80, 65] — loops continuously…
            </p>
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
