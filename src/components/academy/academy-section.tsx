import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { supabase } from "@/integrations/supabase/client";
import { audit, type AuditAction } from "@/lib/audit";
import { academyKeys } from "@/lib/academy";

/**
 * Shared building blocks for every Academy module section: consistent
 * skeleton / empty / error handling and a single audited CRUD hook so all
 * write paths log to `audit_logs` and invalidate the same cache keys.
 */

export function SectionState({
  isLoading,
  error,
  isEmpty,
  skeletonRows = 3,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  onRetry,
  children,
}: {
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  skeletonRows?: number;
  emptyIcon: LucideIcon;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
  onRetry?: () => void;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading…</span>
        {Array.from({ length: skeletonRows }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTriangle className="size-4" aria-hidden />
        <AlertTitle>We couldn't load this section</AlertTitle>
        <AlertDescription className="flex flex-col items-start gap-3">
          <span>{error instanceof Error ? error.message : "Unexpected error. Please try again."}</span>
          {onRetry && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return <>{children}</>;
}

export interface AcademyCrudOptions {
  orgId: string;
  table: string;
  /** Cache section key used by the matching query in `@/lib/academy`. */
  section: string;
  entity: string;
  actions: { create: AuditAction; update: AuditAction; remove: AuditAction };
}

/** Audited create / update / delete against an org-scoped academy table. */
export function useAcademyCrud({ orgId, table, section, entity, actions }: AcademyCrudOptions) {
  const queryClient = useQueryClient();

  const invalidate = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: academyKeys.section(orgId, section) });
    queryClient.invalidateQueries({ queryKey: ["organization", orgId, "activity"] });
  }, [queryClient, orgId, section]);

  const create = useMutation({
    mutationFn: async (values: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from(table as never)
        .insert({ ...values, org_id: orgId } as never)
        .select("id")
        .single();
      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: (data, values) => {
      void audit(actions.create, {
        orgId,
        entity,
        entityId: data?.id,
        metadata: { name: values.name ?? values.title ?? values.full_name ?? null },
      });
      invalidate();
      toast.success(`${entity} created`);
    },
    onError: (error: Error) => toast.error(error.message || `Could not create ${entity.toLowerCase()}`),
  });

  const update = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Record<string, unknown> }) => {
      const { error } = await supabase
        .from(table as never)
        .update(values as never)
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id, variables) => {
      void audit(actions.update, {
        orgId,
        entity,
        entityId: id,
        metadata: { fields: Object.keys(variables.values) },
      });
      invalidate();
      toast.success(`${entity} updated`);
    },
    onError: (error: Error) => toast.error(error.message || `Could not update ${entity.toLowerCase()}`),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from(table as never)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      void audit(actions.remove, { orgId, entity, entityId: id });
      invalidate();
      toast.success(`${entity} deleted`);
    },
    onError: (error: Error) => toast.error(error.message || `Could not delete ${entity.toLowerCase()}`),
  });

  return { create, update, remove, invalidate };
}

/** Read-only banner shown to members without organisation admin rights. */
export function ReadOnlyNotice({ canManage }: { canManage: boolean }) {
  if (canManage) return null;
  return (
    <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      You have read-only access to this academy. Organisation admins can make changes.
    </p>
  );
}
