import useRoleFlags from "@/hooks/useRoleFlags";
import { DashboardBanner } from "../components/DashboardBanner";
import { DashboardKpiCards } from "../components/KPICards/DashboardKpiCards";
import { SubjectOverviewSection } from "../components/SubjectOverviewSection";
import { RecentQuestionsCard } from "../components/RecentQuestionsCard";
import { StudentRosterCard } from "../components/StudentRosterCard";
import { StudentPassingRateAnalytics } from "../components/StudentPassingRateAnalytics";
import { FacultyRosterCard } from "../components/FacultyRosterCard";
import { SystemAuditLogsCard } from "../components/SystemAuditLogsCard";

export default function Dashboard() {
  const { isSuperAdmin } = useRoleFlags();

  return (
    <div className="flex flex-col gap-3.5 p-3 sm:p-4 md:p-5 w-full font-sans bg-background text-foreground">
      {/* Banner Section (System Condition & Status) */}
      <div className="w-full shrink-0">
        <DashboardBanner />
      </div>

      {/* System Overview KPI Cards */}
      <div className="w-full shrink-0">
        <DashboardKpiCards />
      </div>

      {/* SuperAdmin View: Faculty Roster & System Audit Logs */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 shrink-0">
          <FacultyRosterCard />
          <SystemAuditLogsCard />
        </div>
      )}

      {/* Operational Sections: Hidden for SUPERADMIN */}
      {!isSuperAdmin && (
        <>
          {/* App Analytics: Line Graph & Performance Distribution */}
          <div className="w-full shrink-0">
            <StudentPassingRateAnalytics />
          </div>

          {/* 6 Major Licensure Examination Subjects Overview */}
          <div className="w-full shrink-0">
            <SubjectOverviewSection />
          </div>

          {/* Operational Grid: Recent Questions & Student Roster */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 shrink-0">
            <RecentQuestionsCard />
            <StudentRosterCard />
          </div>
        </>
      )}
    </div>
  );
}
