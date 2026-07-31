import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Archive, ArchiveRestore, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { audit } from "@/lib/audit";
import type { OrganizationRow } from "@/lib/organizations";
import { ORG_STATUSES, ORG_STATUS_LABELS, type OrgStatus } from "@/lib/validation/org";
import { useAuth } from "@/providers/auth-provider";

export function OrgDangerZone({ org }: { org: OrganizationRow }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [confirmName, setConfirmName] = React.useState("");
  const isArchived = org.status === "archived";

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["organization", org.id] });
    await queryClient.invalidateQueries({ queryKey: ["organizations"] });
  };

  const setStatus = useMutation({
    mutationFn: async (status: OrgStatus) => {
      const { error } = await supabase
        .from("organizations")
        .update({
          status,
          archived_at: status === "archived" ? new Date().toISOString() : null,
          archived_by: status === "archived" ? session?.userId ?? null : null,
        })
        .eq("id", org.id);
      if (error) throw error;
    },
    onSuccess: async (_d, status) => {
      await audit(status === "archived" ? "org.archived" : "org.restored", {
        orgId: org.id,
        entity: "organizations",
        entityId: org.id,
        metadata: { status },
      });
      toast.success(status === "archived" ? "Organisation archived" : "Organisation status updated");
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const softDelete = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("organizations")
        .update({
          deleted_at: new Date().toISOString(),
          status: "archived",
          archived_at: new Date().toISOString(),
          archived_by: session?.userId ?? null,
        })
        .eq("id", org.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await audit("org.deleted", {
        orgId: org.id,
        entity: "organizations",
        entityId: org.id,
        metadata: { soft: true },
      });
      toast.success("Organisation deleted (recoverable)");
      await invalidate();
      navigate({ to: "/organisations" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const restore = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("organizations")
        .update({ deleted_at: null, status: "active", archived_at: null, archived_by: null })
        .eq("id", org.id);
      if (error) throw error;
    },
    onSuccess: async () => {
      await audit("org.restored", { orgId: org.id, entity: "organizations", entityId: org.id });
      toast.success("Organisation restored");
      await invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Lifecycle status</CardTitle>
          <CardDescription>
            Suspending or deactivating blocks operational workflows without losing data.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-2">
            <Label htmlFor="org-status">Status</Label>
            <Select
              value={org.status}
              onValueChange={(v) => setStatus.mutate(v as OrgStatus)}
              disabled={setStatus.isPending}
            >
              <SelectTrigger id="org-status" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORG_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORG_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {setStatus.isPending && <Loader2 className="mb-2 size-4 animate-spin" aria-hidden />}
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Archiving hides the organisation from active workflows. Deleting is a recoverable soft
            delete retained for audit purposes.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {org.deleted_at ? (
            <Button
              variant="outline"
              className="gap-2"
              disabled={restore.isPending}
              onClick={() => restore.mutate()}
            >
              {restore.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <ArchiveRestore className="size-4" aria-hidden />
              )}
              Restore organisation
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                className="gap-2"
                disabled={setStatus.isPending}
                onClick={() => setStatus.mutate(isArchived ? "active" : "archived")}
              >
                {isArchived ? (
                  <ArchiveRestore className="size-4" aria-hidden />
                ) : (
                  <Archive className="size-4" aria-hidden />
                )}
                {isArchived ? "Unarchive" : "Archive organisation"}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="size-4" aria-hidden />
                    Delete organisation
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {org.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This performs a soft delete: the organisation is removed from all directories
                      and dashboards but remains recoverable by an administrator. Type the
                      organisation name to confirm.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-name">Organisation name</Label>
                    <Input
                      id="confirm-name"
                      value={confirmName}
                      onChange={(e) => setConfirmName(e.target.value)}
                      placeholder={org.name}
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setConfirmName("")}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={confirmName !== org.name || softDelete.isPending}
                      onClick={(e) => {
                        e.preventDefault();
                        softDelete.mutate();
                      }}
                    >
                      {softDelete.isPending && <Loader2 className="size-4 animate-spin" />}
                      Delete organisation
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
