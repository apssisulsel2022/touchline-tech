import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Moon, Search, ShieldCheck, Sun, User } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationCenter } from "@/components/layout/notification-center";
import { OrgSwitcher } from "@/components/layout/org-switcher";
import { ROLE_NAVIGATION } from "@/lib/navigation";
import { ROLE_LABELS } from "@/lib/rbac";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";

function useBreadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => ({
      label: segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      href: "/" + segments.slice(0, index + 1).join("/"),
      isLast: index === segments.length - 1,
    }));
  }, [pathname]);
}

export function Topbar() {
  const { session, role, signOut, hasPermission } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const crumbs = useBreadcrumbs();
  const [commandOpen, setCommandOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commandItems = React.useMemo(
    () =>
      (role ? ROLE_NAVIGATION[role] : [])
        .flatMap((group) => group.items)
        .filter((item) => !item.permission || hasPermission(item.permission)),
    [role, hasPermission],
  );

  const initials = (session?.displayName ?? "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4">
      <SidebarTrigger className="shrink-0" />

      <OrgSwitcher />

      <nav aria-label="Breadcrumb" className="hidden min-w-0 flex-1 md:block">
        <Breadcrumb>
          <BreadcrumbList>
            {crumbs.map((crumb) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem className="min-w-0">
                  {crumb.isLast ? (
                    <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!crumb.isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </nav>

      <div className="ml-auto flex shrink-0 items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCommandOpen(true)}
          className="hidden h-9 gap-2 text-muted-foreground sm:inline-flex"
        >
          <Search className="size-4" aria-hidden />
          <span>Search</span>
          <kbd className="rounded border bg-muted px-1 text-[10px]">⌘K</kbd>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 sm:hidden"
          aria-label="Search"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="size-4" aria-hidden />
        </Button>

        <NotificationCenter
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="relative min-h-11 min-w-11"
              aria-label="Notifications"
            >
              <Bell className="size-4" aria-hidden />
            </Button>
          }
        />

        <Button
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11"
          onClick={toggleTheme}
          aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="size-4" aria-hidden />
          ) : (
            <Moon className="size-4" aria-hidden />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Account menu">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary-subtle text-xs font-semibold text-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="space-y-1">
              <span className="block truncate text-sm">{session?.displayName}</span>
              <span className="block truncate text-xs font-normal text-muted-foreground">
                {session?.email}
              </span>
              {role && (
                <Badge variant="secondary" className="mt-1">
                  {ROLE_LABELS[role]}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/settings" })}>
              <User className="size-4" aria-hidden /> Profile & settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/reset-password" })}>
              <ShieldCheck className="size-4" aria-hidden /> Security
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => {
                signOut();
                navigate({ to: "/auth", replace: true });
              }}
            >
              <LogOut className="size-4" aria-hidden /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search navigation and actions…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigation">
            {commandItems.map((item) => (
              <CommandItem
                key={item.to}
                value={item.title}
                onSelect={() => {
                  setCommandOpen(false);
                  navigate({ to: item.comingSoon ? "/dashboard" : item.to });
                }}
              >
                <item.icon className="size-4" aria-hidden />
                {item.title}
                {item.comingSoon && (
                  <span className="ml-auto text-xs text-muted-foreground">Soon</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
