import { useState } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useReviewSchedules,
  useDeleteReviewSchedule,
  useReviewCenters,
} from "./review_center/hooks/useReviewCenter";
import type { ReviewSchedule } from "./review_center/types";
import ReviewCalendarView from "./review_center/components/ReviewCalendarView";
import SetReviewScheduleModal from "./review_center/components/SetReviewScheduleModal";

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
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full min-h-full font-sans bg-background text-foreground">
      {/* Sticky Top Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 border-b border-border z-10">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="text-primary" size={26} />
            Calendar & Review Schedule Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Set and manage start/end dates for intensive board reviews, mock exams, and institutional timelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenAddSchedule}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Schedule Review Period
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
