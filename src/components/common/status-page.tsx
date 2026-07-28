import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Full-viewport status page primitive. Used for 404/500/offline/maintenance/
 * unauthorized/session-expired screens so every dedicated status route shares
 * one accessible layout.
 */
export function StatusPage({
  icon: Icon,
  code,
  title,
  description,
  actions,
  tone = "default",
  className,
}: {
  icon?: LucideIcon;
  code?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  tone?: "default" | "destructive" | "warning";
  className?: string;
}) {
  const toneClass =
    tone === "destructive"
      ? "bg-destructive/10 text-destructive"
      : tone === "warning"
        ? "bg-warning/10 text-warning"
        : "bg-primary-subtle text-primary";

  return (
    <main
      role="alert"
      className={cn(
        "grid min-h-dvh place-items-center bg-background px-4 py-10",
        className,
      )}
    >
      <div className="w-full max-w-md text-center">
        {Icon && (
          <span
            aria-hidden
            className={cn(
              "mx-auto mb-6 grid size-14 place-items-center rounded-2xl",
              toneClass,
            )}
          >
            <Icon className="size-6" />
          </span>
        )}
        {code && (
          <p className="font-display text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
            {code}
          </p>
        )}
        <h1 className="mt-3 text-xl font-semibold text-foreground sm:text-2xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {actions && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">{actions}</div>
        )}
      </div>
    </main>
  );
}
