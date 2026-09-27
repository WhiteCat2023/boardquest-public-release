import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReviewSchedule } from "../../types/types";

interface MonthCalendarGridProps {
  schedules: ReviewSchedule[];
  onEditSchedule: (schedule: ReviewSchedule) => void;
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

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function MonthCalendarGrid({
  schedules,
  onEditSchedule,
}: MonthCalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Days in month calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const activeSchedules = schedules || [];

  // Helper to check if a specific day is in range of a schedule
  const getSchedulesForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day,
    ).padStart(2, "0")}`;
    const targetDate = new Date(dayStr);

    return activeSchedules.filter((sched) => {
      if (!sched.startDate || !sched.endDate) return false;
      const start = new Date(sched.startDate);
      const end = new Date(sched.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      targetDate.setHours(12, 0, 0, 0);

      return targetDate >= start && targetDate <= end;
    });
  };

  const todayDate = new Date();
  const isToday = (day: number) => {
    return (
      todayDate.getDate() === day &&
      todayDate.getMonth() === month &&
      todayDate.getFullYear() === year
    );
  };

  return (
    <div className="xl:col-span-2 flex flex-col bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs font-sans">
      {/* Month Navigation & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-3 border-b border-border/80">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
            <CalendarIcon className="size-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {MONTH_NAMES[month]} {year}
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Review schedule and timeline overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-8 px-2.5 text-xs font-semibold rounded-lg border-border cursor-pointer hover:bg-muted"
          >
            Today
          </Button>
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="w-px h-4 bg-border" />
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Days of the Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {DAYS_OF_WEEK.map((d) => (
          <div
            key={d}
            className="py-1.5 text-[10px] sm:text-[11px] font-bold text-muted-foreground tracking-wider uppercase"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Day Grid */}
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-[360px] sm:min-h-[420px]">
        {/* Empty cells before month start */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="rounded-xl bg-muted/10 border border-transparent min-h-[60px] sm:min-h-[72px]"
          />
        ))}

        {/* Days of Month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const daySchedules = getSchedulesForDay(day);
          const hasSchedules = daySchedules.length > 0;
          const today = isToday(day);

          return (
            <div
              key={`day-${day}`}
              className={`
                flex flex-col p-1.5 rounded-xl border transition-all duration-150 relative min-h-[60px] sm:min-h-[72px] overflow-hidden
                ${
                  today
                    ? "border-primary bg-primary/5 font-bold shadow-2xs"
                    : hasSchedules
                    ? "border-border/90 bg-muted/20 hover:bg-muted/40"
                    : "border-border/40 bg-card hover:bg-muted/20"
                }
              `}
            >
              {/* Day Number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`
                    text-[11px] sm:text-xs font-semibold leading-none
                    ${
                      today
                        ? "size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]"
                        : "text-foreground"
                    }
                  `}
                >
                  {day}
                </span>
                {hasSchedules && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </div>

              {/* Day Events Indicator */}
              <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[40px] sm:max-h-[48px] no-scrollbar">
                {daySchedules.slice(0, 2).map((sched) => (
                  <div
                    key={sched.id}
                    onClick={() => onEditSchedule(sched)}
                    className="px-1 py-0.5 rounded text-[9px] font-bold bg-primary/15 text-primary border border-primary/25 truncate cursor-pointer hover:opacity-80 transition-opacity"
                    title={`${sched.title} (${sched.startDate} to ${sched.endDate})`}
                  >
                    {sched.title}
                  </div>
                ))}
                {daySchedules.length > 2 && (
                  <span className="text-[8px] font-bold text-muted-foreground pl-0.5">
                    +{daySchedules.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MonthCalendarGrid;
