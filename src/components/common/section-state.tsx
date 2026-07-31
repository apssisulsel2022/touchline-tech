import * as React from "react";
import { AlertTriangle, type LucideIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";

/**
 * Shared loading / error / empty presentation for any module section.
 * Domain modules compose this instead of hand-rolling their own states so the
 * accessibility contract (aria-busy, role="alert", retry affordance) is
 * consistent platform-wide.
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

/** Read-only banner shown to members without organisation admin rights. */
export function ReadOnlyNotice({
  canManage,
  message = "You have read-only access here. Organisation admins can make changes.",
}: {
  canManage: boolean;
  message?: string;
}) {
  if (canManage) return null;
  return (
    <p className="rounded-lg border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      {message}
    </p>
  );
}
