import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Application shell used by every authenticated role layout.
 * Regions: skip link · sidebar · topbar · main content. Exactly one <main>
 * per page.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only absolute left-2 top-2 z-50 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <div className="flex min-h-dvh w-full">
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <Topbar />
          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 px-4 py-6 focus:outline-none sm:px-6 lg:px-8"
          >
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
