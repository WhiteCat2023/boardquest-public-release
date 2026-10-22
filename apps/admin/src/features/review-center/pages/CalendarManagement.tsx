import { useState } from "react";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useReviewSchedules } from "../api/useCalendar";
import type { ReviewSchedule } from "../types/types";
import {
  ReviewCalendarView,
  SetReviewScheduleModal,
} from "../components";

const EMPTY_SCHEDULES: ReviewSchedule[] = [];

export default function CalendarManagement() {
  const { canManageSchedules } = useRoleFlags();
  const { data: rawSchedules, isLoading: isSchedulesLoading } = useReviewSchedules();
  const schedules = Array.isArray(rawSchedules) ? rawSchedules : EMPTY_SCHEDULES;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReviewSchedule | null>(null);

  const handleOpenAddSchedule = () => {
    if (!canManageSchedules) return;
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  const handleOpenEditSchedule = (sched: ReviewSchedule) => {
    if (!canManageSchedules) return;
    setEditingSchedule(sched);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col p-3 sm:p-4 w-full flex-1 min-h-0 h-full font-sans bg-background text-foreground">
      {/* Interactive Monthly Calendar & Schedule View */}
      <ReviewCalendarView
        schedules={schedules}
        isLoading={isSchedulesLoading}
        canManage={canManageSchedules}
        onAddSchedule={handleOpenAddSchedule}
        onEditSchedule={handleOpenEditSchedule}
      />

      {/* Set Game Final Review Schedule Modal */}
      {canManageSchedules && (
        <SetReviewScheduleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialData={editingSchedule}
        />
      )}
    </div>
  );
}
