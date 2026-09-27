import React from "react";
import { toast } from "sonner";
import { useDeleteReviewSchedule } from "../api/useCalendar";
import type { ReviewSchedule } from "../types/types";
import { MonthCalendarGrid, ScheduledPeriodsList } from "./calendar";

interface ReviewCalendarViewProps {
  schedules: ReviewSchedule[];
  isLoading: boolean;
  onAddSchedule: () => void;
  onEditSchedule: (schedule: ReviewSchedule) => void;
  onDeleteSchedule?: (schedule: ReviewSchedule) => void;
}

export function ReviewCalendarView({
  schedules,
  isLoading,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}: ReviewCalendarViewProps) {
  const deleteScheduleMutation = useDeleteReviewSchedule();

  const handleDeleteSchedule = (sched: ReviewSchedule) => {
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
        schedules={schedules}
        onEditSchedule={onEditSchedule}
      />

      {/* ── Right Col: Scheduled Review Periods List ── */}
      <ScheduledPeriodsList
        schedules={schedules}
        isLoading={isLoading}
        onAddSchedule={onAddSchedule}
        onEditSchedule={onEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />
    </div>
  );
}

export default ReviewCalendarView;
