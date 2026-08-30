import { useState } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  useReviewSchedules,
  useDeleteReviewSchedule,
  type ReviewSchedule,
} from "../api/useCalendar";
import ReviewCalendarView from "../components/ReviewCalendarView";
import SetReviewScheduleModal from "../components/SetReviewScheduleModal";

export function SchedulesPage() {
  const { data: rawSchedules = [], isLoading: isSchedulesLoading } =
    useReviewSchedules();
  const deleteScheduleMutation = useDeleteReviewSchedule();

  const schedules = Array.isArray(rawSchedules) ? rawSchedules : [];

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReviewSchedule | null>(
    null
  );

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
        toast.error(
          err.response?.data?.message || "Failed to delete schedule."
        );
      },
    });
  };

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-primary size-6 shrink-0" />
            Evaluation Schedules
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure partner review periods, mock board dates, and diagnostic drills to sync with the Academic Calendar.
          </p>
        </div>

        <Button
          onClick={handleOpenAddSchedule}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs px-4 h-9 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus size={15} />
          <span>Schedule Review Period</span>
        </Button>
      </div>

      {/* Monthly Interactive Calendar & Schedule List View */}
      <ReviewCalendarView
        schedules={schedules}
        isLoading={isSchedulesLoading}
        onAddSchedule={handleOpenAddSchedule}
        onEditSchedule={handleOpenEditSchedule}
        onDeleteSchedule={handleDeleteSchedule}
      />

      {/* Modal for setting/updating review schedule */}
      <SetReviewScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingSchedule}
      />
    </div>
  );
}

export default SchedulesPage;
