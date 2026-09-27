import { useState } from "react";
import { useReviewSchedules } from "../api/useCalendar";
import type { ReviewSchedule } from "../types/types";
import {
  CalendarHeader,
  ReviewCalendarView,
  SetReviewScheduleModal,
} from "../components";

export default function CalendarManagement() {
  const { data: rawSchedules = [], isLoading: isSchedulesLoading } = useReviewSchedules();
  const schedules = Array.isArray(rawSchedules) ? rawSchedules : [];

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
