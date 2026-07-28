import * as React from "react";
import { BellRing, Check, Inbox } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/**
 * Shell-level notification center. Data source is intentionally empty until
 * the notifications domain module lands; the tri-tab layout (All / Unread /
 * Archived) and mark-all-read affordances are the durable surface.
 */

export interface ShellNotification {
  id: string;
  title: string;
  body: string;
  ts: string;
  read: boolean;
  archived?: boolean;
}

interface NotificationCenterProps {
  trigger: React.ReactNode;
  notifications?: ShellNotification[];
}

export function NotificationCenter({
  trigger,
  notifications = [],
}: NotificationCenterProps) {
  const [items, setItems] = React.useState<ShellNotification[]>(notifications);

  React.useEffect(() => setItems(notifications), [notifications]);

  const unread = items.filter((n) => !n.read && !n.archived);
  const archived = items.filter((n) => n.archived);

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => (n.archived ? n : { ...n, read: true })));

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <SheetTitle className="flex items-center gap-2 font-display text-xl">
                Notifications
                {unread.length > 0 && (
                  <Badge variant="secondary" className="tabular-nums">
                    {unread.length}
                  </Badge>
                )}
              </SheetTitle>
              <SheetDescription>Alerts and updates from your workspace.</SheetDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              disabled={unread.length === 0}
              className="shrink-0"
            >
              <Check className="size-4" aria-hidden />
              Mark all read
            </Button>
          </div>
        </SheetHeader>

        <Tabs defaultValue="all" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread {unread.length > 0 && `(${unread.length})`}
            </TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="min-h-0 flex-1">
            <NotificationList items={items.filter((n) => !n.archived)} />
          </TabsContent>
          <TabsContent value="unread" className="min-h-0 flex-1">
            <NotificationList items={unread} />
          </TabsContent>
          <TabsContent value="archived" className="min-h-0 flex-1">
            <NotificationList items={archived} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function NotificationList({ items }: { items: ShellNotification[] }) {
  if (items.length === 0) {
    return (
      <div className="px-6 py-8">
        <EmptyState
          icon={Inbox}
          title="Nothing here yet"
          description="You're all caught up. New alerts from the platform will appear here."
        />
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <ul className="divide-y">
        {items.map((n) => (
          <li
            key={n.id}
            className={cn(
              "flex gap-3 px-6 py-4",
              !n.read && "bg-primary-subtle/40",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "mt-1 grid size-8 shrink-0 place-items-center rounded-lg",
                n.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground",
              )}
            >
              <BellRing className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{n.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.ts}</p>
            </div>
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
