import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowIcon } from "@/components/arrow-icon";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/pathfinding/")({
  component: PathfindingGalleryPage,
});

function PathfindingGalleryPage() {
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
        center="Pathfinding"
      />
      <main id="main-content">
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
          <p className="text-sm text-muted-foreground">Loading pathfinding algorithms…</p>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
