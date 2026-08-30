import DashboardHeader from "../components/DashboardHeader";
import DashboardKpiGrid from "../components/DashboardKpiGrid";
import EmptyDashboardState from "../components/EmptyDashboardState";
import { useReviewSchedules } from "@/features/schedules/api/useCalendar";
import { useCandidates } from "@/features/students/api/useCandidates";

export function ReviewCenterDashboard() {
  const { data: schedules = [] } = useReviewSchedules();
  const { data: candidatesData } = useCandidates();

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto">
      {/* Header Profile Greeting */}
      <DashboardHeader />

      {/* KPI Stats Grid with live counts */}
      <DashboardKpiGrid
        candidatesCount={candidatesData?.total || 0}
        schedulesCount={schedules.length}
      />

      {/* Clean Blank Dashboard Main State */}
      <EmptyDashboardState />
    </div>
  );
}

export default ReviewCenterDashboard;
