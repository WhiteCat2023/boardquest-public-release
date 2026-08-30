import DashboardHeader from "../components/DashboardHeader";
import DashboardKpiGrid from "../components/DashboardKpiGrid";
import EmptyDashboardState from "../components/EmptyDashboardState";

export function ReviewCenterDashboard() {
  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto">
      {/* Header Profile Greeting */}
      <DashboardHeader />

      {/* KPI Stats Grid (0 / Standby live zero-state without mock data) */}
      <DashboardKpiGrid />

      {/* Clean Blank Dashboard Main State */}
      <EmptyDashboardState />
    </div>
  );
}

export default ReviewCenterDashboard;
