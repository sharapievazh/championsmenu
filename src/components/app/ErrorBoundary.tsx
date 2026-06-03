import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackActionLabel?: string;
  onFallbackAction?: () => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleReload = () => {
    if (this.props.onFallbackAction) {
      this.props.onFallbackAction();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[50vh] p-6">
          <div className="bg-card text-foreground rounded-2xl shadow-soft p-6 text-center max-w-sm w-full border border-border">
            <h2 className="text-lg font-bold mb-2">
              {this.props.fallbackTitle || "Something went wrong"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              {this.props.fallbackHint || "Try reloading the page."}
            </p>
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              {this.props.fallbackActionLabel || "Reload"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
