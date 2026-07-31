import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  FileText,
  Gauge,
  GraduationCap,
  History,
  Network,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrgDashboardTab } from "@/components/organizations/org-dashboard-tab";
import { OrgProfileTab } from "@/components/organizations/org-profile-tab";
import { OrgMembersTab } from "@/components/organizations/org-members-tab";
import { OrgHierarchyTab } from "@/components/organizations/org-hierarchy-tab";
import { OrgSettingsTab } from "@/components/organizations/org-settings-tab";
import { OrgDocumentsTab } from "@/components/organizations/org-documents-tab";
import { OrgAuditTab } from "@/components/organizations/org-audit-tab";
import { OrgDangerZone } from "@/components/organizations/org-danger-zone";
import { OrgTenantCard } from "@/components/organizations/org-tenant-card";
import { AcademyWorkspace } from "@/components/academy/academy-workspace";
import { organizationQuery } from "@/lib/organizations";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/organisations/$orgId")({
  head: () => ({
    meta: [
      { title: "Organisation workspace — Touchline" },
      {
        name: "description",
        content:
          "Govern a single tenant: profile, hierarchy, members, documents, settings and audit history.",
      },
      { property: "og:title", content: "Organisation workspace — Touchline" },
      {
        property: "og:description",
        content: "Tenant governance workspace inside the Touchline football ecosystem platform.",
      },
    ],
  }),
  component: OrgDetailPage,
});

function OrgDetailPage() {
  const { orgId } = Route.useParams();
  const navigate = useNavigate();
  const { hasPermission, memberships } = useAuth();
  const [tab, setTab] = React.useState("overview");

  const orgQuery = useQuery(organizationQuery(orgId));
  const org = orgQuery.data;

  const membership = memberships.find((m) => m.orgId === orgId) ?? null;
  const isAcademy = org?.type === "academy" || org?.type === "football_school";
  const canManage = hasPermission("org:manage");

  if (orgQuery.isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6" aria-busy>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-72 w-full" />
      </main>
    );
  }

  if (orgQuery.isError || !org) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
        <Card className="border-destructive/40">
          <CardContent className="space-y-4 p-8 text-center">
            <ShieldAlert className="mx-auto size-10 text-destructive" aria-hidden />
            <h1 className="text-xl font-semibold">Organisation unavailable</h1>
            <p className="text-sm text-muted-foreground">
              {orgQuery.error
                ? (orgQuery.error as Error).message
                : "This organisation does not exist, or your tenant permissions do not allow access."}
            </p>
            <Button onClick={() => navigate({ to: "/organisations" })}>
              Back to organisations
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 gap-2 -ml-2">
          <Link to="/organisations">
            <ArrowLeft className="size-4" aria-hidden />
            All organisations
          </Link>
        </Button>
        <PageHeader icon={Building2} title={org.name} description={org.description || `/${org.slug}`} />
      </div>

      {org.deleted_at && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm"
        >
          <AlertTriangle className="size-4 text-destructive" aria-hidden />
          This organisation has been soft-deleted and is hidden from active workflows.
        </div>
      )}

      {/* Academy workspace only applies to academies and football schools */}
      <OrgTenantCard org={org} role={membership?.role ?? null} />

      <Tabs value={tab} onValueChange={setTab}>
        <div className="overflow-x-auto">
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <Gauge className="size-4" aria-hidden />
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <Building2 className="size-4" aria-hidden />
              Profile
            </TabsTrigger>
            <TabsTrigger value="hierarchy" className="gap-2">
              <Network className="size-4" aria-hidden />
              Hierarchy
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="size-4" aria-hidden />
              Members
            </TabsTrigger>
            {isAcademy && (
              <TabsTrigger value="academy" className="gap-2">
                <GraduationCap className="size-4" aria-hidden />
                Academy
              </TabsTrigger>
            )}
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="size-4" aria-hidden />
              Documents
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="size-4" aria-hidden />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <History className="size-4" aria-hidden />
              Activity
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-6">
          <OrgDashboardTab org={org} canManage={canManage} onSelectTab={setTab} />
        </TabsContent>
        <TabsContent value="profile" className="mt-6">
          <OrgProfileTab org={org} canManage={canManage} />
        </TabsContent>
        <TabsContent value="hierarchy" className="mt-6">
          <OrgHierarchyTab org={org} canManage={canManage} />
        </TabsContent>
        <TabsContent value="members" className="mt-6">
          <OrgMembersTab org={org} canManage={canManage} />
        </TabsContent>
        {isAcademy && (
          <TabsContent value="academy" className="mt-6">
            <AcademyWorkspace org={org} canManage={canManage} />
          </TabsContent>
        )}
        <TabsContent value="documents" className="mt-6">
          <OrgDocumentsTab org={org} canManage={canManage} />
        </TabsContent>
        <TabsContent value="settings" className="mt-6 space-y-6">
          <OrgSettingsTab org={org} canManage={canManage} />
          {canManage && <OrgDangerZone org={org} />}
        </TabsContent>
        <TabsContent value="activity" className="mt-6">
          <OrgAuditTab orgId={org.id} />
        </TabsContent>
      </Tabs>
    </main>
  );
}
