import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function greet(name: string) {
  const hour = new Date().getHours();
  if (hour < 5) return `Still up, ${name}?`;
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 18) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

/**
 * Reusable welcome banner for role dashboards. Presentation-only — feed it a
 * name, a role/context label and optional CTAs.
 */
export function WelcomeBanner({
  displayName,
  contextLabel,
  actions,
  className,
}: {
  displayName: string;
  contextLabel?: string;
  actions?: ReactNode;
  className?: string;
}) {
  const first = displayName.split(" ")[0] ?? displayName;
  return (
    <Card
      className={cn(
        "overflow-hidden border-none bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground shadow-none",
        className,
      )}
    >
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="min-w-0 space-y-1">
          {contextLabel && (
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/80">
              {contextLabel}
            </p>
          )}
          <h2 className="font-display text-2xl font-bold sm:text-3xl">{greet(first)}</h2>
          <p className="text-sm text-primary-foreground/80">
            Here's what's happening across your workspace today.
          </p>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </CardContent>
    </Card>
  );
}
