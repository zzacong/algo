import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowIcon } from "@/components/arrow-icon";
import { DPVisualizer } from "@/components/dp-visualizer";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { getDPAlgorithm } from "@/data/dp";

export const Route = createFileRoute("/dp/$id")({
  component: DPDetailPage,
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

const VARIANT_LABELS: Record<string, string> = {
  "recursion-tree": "Recursion tree",
  "dependency-arrows": "Dependency arrows",
  "lis-scan": "LIS scan",
  "row-highlight": "Row-by-row fill",
};

function TableLegend({ variant }: { variant: string }) {
  const items: Array<{ color: string; label: string }> = [
    { color: "#2563eb", label: "Active cell" },
    { color: "#0d9488", label: "Current row" },
    { color: "#475569", label: "Computed" },
    { color: "#6d28d9", label: "Dependency" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        {items.map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block size-2.5 rounded-sm" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/70">
        Secondary panel:{" "}
        <span className="font-medium text-muted-foreground">
          {VARIANT_LABELS[variant] ?? variant}
        </span>
      </p>
    </div>
  );
}

function DPDetailPage() {
  const { id } = Route.useParams();
  const algo = getDPAlgorithm(id);

  if (!algo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
        <p className="text-lg font-semibold text-foreground">Algorithm not found</p>
        <p className="text-sm text-muted-foreground">
          There's no DP algorithm with the id <code className="font-mono">{id}</code>.
        </p>
        <Link
          to="/dp"
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
        >
          <ArrowIcon direction="left" className="size-4" />
          Back to Dynamic Programming
        </Link>
      </div>
    );
  }

  return (
    <div className="page-fade-in min-h-screen bg-background">
      <SiteHeader
        left={
          <Link
            to="/dp"
            className="flex items-center gap-1.5 rounded text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowIcon direction="left" className="size-3.5" />
            Dynamic Programming
          </Link>
        }
        center="algo."
      />

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Page heading */}
        <div className="mb-8">
          <p className="mb-1.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Dynamic Programming
          </p>
          <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance text-foreground sm:text-3xl">
            {algo.name}
          </h1>
        </div>

        {/* Visualizer-first: both canvases side by side */}
        <div className="mb-8 rounded-xl border border-border bg-muted/30 p-4 sm:p-6">
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Live Animation — <span className="tabular-nums">{algo.frames.length}</span> frames
          </p>
          <DPVisualizer frames={algo.frames} variant={algo.variant} fps={4} size="lg" />
        </div>

        {/* Description + metadata below */}
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          {/* Description */}
          <div className="flex flex-col gap-4 lg:flex-1">
            <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
              {algo.description}
            </p>

            {/* Legend */}
            <div>
              <p className="mb-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Legend
              </p>
              <TableLegend variant={algo.variant} />
            </div>
          </div>

          {/* Stats table */}
          <div className="lg:w-72 lg:shrink-0">
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
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
