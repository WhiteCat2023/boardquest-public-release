import * as React from "react";
import { ClipLoader, PulseLoader, BeatLoader, RingLoader } from "react-spinners";
import { cn } from "@/lib/utils";

export type SpinnerVariant =
  | "default"
  | "secondary"
  | "muted"
  | "destructive"
  | "accent"
  | "white"
  | "current";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl" | number;

export type SpinnerType = "clip" | "pulse" | "beat" | "ring";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  type?: SpinnerType;
  color?: string;
  loading?: boolean;
  speedMultiplier?: number;
}

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
};

const variantColorMap: Record<SpinnerVariant, string> = {
  default: "var(--primary)",
  secondary: "var(--secondary-foreground)",
  muted: "var(--muted-foreground)",
  destructive: "var(--destructive)",
  accent: "var(--accent-foreground)",
  white: "var(--primary-foreground)",
  current: "currentColor",
};

const variantClassMap: Record<SpinnerVariant, string> = {
  default: "text-primary",
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
  destructive: "text-destructive",
  accent: "text-accent-foreground",
  white: "text-primary-foreground",
  current: "text-current",
};

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      variant = "default",
      size = "sm",
      type = "clip",
      color,
      loading = true,
      speedMultiplier = 1,
      className,
      ...props
    },
    ref
  ) => {
    const numericSize = typeof size === "number" ? size : sizeMap[size] ?? 16;
    const resolvedColor = color || variantColorMap[variant] || "var(--primary)";

    const renderLoader = () => {
      switch (type) {
        case "pulse":
          return (
            <PulseLoader
              color={resolvedColor}
              size={Math.max(4, Math.round(numericSize / 3))}
              loading={loading}
              speedMultiplier={speedMultiplier}
            />
          );
        case "beat":
          return (
            <BeatLoader
              color={resolvedColor}
              size={Math.max(4, Math.round(numericSize / 3))}
              loading={loading}
              speedMultiplier={speedMultiplier}
            />
          );
        case "ring":
          return (
            <RingLoader
              color={resolvedColor}
              size={numericSize}
              loading={loading}
              speedMultiplier={speedMultiplier}
            />
          );
        case "clip":
        default:
          return (
            <ClipLoader
              color={resolvedColor}
              size={numericSize}
              loading={loading}
              speedMultiplier={speedMultiplier}
            />
          );
      }
    };

    if (!loading) return null;

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading..."
        className={cn(
          "inline-flex items-center justify-center shrink-0",
          variantClassMap[variant],
          className
        )}
        {...props}
      >
        {renderLoader()}
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export default Spinner;
