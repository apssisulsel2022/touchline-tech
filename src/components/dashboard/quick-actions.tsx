import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuickAction {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  disabled?: boolean;
}

/**
 * Grid of role-relevant entry points shown near the top of a dashboard.
 * Modules populate the `actions` array; the shell only owns the layout.
 */
export function QuickActions({
  actions,
  title = "Quick actions",
  description = "Jump straight into the workflows most relevant to your role.",
}: {
  actions: QuickAction[];
  title?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary-subtle text-primary"
              >
                <Icon className="size-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{action.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {action.description}
                </span>
              </span>
              <ArrowUpRight
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </>
          );
          const baseClass = cn(
            "group flex items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors",
            action.disabled
              ? "cursor-not-allowed opacity-60"
              : "hover:border-primary/40 hover:bg-primary-subtle/30",
          );

          if (action.disabled) {
            return (
              <div key={action.title} aria-disabled className={baseClass}>
                {content}
              </div>
            );
          }

          return (
            <Link key={action.title} to={action.to} className={baseClass}>
              {content}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
