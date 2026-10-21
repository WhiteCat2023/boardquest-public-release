import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useId,
} from "react";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TabTone =
  | "default"
  | "primary"
  | "danger"
  | "warning"
  | "success"
  | "info"
  | "neutral";

export interface NavTabItem<T extends string = string> {
  id: T;
  label: React.ReactNode;
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  badgeCount?: number | string;
  badgeVariant?: "default" | "primary" | "secondary" | "muted";
  tone?: TabTone;
  disabled?: boolean;
  title?: string;
  className?: string;
  showZero?: boolean;
}

export interface StandardNavTabsProps<T extends string = string> {
  tabs: NavTabItem<T>[];
  activeTab: T;
  onTabChange: (tabId: T) => void;
  /**
   * Visual style variant:
   * - "underline": (Default) The standardized student-view bottom-underline tab style with red active indicator
   * - "secondary": Secondary pill tabs (with status tone support: danger, warning, primary, etc.)
   * - "pills": Segmented capsule pill design for toolbars or compact headers
   */
  variant?: "underline" | "secondary" | "pills";
  /**
   * Tab sizing
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * How scroll buttons (< and >) should be displayed:
   * - "auto": (Default) Only show chevron buttons when tabs overflow their container
   * - true: Always display chevron buttons (disabled when scrolled to limits, matching Student View)
   * - false: Never display chevron buttons
   */
  showScrollButtons?: boolean | "auto";
  /**
   * If true, badges with a value of 0 will be displayed.
   * By default (false), badges with 0 or falsy values are hidden conditionally.
   * @default false
   */
  showZeroBadges?: boolean;
  /**
   * Custom class for the outermost container
   */
  className?: string;
  /**
   * Custom class for the scrolling tab track
   */
  trackClassName?: string;
  /**
   * Custom class for individual tab buttons
   */
  tabClassName?: string;
  /**
   * Optional right-side content (e.g. export buttons, filters, search, actions)
   */
  rightContent?: React.ReactNode;
  /**
   * Optional accessible label for the tablist
   */
  ariaLabel?: string;
}

// Tone styling for secondary pills
function getToneClasses(tone: TabTone = "default", isActive: boolean): string {
  if (isActive) {
    switch (tone) {
      case "danger":
        return "bg-rose-500 text-white border-rose-600 shadow-2xs font-bold";
      case "warning":
        return "bg-amber-500 text-white border-amber-600 shadow-2xs font-bold";
      case "success":
        return "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-bold";
      case "info":
        return "bg-blue-600 text-white border-blue-600 shadow-2xs font-bold";
      case "primary":
        return "bg-primary text-primary-foreground border-primary shadow-2xs font-bold";
      case "neutral":
        return "bg-slate-700 text-white border-slate-800 shadow-2xs font-bold";
      case "default":
      default:
        return "bg-foreground text-background border-foreground shadow-2xs font-bold";
    }
  }

  // Inactive states
  switch (tone) {
    case "danger":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20";
    case "success":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20";
    case "info":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/20";
    case "primary":
      return "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20";
    case "neutral":
      return "bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground";
    case "default":
    default:
      return "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/50";
  }
}

function getToneIconColor(tone: TabTone = "default", isActive: boolean): string {
  if (isActive) return "text-current";
  switch (tone) {
    case "danger":
      return "text-rose-600 dark:text-rose-400";
    case "warning":
      return "text-amber-600 dark:text-amber-400";
    case "success":
      return "text-emerald-600 dark:text-emerald-400";
    case "info":
      return "text-blue-600 dark:text-blue-400";
    case "primary":
      return "text-primary";
    case "neutral":
    case "default":
    default:
      return "text-muted-foreground group-hover:text-foreground";
  }
}

function shouldShowBadge(
  badgeCount: number | string | undefined | null,
  showZero = false
): boolean {
  if (badgeCount === undefined || badgeCount === null || badgeCount === "") {
    return false;
  }
  if (showZero) {
    return true;
  }
  if (typeof badgeCount === "number") {
    return badgeCount > 0;
  }
  const parsed = Number(badgeCount);
  if (!isNaN(parsed)) {
    return parsed > 0;
  }
  return Boolean(badgeCount);
}

export function StandardNavTabs<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  variant = "underline",
  size = "md",
  showScrollButtons = "auto",
  showZeroBadges = false,
  className,
  trackClassName,
  tabClassName,
  rightContent,
  ariaLabel = "Navigation Tabs",
}: StandardNavTabsProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const tablistId = useId();

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  // Check scroll position and overflow bounds
  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth > clientWidth + 2;
    setHasOverflow(overflow);
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
  }, []);

  useLayoutEffect(() => {
    updateScrollState();
    const el = containerRef.current;
    if (!el) return;

    const handleResize = () => updateScrollState();
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => updateScrollState());
    resizeObserver.observe(el);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, tabs]);

  // Ensure active tab smoothly scrolls into view when changed
  useEffect(() => {
    const container = containerRef.current;
    const activeEl = tabRefs.current[activeTab];
    if (container && activeEl) {
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeEl.getBoundingClientRect();

      if (tabRect.left < containerRect.left) {
        container.scrollBy({
          left: tabRect.left - containerRect.left - 24,
          behavior: "smooth",
        });
      } else if (tabRect.right > containerRect.right) {
        container.scrollBy({
          left: tabRect.right - containerRect.right + 24,
          behavior: "smooth",
        });
      }
    }
  }, [activeTab]);

  // Handle clicking left/right chevron buttons
  const handleScroll = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    const scrollAmount = Math.max(200, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Keyboard navigation across tabs
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const enabledTabs = tabs.filter((t) => !t.disabled);
    const currentIndex = enabledTabs.findIndex((t) => t.id === tabs[index].id);

    let nextTab: NavTabItem<T> | undefined;

    if (e.key === "ArrowRight") {
      e.preventDefault();
      nextTab = enabledTabs[(currentIndex + 1) % enabledTabs.length];
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      nextTab =
        enabledTabs[(currentIndex - 1 + enabledTabs.length) % enabledTabs.length];
    } else if (e.key === "Home") {
      e.preventDefault();
      nextTab = enabledTabs[0];
    } else if (e.key === "End") {
      e.preventDefault();
      nextTab = enabledTabs[enabledTabs.length - 1];
    }

    if (nextTab) {
      onTabChange(nextTab.id);
      tabRefs.current[nextTab.id]?.focus();
    }
  };

  // Decide if scroll buttons should be displayed
  const shouldRenderButtons =
    showScrollButtons === true || (showScrollButtons === "auto" && hasOverflow);

  // Helper to render icon correctly whether it's a Lucide component or React element
  const renderIcon = (
    icon: NavTabItem<T>["icon"],
    isActive: boolean,
    iconSize: number,
    tone?: TabTone
  ) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComp = icon as React.ComponentType<{ size?: number; className?: string }>;
    const toneColor = getToneIconColor(tone, isActive);

    return (
      <IconComp
        size={iconSize}
        className={cn("shrink-0 transition-colors", toneColor)}
      />
    );
  };

  // Sizing definitions
  const sizeStyles = {
    sm: {
      tab: "px-2.5 sm:px-3 py-1.5 text-[11px]",
      icon: 13,
      badge: "text-[9px] px-1 py-0.1",
      height: "h-7 w-7",
      chevronSize: 14,
    },
    md: {
      tab: "px-3 sm:px-4 py-2.5 text-xs",
      icon: 14,
      badge: "text-[9.5px] px-1.5 py-0.2",
      height: "h-8 w-8",
      chevronSize: 16,
    },
    lg: {
      tab: "px-4 sm:px-5 py-3 text-sm",
      icon: 16,
      badge: "text-[10px] px-2 py-0.5",
      height: "h-9 w-9",
      chevronSize: 18,
    },
  }[size];

  // Secondary variant (triage / filter pills matching the secondary tabs)
  if (variant === "secondary") {
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 sm:gap-2 flex-wrap w-full font-sans",
          className
        )}
      >
        <div
          ref={containerRef}
          role="tablist"
          aria-label={ariaLabel}
          onScroll={updateScrollState}
          className={cn(
            "flex items-center gap-1.5 sm:gap-2 flex-wrap overflow-x-auto scrollbar-none",
            trackClassName
          )}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                role="tab"
                id={`${tablistId}-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`${tablistId}-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                type="button"
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                title={tab.title}
                className={cn(
                  "h-8 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border shrink-0 group select-none",
                  getToneClasses(tab.tone, isActive),
                  tab.disabled && "opacity-40 cursor-not-allowed pointer-events-none",
                  tabClassName,
                  tab.className
                )}
              >
                {renderIcon(tab.icon, isActive, sizeStyles.icon, tab.tone)}
                <span>{tab.label}</span>
                {shouldShowBadge(tab.badgeCount, tab.showZero ?? showZeroBadges) && (
                  <span
                    className={cn(
                      "rounded-full font-extrabold shrink-0 transition-colors px-1.5 py-0.2 text-[9.5px]",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {rightContent && <div className="ml-auto flex items-center gap-2">{rightContent}</div>}
      </div>
    );
  }

  // Pill variant rendering (segmented capsule)
  if (variant === "pills") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 flex-wrap w-auto shrink-0",
          className
        )}
      >
        <div
          role="tablist"
          aria-label={ariaLabel}
          className={cn(
            "flex items-center p-1 bg-muted/60 border border-border/80 rounded-xl w-fit overflow-x-auto scrollbar-none",
            trackClassName
          )}
        >
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[tab.id] = el;
                }}
                role="tab"
                id={`${tablistId}-tab-${tab.id}`}
                aria-selected={isActive}
                aria-controls={`${tablistId}-panel-${tab.id}`}
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                type="button"
                onClick={() => onTabChange(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                title={tab.title}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 group select-none",
                  sizeStyles.tab,
                  isActive
                    ? "bg-card text-foreground shadow-2xs border border-border/80 font-extrabold"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                  tab.disabled && "opacity-40 cursor-not-allowed pointer-events-none",
                  tabClassName,
                  tab.className
                )}
              >
                {renderIcon(tab.icon, isActive, sizeStyles.icon, tab.tone)}
                <span>{tab.label}</span>
                {shouldShowBadge(tab.badgeCount, tab.showZero ?? showZeroBadges) && (
                  <span
                    className={cn(
                      "rounded-full font-extrabold shrink-0 transition-colors",
                      sizeStyles.badge,
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {rightContent && <div className="ml-auto flex items-center gap-2">{rightContent}</div>}
      </div>
    );
  }

  // Underline variant (Default - standardized from Student View)
  return (
    <div
      className={cn(
        "border-b border-border flex items-center gap-1 pt-1 relative w-full font-sans",
        className
      )}
    >
      {/* Left Scroll Chevron Arrow */}
      {shouldRenderButtons && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canScrollLeft}
          onClick={() => handleScroll("left")}
          className={cn(
            sizeStyles.height,
            "shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all",
            !canScrollLeft
              ? "opacity-20 cursor-default pointer-events-none"
              : "cursor-pointer active:scale-95 shadow-2xs"
          )}
          aria-label="Scroll tabs left"
          title="Scroll tabs left"
        >
          <ChevronLeft size={sizeStyles.chevronSize} />
        </Button>
      )}

      {/* Scrollable Tabs Track */}
      <div
        ref={containerRef}
        role="tablist"
        aria-label={ariaLabel}
        onScroll={updateScrollState}
        className={cn(
          "flex-1 flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none scroll-smooth -mb-[1px] touch-pan-x",
          trackClassName
        )}
      >
        {tabs.map((tab, idx) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                tabRefs.current[tab.id] = el;
              }}
              role="tab"
              id={`${tablistId}-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${tablistId}-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              disabled={tab.disabled}
              type="button"
              onClick={() => onTabChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              title={tab.title}
              className={cn(
                "flex items-center gap-2 font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap border-b-2 group select-none",
                sizeStyles.tab,
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                tab.disabled && "opacity-40 cursor-not-allowed pointer-events-none",
                tabClassName,
                tab.className
              )}
            >
              {renderIcon(tab.icon, isActive, sizeStyles.icon, tab.tone)}
              <span>{tab.label}</span>
              {shouldShowBadge(tab.badgeCount, tab.showZero ?? showZeroBadges) && (
                <span
                  className={cn(
                    "rounded-full font-extrabold shrink-0 transition-colors",
                    sizeStyles.badge,
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  )}
                >
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Chevron Arrow */}
      {shouldRenderButtons && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={!canScrollRight}
          onClick={() => handleScroll("right")}
          className={cn(
            sizeStyles.height,
            "shrink-0 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all",
            !canScrollRight
              ? "opacity-20 cursor-default pointer-events-none"
              : "cursor-pointer active:scale-95 shadow-2xs"
          )}
          aria-label="Scroll tabs right"
          title="Scroll tabs right"
        >
          <ChevronRight size={sizeStyles.chevronSize} />
        </Button>
      )}

      {/* Optional right-aligned accessories */}
      {rightContent && (
        <div className="shrink-0 ml-1 flex items-center gap-2 pb-1">
          {rightContent}
        </div>
      )}
    </div>
  );
}

// Dedicated SecondaryNavTabs component for sub-tabs and filter pills
export function SecondaryNavTabs<T extends string = string>(
  props: Omit<StandardNavTabsProps<T>, "variant"> & {
    variant?: "secondary" | "pills";
  }
) {
  return <StandardNavTabs {...props} variant={props.variant ?? "secondary"} />;
}

export default StandardNavTabs;
