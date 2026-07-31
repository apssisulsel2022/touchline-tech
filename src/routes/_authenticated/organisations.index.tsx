import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Filter, Network, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgStatusBadge, OrgTypeBadge } from "@/components/organizations/org-badges";
import { OrgHierarchyTree } from "@/components/organizations/org-hierarchy-tree";
import {
  buildOrgTree,
  ORG_LIST_PAGE_SIZE,
  organizationTreeQuery,
  organizationsQuery,
} from "@/lib/organizations";
import {
  ORG_STATUSES,
  ORG_STATUS_LABELS,
  ORG_TYPES,
  ORG_TYPE_LABELS,
  type OrgStatus,
  type OrgType,
} from "@/lib/validation/org";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/organisations/")({
  head: () => ({
    meta: [
      { title: "Organisations — Touchline" },
      {
        name: "description",
        content:
          "Search, filter and govern every federation, association, academy and club across the Touchline ecosystem.",
      },
      { property: "og:title", content: "Organisations — Touchline" },
      {
        property: "og:description",
        content: "Multi-tenant organisation directory and hierarchy for the football ecosystem.",
      },
    ],
  }),
  component: OrganisationsPage,
});

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

function OrganisationsPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission("org:manage");

  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<OrgType | "all">("all");
  const [status, setStatus] = React.useState<OrgStatus | "all">("all");
  const [includeDeleted, setIncludeDeleted] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const debouncedSearch = useDebounced(search);

  React.useEffect(() => setPage(1), [debouncedSearch, type, status, includeDeleted]);

  const listQuery = useQuery(
    organizationsQuery({ search: debouncedSearch, type, status, includeDeleted, page }),
  );
  const treeQuery = useQuery(organizationTreeQuery());

  const rows = listQuery.data?.rows ?? [];
  const total = listQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / ORG_LIST_PAGE_SIZE));
  const forest = React.useMemo(() => buildOrgTree(treeQuery.data ?? []), [treeQuery.data]);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        icon={Building2}
        title="Organisations"
        description="Directory and hierarchy of every tenant in the Touchline ecosystem."
        actions={
          canManage ? (
            <Button asChild className="gap-2">
              <Link to="/organisations/new">
                <Plus className="size-4" aria-hidden />
                New organisation
              </Link>
            </Button>
          ) : null
        }
      />

      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory" className="gap-2">
            <Building2 className="size-4" aria-hidden />
            Directory
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="gap-2">
            <Network className="size-4" aria-hidden />
            Hierarchy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="size-4" aria-hidden />
                Search &amp; filters
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="org-search">Search</Label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden
                  />
                  <Input
                    id="org-search"
                    className="pl-9"
                    placeholder="Name, slug or city"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-type-filter">Type</Label>
                <Select value={type} onValueChange={(v) => setType(v as OrgType | "all")}>
                  <SelectTrigger id="org-type-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {ORG_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {ORG_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-status-filter">Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as OrgStatus | "all")}>
                  <SelectTrigger id="org-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {ORG_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {ORG_STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3 md:col-span-4">
                <Switch
                  id="include-deleted"
                  checked={includeDeleted}
                  onCheckedChange={setIncludeDeleted}
                />
                <Label htmlFor="include-deleted" className="font-normal">
                  Include deleted organisations
                </Label>
              </div>
            </CardContent>
          </Card>

          {listQuery.isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          )}

          {listQuery.isError && (
            <Card className="border-destructive/40">
              <CardContent className="p-6">
                <p role="alert" className="text-sm text-destructive">
                  Could not load organisations. {(listQuery.error as Error).message}
                </p>
                <Button className="mt-4" variant="outline" onClick={() => listQuery.refetch()}>
                  Try again
                </Button>
              </CardContent>
            </Card>
          )}

          {!listQuery.isLoading && !listQuery.isError && rows.length === 0 && (
            <EmptyState
              icon={Building2}
              title="No organisations found"
              description="Adjust your filters, or create the first organisation for this ecosystem."
              action={
                canManage ? (
                  <Button asChild>
                    <Link to="/organisations/new">Create organisation</Link>
                  </Button>
                ) : undefined
              }
            />
          )}

          {rows.length > 0 && (
            <>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((org) => (
                  <li key={org.id}>
                    <Link
                      to="/organisations/$orgId"
                      params={{ orgId: org.id }}
                      className="block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Card className="h-full transition-colors hover:border-primary/50">
                        <CardContent className="space-y-3 p-5">
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden
                              className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary-subtle text-primary"
                            >
                              {org.logo_url ? (
                                <img src={org.logo_url} alt="" className="size-full object-cover" />
                              ) : (
                                <Building2 className="size-5" />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">{org.name}</p>
                              <p className="truncate text-xs text-muted-foreground">/{org.slug}</p>
                            </div>
                          </div>
                          <p className="line-clamp-2 text-sm text-muted-foreground">
                            {org.description || "No description provided yet."}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <OrgTypeBadge type={org.type as OrgType} />
                            <OrgStatusBadge status={org.status as OrgStatus} />
                            {org.deleted_at && <Badge variant="destructive">Deleted</Badge>}
                          </div>
                          {org.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {org.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>

              <nav
                aria-label="Pagination"
                className="flex flex-wrap items-center justify-between gap-3"
              >
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  Showing {(page - 1) * ORG_LIST_PAGE_SIZE + 1}–
                  {Math.min(page * ORG_LIST_PAGE_SIZE, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </nav>
            </>
          )}
        </TabsContent>

        <TabsContent value="hierarchy" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ecosystem hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              {treeQuery.isLoading && <Skeleton className="h-48 w-full" />}
              {!treeQuery.isLoading && forest.length === 0 && (
                <EmptyState
                  icon={Network}
                  title="No hierarchy yet"
                  description="Once organisations are created and linked to a parent, the tree appears here."
                />
              )}
              {forest.length > 0 && <OrgHierarchyTree nodes={forest} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
