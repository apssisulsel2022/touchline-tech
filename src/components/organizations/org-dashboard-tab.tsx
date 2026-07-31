import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Building2,
  FileText,
  History,
  Network,
  Plus,
  Settings,
  Shield,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { OrgStatusBadge, OrgTypeBadge } from "@/components/organizations/org-badges";
import {
  orgActivityQuery,
  orgChildrenQuery,
  orgDocumentsQuery,
  orgMembersQuery,
  type OrganizationRow,
} from "@/lib/organizations";
import { type OrgStatus, type OrgType } from "@/lib/validation/org";

export function OrgDashboardTab({
  org,
  canManage,
  onSelectTab,
}: {
  org: OrganizationRow;
  canManage: boolean;
  onSelectTab: (tab: string) => void;
}) {
  const members = useQuery(orgMembersQuery(org.id));
  const children = useQuery(orgChildrenQuery(org.id));
  const documents = useQuery(orgDocumentsQuery(org.id));
  const activity = useQuery(orgActivityQuery(org.id));

  const memberCount = members.data?.length ?? 0;
  const childCount = children.data?.length ?? 0;
  const documentCount = documents.data?.length ?? 0;
  const recentActivity = (activity.data ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            {members.isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold">{memberCount}</p>
            )}
            <p className="text-xs text-muted-foreground">Active in this tenant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sub-organisations</CardTitle>
            <Network className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            {children.isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold">{childCount}</p>
            )}
            <p className="text-xs text-muted-foreground">Direct child tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent>
            {documents.isLoading ? (
              <Skeleton className="h-7 w-16" />
            ) : (
              <p className="text-2xl font-bold">{documentCount}</p>
            )}
            <p className="text-xs text-muted-foreground">Statutes &amp; licences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status &amp; Type</CardTitle>
            <Shield className="size-4 text-muted-foreground" aria-hidden />
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex flex-wrap gap-1.5">
              <OrgTypeBadge type={org.type as OrgType} />
              <OrgStatusBadge status={org.status as OrgStatus} />
            </div>
            <p className="text-xs text-muted-foreground truncate">/{org.slug}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent administrative activity</CardTitle>
              <CardDescription>
                Latest events logged against {org.name} across memberships and governance.
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onSelectTab("activity")}>
              View all
            </Button>
          </CardHeader>
          <CardContent>
            {activity.isLoading && <Skeleton className="h-32 w-full" />}
            {!activity.isLoading && recentActivity.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No administrative activity logged yet.
              </p>
            )}
            {recentActivity.length > 0 && (
              <ul className="divide-y">
                {recentActivity.map((row) => (
                  <li key={row.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="font-medium">{row.action}</span>
                    <time dateTime={row.createdAt} className="text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tenant Quick Actions</CardTitle>
            <CardDescription>Shortcut to key tenant operations.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onSelectTab("members")}
            >
              <Users className="size-4 text-primary" aria-hidden />
              Manage members &amp; roles
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onSelectTab("hierarchy")}
            >
              <Network className="size-4 text-primary" aria-hidden />
              Hierarchy &amp; lineage
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => onSelectTab("documents")}
            >
              <FileText className="size-4 text-primary" aria-hidden />
              View documents
            </Button>
            {canManage && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => onSelectTab("settings")}
              >
                <Settings className="size-4 text-primary" aria-hidden />
                Organisation settings
              </Button>
            )}
            <Button asChild variant="secondary" className="mt-2 w-full gap-2">
              <Link to="/organisations/new">
                <Plus className="size-4" aria-hidden />
                Create child organisation
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
