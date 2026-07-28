import { Link, useRouterState } from "@tanstack/react-router";
import { CircleDot } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROLE_NAVIGATION } from "@/lib/navigation";
import { ROLE_LABELS } from "@/lib/rbac";
import { useAuth } from "@/providers/auth-provider";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role, hasPermission, session } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const groups = role ? ROLE_NAVIGATION[role] : [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex min-w-0 items-center gap-2 px-2 py-1.5">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <CircleDot className="size-4" />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold">Touchline</span>
              <span className="block truncate text-xs text-muted-foreground">
                {role ? ROLE_LABELS[role] : "Guest"}
              </span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {groups.map((group) => {
          const items = group.items.filter(
            (item) => !item.permission || hasPermission(item.permission),
          );
          if (items.length === 0) return null;

          return (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.to}
                        tooltip={item.title}
                      >
                        <Link
                          to={item.comingSoon ? "/dashboard" : item.to}
                          aria-disabled={item.comingSoon || undefined}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="size-4 shrink-0" aria-hidden />
                          <span className="truncate">{item.title}</span>
                          {item.comingSoon && !collapsed && (
                            <span className="ml-auto rounded-sm bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Soon
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      {!collapsed && (
        <SidebarFooter>
          <p className="px-2 pb-1 text-xs text-muted-foreground">
            <span className="block truncate">{session?.organizationName}</span>
            <span className="block">Shell v1.0</span>
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
