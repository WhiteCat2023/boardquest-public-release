import React, { useEffect, useCallback } from "react";
import { showFeedback } from "@/components/modal";
import useAuth from "@/hooks/useAuth";
import {
  useCreateReviewSchedule,
  useUpdateReviewSchedule,
  useDeleteReviewSchedule,
  useCalendarEvents,
  useCreateCalendarEvent,
  useUpdateCalendarEvent,
  useDeleteCalendarEvent,
} from "../api/useCalendar";
import type { ReviewSchedule } from "../types/types";
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
  isLoading: boolean;
  canManage?: boolean;
  onAddSchedule?: () => void;
  onEditSchedule?: (schedule: ReviewSchedule) => void;
  onDeleteSchedule?: (schedule: ReviewSchedule) => void;
}

export function ReviewCalendarView({
  schedules,
  isLoading,
  canManage = true,
}: ReviewCalendarViewProps) {
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;

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
    setCustomEvents,
    addCustomEvent,
    updateCustomEvent,
    deleteCustomEvent,
  } = useCalendarStore();

  const filteredEvents = useFilteredCalendarEvents();

  // Review schedule mutations (backend programs)
  const createMutation = useCreateReviewSchedule();
  const updateMutation = useUpdateReviewSchedule();
  const deleteMutation = useDeleteReviewSchedule();

  // Calendar event hooks (MongoDB database)
  const { data: dbEvents } = useCalendarEvents();
  const createEventMutation = useCreateCalendarEvent();
  const updateEventMutation = useUpdateCalendarEvent();
  const deleteEventMutation = useDeleteCalendarEvent();

  // Sync backend schedules into calendar store
  useEffect(() => {
    if (schedules && Array.isArray(schedules)) {
      setBackendSchedules(schedules);
    }
  }, [schedules, setBackendSchedules]);

  // Sync database calendar events into calendar store
  useEffect(() => {
    if (dbEvents && Array.isArray(dbEvents)) {
      setCustomEvents(dbEvents);
    }
  }, [dbEvents, setCustomEvents]);

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
      if (data.isSchedule || data.isBackendSchedule) {
        updateMutation.mutate(
          {
            id: data.id,
            data: {
              title: data.title,
              startDate: data.startDate,
              endDate: data.endDate,
              category: data.category,
              description: data.description,
            },
          },
          {
            onSuccess: () => {
              showFeedback.success(`Updated review schedule "${data.title}"`);
            },
            onError: (err: any) => {
              showFeedback.error(
                err.response?.data?.message || "Failed to update schedule."
              );
            },
          }
        );
      } else {
        const updatePayload = {
          ...data,
          authorId: (data as any).authorId ?? viewingEvent?.authorId ?? currentUser?.id,
          authorName:
            (data as any).authorName ??
            viewingEvent?.authorName ??
            currentUser?.name ??
            "Super Admin",
          authorEmail:
            (data as any).authorEmail ??
            viewingEvent?.authorEmail ??
            currentUser?.email,
          createdBy:
            (data as any).createdBy ??
            viewingEvent?.createdBy ??
            currentUser?.id,
        };

        updateEventMutation.mutate(
          { id: data.id, data: updatePayload },
          {
            onSuccess: () => {
              updateCustomEvent(updatePayload as CalendarEvent);
              showFeedback.success(`Updated event "${data.title}"`);
            },
            onError: (err: any) => {
              showFeedback.error(
                err.response?.data?.message || "Failed to update event."
              );
            },
          }
        );
      }
    } else {
      // Creating new event
      const currentUserName =
        currentUser?.name ||
        [currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ") ||
        "Super Admin";

      const eventPayload: Partial<CalendarEvent> = {
        title: data.title || "Untitled Event",
        category: data.category || "Events",
        startDate: data.startDate || new Date().toISOString().split("T")[0],
        endDate:
          data.endDate || data.startDate || new Date().toISOString().split("T")[0],
        startTime: data.startTime || "09:00 AM",
        endTime: data.endTime || "10:00 AM",
        location: data.location || "",
        link: data.link || "",
        conferenceType: data.conferenceType || "Online",
        description: data.description || "",
        status: data.status || "UPCOMING",
        colorKey: data.colorKey || "purple",
        labels: data.labels || [],
        attendees: data.attendees || [],
        attachments: data.attachments || [],
        authorId: currentUser?.id,
        authorName: currentUserName,
        authorEmail: currentUser?.email,
        createdBy: currentUser?.id || "usr-superadmin",
      };

      if (
        data.category === "Board Review" ||
        data.category === "Mock Exam" ||
        data.category?.includes("Review")
      ) {
        createMutation.mutate(
          {
            title: eventPayload.title!,
            companyName: "Institutional (BoardQuest)",
            startDate: eventPayload.startDate!,
            endDate: eventPayload.endDate!,
            category: eventPayload.category!,
            description: eventPayload.description,
          },
          {
            onSuccess: () => {
              showFeedback.success(`Created review schedule "${eventPayload.title}"`);
            },
            onError: (err: any) => {
              showFeedback.error(
                err.response?.data?.message || "Failed to create schedule."
              );
            },
          }
        );
      } else {
        createEventMutation.mutate(eventPayload, {
          onSuccess: (saved) => {
            if (saved?.id) {
              addCustomEvent(saved as CalendarEvent);
            }
            showFeedback.success(
              `Created event "${saved?.title || eventPayload.title}"`
            );
          },
          onError: (err: any) => {
            showFeedback.error(
              err.response?.data?.message || "Failed to create event."
            );
          },
        });
      }
    }
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    const targetEvent = filteredEvents.find((e) => e.id === id);
    const isBackend = targetEvent?.isSchedule || targetEvent?.isBackendSchedule;
    if (isBackend) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          showFeedback.success("Deleted review schedule.");
        },
        onError: (err: any) => {
          showFeedback.error(
            err.response?.data?.message || "Failed to delete schedule."
          );
        },
      });
    } else {
      deleteEventMutation.mutate(id, {
        onSuccess: () => {
          deleteCustomEvent(id);
          showFeedback.success("Deleted event.");
        },
        onError: (err: any) => {
          showFeedback.error(
            err.response?.data?.message || "Failed to delete event."
          );
        },
      });
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full min-h-0 h-full gap-3 font-sans animate-in fade-in duration-200">
      {/* Top Header Toolbar (Outside the container) */}
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
          showFeedback.info("No unread calendar notifications.");
        }}
        onSettingsClick={() => {
          showFeedback.info("Calendar settings are synced with system preferences.");
        }}
      />

      {/* ── Main Panel Container (Contains Month, Week, Day, or Year) ── */}
      <main
        className={`w-full flex-1 min-h-0 flex flex-col overflow-hidden ${
          viewMode === "year"
            ? ""
            : "bg-card border border-border/80 rounded-2xl shadow-xs"
        }`}
      >
        {/* View Selection: Month, Week, Day, or Year */}
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

      {/* Event Details Popover (When clicking an event to view) */}
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

      {/* Event Details / Create / Edit Drawer (Replaced Modal) */}
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
