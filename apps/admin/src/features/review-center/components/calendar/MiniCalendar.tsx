import React, { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";

import type { CalendarViewMode } from "./types";

interface MiniCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  viewMode?: CalendarViewMode;
}

export function MiniCalendar({
  currentDate,
  onDateChange,
  viewMode = "month",
}: MiniCalendarProps) {
  const [navMonth, setNavMonth] = useState<Date>(() => new Date(currentDate));

  // Sync navMonth when currentDate month or year changes externally
  useEffect(() => {
    setNavMonth(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
  }, [currentDate.getFullYear(), currentDate.getMonth()]);

  // In week view, determine active week start and end
  const activeWeekRange = useMemo(() => {
    if (viewMode !== "week") return null;
    const dayOfWeek = (currentDate.getDay() + 6) % 7;
    const start = new Date(currentDate);
    start.setDate(currentDate.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { from: start, to: end };
  }, [currentDate, viewMode]);

  const handlePrevMonth = () => {
    setNavMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setNavMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formattedMonthLabel = navMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs font-sans select-none flex flex-col w-full">
      {/* Month Header aligned with Navigation Arrows (Space-between) */}
      <div className="flex items-center justify-between w-full px-1 mb-2">
        <h3 className="text-xs font-bold text-foreground tracking-tight select-none">
          {formattedMonthLabel}
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="size-5.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer"
            title="Previous month"
            aria-label="Previous month"
          >
            <ChevronLeft size={13} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="size-5.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 flex items-center justify-center transition-colors cursor-pointer"
            title="Next month"
            aria-label="Next month"
          >
            <ChevronRight size={13} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <Calendar
        mode="single"
        selected={currentDate}
        onSelect={(date) => {
          if (date) {
            onDateChange(date);
          }
        }}
        month={navMonth}
        onMonthChange={setNavMonth}
        hideNavigation={true}
        showOutsideDays={true}
        weekStartsOn={1}
        formatters={{
          formatWeekdayName: (date) =>
            ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
        }}
        modifiers={{
          ...(activeWeekRange ? { inWeek: [activeWeekRange] } : {}),
        }}
        modifiersClassNames={{
          inWeek: "!bg-primary/10 !text-primary !font-semibold rounded-lg",
        }}
        className="p-0 w-full [--cell-size:1.625rem] [--cell-radius:0.375rem]"
        classNames={{
          root: "w-full",
          months: "flex flex-col w-full",
          month: "flex w-full flex-col gap-1",
          month_caption: "hidden",
          nav: "hidden",
          month_grid: "w-full border-collapse",
          weekdays: "flex w-full justify-between mb-1",
          weekday:
            "flex-1 text-[10px] font-medium text-muted-foreground/75 py-0.5 text-center select-none",
          week: "flex w-full justify-between mt-0.5",
          day: "group/day relative aspect-square h-full w-full rounded-md p-0 text-center select-none flex items-center justify-center text-[10.5px] flex-1",
          day_button: "min-w-0 size-full flex items-center justify-center p-0 rounded-md text-[10.5px]",
        }}
      />
    </div>
  );
}

export default MiniCalendar;
