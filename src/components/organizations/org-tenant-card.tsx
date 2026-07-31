import { Building2, KeyRound, Layers, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OrgStatusBadge, OrgTypeBadge } from "@/components/organizations/org-badges";
import { ROLE_LABELS, type Role } from "@/lib/rbac";
import type { OrganizationRow, OrgSettings } from "@/lib/organizations";
import type { OrgStatus, OrgType } from "@/lib/validation/org";

export function OrgTenantCard({
  org,
  role,
}: {
  org: OrganizationRow;
  role: Role | null;
}) {
  const settings = (org.settings ?? {}) as OrgSettings;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layers className="size-5 text-primary" aria-hidden />
              Tenant Context &amp; Isolation
            </CardTitle>
            <CardDescription>
              Row-Level Security (RLS) guarantees data isolation for tenant <code className="font-mono text-xs">{org.slug}</code>.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <OrgTypeBadge type={org.type as OrgType} />
            <OrgStatusBadge status={org.status as OrgStatus} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <Building2 className="size-3.5" aria-hidden />
            Tenant ID
          </div>
          <p className="font-mono text-xs truncate" title={org.id}>
            {org.id}
          </p>
          <p className="text-xs text-muted-foreground">Postgres RLS partition key</p>
        </div>

        <div className="rounded-lg border p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <KeyRound className="size-3.5" aria-hidden />
            Your Tenant Role
          </div>
          <p className="font-semibold text-sm">
            {role ? ROLE_LABELS[role] : "No explicit membership"}
          </p>
          <p className="text-xs text-muted-foreground">RBAC permission scope</p>
        </div>

        <div className="rounded-lg border p-3.5 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden />
            Security Posture
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <Badge variant="outline" className="text-xs">
              MFA {settings.requireMfaForAdmins ? "Required" : "Optional"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Directory {settings.allowPublicDirectory ? "Listed" : "Private"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
