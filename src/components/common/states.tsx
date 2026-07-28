import { Inbox, Lock, SearchX } from "lucide-react";
import type { ReactNode } from "react";

import { EmptyState } from "@/components/common/empty-state";

/** Permission-denied state for a region or a whole page. */
export function AccessDenied({
  requiredRoleLabel,
  action,
}: {
  requiredRoleLabel?: string;
  action?: ReactNode;
}) {
  return (
    <EmptyState
      icon={Lock}
      title="You don't have access to this area"
      description={
        requiredRoleLabel
          ? `This area is available to ${requiredRoleLabel}. Ask your administrator to grant access.`
          : "Your role doesn't include permission for this area. Ask your administrator to grant access."
      }
      action={action}
    />
  );
}

/** No records exist yet. */
export function NoData({
  entity = "records",
  action,
}: {
  entity?: string;
  action?: ReactNode;
}) {
  return (
    <EmptyState
      icon={Inbox}
      title={`No ${entity} yet`}
      description={`Once ${entity} are added they will appear here.`}
      action={action}
    />
  );
}

/** Records exist but the active filters exclude them all. */
export function NoResults({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={SearchX}
      title="No matching results"
      description="Try a different search term or clear the filters to see everything."
      action={
        onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Clear filters
          </button>
        ) : undefined
      }
    />
  );
}
