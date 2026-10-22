import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CalendarEvent } from "./types";

interface YearViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onMonthSelect?: (monthIndex: number) => void;
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

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function YearView({
  currentDate,
  events,
  onDateSelect,
  onMonthSelect,
}: YearViewProps) {
  const year = currentDate.getFullYear();
  const today = new Date();

  // Pre-index events by YYYY-MM-DD for fast lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      if (!ev.startDate) return;
      const start = ev.startDate;
      const end = ev.endDate || ev.startDate;

      // Handle single or multi-day range
      let cur = new Date(`${start}T00:00:00`);
      const endD = new Date(`${end}T00:00:00`);

      // Prevent runaway loop on invalid dates
      let count = 0;
      while (cur <= endD && count < 60) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, "0");
        const d = String(cur.getDate()).padStart(2, "0");
        const key = `${y}-${m}-${d}`;

        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(ev);

        cur.setDate(cur.getDate() + 1);
        count++;
      }
    });
    return map;
  }, [events]);

  const isToday = (y: number, m: number, d: number) => {
    return (
      today.getFullYear() === y &&
      today.getMonth() === m &&
      today.getDate() === d
    );
  };

  const isSelected = (y: number, m: number, d: number) => {
    return (
      currentDate.getFullYear() === y &&
      currentDate.getMonth() === m &&
      currentDate.getDate() === d
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden font-sans">
      {/* 12 Months Grid (4 columns on desktop, 3 on tablet, 2 on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5 p-1 sm:p-1.5 flex-1 min-h-0 overflow-y-auto">
        {MONTH_NAMES.map((monthName, monthIndex) => {
          const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
          const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();
          const firstDayIndex = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // Monday = 0
          const totalSlots = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

          const handleMonthClick = () => {
            const newDate = new Date(year, monthIndex, 1);
            onDateSelect(newDate);
            onMonthSelect?.(monthIndex);
          };

          return (
            <div
              key={monthName}
              className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs hover:border-border transition-all flex flex-col justify-between font-sans select-none"
            >
              {/* Month Card Header */}
              <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-border/50">
                <button
                  type="button"
                  onClick={handleMonthClick}
                  className="text-xs font-bold text-foreground hover:text-primary transition-colors cursor-pointer tracking-tight"
                  title={`Go to ${monthName} ${year}`}
                >
                  {monthName} {year}
                </button>

                <div className="flex items-center gap-0.5 text-muted-foreground/60">
                  <button
                    type="button"
                    onClick={() => {
                      const prevMonth = new Date(year, monthIndex - 1, 1);
                      onDateSelect(prevMonth);
                      onMonthSelect?.(prevMonth.getMonth());
                    }}
                    className="size-5 rounded-md flex items-center justify-center hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextMonth = new Date(year, monthIndex + 1, 1);
                      onDateSelect(nextMonth);
                      onMonthSelect?.(nextMonth.getMonth());
                    }}
                    className="size-5 rounded-md flex items-center justify-center hover:bg-muted/80 hover:text-foreground cursor-pointer transition-colors"
                    aria-label="Next Month"
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* Weekday Row */}
              <div className="grid grid-cols-7 mb-1 text-center">
                {WEEKDAY_SHORT.map((dayName) => (
                  <div
                    key={dayName}
                    className="text-[9.5px] font-semibold text-muted-foreground/75 uppercase tracking-wider py-0.5"
                  >
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 gap-y-1 gap-x-0.5 text-center flex-1">
                {Array.from({ length: totalSlots }).map((_, slotIdx) => {
                  let dayNum: number;
                  let cellM = monthIndex;
                  let cellY = year;
                  let isCurrentMonth = true;

                  if (slotIdx < firstDayIndex) {
                    dayNum = daysInPrevMonth - firstDayIndex + slotIdx + 1;
                    cellM = monthIndex === 0 ? 11 : monthIndex - 1;
                    cellY = monthIndex === 0 ? year - 1 : year;
                    isCurrentMonth = false;
                  } else if (slotIdx < firstDayIndex + daysInMonth) {
                    dayNum = slotIdx - firstDayIndex + 1;
                  } else {
                    dayNum = slotIdx - (firstDayIndex + daysInMonth) + 1;
                    cellM = monthIndex === 11 ? 0 : monthIndex + 1;
                    cellY = monthIndex === 11 ? year + 1 : year;
                    isCurrentMonth = false;
                  }

                  const activeToday = isToday(cellY, cellM, dayNum);
                  const activeSelected = isSelected(cellY, cellM, dayNum);

                  const dateKey = `${cellY}-${String(cellM + 1).padStart(2, "0")}-${String(
                    dayNum
                  ).padStart(2, "0")}`;
                  const dayEvents = eventsByDate.get(dateKey) || [];
                  const hasEvents = isCurrentMonth && dayEvents.length > 0;

                  const handleDayClick = (e: React.MouseEvent) => {
                    e.stopPropagation();
                    const targetDate = new Date(cellY, cellM, dayNum);
                    onDateSelect(targetDate);
                    onMonthSelect?.(cellM);
                  };

                  return (
                    <button
                      key={`slot-${slotIdx}`}
                      type="button"
                      onClick={handleDayClick}
                      className={`relative flex flex-col items-center justify-center h-6 sm:h-6.5 rounded-lg text-[10.5px] font-medium transition-colors cursor-pointer group ${
                        activeSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                          : activeToday
                          ? "bg-primary/15 text-primary font-bold border border-primary/30"
                          : isCurrentMonth
                          ? "text-foreground hover:bg-accent/60"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60"
                      }`}
                    >
                      <span>{dayNum}</span>

                      {/* Event Indicator Dot */}
                      {hasEvents && !activeSelected && (
                        <span
                          className={`absolute bottom-0.5 size-1 rounded-full ${
                            activeToday ? "bg-primary" : "bg-primary/70"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default YearView;
