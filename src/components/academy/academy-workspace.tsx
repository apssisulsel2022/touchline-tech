import * as React from "react";
import {
  Building,
  CalendarClock,
  CalendarRange,
  GraduationCap,
  Images,
  LayoutDashboard,
  Layers,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { OrganizationRow } from "@/lib/organizations";
import { AcademyDashboardTab } from "@/components/academy/academy-dashboard-tab";
import { AcademyProfileTab } from "@/components/academy/academy-profile-tab";
import { AcademyAgeCategoriesTab } from "@/components/academy/academy-age-categories-tab";
import { AcademySeasonsTab } from "@/components/academy/academy-seasons-tab";
import { AcademyTeamsTab } from "@/components/academy/academy-teams-tab";
import { AcademyCoachesTab } from "@/components/academy/academy-coaches-tab";
import { AcademyFacilitiesTab } from "@/components/academy/academy-facilities-tab";
import { AcademyTrainingTab } from "@/components/academy/academy-training-tab";
import { AcademyMediaTab } from "@/components/academy/academy-media-tab";

const SECTIONS = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "profile", label: "Academy profile", icon: ShieldCheck },
  { value: "seasons", label: "Seasons", icon: CalendarRange },
  { value: "categories", label: "Age categories", icon: Layers },
  { value: "teams", label: "Teams", icon: UsersRound },
  { value: "coaches", label: "Coaches", icon: GraduationCap },
  { value: "training", label: "Training", icon: CalendarClock },
  { value: "facilities", label: "Facilities", icon: Building },
  { value: "media", label: "Media", icon: Images },
] as const;

/** Academy / football school workspace grouping every SSB management section. */
export function AcademyWorkspace({ org, canManage }: { org: OrganizationRow; canManage: boolean }) {
  const orgId = org.id;
  const [section, setSection] = React.useState<string>("overview");

  return (
    <Tabs value={section} onValueChange={setSection} className="space-y-6">
      <div className="overflow-x-auto">
        <TabsList>
          {SECTIONS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger key={value} value={value} className="gap-2">
              <Icon className="size-4" aria-hidden />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="overview">
        <AcademyDashboardTab orgId={orgId} />
      </TabsContent>
      <TabsContent value="profile">
        <AcademyProfileTab org={org} canManage={canManage} />
      </TabsContent>
      <TabsContent value="seasons">
        <AcademySeasonsTab orgId={orgId} canManage={canManage} />
      </TabsContent>
      <TabsContent value="categories">
        <AcademyAgeCategoriesTab orgId={orgId} canManage={canManage} />
      </TabsContent>
      <TabsContent value="teams">
        <AcademyTeamsTab orgId={orgId} canManage={canManage} />
      </TabsContent>
      <TabsContent value="coaches">
        <AcademyCoachesTab orgId={orgId} canManage={canManage} />
      </TabsContent>
      <TabsContent value="training">
        <AcademyTrainingTab orgId={orgId} canManage={canManage} />
      </TabsContent>
      <TabsContent value="facilities">
        <AcademyFacilitiesTab orgId={orgId} canManage={canManage} />
      </TabsContent>
      <TabsContent value="media">
        <AcademyMediaTab orgId={orgId} canManage={canManage} />
      </TabsContent>
    </Tabs>
  );
}
