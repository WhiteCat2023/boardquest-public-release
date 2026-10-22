import React from "react";
import { Plus, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MiniCalendar } from "./MiniCalendar";
import { CalendarCategoryFilter } from "./CalendarCategoryFilter";
import { TodaysEventsList } from "./TodaysEventsList";
import { useCalendarStore, useFilteredCalendarEvents } from "./calendarStore";
import type { CalendarEvent, CategoryFilterItem, CalendarViewMode } from "./types";

export interface CalendarSidebarProps {
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  viewMode?: CalendarViewMode;
  events?: CalendarEvent[];
  categories?: CategoryFilterItem[];
  onToggleCategory?: (id: string) => void;
  onCreateEvent?: () => void;
  onEventClick?: (
    event: CalendarEvent,
    anchorEl?: HTMLElement | null,
    anchorRect?: { top: number; left: number; width: number; height: number } | null
  ) => void;
  canManage?: boolean;
  onBack?: () => void;
  className?: string;
}

export function CalendarSidebar({
  currentDate: propCurrentDate,
  onDateChange: propOnDateChange,
  viewMode: propViewMode,
  events: propEvents,
  categories: propCategories,
  onToggleCategory: propOnToggleCategory,
  onCreateEvent: propOnCreateEvent,
  onEventClick: propOnEventClick,
  canManage = true,
  onBack,
  className = "",
}: CalendarSidebarProps) {
  const store = useCalendarStore();
  const defaultEvents = useFilteredCalendarEvents();

  const currentDate = propCurrentDate ?? store.currentDate;
  const onDateChange = propOnDateChange ?? store.setCurrentDate;
  const viewMode = propViewMode ?? store.viewMode;
  const events = propEvents ?? defaultEvents;
  const categories = propCategories ?? store.categories;
  const onToggleCategory = propOnToggleCategory ?? store.toggleCategory;
  const onCreateEvent = propOnCreateEvent ?? (() => store.openCreateModal());
  const onEventClick =
    propOnEventClick ?? ((evt, el, rect) => store.openDetails(evt, el, rect));

  return (
    <div className={`w-full flex flex-col gap-2.5 font-sans ${className}`}>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 w-full px-2 py-1.5 -mx-0.5 rounded-lg border-0 border-none bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer group select-none text-left"
          title="Back to Navigation Menu"
          aria-label="Back to Navigation Menu"
        >
          <ChevronLeft
            size={15}
            className="shrink-0 text-muted-foreground group-hover:text-foreground transition-transform group-hover:-translate-x-0.5"
          />
          <CalendarIcon className="size-3.5 text-primary shrink-0" />
          <span className="text-[11.5px] font-semibold text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
            Academic Calendar
          </span>
        </button>
      )}

      {/* Top: + Create Event Button */}
      {canManage && (
        <Button
          type="button"
          onClick={onCreateEvent}
          className="w-full h-9 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11.5px] shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
        >
          <Plus size={15} strokeWidth={2.5} />
          <span>Create Event</span>
        </Button>
      )}

      {/* Mini Calendar Card */}
      <MiniCalendar
        currentDate={currentDate}
        onDateChange={onDateChange}
        viewMode={viewMode}
      />

      {/* My Calendars Filter Card */}
      <CalendarCategoryFilter
        categories={categories}
        onToggleCategory={onToggleCategory}
      />

      {/* Today's Schedules Card */}
      <TodaysEventsList
        events={events}
        selectedDate={currentDate}
        onEventClick={onEventClick}
      />
    </div>
  );
}

export default CalendarSidebar;
