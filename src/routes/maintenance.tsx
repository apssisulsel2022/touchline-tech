import { createFileRoute } from "@tanstack/react-router";
import { Wrench } from "lucide-react";

import { StatusPage } from "@/components/common/status-page";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "Scheduled maintenance — Touchline" },
      { name: "description", content: "Touchline is briefly offline for scheduled maintenance." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Scheduled maintenance — Touchline" },
      { property: "og:description", content: "We'll be right back." },
    ],
  }),
  component: Maintenance,
});

function Maintenance() {
  return (
    <StatusPage
      icon={Wrench}
      tone="warning"
      title="We'll be right back"
      description="Touchline is briefly offline for scheduled maintenance. Your data is safe — please try again in a few minutes."
      actions={
        <Button onClick={() => window.location.reload()}>Check again</Button>
      }
    />
  );
}
