import { useState } from "react";
import useRoleFlags from "@/hooks/useRoleFlags";
import { DashboardBanner } from "../components/DashboardBanner";
import { DashboardKpiCards } from "../components/KPICards/DashboardKpiCards";
import { SubjectOverviewSection } from "../components/SubjectOverviewSection";
import { RecentQuestionsCard } from "../components/RecentQuestionsCard";
import { StudentRosterCard } from "../components/StudentRosterCard";
import { FacultyRosterCard } from "../components/FacultyRosterCard";
import { SystemAuditLogsCard } from "../components/SystemAuditLogsCard";
import { FacultyEncodingWatchCard } from "../components/FacultyEncodingWatchCard";
import { InactiveStudentsWatchCard } from "../components/InactiveStudentsWatchCard";
import { CalendarPaceLagCard } from "../components/CalendarPaceLagCard";
import { NudgeTeacherModal } from "@/features/question-bank/components/tracker/NudgeTeacherModal";
import { AssignGuidanceModal } from "@/features/students/components/AssignGuidanceModal";
import type { FacultyTrackItem } from "@/features/question-bank/types/encodingTracker.types";
import type { Student } from "@/features/students/types/types";

export default function Dashboard() {
  const { isSuperAdmin, isDean, isTeamLead } = useRoleFlags();
  const canViewOversight = isSuperAdmin || isDean || isTeamLead;

  const [nudgeItem, setNudgeItem] = useState<FacultyTrackItem | null>(null);
  const [guidanceStudent, setGuidanceStudent] = useState<Student | null>(null);

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

      {/* 6 Major Licensure Examination Subjects Overview */}
      <div className="w-full shrink-0">
        <SubjectOverviewSection />
      </div>

      {/* Dean, SuperAdmin & TeamLead: Academic Oversight & Early Intervention */}
      {canViewOversight && (
        <div className="flex flex-col gap-2.5 w-full shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <FacultyEncodingWatchCard
              onNudgeClick={(item) => setNudgeItem(item)}
            />
            <InactiveStudentsWatchCard
              onInterveneClick={(student) => setGuidanceStudent(student)}
            />
            <CalendarPaceLagCard
              onInterveneClick={(student) => setGuidanceStudent(student)}
            />
          </div>
        </div>
      )}

      {/* SuperAdmin View: Faculty Roster & System Audit Logs */}
      {isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 shrink-0">
          <FacultyRosterCard />
          <SystemAuditLogsCard />
        </div>
      )}

      {/* Operational Grid: Recent Questions & Student Roster */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 shrink-0">
        <RecentQuestionsCard />
        <StudentRosterCard />
      </div> */}

      {/* Modals for Direct Action from Dashboard Cards */}
      <NudgeTeacherModal
        isOpen={Boolean(nudgeItem)}
        onClose={() => setNudgeItem(null)}
        item={nudgeItem}
      />

      <AssignGuidanceModal
        isOpen={Boolean(guidanceStudent)}
        onClose={() => setGuidanceStudent(null)}
        student={guidanceStudent}
      />
    </div>
  );
}

