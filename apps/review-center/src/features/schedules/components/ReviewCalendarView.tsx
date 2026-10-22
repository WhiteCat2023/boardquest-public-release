import React, { useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  useCreateReviewSchedule,
  useUpdateReviewSchedule,
  useDeleteReviewSchedule,
  type ReviewSchedule,
} from "../api/useCalendar";
import {
  CalendarHeaderToolbar,
  MonthView,
  WeekView,
  DayView,
  YearView,
  CalendarEventDrawer,
  CalendarEventDetailsDialog,
  type CalendarEvent,
  useCalendarStore,
  useFilteredCalendarEvents,
} from "./calendar";

interface ReviewCalendarViewProps {
  schedules: ReviewSchedule[];
  isLoading?: boolean;
  canManage?: boolean;
  onAddSchedule?: () => void;
  onEditSchedule?: (schedule: ReviewSchedule) => void;
  onDeleteSchedule?: (schedule: ReviewSchedule) => void;
  activeSchoolYear?: string;
}

export function ReviewCalendarView({
  schedules,
  isLoading = false,
  canManage = true,
  activeSchoolYear,
}: ReviewCalendarViewProps) {
  const { user } = useAuth();

  const {
    currentDate,
    setCurrentDate,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    setBackendSchedules,
    isModalOpen,
    selectedEvent,
    prefilledTime,
    openCreateModal,
    openEditModal,
    closeModal,
    isDetailsOpen,
    viewingEvent,
    detailsAnchorEl,
    detailsAnchorRect,
    openDetails,
    closeDetails,
    showCalendarSubSidebar,
    setShowCalendarSubSidebar,
  } = useCalendarStore();

  const filteredEvents = useFilteredCalendarEvents();

  // Mutations
  const createMutation = useCreateReviewSchedule();
  const updateMutation = useUpdateReviewSchedule();
  const deleteMutation = useDeleteReviewSchedule();

  // Sync backend schedules into calendar store
  useEffect(() => {
    if (schedules && Array.isArray(schedules)) {
      setBackendSchedules(schedules);
    }
  }, [schedules, setBackendSchedules]);

  // Jump calendar to active school year if far from current
  useEffect(() => {
    if (!activeSchoolYear) return;
    const match = activeSchoolYear.match(/^(\d{4})-\d{4}$/);
    if (match) {
      const syStartYear = parseInt(match[1], 10);
      const todayYear = new Date().getFullYear();
      if (todayYear !== syStartYear && todayYear !== syStartYear + 1) {
        setCurrentDate(new Date(syStartYear, 7, 1));
      }
    }
  }, [activeSchoolYear, setCurrentDate]);

  // Period navigation controls (Month, Week, Day, Year)
  const handlePrev = useCallback(() => {
    setCurrentDate(
      (() => {
        const next = new Date(currentDate);
        if (viewMode === "year") {
          next.setFullYear(next.getFullYear() - 1);
        } else if (viewMode === "month") {
          next.setMonth(next.getMonth() - 1);
        } else if (viewMode === "week") {
          next.setDate(next.getDate() - 7);
        } else {
          next.setDate(next.getDate() - 1);
        }
        return next;
      })()
    );
  }, [currentDate, viewMode, setCurrentDate]);

  const handleNext = useCallback(() => {
    setCurrentDate(
      (() => {
        const next = new Date(currentDate);
        if (viewMode === "year") {
          next.setFullYear(next.getFullYear() + 1);
        } else if (viewMode === "month") {
          next.setMonth(next.getMonth() + 1);
        } else if (viewMode === "week") {
          next.setDate(next.getDate() + 7);
        } else {
          next.setDate(next.getDate() + 1);
        }
        return next;
      })()
    );
  }, [currentDate, viewMode, setCurrentDate]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, [setCurrentDate]);

  // Save Event (Create or Update)
  const handleSaveEvent = (data: Partial<CalendarEvent>) => {
    if (data.id) {
      updateMutation.mutate(
        {
          id: data.id,
          data: {
            title: data.title,
            startDate: data.startDate,
            endDate: data.endDate,
            category: data.category,
            description: data.description,
            schoolYear: activeSchoolYear,
          },
        },
        {
          onSuccess: () => {
            toast.success(`Updated event "${data.title}"`);
          },
          onError: (err: any) => {
            toast.error(
              err.response?.data?.message || "Failed to update event."
            );
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          title: data.title || "Untitled Event",
          startDate: data.startDate || new Date().toISOString().split("T")[0],
          endDate:
            data.endDate || data.startDate || new Date().toISOString().split("T")[0],
          category: data.category || "Board Review",
          description: data.description,
          schoolYear: activeSchoolYear,
        },
        {
          onSuccess: () => {
            toast.success(`Created event "${data.title || "Untitled Event"}"`);
          },
          onError: (err: any) => {
            toast.error(
              err.response?.data?.message || "Failed to create event."
            );
          },
        }
      );
    }
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success("Deleted event.");
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message || "Failed to delete event."
        );
      },
    });
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 h-full gap-3 font-sans animate-in fade-in duration-200">
      {/* Top Header Toolbar */}
      <CalendarHeaderToolbar
        currentDate={currentDate}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onQuickAdd={canManage ? () => openCreateModal() : undefined}
        onFilterClick={() => {
          setShowCalendarSubSidebar(!showCalendarSubSidebar);
        }}
        onNotificationClick={() => {
          toast.info("No unread calendar notifications.");
        }}
        onSettingsClick={() => {
          toast.info("Calendar settings are synced with system preferences.");
        }}
      />

      {/* Main Calendar Grid Panel (Full width with dynamic sidebar handled at layout level) */}
      <main
        className={`w-full flex-1 min-h-0 flex flex-col overflow-hidden ${
          viewMode === "year"
            ? ""
            : "bg-card border border-border/80 rounded-2xl shadow-xs"
        }`}
      >
        <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          {viewMode === "month" && (
            <MonthView
              currentDate={currentDate}
              events={filteredEvents}
              onDateSelect={setCurrentDate}
              onEventClick={openDetails}
              onCellClick={(date) => openCreateModal(date)}
            />
          )}

          {viewMode === "week" && (
            <WeekView
              currentDate={currentDate}
              events={filteredEvents}
              onDateSelect={setCurrentDate}
              onEventClick={openDetails}
              onCellClick={(date, time) => openCreateModal(date, time)}
            />
          )}

          {viewMode === "day" && (
            <DayView
              currentDate={currentDate}
              events={filteredEvents}
              onEventClick={openDetails}
              onSlotClick={(time) => openCreateModal(currentDate, time)}
            />
          )}

          {viewMode === "year" && (
            <YearView
              currentDate={currentDate}
              events={filteredEvents}
              onDateSelect={setCurrentDate}
              onMonthSelect={() => setViewMode("month")}
            />
          )}
        </div>
      </main>

      {/* Event Details Popover (When clicking an event) */}
      <CalendarEventDetailsDialog
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        event={viewingEvent}
        anchorEl={detailsAnchorEl}
        anchorRect={detailsAnchorRect}
        side={viewMode === "day" ? "bottom" : undefined}
        align={viewMode === "day" ? "center" : "start"}
        onEdit={(ev) => {
          closeDetails();
          openEditModal(ev);
        }}
        onDelete={handleDeleteEvent}
        canManage={canManage}
      />

      {/* Event Details / Create / Edit Drawer */}
      <CalendarEventDrawer
        isOpen={isModalOpen}
        onClose={closeModal}
        initialEvent={selectedEvent}
        defaultDate={currentDate}
        defaultTime={prefilledTime}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
        canManage={canManage}
      />
    </div>
  );
}

export default ReviewCalendarView;
