import React from "react";
import type { CalendarEvent } from "./types";
import { getEventColor } from "./types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventClick: (
    event: CalendarEvent,
    anchorEl?: HTMLElement | null,
    anchorRect?: { top: number; left: number; width: number; height: number } | null
  ) => void;
  onCellClick?: (date: Date) => void;
}

const WEEKDAY_NAMES = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function MonthView({
  currentDate,
  events,
  onDateSelect,
  onEventClick,
  onCellClick,
}: MonthViewProps) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

  const today = new Date();
  const isToday = (d: number, m: number, y: number) => {
    return (
      today.getDate() === d &&
      today.getMonth() === m &&
      today.getFullYear() === y
    );
  };

  const isSelected = (d: number, m: number, y: number) => {
    return (
      currentDate.getDate() === d &&
      currentDate.getMonth() === m &&
      currentDate.getFullYear() === y
    );
  };

  // Helper to get events for a given YYYY-MM-DD
  const getEventsForDay = (day: number, m: number, y: number) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return events.filter((ev) => {
      if (!ev.startDate) return false;
      const start = ev.startDate;
      const end = ev.endDate || ev.startDate;
      return dateStr >= start && dateStr <= end;
    });
  };

  // Total grid slots: prev days + current days + next trailing days
  const totalSlots = Math.ceil((firstDayIndex + daysInMonth) / 7) * 7;

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden font-sans">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-border/80 bg-muted/20 shrink-0">
        {WEEKDAY_NAMES.map((name) => (
          <div
            key={name}
            className="py-2 text-center text-[10.5px] font-semibold text-muted-foreground/80 tracking-wider uppercase"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Month Days Grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr divide-x divide-y divide-border/60 min-h-0">
        {Array.from({ length: totalSlots }).map((_, index) => {
          let dayNumber: number;
          let cellMonth: number;
          let cellYear: number;
          let isCurrentMonth = true;

          if (index < firstDayIndex) {
            // Previous month trailing days
            dayNumber = daysInPrevMonth - firstDayIndex + index + 1;
            cellMonth = month === 0 ? 11 : month - 1;
            cellYear = month === 0 ? year - 1 : year;
            isCurrentMonth = false;
          } else if (index < firstDayIndex + daysInMonth) {
            // Current month days
            dayNumber = index - firstDayIndex + 1;
            cellMonth = month;
            cellYear = year;
          } else {
            // Next month leading days
            dayNumber = index - (firstDayIndex + daysInMonth) + 1;
            cellMonth = month === 11 ? 0 : month + 1;
            cellYear = month === 11 ? year + 1 : year;
            isCurrentMonth = false;
          }

          const dayEvents = getEventsForDay(dayNumber, cellMonth, cellYear);
          const activeToday = isToday(dayNumber, cellMonth, cellYear);
          const activeSelected = isSelected(dayNumber, cellMonth, cellYear);

          const maxVisibleEvents = 2;
          const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
          const overflowCount = dayEvents.length - maxVisibleEvents;

          const handleCellClick = () => {
            const newDate = new Date(cellYear, cellMonth, dayNumber);
            onDateSelect(newDate);
            onCellClick?.(newDate);
          };

          return (
            <div
              key={`cell-${index}`}
              onClick={handleCellClick}
              className={`min-h-[90px] sm:min-h-[115px] p-1.5 sm:p-2 flex flex-col justify-between transition-colors cursor-pointer group ${
                isCurrentMonth
                  ? "bg-card hover:bg-accent/30"
                  : "bg-muted/10 opacity-45 hover:opacity-75"
              }`}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`size-5.5 text-[11px] font-semibold rounded-md flex items-center justify-center transition-all ${
                    activeSelected
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : activeToday
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : isCurrentMonth
                      ? "text-foreground group-hover:text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {String(dayNumber).padStart(2, "0")}
                </span>
              </div>

              {/* Day Events Stack */}
              <div className="flex flex-col gap-1 flex-1 overflow-hidden">
                {visibleEvents.map((ev) => {
                  const color = getEventColor(ev.category, ev.colorKey);
                  const isMultiDay = ev.startDate !== (ev.endDate || ev.startDate);
                  const timeLabel = ev.startTime ? `${ev.startTime} - ` : "";

                  return (
                    <div
                      key={ev.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        onEventClick(ev, e.currentTarget, {
                          top: rect.top,
                          left: rect.left,
                          width: rect.width,
                          height: rect.height,
                        });
                      }}
                      className={`text-[9.5px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-md truncate cursor-pointer transition-all border-l-3 select-none ${
                        color.borderLeft
                      } ${color.bg} ${color.text} hover:opacity-85 ${
                        isMultiDay ? "ring-1 ring-primary/20" : ""
                      }`}
                      title={`${ev.title} ${timeLabel ? `(${timeLabel})` : ""}`}
                    >
                      <span>{timeLabel}</span>
                      <span>{ev.title}</span>
                    </div>
                  );
                })}

                {/* Overflow + More Popover */}
                {overflowCount > 0 && (
                  <DayOverflowPopover
                    dayNumber={dayNumber}
                    weekdayName={WEEKDAY_NAMES[index % 7]}
                    dayEvents={dayEvents}
                    overflowCount={overflowCount}
                    onEventClick={onEventClick}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayOverflowPopover({
  dayNumber,
  weekdayName,
  dayEvents,
  overflowCount,
  onEventClick,
}: {
  dayNumber: number;
  weekdayName: string;
  dayEvents: CalendarEvent[];
  overflowCount: number;
  onEventClick: (
    event: CalendarEvent,
    anchorEl?: HTMLElement | null,
    anchorRect?: { top: number; left: number; width: number; height: number } | null
  ) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(true);
          }}
          className="text-[10px] sm:text-[11px] font-bold text-primary hover:underline text-left mt-0.5 px-1 py-0.5 cursor-pointer rounded"
        >
          + {overflowCount} More
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-64 p-2.5 rounded-xl shadow-lg border border-border bg-card font-sans space-y-1.5 z-40"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-xs font-bold text-foreground border-b border-border/80 pb-1 px-1">
          Events for {String(dayNumber).padStart(2, "0")} {weekdayName}
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1 pt-1">
          {dayEvents.map((ev) => {
            const color = getEventColor(ev.category, ev.colorKey);
            return (
              <div
                key={ev.id}
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const anchorRect = {
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                  };
                  // Auto-close overflow popover so it doesn't overlap or stick around
                  setIsOpen(false);
                  onEventClick(ev, null, anchorRect);
                }}
                className={`text-[11px] font-semibold px-2 py-1 rounded border-l-3 cursor-pointer ${color.borderLeft} ${color.bg} ${color.text} hover:opacity-85`}
              >
                <div className="truncate font-bold">{ev.title}</div>
                {ev.startTime && (
                  <div className="text-[10px] opacity-80">
                    {ev.startTime}
                    {ev.endTime ? ` - ${ev.endTime}` : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default MonthView;
