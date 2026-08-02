import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, Filter, Plus, Search, Users } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { SectionState, ReadOnlyNotice } from "@/components/common/section-state";
import { PlayerStatusBadge } from "@/components/players/player-badges";
import { PlayerFormDialog } from "@/components/players/player-form-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDate,
  playerAge,
  playerFullName,
  playerInitials,
  playersQuery,
  type PlayerRow,
} from "@/lib/players";
import {
  PLAYER_POSITIONS,
  PLAYER_POSITION_LABELS,
  PLAYER_STATUSES,
  PLAYER_STATUS_LABELS,
  type PlayerPosition,
  type PlayerStatus,
} from "@/lib/validation/players";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/players/")({
  head: () => ({
    meta: [
      { title: "Player Registry — Touchline" },
      {
        name: "description",
        content:
          "Search, filter and manage every registered player in your Touchline organisation.",
      },
      { property: "og:title", content: "Player Registry — Touchline" },
      {
        property: "og:description",
        content: "Search, filter and manage every registered player in your organisation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PlayersDirectoryPage,
  errorComponent: ({ error }) => (
    <div className="p-6" role="alert">
      {error instanceof Error ? error.message : "The player registry failed to load."}
    </div>
  ),
});

function useDebounced(value: string, delay = 250) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function matches(player: PlayerRow, term: string) {
  if (!term) return true;
  const haystack = [
    player.first_name,
    player.last_name,
    player.known_as,
    player.registry_no,
    player.email,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

function PlayersDirectoryPage() {
  const { session, hasPermission } = useAuth();
  const orgId = session?.organizationId ?? null;
  const canManage = hasPermission("org:manage");

  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<PlayerStatus | "all">("all");
  const [position, setPosition] = React.useState<PlayerPosition | "all">("all");
  const [createOpen, setCreateOpen] = React.useState(false);
  const debouncedSearch = useDebounced(search);

  const list = useQuery({ ...playersQuery(orgId ?? ""), enabled: Boolean(orgId) });

  const rows = React.useMemo(() => {
    return (list.data ?? []).filter(
      (player) =>
        matches(player, debouncedSearch) &&
        (status === "all" || player.status === status) &&
        (position === "all" || player.primary_position === position),
    );
  }, [list.data, debouncedSearch, status, position]);

  if (!orgId) {
    return (
      <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <EmptyState
          icon={Building2}
          title="Select an organisation"
          description="The player registry is scoped to a single organisation. Choose one from the switcher to continue."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-4 sm:p-6">
      <PageHeader
        icon={Users}
        title="Players"
        description="The registry of every player registered with this organisation."
        actions={
          canManage ? (
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden />
              New player
            </Button>
          ) : null
        }
      />

      <ReadOnlyNotice
        canManage={canManage}
        message="You have read-only access to the registry. Organisation admins can add or edit players."
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="size-4" aria-hidden />
            Search &amp; filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="player-search">Search</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="player-search"
                className="pl-9"
                placeholder="Name, registry number or email"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-status">Status</Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as PlayerStatus | "all")}
            >
              <SelectTrigger id="player-status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {PLAYER_STATUSES.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PLAYER_STATUS_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="player-position">Position</Label>
            <Select
              value={position}
              onValueChange={(value) => setPosition(value as PlayerPosition | "all")}
            >
              <SelectTrigger id="player-position">
                <SelectValue placeholder="All positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All positions</SelectItem>
                {PLAYER_POSITIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {PLAYER_POSITION_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <SectionState
        isLoading={list.isPending}
        error={list.error}
        isEmpty={rows.length === 0}
        emptyIcon={Users}
        emptyTitle={list.data?.length ? "No players match these filters" : "No players yet"}
        emptyDescription={
          list.data?.length
            ? "Adjust the search term or filters to widen the results."
            : "Register your first player to start building the registry."
        }
        emptyAction={
          canManage && !list.data?.length ? (
            <Button className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" aria-hidden />
              New player
            </Button>
          ) : null
        }
        onRetry={() => void list.refetch()}
      >
        <Card>
          <CardContent className="p-0">
            <Table>
              <caption className="sr-only">
                {rows.length} player{rows.length === 1 ? "" : "s"} in the registry
              </caption>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Registry no.</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Date of birth</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <Link
                        to="/players/$playerId"
                        params={{ playerId: player.id }}
                        className="flex items-center gap-3 font-medium hover:underline"
                      >
                        <Avatar className="size-8">
                          {player.photo_url ? <AvatarImage src={player.photo_url} alt="" /> : null}
                          <AvatarFallback>{playerInitials(player)}</AvatarFallback>
                        </Avatar>
                        {playerFullName(player)}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{player.registry_no}</TableCell>
                    <TableCell>{playerAge(player)}</TableCell>
                    <TableCell>{PLAYER_POSITION_LABELS[player.primary_position]}</TableCell>
                    <TableCell>{formatDate(player.date_of_birth)}</TableCell>
                    <TableCell>
                      <PlayerStatusBadge status={player.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </SectionState>

      {canManage ? (
        <PlayerFormDialog orgId={orgId} open={createOpen} onOpenChange={setCreateOpen} />
      ) : null}
    </main>
  );
}
