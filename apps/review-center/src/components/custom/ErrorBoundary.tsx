import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  public handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Card className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center shadow-xs">
          <CardContent className="space-y-3 p-0 flex flex-col items-center">
            <div className="size-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground">
                {this.props.fallbackTitle || "Something went wrong loading this section"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {this.props.fallbackDescription ||
                  this.state.error?.message ||
                  "An unexpected error occurred while rendering this widget."}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={this.handleRetry}
              className="h-8 px-3 text-xs font-semibold gap-1.5 rounded-xl border-border cursor-pointer mt-1"
            >
              <RotateCcw className="size-3.5" />
              <span>Retry</span>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
