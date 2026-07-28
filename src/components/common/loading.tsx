import { Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Inline spinner. Use only for waits under ~1s; prefer skeletons beyond that. */
export function Spinner({ className, label }: { className?: string; label?: string }) {
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <Loader2 className={cn("size-4 animate-spin text-muted-foreground", className)} aria-hidden />
      <span className={label ? "text-sm text-muted-foreground" : "sr-only"}>
        {label ?? "Loading"}
      </span>
    </span>
  );
}

/** Full-region loading state used as a route pending component. */
export function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[60dvh] place-items-center" aria-busy="true">
      <Spinner label={label} />
    </div>
  );
}

/** Skeleton whose geometry mirrors the KPI + widget dashboard layout. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 lg:col-span-2" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );
}

/** Skeleton rows for tables and lists. */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
