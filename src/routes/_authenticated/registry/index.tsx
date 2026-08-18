import { createFileRoute } from "@tanstack/react-router";

import { RegistryPage } from "@/components/registry/registry-page";

export const Route = createFileRoute("/_authenticated/registry/")({
  head: () => ({
    meta: [
      { title: "Global Registry — Touchline" },
      { name: "description", content: "Manage registry identities and governance workflows for the Global Registry Foundation." },
      { property: "og:title", content: "Global Registry — Touchline" },
      { property: "og:description", content: "Browse and review registry identities using the approved Global Registry Foundation experience." },
    ],
  }),
  component: RegistryPage,
});
