import { useState } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useReviewSchedules,
  useDeleteReviewSchedule,
} from "@/features/review-center";
import { useReviewCenters } from "@/features/review-center";
import type { ReviewSchedule } from "@/features/review-center";
import ReviewCalendarView from "./ReviewCalendarView";
import SetReviewScheduleModal from "./SetReviewScheduleModal";

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
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 md:p-6 w-full min-h-screen lg:min-h-[calc(100vh-5rem)] flex-1 font-sans bg-background text-foreground">
      {/* Sticky Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-3.5 -mt-3 -mx-3 sm:-mt-4 sm:-mx-4 md:-mt-6 md:-mx-6 px-3 sm:px-4 md:px-6 border-b border-border z-10 font-sans">
        <div>
          <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-primary size-4.5 sm:size-5 shrink-0" />
            Calendar & Review Schedule Management
          </h1>
          <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
            Set and manage start/end dates for intensive board reviews, mock exams, and institutional timelines.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <Button
            onClick={handleOpenAddSchedule}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3 sm:px-3.5 h-8 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden xs:inline sm:inline">Schedule Review Period</span>
            <span className="xs:hidden sm:hidden">Schedule</span>
          </Button>
        </div>
      </div>

      {/* Interactive Monthly Calendar & Schedule View */}
      <ReviewCalendarView
        schedules={schedules}
        isLoading={isSchedulesLoading}
        onAddSchedule={handleOpenAddSchedule}
        onEditSchedule={handleOpenEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />

      {/* Set Review Schedule Modal (Start/End Date picker) */}
      <SetReviewScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingSchedule}
        reviewCenters={reviewCenters}
      />
    </div>
  );
}
