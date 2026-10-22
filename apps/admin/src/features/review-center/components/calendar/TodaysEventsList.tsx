import React from "react";
import type { CalendarEvent } from "./types";
import { getEventColor } from "./types";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface TodaysEventsListProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onEventClick: (
    event: CalendarEvent,
    anchorEl?: HTMLElement | null,
    anchorRect?: { top: number; left: number; width: number; height: number } | null
  ) => void;
}

export function TodaysEventsList({
  events,
  selectedDate,
  onEventClick,
}: TodaysEventsListProps) {
  // Filter events that happen on the selected date
  const selectedDateStr = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const todaysEvents = events.filter((ev) => {
    if (!ev.startDate) return false;
    const start = ev.startDate;
    const end = ev.endDate || ev.startDate;
    return selectedDateStr >= start && selectedDateStr <= end;
  });

  // Check if selectedDate is today
  const isActualToday = (() => {
    const today = new Date();
    return (
      today.getDate() === selectedDate.getDate() &&
      today.getMonth() === selectedDate.getMonth() &&
      today.getFullYear() === selectedDate.getFullYear()
    );
  })();

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs font-sans">
      <div className="flex items-center justify-between mb-2.5">
        <h3 className="text-xs font-bold text-foreground tracking-tight">
          {isActualToday ? "Today's Events" : "Selected Day's Events"}
        </h3>
        <span className="text-[9.5px] font-bold text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
          {todaysEvents.length}
        </span>
      </div>

      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
        {todaysEvents.length === 0 ? (
          <div className="py-5 text-center text-muted-foreground flex flex-col items-center gap-1.5">
            <CalendarIcon className="size-5 text-muted-foreground/40" />
            <p className="text-[11px] font-medium">No events scheduled</p>
          </div>
        ) : (
          todaysEvents.map((ev) => {
            const color = getEventColor(ev.category, ev.colorKey);
            const timeDisplay =
              ev.startTime && ev.endTime
                ? `${ev.startTime} - ${ev.endTime}`
                : ev.startTime || "All Day Event";

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
                className="flex items-start gap-2 p-1 -mx-0.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
              >
                <span
                  className={`size-1.5 rounded-full mt-1 shrink-0 ${color.dot}`}
                />
                <div className="min-w-0 flex-1">
                  <h4 className="text-[11px] font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {ev.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock size={10} className="shrink-0 text-muted-foreground/70" />
                    <span className="truncate">{timeDisplay}</span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default TodaysEventsList;
