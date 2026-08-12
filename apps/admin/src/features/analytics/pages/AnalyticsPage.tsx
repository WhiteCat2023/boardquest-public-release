import { useState, useEffect } from "react";
import { BarChart2, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudentListItem, TabType } from "../types/types";
import { useStudentsList, useStudentAnalyticsReport } from "../api/useStudentAnalytics";
import { AspirantRosterSidebar } from "../components/AspirantRosterSidebar";
import { StudentAnalyticsHeader } from "../components/StudentAnalyticsHeader";
import { LLMOptimizationBar } from "../components/LLMOptimizationBar";
import { AnalyticsNavTabs } from "../components/AnalyticsNavTabs";
import { OverviewTab } from "../components/OverviewTab";
import { PerformanceGraphsTab } from "../components/PerformanceGraphsTab";
import { ActivityTimelineTab } from "../components/ActivityTimelineTab";
import { SyllabusReadinessTab } from "../components/SyllabusReadinessTab";
import { AchievementsTab } from "../components/AchievementsTab";

export default function AnalyticsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Query: Get all students
  const { data: studentsData, isLoading: isStudentsLoading } = useStudentsList();
  const studentsList = Array.isArray(studentsData) ? studentsData : [];

  // Filter students by search query
  const filteredStudents = studentsList.filter((s: StudentListItem) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Set first student as default if none selected
  useEffect(() => {
    if (filteredStudents.length > 0 && !selectedStudentId) {
      setSelectedStudentId(filteredStudents[0].id);
    }
  }, [filteredStudents, selectedStudentId]);

  // Query: Get selected student's analytics report
  const { data: report, isLoading: isReportLoading, isRefetching } = useStudentAnalyticsReport(selectedStudentId);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-3.5rem)] overflow-hidden font-sans bg-background text-foreground">
      {/* Left Sidebar: Aspirant Roster */}
      <AspirantRosterSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredStudents={filteredStudents}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={setSelectedStudentId}
      />

      {/* Right Pane: Performance Dashboard */}
      <div className="flex-1 overflow-y-auto bg-background/50 h-full p-4 md:p-5 flex flex-col gap-4 scrollbar-thin">
        {isReportLoading || isStudentsLoading ? (
          <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
            <Card className="p-4 bg-card border-border/70 rounded-2xl space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full bg-muted" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48 bg-muted rounded-md" />
                  <Skeleton className="h-3.5 w-32 bg-muted rounded-md" />
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Skeleton className="h-20 rounded-xl bg-muted" />
              <Skeleton className="h-20 rounded-xl bg-muted" />
              <Skeleton className="h-20 rounded-xl bg-muted" />
              <Skeleton className="h-20 rounded-xl bg-muted" />
            </div>
          </div>
        ) : studentsList.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-24 text-center gap-2.5">
            <Users size={42} className="text-muted-foreground/30 stroke-[1.5]" />
            <p className="font-bold text-foreground text-sm">No Students Found</p>
            <p className="text-xs max-w-xs">There are currently no students registered in the system.</p>
          </div>
        ) : !report ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-24 text-center gap-2.5">
            <BarChart2 size={42} className="text-muted-foreground/30 stroke-[1.5]" />
            <p className="font-bold text-foreground text-sm">No Analytics Data</p>
            <p className="text-xs max-w-xs">Selected student has no recorded performance statistics yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            {/* Student Consolidated Header Banner */}
            <StudentAnalyticsHeader report={report} isRefetching={isRefetching} />

            {/* Token-Saving LLM Optimization Engine Bar */}
            <LLMOptimizationBar cacheStats={report.cacheStats} />

            {/* Segmented Sub-Tabs Navigation */}
            <AnalyticsNavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* TAB CONTENTS */}
            {activeTab === "overview" && <OverviewTab report={report} />}
            {activeTab === "graphs" && <PerformanceGraphsTab report={report} />}
            {activeTab === "timeline" && <ActivityTimelineTab report={report} />}
            {activeTab === "progress" && <SyllabusReadinessTab report={report} />}
            {activeTab === "achievements" && <AchievementsTab report={report} />}
          </div>
        )}
      </div>
    </div>
  );
}
