import { useQuery } from "@tanstack/react-query";
import {
  Building,
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Images,
  ShieldAlert,
  UsersRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  academyEventsQuery,
  academyProfileQuery,
  ageCategoriesQuery,
  coachesQuery,
  currentSeason,
  facilitiesQuery,
  formatDate,
  formatTime,
  isExpiringSoon,
  mediaItemsQuery,
  seasonsQuery,
  teamsQuery,
  trainingSessionsQuery,
} from "@/lib/academy";
import { ACADEMY_EVENT_TYPE_LABELS, WEEKDAYS, type AcademyEventType } from "@/lib/validation/academy";

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof UsersRound;
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="size-4 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

/** Academy overview: squads, staff, facilities, schedule health and alerts. */
export function AcademyDashboardTab({ orgId }: { orgId: string }) {
  const profile = useQuery(academyProfileQuery(orgId));
  const seasons = useQuery(seasonsQuery(orgId));
  const categories = useQuery(ageCategoriesQuery(orgId));
  const teams = useQuery(teamsQuery(orgId));
  const coaches = useQuery(coachesQuery(orgId));
  const facilities = useQuery(facilitiesQuery(orgId));
  const sessions = useQuery(trainingSessionsQuery(orgId));
  const events = useQuery(academyEventsQuery(orgId));
  const media = useQuery(mediaItemsQuery(orgId));

  const season = currentSeason(seasons.data ?? []);
  const activeTeams = (teams.data ?? []).filter((t) => t.status === "active");
  const activeCoaches = (coaches.data ?? []).filter((c) => c.status === "active");
  const activeSessions = (sessions.data ?? []).filter((s) => s.is_active);
  const availableFacilities = (facilities.data ?? []).filter((f) => f.status === "available");

  const expiringLicences = (coaches.data ?? []).filter((c) => isExpiringSoon(c.licence_expires_at));
  const teamsWithoutCoach = activeTeams.filter((t) => !t.coach_id);
  const teamsWithoutSession = activeTeams.filter(
    (t) => !activeSessions.some((s) => s.team_id === t.id),
  );

  const coveredCategories = new Set(activeTeams.map((t) => t.age_category_id).filter(Boolean));
  const categoryCoverage = (categories.data ?? []).length
    ? Math.round((coveredCategories.size / (categories.data ?? []).length) * 100)
    : 0;

  const upcomingEvents = (events.data ?? [])
    .filter((event) => new Date(event.starts_on) >= new Date(new Date().toDateString()))
    .slice(0, 5);

  const nextSessions = [...activeSessions]
    .sort((a, b) => a.weekday - b.weekday || a.starts_at.localeCompare(b.starts_at))
    .slice(0, 5);

  const alerts = [
    expiringLicences.length > 0 &&
      `${expiringLicences.length} coaching licence${expiringLicences.length > 1 ? "s" : ""} expiring within 60 days`,
    teamsWithoutCoach.length > 0 &&
      `${teamsWithoutCoach.length} active squad${teamsWithoutCoach.length > 1 ? "s have" : " has"} no assigned coach`,
    teamsWithoutSession.length > 0 &&
      `${teamsWithoutSession.length} active squad${teamsWithoutSession.length > 1 ? "s have" : " has"} no weekly training slot`,
    !season && "No current season is set — schedules and registrations need an active season",
    !profile.data && "Academy profile is incomplete — add licensing and accreditation details",
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label="Active squads"
          value={activeTeams.length}
          hint={`${(teams.data ?? []).length} total registered`}
        />
        <StatCard
          icon={GraduationCap}
          label="Active coaches"
          value={activeCoaches.length}
          hint={`${expiringLicences.length} licence(s) expiring soon`}
        />
        <StatCard
          icon={Building}
          label="Facilities available"
          value={availableFacilities.length}
          hint={`${(facilities.data ?? []).length} in the estate`}
        />
        <StatCard
          icon={CalendarClock}
          label="Weekly sessions"
          value={activeSessions.length}
          hint={`${(media.data ?? []).length} media items published`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Current season</CardTitle>
            <CardDescription>
              {season
                ? `${season.name} · ${formatDate(season.starts_on)} – ${formatDate(season.ends_on)}`
                : "No season marked as current"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Age category coverage</span>
                <span className="tabular-nums text-muted-foreground">
                  {coveredCategories.size}/{(categories.data ?? []).length} ({categoryCoverage}%)
                </span>
              </div>
              <Progress value={categoryCoverage} aria-label="Age category coverage" />
            </div>
            {season?.registration_opens_on && (
              <p className="text-sm text-muted-foreground">
                Registration window: {formatDate(season.registration_opens_on)} –{" "}
                {formatDate(season.registration_closes_on)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="size-4" aria-hidden />
              Attention needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Everything looks in order.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {alerts.map((alert) => (
                  <li key={alert} className="flex gap-2">
                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-destructive" />
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly training highlights</CardTitle>
            <CardDescription>First sessions of the training week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextSessions.length === 0 && (
              <p className="text-sm text-muted-foreground">No active sessions scheduled.</p>
            )}
            {nextSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{session.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {WEEKDAYS[session.weekday]} · {formatTime(session.starts_at)}–
                    {formatTime(session.ends_at)}
                  </p>
                </div>
                <Badge variant="outline">
                  {teams.data?.find((t) => t.id === session.team_id)?.name ?? "All squads"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="size-4" aria-hidden />
              Upcoming calendar
            </CardTitle>
            <CardDescription>Holidays, tournaments, trials and academy blocks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">No upcoming calendar entries.</p>
            )}
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(event.starts_on)}
                    {event.ends_on && event.ends_on !== event.starts_on
                      ? ` – ${formatDate(event.ends_on)}`
                      : ""}
                  </p>
                </div>
                <Badge variant="secondary">
                  {ACADEMY_EVENT_TYPE_LABELS[event.type as AcademyEventType] ?? event.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Images className="size-4" aria-hidden />
            Media library
          </CardTitle>
          <CardDescription>
            {(media.data ?? []).length} items published across the academy gallery.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
