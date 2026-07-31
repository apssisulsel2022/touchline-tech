import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { orgActivityQuery } from "@/lib/organizations";

const ACTION_LABELS: Record<string, string> = {
  "org.created": "Organisation created",
  "org.updated": "Organisation profile updated",
  "org.settings_updated": "Organisation settings saved",
  "org.archived": "Organisation archived",
  "org.restored": "Organisation restored",
  "org.deleted": "Organisation soft-deleted",
  "org.moved": "Organisation hierarchy changed",
  "org.ownership_transferred": "Ownership transferred",
  "org.document_added": "Document linked",
  "org.document_removed": "Document unlinked",
  "member.role_changed": "Member role updated",
  "member.removed": "Member removed",
  "invitation.sent": "Member invitation sent",
  "invitation.accepted": "Invitation accepted",
  "invitation.rejected": "Invitation rejected",
  "invitation.revoked": "Invitation revoked",
};

export function OrgAuditTab({ orgId }: { orgId: string }) {
  const activity = useQuery(orgActivityQuery(orgId));
  const rows = activity.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit &amp; activity log</CardTitle>
        <CardDescription>
          Immutable chronological record of administrative and membership actions for this tenant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {activity.isLoading && <Skeleton className="h-40 w-full" />}
        {activity.isError && (
          <p role="alert" className="text-sm text-destructive">
            Could not load audit logs. {(activity.error as Error).message}
          </p>
        )}
        {!activity.isLoading && rows.length === 0 && (
          <EmptyState
            icon={History}
            title="No activity recorded yet"
            description="Changes to this organisation's profile, settings or members will appear here."
          />
        )}
        {rows.length > 0 && (
          <ol className="relative border-l ml-2 space-y-4">
            {rows.map((row) => (
              <li key={row.id} className="ml-4">
                <div
                  className="absolute -left-1.5 mt-1.5 size-3 rounded-full border border-background bg-primary"
                  aria-hidden
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium">
                    {ACTION_LABELS[row.action] ?? row.action}
                  </p>
                  <time
                    dateTime={row.createdAt}
                    className="text-xs text-muted-foreground"
                  >
                    {new Date(row.createdAt).toLocaleString()}
                  </time>
                </div>
                {row.entity && (
                  <p className="text-xs text-muted-foreground">Entity: {row.entity}</p>
                )}
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
