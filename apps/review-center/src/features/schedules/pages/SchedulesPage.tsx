import {
  useReviewSchedules,
} from "../api/useCalendar";
import ReviewCalendarView from "../components/ReviewCalendarView";
import { useActiveSchoolYear } from "@/context/SchoolYearContext";

export function SchedulesPage() {
  const { activeSchoolYear } = useActiveSchoolYear();
  const { data: rawSchedules = [], isLoading: isSchedulesLoading } =
    useReviewSchedules({ schoolYear: activeSchoolYear });

  const schedules = Array.isArray(rawSchedules) ? rawSchedules : [];

  return (
    <div className="flex flex-col p-3 sm:p-4 w-full flex-1 min-h-0 h-full font-sans bg-background text-foreground">
      {/* Full Modern Google Calendar View */}
      <ReviewCalendarView
        schedules={schedules}
        isLoading={isSchedulesLoading}
        activeSchoolYear={activeSchoolYear}
      />
    </div>
  );
}

export default SchedulesPage;
