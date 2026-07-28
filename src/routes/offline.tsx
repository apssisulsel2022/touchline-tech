import { createFileRoute, Link } from "@tanstack/react-router";
import { WifiOff } from "lucide-react";

import { StatusPage } from "@/components/common/status-page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "You're offline — Touchline" },
      { name: "description", content: "Touchline needs a network connection to load this page." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "You're offline — Touchline" },
      { property: "og:description", content: "Reconnect to keep working." },
    ],
  }),
  component: Offline,
});

function Offline() {
  return (
    <StatusPage
      icon={WifiOff}
      tone="warning"
      title="You're offline"
      description="Touchline needs a network connection to load this page. Reconnect and we'll pick up where you left off."
      actions={
        <>
          <Button onClick={() => window.location.reload()}>Try again</Button>
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        </>
      }
    />
  );
}
