import React from "react";
import type { CalendarEvent } from "./types";
import { getEventColor } from "./types";
import { Clock, Plus, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DayViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (
    event: CalendarEvent,
    anchorEl?: HTMLElement | null,
    anchorRect?: { top: number; left: number; width: number; height: number } | null
  ) => void;
  onSlotClick?: (hourStr: string) => void;
}

const DAY_HOURS = [
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
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
];

export function DayView({
  currentDate,
  events,
  onEventClick,
  onSlotClick,
}: DayViewProps) {
  const currentDateStr = `${currentDate.getFullYear()}-${String(
    currentDate.getMonth() + 1
  ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;

  // Filter events happening on this date
  const dayEvents = events.filter((ev) => {
    if (!ev.startDate) return false;
    const start = ev.startDate;
    const end = ev.endDate || ev.startDate;
    return currentDateStr >= start && currentDateStr <= end;
  });

  // Convert time string like "09:30 AM" or "14:00" to hour number (e.g. 9.5)
  const parseHourFromTime = (timeStr?: string): number => {
    if (!timeStr) return 9; // default 9 AM
    const upper = timeStr.toUpperCase().trim();
    const match = upper.match(/(\d+):?(\d*)\s*(AM|PM)?/);
    if (!match) return 9;

    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const meridiem = match[3];

    if (meridiem === "PM" && hour < 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;

    return hour + minute / 60;
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-hidden font-sans">
      {/* Day Schedule Scroll Area */}
      <div className="flex-1 overflow-y-auto min-h-0 divide-y divide-border/60">
        {DAY_HOURS.map((hourLabel, index) => {
          const slotHour = 8 + index;

          // Find events assigned to this hour
          const matchingEvents = dayEvents.filter((ev) => {
            if (ev.startTime) {
              const evHour = Math.floor(parseHourFromTime(ev.startTime));
              return evHour === slotHour;
            }
            return slotHour === 9; // untimed default
          });

          return (
            <div
              key={hourLabel}
              className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] min-h-[68px] divide-x divide-border/60 group relative"
            >
              {/* Left Column: Hour Label */}
              <div className="p-3 text-[11px] font-semibold text-muted-foreground/80 flex items-center justify-center bg-muted/10 select-none">
                {hourLabel}
              </div>

              {/* Right Column: Event slot content */}
              <div
                onClick={() => onSlotClick?.(hourLabel)}
                className="p-2 sm:p-2.5 flex flex-col justify-center gap-2 hover:bg-accent/20 transition-colors cursor-pointer relative"
              >
                {matchingEvents.length > 0 ? (
                  matchingEvents.map((ev) => {
                    const color = getEventColor(ev.category, ev.colorKey);
                    const timeRangeStr =
                      ev.startTime && ev.endTime
                        ? `${ev.startTime} - ${ev.endTime}`
                        : ev.startTime || hourLabel;

                    const attendees = ev.attendees || [];

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
                        className={`w-full p-2.5 sm:p-3 rounded-xl border-l-4 flex items-center justify-between gap-3 shadow-2xs transition-all cursor-pointer select-none ${color.borderLeft} ${color.bg} hover:shadow-xs hover:scale-[1.005]`}
                      >
                        <div className="min-w-0 flex-1">
                          <h4
                            className={`text-xs sm:text-[13px] font-semibold tracking-tight truncate ${color.text}`}
                          >
                            {ev.title}
                          </h4>
                          <p className="text-[10px] text-muted-foreground/80 font-medium flex items-center gap-1.5 mt-0.5">
                            <Clock size={11} className="shrink-0" />
                            <span>{timeRangeStr}</span>
                            {ev.category && (
                              <>
                                <span className="opacity-40">•</span>
                                <span className="truncate">{ev.category}</span>
                              </>
                            )}
                          </p>
                        </div>

                        {/* Avatar Stack on Right */}
                        {attendees.length > 0 && (
                          <div className="flex items-center -space-x-2 shrink-0">
                            {attendees.slice(0, 3).map((att, i) => (
                              <Avatar
                                key={i}
                                className="size-6 sm:size-7 border-2 border-background ring-1 ring-border shadow-2xs"
                              >
                                {att.avatarUrl ? (
                                  <AvatarImage src={att.avatarUrl} alt={att.name} />
                                ) : null}
                                <AvatarFallback className="text-[10px] font-bold bg-muted text-foreground">
                                  {att.initials || att.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {attendees.length > 3 && (
                              <span className="size-6 sm:size-7 rounded-full bg-primary/20 border-2 border-background text-[10px] font-bold text-primary flex items-center justify-center shadow-2xs">
                                +{attendees.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* Empty Slot Prompt on Hover (Screenshot 3 design: + Create New Event) */
                  <div className="w-full flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/50 group-hover:text-primary transition-colors py-1.5 px-2">
                    <Plus size={14} />
                    <span>Create New Event</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DayView;
