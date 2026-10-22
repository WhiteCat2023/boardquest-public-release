import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CalendarViewMode } from "./types";

interface CalendarHeaderToolbarProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickAdd?: () => void;
  onFilterClick?: () => void;
  onNotificationClick?: () => void;
  onSettingsClick?: () => void;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CalendarHeaderToolbar({
  currentDate,
  viewMode,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  searchQuery,
  onSearchChange,
  onQuickAdd,
  onFilterClick,
  onNotificationClick,
  onSettingsClick,
}: CalendarHeaderToolbarProps) {
  // Format center title based on viewMode
  const getCenterTitle = () => {
    const year = currentDate.getFullYear();
    const monthName = MONTH_NAMES[currentDate.getMonth()];
    const day = currentDate.getDate();

    if (viewMode === "year") {
      return `${year}`;
    }

    if (viewMode === "month") {
      return `${monthName} ${year}`;
    }

    if (viewMode === "day") {
      const formattedDay = String(day).padStart(2, "0");
      return `${monthName} ${formattedDay}, ${year}`;
    }

    // Week view: calculate Monday to Sunday range
    const dayOfWeek = (currentDate.getDay() + 6) % 7;
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - dayOfWeek);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startMonth = MONTH_NAMES[weekStart.getMonth()];
    const endMonth = MONTH_NAMES[weekEnd.getMonth()];
    const startDayStr = String(weekStart.getDate()).padStart(2, "0");
    const endDayStr = String(weekEnd.getDate()).padStart(2, "0");

    if (weekStart.getMonth() === weekEnd.getMonth()) {
      return `${startMonth} ${startDayStr} - ${endDayStr}, ${year}`;
    }
    return `${startMonth} ${startDayStr} - ${endMonth} ${endDayStr}, ${year}`;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 font-sans shrink-0 px-0.5 py-0.5">
      {/* Left: View Mode Selector (Segmented tabs matching mockup on desktop, dropdown on mobile) */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:inline-flex items-center p-0.5 rounded-xl bg-muted/60 border border-border/70">
          {(["day", "week", "month", "year"] as CalendarViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onViewModeChange(mode)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                viewMode === mode
                  ? "bg-card text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:text-foreground font-medium"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="sm:hidden">
          <Select
            value={viewMode}
            onValueChange={(val) => onViewModeChange(val as CalendarViewMode)}
          >
            <SelectTrigger className="w-28 h-8.5 rounded-xl border-border bg-background text-xs font-medium text-foreground capitalize focus:ring-1 focus:ring-ring/20">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent className="rounded-xl font-sans">
              <SelectItem value="day" className="text-xs font-medium cursor-pointer">
                Day
              </SelectItem>
              <SelectItem value="week" className="text-xs font-medium cursor-pointer">
                Week
              </SelectItem>
              <SelectItem value="month" className="text-xs font-medium cursor-pointer">
                Month
              </SelectItem>
              <SelectItem value="year" className="text-xs font-medium cursor-pointer">
                Year
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToday}
          className="h-8.5 px-3 rounded-xl text-[11.5px] font-medium border-border hover:bg-accent text-foreground cursor-pointer shrink-0"
        >
          Today
        </Button>
      </div>

      {/* Center: Navigation < Month/Week/Day > */}
      <div className="flex items-center gap-2 order-last sm:order-none w-full sm:w-auto justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onPrev}
          className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
          aria-label="Previous period"
        >
          <ChevronLeft size={16} />
        </Button>

        <span className="text-xs sm:text-[13px] font-semibold text-foreground tracking-tight min-w-[140px] sm:min-w-[180px] text-center select-none">
          {getCenterTitle()}
        </span>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onNext}
          className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
          aria-label="Next period"
        >
          <ChevronRight size={16} />
        </Button>
      </div>

      {/* Right: Search input */}
      <div className="flex items-center flex-1 sm:flex-initial justify-end">
        {/* Search Input */}
        <div className="relative min-w-[130px] sm:min-w-[170px] max-w-[210px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-7 pr-6 h-8 text-xs bg-muted/20 border-border rounded-xl placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-ring/20 focus-visible:border-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarHeaderToolbar;
