import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { ErrorBoundary } from "@/components/common/error-boundary";
import { LoadingScreen } from "@/components/common/loading";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Protected layout. Client-only because the Supabase session lives in
 * localStorage — SSR has no access to it and a server-side gate loops on
 * hard refresh.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }
    return { user: data.user };
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
