import { createFileRoute } from "@tanstack/react-router";
import { Check, Shield } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ROLES, ROLE_LABELS, ROLE_PERMISSIONS, type Permission } from "@/lib/rbac";

const ALL_PERMISSIONS: Permission[] = [
  "dashboard:view",
  "tenants:manage",
  "governance:manage",
  "org:manage",
  "people:view",
  "competitions:view",
  "matches:view",
  "finance:view",
  "medical:view",
  "analytics:view",
  "settings:manage",
];

const PERMISSION_LABELS: Record<Permission, string> = {
  "dashboard:view": "View dashboard",
  "tenants:manage": "Manage tenants",
  "governance:manage": "Manage governance",
  "org:manage": "Manage organisation",
  "people:view": "View people",
  "competitions:view": "View competitions",
  "matches:view": "View matches",
  "finance:view": "View finance",
  "medical:view": "View medical",
  "analytics:view": "View analytics",
  "settings:manage": "Manage settings",
};

export const Route = createFileRoute("/_authenticated/roles")({
  head: () => ({
    meta: [
      { title: "Roles & permissions — Touchline" },
      { name: "description", content: "Review the platform's role and permission matrix." },
      { property: "og:title", content: "Roles & permissions — Touchline" },
      { property: "og:description", content: "Roles, permissions and access boundaries." },
    ],
  }),
  component: RolesPage,
});

function RolesPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      <PageHeader
        icon={Shield}
        title="Roles & permissions"
        description="Access boundaries for every role across the Touchline platform."
      />
      <Card>
        <CardHeader>
          <CardTitle>Permission matrix</CardTitle>
          <CardDescription>
            Server-side authorisation always wins — this matrix documents the derived
            role → permission mapping used by the shell.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 z-10 bg-background">Permission</TableHead>
                {ROLES.map((r) => (
                  <TableHead key={r} className="whitespace-nowrap text-center">
                    {ROLE_LABELS[r]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ALL_PERMISSIONS.map((p) => (
                <TableRow key={p}>
                  <TableCell className="sticky left-0 z-10 bg-background font-medium">
                    {PERMISSION_LABELS[p]}
                  </TableCell>
                  {ROLES.map((r) => {
                    const allowed = ROLE_PERMISSIONS[r].includes(p);
                    return (
                      <TableCell key={r} className="text-center">
                        {allowed ? (
                          <Check className="mx-auto size-4 text-primary" aria-label="Allowed" />
                        ) : (
                          <span aria-label="Not allowed" className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  );
}
