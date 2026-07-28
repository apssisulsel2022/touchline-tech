import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROLE_LABELS } from "@/lib/rbac";
import { useAuth } from "@/providers/auth-provider";
import { audit } from "@/lib/audit";

export function OrgSwitcher() {
  const { session, memberships, switchOrganization } = useAuth();
  const activeName = session?.organizationName ?? "No organisation";
  const activeId = session?.organizationId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 max-w-[240px] gap-2 pl-2 pr-2 lg:inline-flex"
        >
          <span
            aria-hidden
            className="grid size-6 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary"
          >
            <Building2 className="size-3.5" />
          </span>
          <span className="min-w-0 truncate text-left font-medium">{activeName}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Your organisations
        </DropdownMenuLabel>
        {memberships.length === 0 && (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            You aren't a member of any organisation yet.
          </div>
        )}
        {memberships.map((m) => (
          <DropdownMenuItem
            key={m.orgId}
            className="gap-2"
            onSelect={async () => {
              if (m.orgId === activeId) return;
              await switchOrganization(m.orgId);
              await audit("org.switched", { orgId: m.orgId });
            }}
          >
            <Building2 className="size-4" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{m.orgName}</div>
              <div className="truncate text-xs text-muted-foreground">{ROLE_LABELS[m.role]}</div>
            </div>
            {m.orgId === activeId && <Check className="size-4 text-primary" aria-hidden />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/organisations/new" className="gap-2">
            <Plus className="size-4" aria-hidden />
            Create organisation
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
