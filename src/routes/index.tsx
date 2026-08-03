import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowIcon } from "@/components/arrow-icon";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";
import { CATEGORIES, type Category } from "@/data/categories";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function CategoryCard({ category }: { category: Category }) {
  const isLive = category.status === "live";

  if (!isLive) {
    return (
      <div className="relative flex flex-col gap-3 rounded-xl border border-border/50 bg-card/50 p-5 opacity-50">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">{category.name}</h2>
          <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            soon
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{category.description}</p>
      </div>
    );
  }

  return (
    <Link
      to={category.route as "/sorting" | "/pathfinding" | "/trees"}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{category.name}</h2>
        <div className="flex items-center gap-1.5">
          {category.count !== null && (
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {category.count}
            </span>
          )}
          <ArrowIcon
            direction="right"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">{category.description}</p>
    </Link>
  );
}

function HomePage() {
  const live = CATEGORIES.filter((c) => c.status === "live");
  const soon = CATEGORIES.filter((c) => c.status === "coming-soon");

  return (
    <div className="page-fade-in min-h-screen bg-background">
      <SiteHeader
        left={<span className="text-sm font-bold tracking-tight text-foreground">algo.</span>}
      />

      <main id="main-content">
        {/* Hero */}
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-10 sm:px-6 sm:pt-16">
          <p className="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Visual learning
          </p>
          <h1 className="text-3xl leading-[1.1] font-bold tracking-tight text-balance text-foreground sm:text-4xl">
            Algorithms, <span className="font-light text-muted-foreground italic">visualised.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">
            Step-by-step animated visualisations for sorting, pathfinding, trees, and more. Pick a
            category and watch the algorithm work.
          </p>
          <p className="mt-3 text-xs text-muted-foreground/60">
            Press{" "}
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
              D
            </kbd>{" "}
            to toggle dark mode
          </p>
        </div>

        {/* Live categories */}
        <div className="mx-auto max-w-5xl px-4 pb-6 sm:px-6">
          <p className="mb-4 text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Categories
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>

        {/* Coming soon */}
        <div className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <p className="mb-4 text-xs font-medium tracking-widest text-muted-foreground/50 uppercase">
            Coming soon
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {soon.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </main>

      <PageFooter />
    </div>
  );
}
