import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { readSession } from "@/lib/session";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { LoadingScreen } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { AlertTriangle } from "lucide-react";

/**
 * Protected layout. Rendered client-side only: the session lives in browser
 * storage, so a server-side gate would loop on hard refresh.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: () => {
    if (!readSession()) {
      throw redirect({ to: "/auth" });
    }
  },
  component: AuthenticatedLayout,
  pendingComponent: () => <LoadingScreen label="Preparing your workspace" />,
  errorComponent: LayoutError,
});

function AuthenticatedLayout() {
  return (
    <AppShell>
      <ErrorBoundary boundary="authenticated_layout">
        <Outlet />
      </ErrorBoundary>
    </AppShell>
  );
}

function LayoutError() {
  return (
    <div className="grid min-h-dvh place-items-center p-6">
      <EmptyState
        icon={AlertTriangle}
        title="The workspace didn't load"
        description="We couldn't start your workspace shell. Try signing in again."
        action={
          <Button asChild variant="outline">
            <Link to="/auth">Back to sign in</Link>
          </Button>
        }
      />
    </div>
  );
}
