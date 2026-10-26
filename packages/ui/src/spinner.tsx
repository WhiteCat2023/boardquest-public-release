import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { cn } from "./utils"

export type SpinnerVariant =
  | "default"
  | "secondary"
  | "muted"
  | "destructive"
  | "accent"
  | "white"
  | "current"
  | (string & {})

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl" | number

export interface SpinnerProps extends React.ComponentProps<"svg"> {
  variant?: SpinnerVariant
  size?: SpinnerSize
}

const sizeClassMap: Record<string, string> = {
  xs: "size-3",
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
  xl: "size-10",
}

const variantClassMap: Record<string, string> = {
  default: "text-primary",
  secondary: "text-secondary-foreground",
  muted: "text-muted-foreground",
  destructive: "text-destructive",
  accent: "text-accent-foreground",
  white: "text-primary-foreground",
  current: "text-current",
}

function Spinner({
  className,
  size = "sm",
  variant = "default",
  style,
  ...props
}: SpinnerProps) {
  const isCustomSize = typeof size === "number"
  const sizeClass = typeof size === "string" ? sizeClassMap[size] ?? "size-4" : undefined

  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn(
        "animate-spin shrink-0",
        sizeClass,
        variantClassMap[variant] ?? "text-current",
        className
      )}
      style={isCustomSize ? { width: size, height: size, ...style } : style}
      {...props}
    />
  )
}

export { Spinner }
export default Spinner
