import { useState } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-6 p-4 sm:p-6 md:p-8 pb-16 w-full max-w-7xl mx-auto font-sans bg-background text-foreground">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="size-6 text-primary shrink-0" />
            <span>Academic Calendar</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Set and manage institutional game final review periods, mock exams, and review center timelines.
          </p>
        </div>

        <Button
          onClick={handleOpenAddSchedule}
          className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Schedule Review Period</span>
        </Button>
      </div>

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
