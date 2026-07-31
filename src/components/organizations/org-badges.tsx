import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ORG_STATUS_LABELS,
  ORG_TYPE_LABELS,
  type OrgStatus,
  type OrgType,
} from "@/lib/validation/org";

const STATUS_CLASSES: Record<OrgStatus, string> = {
  active: "border-transparent bg-primary-subtle text-primary",
  inactive: "border-transparent bg-muted text-muted-foreground",
  suspended: "border-transparent bg-destructive/10 text-destructive",
  archived: "border-transparent bg-accent text-accent-foreground",
};

export function OrgStatusBadge({ status, className }: { status: OrgStatus; className?: string }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASSES[status], className)}>
      <span className="sr-only">Status: </span>
      {ORG_STATUS_LABELS[status]}
    </Badge>
  );
}

export function OrgTypeBadge({ type, className }: { type: OrgType; className?: string }) {
  return (
    <Badge variant="secondary" className={cn("font-medium", className)}>
      <span className="sr-only">Type: </span>
      {ORG_TYPE_LABELS[type] ?? type}
    </Badge>
  );
}
