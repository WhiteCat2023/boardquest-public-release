import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Clock,
  TrendingUp,
  Target,
  Award,
  Calculator,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useStudent, useStudents } from "@/features/students";
import {
  PerformanceGraphsTab,
  ActivityTimelineTab,
  SyllabusReadinessTab,
  useStudentAnalyticsReport,
} from "@/features/analytics";
import { getStudentEarnedBadges } from "@/utils/badgeUtils";
import { useGameLeaderboard } from "@/features/game-management";

import { StudentProfileHeader } from "../components/profile/StudentProfileHeader";
import { StudentAiSummaryKpiStrip } from "../components/profile/StudentAiSummaryKpiStrip";
import { StudentCompetencyAnalytics } from "../components/profile/StudentCompetencyAnalytics";
import { StudentPredictedOutcomesCard } from "../components/profile/StudentPredictedOutcomesCard";
import { StudentLearningHabitsCard } from "../components/profile/StudentLearningHabitsCard";
import { StudentCombatAttributesCard } from "../components/profile/StudentCombatAttributesCard";
import { StudentDisciplineProgressCard } from "../components/profile/StudentDisciplineProgressCard";
import { StudentAiInsightsCard } from "../components/profile/StudentAiActionCenterCard";
import { PointScorecardModal } from "../components/profile/PointScorecardModal";
import { AssignGuidanceModal } from "../components/AssignGuidanceModal";
import { StudentBadgesSection } from "../components/profile/StudentBadgesSection";
import { StudentAchievementHistory } from "../components/profile/StudentAchievementHistory";
import StudentReviewCenterTab from "../components/profile/StudentReviewCenterTab";

type StudentProfileTab = "overview" | "timeline" | "graphs" | "readiness" | "achievements" | "review-center";

export default function ViewStudent() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<StudentProfileTab>("overview");
  const [isScorecardOpen, setIsScorecardOpen] = useState(false);
  const [isFormulaOpen, setIsFormulaOpen] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);

  const { data: studentDirect, isLoading: isDirectLoading } = useStudent(studentId);
  const { data: allStudentsData, isLoading: isListLoading } = useStudents({
    skip: 0,
    take: 100,
  });

  const { data: analyticsReport, isLoading: isReportLoading } =
    useStudentAnalyticsReport(studentId || null);
  const { data: leaderboardEntries } = useGameLeaderboard({ limit: 100 });

  const fallbackStudent = (allStudentsData?.students || []).find(
    (s) => s.id === studentId,
  );
  const student = studentDirect || fallbackStudent;
  const isLoading = (isDirectLoading || isListLoading) && !student;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans">
        <div className="h-6 w-48 bg-muted rounded-lg animate-pulse" />
        <div className="h-24 bg-card border border-border rounded-2xl p-6 animate-pulse" />
        <div className="h-28 bg-card border border-border rounded-2xl p-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-72 bg-card border border-border rounded-2xl p-6 animate-pulse md:col-span-2" />
          <div className="h-72 bg-card border border-border rounded-2xl p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 font-sans mt-12">
        <h2 className="text-xl font-bold text-foreground">
          Student Profile Not Found
        </h2>
        <p className="text-xs text-muted-foreground">
          The requested student account could not be retrieved. Please verify the student ID or select a student from the directory.
        </p>
        <Button
          onClick={() => navigate("/student-management")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-semibold"
        >
          Return to Student Directory
        </Button>
      </div>
    );
  }

  const activeStudent = student;
  const studentBadges = getStudentEarnedBadges(activeStudent);
  const unlockedBadgesCount = studentBadges.length;

  const totalPoints = activeStudent.scorecardSummary?.totalPoints ?? (activeStudent.xp || 0);
  const avgAccuracy = activeStudent.scorecardSummary?.avgProficiency ?? 0;
  const totalQuestions = (activeStudent.subjectMetrics || []).reduce(
    (acc, m) => acc + (m.totalQuestionsAnswered || 0),
    0
  );

  // Calculate student leaderboard rank
  const leaderboardRank = (() => {
    if (leaderboardEntries && leaderboardEntries.length > 0) {
      const entry = leaderboardEntries.find(
        (e) => e.userId === activeStudent.id || e.userName?.toLowerCase() === activeStudent.name?.toLowerCase()
      );
      if (entry?.rank) return entry.rank;
      const idx = leaderboardEntries.findIndex(
        (e) => e.userId === activeStudent.id || e.userName?.toLowerCase() === activeStudent.name?.toLowerCase()
      );
      if (idx !== -1) return idx + 1;
    }
    const rawStudents = allStudentsData?.students || [];
    if (rawStudents.length > 0) {
      const sorted = [...rawStudents].sort((a, b) => (b.xp || 0) - (a.xp || 0));
      const idx = sorted.findIndex((s) => s.id === activeStudent.id);
      if (idx !== -1) return idx + 1;
    }
    return 1;
  })();

  const NAV_TABS = [
    { id: "overview" as StudentProfileTab, label: "Overview", icon: LayoutDashboard },
    { id: "timeline" as StudentProfileTab, label: "Activity Timeline", icon: Clock },
    { id: "graphs" as StudentProfileTab, label: "Performance Graphs", icon: TrendingUp },
    { id: "readiness" as StudentProfileTab, label: "Syllabus & Readiness", icon: Target },
    {
      id: "achievements" as StudentProfileTab,
      label: "Achievements & Badges",
      icon: Award,
      badgeCount: unlockedBadgesCount,
    },
    {
      id: "review-center" as StudentProfileTab,
      label: "Review Center Scores",
      icon: GraduationCap,
      badgeCount: activeStudent.reviewCenterTranscript?.scores?.length || undefined,
    },
  ];

  return (
    <div className="flex flex-col gap-4 p-3 sm:p-5 md:p-6 w-full max-w-7xl mx-auto animate-in fade-in duration-300 font-sans bg-background text-foreground pb-20">
      {/* 1. Header with Avatar, Name, Level & Leaderboard Rank Badges, and Right Actions */}
      <StudentProfileHeader
        student={activeStudent}
        leaderboardRank={leaderboardRank}
        onOpenScorecard={() => setIsScorecardOpen(true)}
        onOpenFormula={() => setIsFormulaOpen(true)}
        onAssignGuidance={() => setIsGuidanceOpen(true)}
      />

      {/* 2. The Hero AI Summary & 6-Item KPI Strip */}
      <StudentAiSummaryKpiStrip student={activeStudent} />

      {/* 3. Horizontal Navigation Tabs Bar (Underline / Minimalist Style from Reference) */}
      <div className="border-b border-border flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none pt-1">
        {NAV_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shrink-0 whitespace-nowrap border-b-2 -mb-[1px] ${
                isActive
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon size={14} className={isActive ? "text-primary" : "text-muted-foreground"} />
              <span>{tab.label}</span>
              {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[9.5px] font-extrabold ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW (EXACT 2-COLUMN DASHBOARD LAYOUT FROM REFERENCE SCREENSHOT) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start animate-in fade-in duration-200">
          {/* LEFT / CENTER COLUMN (Col span 8) */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            {/* Row 1: Competency Analytics (Radar & Quest History) + Readiness Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              <StudentCompetencyAnalytics
                metrics={activeStudent.subjectMetrics || []}
                accuracyHistory={activeStudent.accuracyHistory || []}
              />
              <StudentPredictedOutcomesCard
                student={activeStudent}
                readinessScore={activeStudent.scorecardSummary?.avgProficiency ?? analyticsReport?.studentInfo?.readinessScore}
              />
            </div>

            {/* Row 2: Study Target Calendar + Combat Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              <StudentLearningHabitsCard student={activeStudent} />
              <StudentCombatAttributesCard student={activeStudent} />
            </div>

            {/* Row 3: Discipline / Lesson Progress */}
            <StudentDisciplineProgressCard
              metrics={activeStudent.subjectMetrics || []}
              onOpenScorecard={() => setIsScorecardOpen(true)}
            />
          </div>

          {/* RIGHT COLUMN (Col span 4): AI Insights */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <StudentAiInsightsCard
              student={activeStudent}
              report={analyticsReport}
              onAssignGuidance={() => setIsGuidanceOpen(true)}
              onOpenScorecard={() => setIsScorecardOpen(true)}
            />
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITY TIMELINE */}
      {activeTab === "timeline" && (
        <div className="animate-in fade-in duration-200">
          {analyticsReport ? (
            <ActivityTimelineTab report={analyticsReport} />
          ) : isReportLoading ? (
            <Card className="p-12 text-center border border-border rounded-2xl space-y-3">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </Card>
          ) : (
            <Card className="p-12 text-center border border-border rounded-2xl text-muted-foreground space-y-2">
              <Clock className="w-8 h-8 mx-auto opacity-40 text-primary" />
              <p className="font-bold text-foreground">No learning activity logged yet</p>
              <p className="text-xs">Completed exams, chapter nodes, and unlocked badges will appear in this timeline.</p>
            </Card>
          )}
        </div>
      )}

      {/* TAB 3: PERFORMANCE GRAPHS */}
      {activeTab === "graphs" && (
        <div className="animate-in fade-in duration-200">
          {analyticsReport ? (
            <PerformanceGraphsTab report={analyticsReport} />
          ) : isReportLoading ? (
            <Card className="p-12 text-center border border-border rounded-2xl space-y-3">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-64 w-full rounded-xl" />
            </Card>
          ) : (
            <Card className="p-12 text-center border border-border rounded-2xl text-muted-foreground space-y-2">
              <TrendingUp className="w-8 h-8 mx-auto opacity-40 text-primary" />
              <p className="font-bold text-foreground">No historical graph trend available</p>
              <p className="text-xs">Once the student completes mock evaluations, score progression graphs will be plotted here.</p>
            </Card>
          )}
        </div>
      )}

      {/* TAB 4: SYLLABUS & READINESS */}
      {activeTab === "readiness" && (
        <div className="animate-in fade-in duration-200">
          {analyticsReport ? (
            <SyllabusReadinessTab report={analyticsReport} />
          ) : isReportLoading ? (
            <Card className="p-12 text-center border border-border rounded-2xl space-y-3">
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </Card>
          ) : (
            <Card className="p-12 text-center border border-border rounded-2xl text-muted-foreground space-y-2">
              <Target className="w-8 h-8 mx-auto opacity-40 text-primary" />
              <p className="font-bold text-foreground">Syllabus readiness data unavailable</p>
              <p className="text-xs">Syllabus module completion and target exam readiness gauge will appear here.</p>
            </Card>
          )}
        </div>
      )}

      {/* TAB 5: ACHIEVEMENTS & BADGES */}
      {activeTab === "achievements" && (
        <div className="animate-in fade-in duration-200">
          <Card className="bg-card border border-border rounded-2xl p-5 md:p-7 shadow-xs flex flex-col gap-6">
            <StudentBadgesSection badges={studentBadges} />
            <StudentAchievementHistory
              achievements={activeStudent.achievements || []}
              studentName={activeStudent.name}
              formatDate={formatDate}
            />
          </Card>
        </div>
      )}

      {/* TAB 6: REVIEW CENTER SCORES & BOARD LICENSURE TRANSCRIPT */}
      {activeTab === "review-center" && (
        <StudentReviewCenterTab student={activeStudent} />
      )}

      {/* MODAL: Official Candidate Scorecard Printable Document */}
      <PointScorecardModal
        open={isScorecardOpen}
        onOpenChange={setIsScorecardOpen}
        totalPoints={totalPoints}
        avgAccuracy={avgAccuracy}
        totalQuestions={totalQuestions}
        subjects={activeStudent.subjectMetrics || []}
        studentName={activeStudent.name}
        studentEmail={activeStudent.email}
      />

      {/* MODAL: Point Calculation Formula Breakdown */}
      <Dialog open={isFormulaOpen} onOpenChange={setIsFormulaOpen}>
        <DialogContent className="max-w-md rounded-2xl p-6 border border-border bg-card">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calculator className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-primary">
                Pointing Formula Reference
              </span>
            </div>
            <DialogTitle className="text-lg font-black text-foreground uppercase tracking-tight">
              How Points Are Calculated
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Standardized parameters governing candidate evaluation points in BoardQuest.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs py-2">
            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
              <span className="font-bold text-foreground text-[11px] uppercase tracking-wider block">
                Per-Subject Points (Max 1,200 Pts / subject)
              </span>
              <p className="font-mono text-primary font-bold text-xs">
                Points = (Correct Answers &times; 25) + (Completion % &times; 6)
              </p>
              <ul className="text-muted-foreground text-[11px] space-y-1 list-disc pl-4 pt-1">
                <li><strong>25 Pts</strong> awarded per verified correct question answered.</li>
                <li><strong>6 Pts</strong> awarded per 1% curriculum modules completed.</li>
                <li>Capped at 1,200 points maximum per discipline.</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-2">
              <span className="font-bold text-foreground text-[11px] uppercase tracking-wider block">
                Cumulative Standing
              </span>
              <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                Total Scorecard = &sum;(Subject Points) + Player XP
              </p>
              <p className="text-[11px] text-muted-foreground">
                Reflects weighted licensure preparation across all quest arenas, mock examinations, streak consistency, and syllabus objectives.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL: Assign Guidance / Academic Advisor */}
      <AssignGuidanceModal
        isOpen={isGuidanceOpen}
        onClose={() => setIsGuidanceOpen(false)}
        student={activeStudent}
      />
    </div>
  );
}
