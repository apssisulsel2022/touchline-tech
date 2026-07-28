import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

import { StatusPage } from "@/components/common/status-page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/session-expired")({
  head: () => ({
    meta: [
      { title: "Session expired — Touchline" },
      { name: "description", content: "Your Touchline session has ended. Sign in again to continue." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Session expired — Touchline" },
      { property: "og:description", content: "Sign in again to continue." },
    ],
  }),
  component: SessionExpired,
});

function SessionExpired() {
  return (
    <StatusPage
      icon={Clock}
      tone="warning"
      title="Your session has expired"
      description="For your security we signed you out after a period of inactivity. Sign in again to continue where you left off."
      actions={
        <Button asChild>
          <Link to="/auth">Sign in again</Link>
        </Button>
      }
    />
  );
}
