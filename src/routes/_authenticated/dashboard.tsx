import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardCheck,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLE_LABELS } from "@/lib/rbac";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Touchline" },
      {
        name: "description",
        content:
          "Your Touchline workspace overview: registrations, fixtures, compliance and squad activity at a glance.",
      },
      { property: "og:title", content: "Dashboard — Touchline" },
      {
        property: "og:description",
        content: "Role-aware overview of your football organisation on Touchline.",
      },
    ],
  }),
  component: DashboardPage,
});

const KPIS = [
  { label: "Registered players", value: "—", hint: "Awaiting People module", icon: Users },
  { label: "Verified digital IDs", value: "—", hint: "Awaiting Identity module", icon: ShieldCheck },
  { label: "Upcoming fixtures", value: "—", hint: "Awaiting Competition module", icon: CalendarDays },
  { label: "Open approvals", value: "—", hint: "Awaiting Workflow module", icon: ClipboardCheck },
];

function DashboardPage() {
  const { session, role } = useAuth();

  return (
    <>
      <PageHeader
        title={`Welcome back, ${session?.displayName?.split(" ")[0] ?? "there"}`}
        description={
          role
            ? `${ROLE_LABELS[role]} workspace · ${session?.organizationName ?? ""}`
            : undefined
        }
        actions={
          <Button asChild variant="outline">
            <Link to="/settings">
              Workspace settings
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </Button>
        }
      />

      <section aria-label="Key metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-bold tabular-nums">{kpi.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4" aria-hidden />
              Activity
            </CardTitle>
            <CardDescription>
              Domain modules plug their widgets into this region.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmptyState
              icon={TrendingUp}
              title="No activity yet"
              description="This is the shell release. Once the People, Competition and Match modules ship, their activity streams appear here."
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shell status</CardTitle>
            <CardDescription>What's live in this release.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              ["Design tokens", "Ready"],
              ["Role-aware navigation", "Ready"],
              ["Auth & permissions", "Local"],
              ["Business modules", "Pending"],
            ].map(([item, status]) => (
              <div key={item} className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-muted-foreground">{item}</span>
                <Badge variant={status === "Pending" ? "outline" : "secondary"}>{status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
