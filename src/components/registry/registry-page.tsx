import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RegistryFilters } from "@/components/registry/registry-filters";
import { RegistryForm } from "@/components/registry/registry-form";
import { RegistryTable } from "@/components/registry/registry-table";
import { listRegistryIdentities } from "@/lib/api/registry";

export function RegistryPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["registry-identities"],
    queryFn: listRegistryIdentities,
  });

  const filteredRows = React.useMemo(() => {
    const rows = data ?? [];
    return rows.filter((row) => {
      const matchesQuery = !query || row.displayName.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "all" || row.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [data, query, status]);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["registry-identities"] });
  };

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Global Registry Foundation"
        description="Govern verified identities, review workflows and registry records from a single workspace."
        icon={ShieldCheck}
        actions={
          <Button variant="outline" className="gap-2">
            <Sparkles className="size-4" />
            Review queue
          </Button>
        }
      />

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <RegistryForm />
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle>Operational overview</CardTitle>
            <CardDescription>Use summary cards to monitor registry health and governance readiness.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Verified identities</p>
              <p className="mt-1 text-2xl font-semibold">1,284</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Pending reviews</p>
              <p className="mt-1 text-2xl font-semibold">24</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Compliance score</p>
              <p className="mt-1 text-2xl font-semibold">97%</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Registry catalogue</h2>
            <p className="text-sm text-muted-foreground">Search, filter and review identity records with accessible controls.</p>
          </div>
          <RegistryFilters query={query} onQueryChange={setQuery} status={status} onStatusChange={setStatus} />
        </div>

        {isLoading ? (
          <div className="grid gap-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertTriangle}
            title="We couldn't load registry identities"
            description={error instanceof Error ? error.message : "The registry service returned an unexpected error."}
            action={<Button onClick={refetch}>Try again</Button>}
          />
        ) : filteredRows.length === 0 ? (
          <EmptyState
            icon={AlertTriangle}
            title="No registry identities found"
            description="Try a broader search or change the status filter."
          />
        ) : (
          <RegistryTable rows={filteredRows} />
        )}
      </section>
    </main>
  );
}
