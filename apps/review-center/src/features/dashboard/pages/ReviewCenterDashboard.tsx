import { useMemo } from "react";
import DashboardHeader from "../components/DashboardHeader";
import DashboardKpiGrid from "../components/DashboardKpiGrid";
import SubjectPassRateAnalytics from "../components/SubjectPassRateAnalytics";
import { ErrorBoundary } from "@/components/custom/ErrorBoundary";
import { useReviewSchedules } from "@/features/schedules/api/useCalendar";
import { useCandidates } from "@/features/students/api/useCandidates";
import { useAssessments } from "@/features/scores/api/useAssessments";

export function ReviewCenterDashboard() {
  const { data: schedules = [] } = useReviewSchedules();
  const { data: candidatesData } = useCandidates();
  const { data: assessmentsData } = useAssessments();

  const averageScore = useMemo(() => {
    const assessments = assessmentsData?.assessments || [];
    let passed = 0;
    let total = 0;
    for (const a of assessments) {
      passed += a.passCount || 0;
      total += (a.passCount || 0) + (a.failCount || 0);
    }
    return total > 0 ? Number(((passed / total) * 100).toFixed(1)) : null;
  }, [assessmentsData]);

  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans pb-12">
      {/* Header Profile Greeting */}
      <DashboardHeader />

      {/* KPI Stats Grid with live counts */}
      <DashboardKpiGrid
        candidatesCount={candidatesData?.total || 0}
        schedulesCount={schedules.length}
        averageScore={averageScore}
      />

      {/* Subject Passing Rates Graphs with error boundary */}
      <ErrorBoundary fallbackTitle="Unable to load subject pass rate analytics">
        <SubjectPassRateAnalytics />
      </ErrorBoundary>
    </div>
  );
}

export default ReviewCenterDashboard;
