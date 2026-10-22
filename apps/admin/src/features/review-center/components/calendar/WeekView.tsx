import React from "react";
import type { CalendarEvent } from "./types";
import { getEventColor } from "./types";
import { Clock } from "lucide-react";

interface WeekViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onDateSelect: (date: Date) => void;
  onEventClick: (
    event: CalendarEvent,
    anchorEl?: HTMLElement | null,
    anchorRect?: { top: number; left: number; width: number; height: number } | null
  ) => void;
  onCellClick?: (date: Date, hourStr: string) => void;
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

const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

export function WeekView({
  currentDate,
  events,
  onDateSelect,
  onEventClick,
  onCellClick,
}: WeekViewProps) {
  // Compute Monday of the current week
  const dayOfWeek = (currentDate.getDay() + 6) % 7; // Monday = 0
  const monday = new Date(currentDate);
  monday.setDate(currentDate.getDate() - dayOfWeek);

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  // Convert time string like "08:30 AM" or "14:00" to hour number (e.g. 8.5)
  const parseHourFromTime = (timeStr?: string): number => {
    if (!timeStr) return 8; // default morning slot
    const upper = timeStr.toUpperCase().trim();
    const match = upper.match(/(\d+):?(\d*)\s*(AM|PM)?/);
    if (!match) return 8;

    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3];

    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    return hour + minute / 60;
  };

  // Format date to YYYY-MM-DD
  const formatDateStr = (d: Date) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden font-sans">
      {/* Week Header Row */}
      <div className="grid grid-cols-8 border-b border-border/80 bg-muted/20 shrink-0">
        {/* Empty top-left cell above time column */}
        <div className="py-2.5 px-2 text-center text-[11px] font-bold text-muted-foreground border-r border-border/60">
          Time
        </div>

        {/* 7 Days Headers: Day Number + Day Name */}
        {weekDays.map((dayDate, i) => {
          const isCurrentToday = isSameDay(dayDate, today);
          const isCurrentSelected = isSameDay(dayDate, currentDate);

          return (
            <div
              key={i}
              onClick={() => onDateSelect(dayDate)}
              className="py-2 px-1 text-center border-r border-border/60 last:border-r-0 cursor-pointer hover:bg-accent/30 transition-colors"
            >
              <div
                className={`size-6 text-[11px] font-semibold rounded-lg flex items-center justify-center mx-auto mb-0.5 ${
                  isCurrentSelected
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : isCurrentToday
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "text-foreground"
                }`}
              >
                {String(dayDate.getDate()).padStart(2, "0")}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground/80 uppercase tracking-wider">
                {WEEKDAY_NAMES[i]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Time Grid Body */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border/60">
        {TIME_SLOTS.map((timeLabel, slotIndex) => {
          const slotHour = 8 + slotIndex; // 8 AM to 6 PM

          return (
            <div key={timeLabel} className="grid grid-cols-8 min-h-[75px] divide-x divide-border/60">
              {/* Left Column: Time Label */}
              <div className="p-2 text-[10px] font-semibold text-muted-foreground/80 flex items-start justify-center bg-muted/10 select-none">
                {timeLabel}
              </div>

              {/* 7 Day Slot Cells */}
              {weekDays.map((dayDate, dayIndex) => {
                const dayDateStr = formatDateStr(dayDate);

                // Find events happening on this date and roughly in this hour
                const matchingEvents = events.filter((ev) => {
                  if (!ev.startDate) return false;
                  const start = ev.startDate;
                  const end = ev.endDate || ev.startDate;
                  const onDate = dayDateStr >= start && dayDateStr <= end;
                  if (!onDate) return false;

                  // If event has time, check hour match
                  if (ev.startTime) {
                    const evHour = Math.floor(parseHourFromTime(ev.startTime));
                    return evHour === slotHour;
                  }
                  // Fallback: show untimed events at 8 AM slot
                  return slotHour === 8;
                });

                return (
                  <div
                    key={dayIndex}
                    onClick={() => {
                      onDateSelect(dayDate);
                      onCellClick?.(dayDate, timeLabel);
                    }}
                    className="p-1 flex flex-col gap-1 transition-colors hover:bg-accent/20 cursor-pointer relative group"
                  >
                    {matchingEvents.map((ev) => {
                      const color = getEventColor(ev.category, ev.colorKey);
                      const timeRangeStr =
                        ev.startTime && ev.endTime
                          ? `${ev.startTime} - ${ev.endTime}`
                          : ev.startTime || timeLabel;

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
                          className={`p-1.5 rounded-lg border-l-3 shadow-2xs transition-all cursor-pointer select-none ${color.borderLeft} ${color.bg} hover:shadow-xs hover:scale-[1.01]`}
                          title={`${ev.title} (${timeRangeStr})`}
                        >
                          <h4
                            className={`text-[11px] font-semibold truncate leading-tight ${color.text}`}
                          >
                            {ev.title}
                          </h4>
                          <p className="text-[9.5px] text-muted-foreground/80 font-medium truncate mt-0.5 flex items-center gap-1">
                            <Clock size={9.5} className="shrink-0" />
                            <span>{timeRangeStr}</span>
                          </p>
                        </div>
                      );
                    })}

                    {/* Subtle add hint on hover if cell is empty */}
                    {matchingEvents.length === 0 && (
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                        <span className="text-[10px] text-muted-foreground/60 font-medium bg-background/80 px-2 py-0.5 rounded-md border border-border/40 shadow-2xs">
                          + Add
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WeekView;
