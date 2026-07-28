import { Building2, Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/auth-provider";

/**
 * Header org switcher. This release shows the active organisation only —
 * multi-org membership arrives with the Tenants module and will populate the
 * menu list.
 */
export function OrgSwitcher() {
  const { session } = useAuth();
  const org = session?.organizationName ?? "Workspace";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 max-w-[220px] gap-2 pl-2 pr-2 lg:inline-flex"
        >
          <span
            aria-hidden
            className="grid size-6 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary"
          >
            <Building2 className="size-3.5" />
          </span>
          <span className="min-w-0 truncate text-left font-medium">{org}</span>
          <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          Active organisation
        </DropdownMenuLabel>
        <DropdownMenuItem className="gap-2">
          <Building2 className="size-4" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{org}</span>
          <Check className="size-4 text-primary" aria-hidden />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Multi-organisation membership arrives with the Tenants module.
        </DropdownMenuLabel>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
