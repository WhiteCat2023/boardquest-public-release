import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart2, Users, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { TabType } from "../types/types";
import {
  useStudentsList,
  useStudentAnalyticsReport,
} from "../api/useStudentAnalytics";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStudentId = searchParams.get("studentId");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    urlStudentId,
  );
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isMobileRosterOpen, setIsMobileRosterOpen] = useState(false);

  // Query: Get all students (search filtered on backend)
  const { data: studentsData, isLoading: isStudentsLoading } = useStudentsList({
    search: searchQuery,
  });
  const studentsList = Array.isArray(studentsData) ? studentsData : [];

  const filteredStudents = studentsList;

  // Sync selected student from URL or fallback to first valid student
  useEffect(() => {
    if (filteredStudents.length > 0) {
      const exists = filteredStudents.some((s) => s.id === urlStudentId);
      if (urlStudentId && exists) {
        if (selectedStudentId !== urlStudentId) {
          setSelectedStudentId(urlStudentId);
        }
      } else if (
        !selectedStudentId ||
        !filteredStudents.some((s) => s.id === selectedStudentId)
      ) {
        const firstId = filteredStudents[0].id;
        setSelectedStudentId(firstId);
        setSearchParams({ studentId: firstId }, { replace: true });
      }
    }
  }, [urlStudentId, filteredStudents, selectedStudentId, setSearchParams]);

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    setSearchParams({ studentId: id });
    setIsMobileRosterOpen(false);
  };

  // Query: Get selected student's analytics report
  const {
    data: report,
    isLoading: isReportLoading,
    isRefetching,
  } = useStudentAnalyticsReport(selectedStudentId);

  const selectedStudentName = report?.studentInfo?.name || "Select Student";

  return (
    <div className="flex flex-col lg:flex-row h-full flex-1 overflow-hidden font-sans bg-background text-foreground min-w-0">
      {/* Desktop Left Sidebar: Aspirant Roster (hidden on < lg) */}
      <AspirantRosterSidebar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredStudents={filteredStudents}
        selectedStudentId={selectedStudentId}
        setSelectedStudentId={handleSelectStudent}
        className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 border-r border-border/80"
      />

      {/* Mobile Drawer Sheet for Aspirant Roster */}
      <Sheet open={isMobileRosterOpen} onOpenChange={setIsMobileRosterOpen}>
        <SheetContent side="left" className="p-0 w-[85vw] sm:w-[360px] max-w-sm">
          <AspirantRosterSidebar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredStudents={filteredStudents}
            selectedStudentId={selectedStudentId}
            setSelectedStudentId={handleSelectStudent}
            onStudentSelected={() => setIsMobileRosterOpen(false)}
            className="h-full border-none"
          />
        </SheetContent>
      </Sheet>

      {/* Right Pane: Performance Dashboard */}
      <div className="flex-1 overflow-y-auto bg-background/50 h-full p-3 sm:p-4 md:p-5 flex flex-col gap-3.5 sm:gap-4 scrollbar-thin min-w-0">
        {/* Mobile quick roster toggle button */}
        <div className="lg:hidden flex items-center justify-between gap-2 p-2.5 bg-card border border-border/70 rounded-xl shadow-2xs min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider shrink-0">Student:</span>
            <span className="text-xs font-bold text-foreground truncate">{selectedStudentName}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMobileRosterOpen(true)}
            className="h-7 px-2.5 text-xs font-bold text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <Users size={13} />
            <span>Select Student</span>
            <ChevronRight size={12} />
          </Button>
        </div>

        {isReportLoading || isStudentsLoading ? (
          <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200 min-w-0">
            <Card className="p-4 bg-card border-border/70 rounded-2xl space-y-3">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full bg-muted shrink-0" />
                <div className="space-y-2 min-w-0 flex-1">
                  <Skeleton className="h-5 w-48 bg-muted rounded-md max-w-full" />
                  <Skeleton className="h-3.5 w-32 bg-muted rounded-md max-w-full" />
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
            <Users
              size={42}
              className="text-muted-foreground/30 stroke-[1.5]"
            />
            <p className="font-bold text-foreground text-sm">
              No Students Found
            </p>
            <p className="text-xs max-w-xs">
              There are currently no students registered in the system.
            </p>
          </div>
        ) : !report ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-24 text-center gap-2.5">
            <BarChart2
              size={42}
              className="text-muted-foreground/30 stroke-[1.5]"
            />
            <p className="font-bold text-foreground text-sm">
              No Performance Data
            </p>
            <p className="text-xs max-w-xs">
              Selected student has no recorded performance statistics yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-150 min-w-0">
            {/* Student Consolidated Header Banner */}
            <StudentAnalyticsHeader
              report={report}
              isRefetching={isRefetching}
            />

            {/* Token-Saving LLM Optimization Engine Bar */}
            {/* <LLMOptimizationBar cacheStats={report.cacheStats} /> */}

            {/* Segmented Sub-Tabs Navigation */}
            <AnalyticsNavTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* TAB CONTENTS */}
            {activeTab === "overview" && <OverviewTab report={report} />}
            {activeTab === "graphs" && <PerformanceGraphsTab report={report} />}
            {activeTab === "timeline" && (
              <ActivityTimelineTab report={report} />
            )}
            {activeTab === "progress" && (
              <SyllabusReadinessTab report={report} />
            )}
            {activeTab === "achievements" && (
              <AchievementsTab report={report} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

