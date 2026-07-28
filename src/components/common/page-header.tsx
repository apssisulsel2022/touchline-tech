import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 pb-6 sm:flex sm:flex-wrap sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        {Icon && (
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary-subtle text-primary"
          >
            <Icon className="size-5" />
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
