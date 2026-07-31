import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRightLeft, Building2, GitMerge, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrgStatusBadge, OrgTypeBadge } from "@/components/organizations/org-badges";
import { OrgHierarchyTree } from "@/components/organizations/org-hierarchy-tree";
import { supabase } from "@/integrations/supabase/client";
import {
  buildOrgTree,
  descendantIds,
  organizationTreeQuery,
  orgPath,
  type OrganizationRow,
} from "@/lib/organizations";
import type { OrgStatus, OrgType } from "@/lib/validation/org";
import { audit } from "@/lib/audit";

export function OrgHierarchyTab({
  org,
  canManage,
}: {
  org: OrganizationRow;
  canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const treeQuery = useQuery(organizationTreeQuery());
  const allRows = treeQuery.data ?? [];

  const parentOrg = allRows.find((r) => r.id === org.parent_id);
  const childOrgs = allRows.filter((r) => r.parent_id === org.id);
  const breadcrumb = orgPath(allRows, org.id);
  const invalidParents = React.useMemo(() => {
    const set = descendantIds(allRows, org.id);
    set.add(org.id);
    return set;
  }, [allRows, org.id]);

  const candidateParents = allRows.filter((r) => !invalidParents.has(r.id));
  const forest = React.useMemo(() => buildOrgTree(allRows), [allRows]);

  const [moveOpen, setMoveOpen] = React.useState(false);
  const [targetParentId, setTargetParentId] = React.useState<string>(org.parent_id ?? "none");

  const moveMutation = useMutation({
    mutationFn: async (newParentId: string | null) => {
      const { error } = await supabase
        .from("organizations")
        .update({ parent_id: newParentId })
        .eq("id", org.id);
      if (error) throw error;
    },
    onSuccess: async (_, newParentId) => {
      await audit("org.moved", {
        orgId: org.id,
        entity: "organizations",
        entityId: org.id,
        metadata: { oldParentId: org.parent_id, newParentId },
      });
      toast.success("Organisation moved in hierarchy");
      setMoveOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["organization", org.id] });
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CardTitle>Lineage</CardTitle>
                <CardDescription>Path from the root federation down to this organisation.</CardDescription>
              </div>
              {canManage && (
                <Dialog open={moveOpen} onOpenChange={setMoveOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <ArrowRightLeft className="size-4" aria-hidden />
                      Move organisation
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Move in hierarchy</DialogTitle>
                      <DialogDescription>
                        Select a new parent organisation. Selecting "None" makes {org.name} a top-level root organisation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Select value={targetParentId} onValueChange={setTargetParentId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None (Top-level root)</SelectItem>
                          {candidateParents.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" type="button" onClick={() => setMoveOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        disabled={moveMutation.isPending}
                        onClick={() =>
                          moveMutation.mutate(targetParentId === "none" ? null : targetParentId)
                        }
                      >
                        {moveMutation.isPending && <Loader2 className="size-4 animate-spin" />}
                        Confirm move
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">Path</p>
              <nav aria-label="Breadcrumb" className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                {breadcrumb.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    {idx > 0 && <span className="text-muted-foreground">/</span>}
                    <Link
                      to="/organisations/$orgId"
                      params={{ orgId: step.id }}
                      className="font-medium hover:underline"
                    >
                      {step.name}
                    </Link>
                  </React.Fragment>
                ))}
              </nav>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">Parent</p>
                {parentOrg ? (
                  <div className="mt-1 flex items-center justify-between">
                    <Link
                      to="/organisations/$orgId"
                      params={{ orgId: parentOrg.id }}
                      className="font-medium hover:underline"
                    >
                      {parentOrg.name}
                    </Link>
                    <OrgTypeBadge type={parentOrg.type as OrgType} />
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Top-level root organisation</p>
                )}
              </div>

              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Direct sub-organisations
                </p>
                <p className="mt-1 text-lg font-bold">{childOrgs.length}</p>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                Child organisations ({childOrgs.length})
              </p>
              {childOrgs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No child organisations registered.</p>
              ) : (
                <ul className="divide-y rounded-lg border">
                  {childOrgs.map((child) => (
                    <li
                      key={child.id}
                      className="flex flex-wrap items-center justify-between gap-2 p-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" aria-hidden />
                        <Link
                          to="/organisations/$orgId"
                          params={{ orgId: child.id }}
                          className="font-medium hover:underline"
                        >
                          {child.name}
                        </Link>
                      </div>
                      <div className="flex items-center gap-2">
                        <OrgTypeBadge type={child.type as OrgType} />
                        <OrgStatusBadge status={child.status as OrgStatus} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Merge Organisation (Placeholder)</CardTitle>
            <CardDescription>
              Consolidate memberships and records from another organisation into {org.name}.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted text-muted-foreground">
                <GitMerge className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">Enterprise Consolidation</p>
                <p className="text-xs text-muted-foreground">
                  Requires two-person administrative approval and federation signature.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Configure Merge Flow
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Ecosystem Tree</CardTitle>
          <CardDescription>Full Touchline federation and club hierarchy.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrgHierarchyTree nodes={forest} activeId={org.id} />
        </CardContent>
      </Card>
    </div>
  );
}
