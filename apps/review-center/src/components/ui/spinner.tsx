import * as React from "react";
import { Loader2 } from "lucide-react";
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

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SpinnerVariant;
  size?: SpinnerSize;
  loading?: boolean;
}

const sizeMap: Record<string, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
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
      loading = true,
      className,
      ...props
    },
    ref
  ) => {
    if (!loading) return null;
    const numericSize = typeof size === "number" ? size : sizeMap[size] ?? 16;

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
        <Loader2
          className="animate-spin"
          style={{ width: numericSize, height: numericSize }}
        />
      </div>
    );
  }
);

Spinner.displayName = "Spinner";

export default Spinner;
