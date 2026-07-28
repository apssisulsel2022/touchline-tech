import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { StatusPage } from "@/components/common/status-page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/unauthorized")({
  head: () => ({
    meta: [
      { title: "Access denied — Touchline" },
      { name: "description", content: "You don't have permission to view this area." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Access denied — Touchline" },
      { property: "og:description", content: "You don't have permission to view this area." },
    ],
  }),
  component: Unauthorized,
});

function Unauthorized() {
  return (
    <StatusPage
      icon={Lock}
      code="403"
      tone="destructive"
      title="You don't have access to this area"
      description="Your role doesn't include permission for this page. Ask your administrator to grant access or return to your dashboard."
      actions={
        <>
          <Button asChild>
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Home</Link>
          </Button>
        </>
      }
    />
  );
}
