import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowIcon } from "@/components/arrow-icon";
import { PageFooter } from "@/components/page-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/trees/$id")({
  component: TreesDetailPage,
});

function TreesDetailPage() {
  const { id } = Route.useParams();
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
      <main id="main-content">
        <div className="mx-auto max-w-5xl px-4 pt-12 pb-8 sm:px-6 sm:pt-16">
          <p className="text-sm text-muted-foreground">
            Loading tree operation: <code className="font-mono">{id}</code>…
          </p>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
