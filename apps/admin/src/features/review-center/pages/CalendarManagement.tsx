import { useState } from "react";
import CalendarHeader from "../components/CalendarHeader";
import { toast } from "sonner";
import {
  useReviewSchedules,
  useDeleteReviewSchedule,
} from "../api/useCalendar";
import { useReviewCenters } from "../api/useReviewCenter";
import type { ReviewSchedule } from "../types/types";
import ReviewCalendarView from "../components/ReviewCalendarView";
import SetReviewScheduleModal from "../components/SetReviewScheduleModal";

export default function CalendarManagement() {
  const { data: rawSchedules = [], isLoading: isSchedulesLoading } = useReviewSchedules();
  const { data: rawReviewCenters = [] } = useReviewCenters();
  const deleteScheduleMutation = useDeleteReviewSchedule();

  const schedules = Array.isArray(rawSchedules) ? rawSchedules : [];
  const reviewCenters = Array.isArray(rawReviewCenters) ? rawReviewCenters : [];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReviewSchedule | null>(null);

  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleOpenEditSchedule = (sched: ReviewSchedule) => {
    setEditingSchedule(sched);
    setIsModalOpen(true);
  };

  const handleDeleteSchedule = (sched: ReviewSchedule) => {
    deleteScheduleMutation.mutate(sched.id, {
      onSuccess: () => {
        toast.success(`Deleted review schedule "${sched.title}".`);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to delete schedule.");
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* ── Page Header ── */}
      <CalendarHeader onAddSchedule={handleOpenAddSchedule} />

      {/* Interactive Monthly Calendar & Schedule View */}
      <ReviewCalendarView
        schedules={schedules}
        isLoading={isSchedulesLoading}
        onAddSchedule={handleOpenAddSchedule}
        onEditSchedule={handleOpenEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />

      {/* Set Game Final Review Schedule Modal */}
      <SetReviewScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingSchedule}
      />
    </div>
  );
}
