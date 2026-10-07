import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { useDeleteReviewSchedule } from "../api/useCalendar";
import type { ReviewSchedule } from "../types/types";
import { MonthCalendarGrid, ScheduledPeriodsList } from "./calendar";

interface ReviewCalendarViewProps {
  schedules: ReviewSchedule[];
  isLoading: boolean;
  canManage?: boolean;
  onAddSchedule: () => void;
  onEditSchedule: (schedule: ReviewSchedule) => void;
  onDeleteSchedule?: (schedule: ReviewSchedule) => void;
}

export function ReviewCalendarView({
  schedules,
  isLoading,
  canManage = true,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}: ReviewCalendarViewProps) {
  const deleteScheduleMutation = useDeleteReviewSchedule();

  // Selected schedule ID: null by default so calendar starts clean without showing all schedules automatically
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const selectedSchedule = useMemo(() => {
    if (!selectedScheduleId) return null;
    return schedules.find((s) => s.id === selectedScheduleId) || null;
  }, [schedules, selectedScheduleId]);

  // Only display the selected schedule in the calendar
  const calendarSchedules = useMemo(() => {
    if (!selectedScheduleId) {
      return [];
    }
    return selectedSchedule ? [selectedSchedule] : [];
  }, [selectedScheduleId, selectedSchedule]);

  const handleSelectSchedule = (sched: ReviewSchedule) => {
    // Clicking the same schedule toggles it off
    setSelectedScheduleId((prev) => (prev === sched.id ? null : sched.id));
  };

  const handleClearSelection = () => {
    setSelectedScheduleId(null);
  };

  const handleDeleteSchedule = (sched: ReviewSchedule) => {
    if (selectedScheduleId === sched.id) {
      setSelectedScheduleId(null);
    }
    if (onDeleteSchedule) {
      onDeleteSchedule(sched);
      return;
    }

    deleteScheduleMutation.mutate(sched.id, {
      onSuccess: () => {
        toast.success(`Deleted review schedule "${sched.title}".`);
      },
      onError: (err: any) => {
        toast.error(
          err.response?.data?.message || "Failed to delete schedule.",
        );
      },
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full font-sans">
      {/* ── Left 2 Cols: Monthly Calendar Grid ── */}
      <MonthCalendarGrid
        schedules={calendarSchedules}
        selectedSchedule={selectedSchedule}
        onClearSelection={handleClearSelection}
        canManage={canManage}
        onEditSchedule={onEditSchedule}
      />

      {/* ── Right Col: Scheduled Review Periods List ── */}
      <ScheduledPeriodsList
        schedules={schedules}
        selectedScheduleId={selectedScheduleId}
        onSelectSchedule={handleSelectSchedule}
        onClearSelection={handleClearSelection}
        isLoading={isLoading}
        canManage={canManage}
        onAddSchedule={onAddSchedule}
        onEditSchedule={onEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />
    </div>
  );
}

export default ReviewCalendarView;
