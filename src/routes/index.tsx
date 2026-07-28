import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CircleDot, LineChart, ShieldCheck, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Touchline — Football Ecosystem Platform" },
      {
        name: "description",
        content:
          "Touchline is the digital operating system for football: verified player identity, competition management, match operations and analytics in one platform.",
      },
      { property: "og:title", content: "Touchline — Football Ecosystem Platform" },
      {
        property: "og:description",
        content:
          "Verified player identity, competitions, match operations and analytics for federations, clubs and academies.",
      },
    ],
  }),
  component: Landing,
});

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Verified identity",
    body: "Digital player IDs and append-only passports that make age fraud and paperwork disputes a thing of the past.",
  },
  {
    icon: Users,
    title: "One ecosystem",
    body: "Federations, associations, clubs, academies, coaches, guardians and officials working from the same record.",
  },
  {
    icon: LineChart,
    title: "Decisions from data",
    body: "Competition standings, match events and performance insight computed deterministically, available in real time.",
  },
];

function Landing() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"
          >
            <CircleDot className="size-4" />
          </span>
          <span className="truncate font-display text-lg font-bold">Touchline</span>
        </div>
        <Button asChild size="sm">
          <Link to="/auth">Sign in</Link>
        </Button>
      </header>

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 sm:px-6 sm:pt-20">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Football ecosystem platform
        </p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
          The operating system for national football
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Touchline unifies player identity, registrations, competitions, match operations, medical
          care and finance for every organisation in the game — from the federation down to the
          weekend academy.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/auth">
              Enter the workspace
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </div>
      </section>

      <section aria-label="Platform pillars" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <Card key={pillar.title}>
              <CardContent className="space-y-3 p-6">
                <span
                  aria-hidden
                  className="grid size-10 place-items-center rounded-xl bg-primary-subtle text-primary"
                >
                  <pillar.icon className="size-5" />
                </span>
                <h2 className="text-lg font-semibold">{pillar.title}</h2>
                <p className="text-sm text-muted-foreground">{pillar.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
