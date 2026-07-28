import * as React from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { reportLovableError } from "@/lib/lovable-error-reporting";

interface Props {
  children: React.ReactNode;
  fallback?: (args: { error: Error; reset: () => void }) => React.ReactNode;
  /** Identifies the boundary in error reports. */
  boundary?: string;
}

interface State {
  error: Error | null;
}

/** Component-level error boundary for widgets and panels. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    reportLovableError(error, { boundary: this.props.boundary ?? "component_error_boundary" });
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback({ error, reset: this.reset });

    return (
      <Card role="alert" className="border-destructive/40">
        <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <span aria-hidden className="grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-semibold">This section didn't load</h3>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Something went wrong while rendering this area. You can retry without leaving the page.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }
}
