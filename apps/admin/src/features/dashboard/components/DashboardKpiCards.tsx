import { Link } from "react-router-dom";
import {
  HelpCircle,
  BookOpen,
  GraduationCap,
  Users,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "./DashboardBanner";
import appContent from "@/constants/appContent";

interface DashboardKpiCardsProps {
  userRole: UserRole;
  teacherAuthoredCount: number;
  totalQuestions: number;
  handledCategoriesCount: number;
  totalCategories: number;
  totalStudents: number;
  totalFaculties: number;
}

export function DashboardKpiCards({
  userRole,
  teacherAuthoredCount,
  totalQuestions,
  handledCategoriesCount,
  totalCategories,
  totalStudents,
  totalFaculties,
}: DashboardKpiCardsProps) {
  const isTeacher = userRole === "TEACHER";
  const kpi = appContent.dashboard.kpiCards;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 font-sans">
      {/* Card 1: Question Bank / My Questions */}
      <Card className="bg-card border border-border rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between gap-2.5 hover:border-primary/30 transition-all min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="p-1.5 bg-primary/10 text-primary rounded-lg border border-primary/20 shrink-0">
            <HelpCircle className="size-4 stroke-[2.2]" />
          </div>
          <Badge
            variant="outline"
            className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-md truncate"
          >
            {isTeacher ? "My Questions" : "Question Bank"}
          </Badge>
        </div>
        <div className="min-w-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground block truncate">
            {isTeacher ? teacherAuthoredCount : totalQuestions}
          </span>
          <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
            {isTeacher ? "Authored Questions" : "Total Questions"}
          </p>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium gap-1 min-w-0">
          <span className="truncate">Repository</span>
          <Link
            to="/question-bank"
            className="text-primary font-semibold flex items-center gap-1 hover:underline shrink-0 text-xs"
          >
            {kpi.questionBank.actionView} <ArrowRight size={11} />
          </Link>
        </div>
      </Card>

      {/* Card 2: Curriculum / Handled Subjects */}
      <Card className="bg-card border border-border rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between gap-2.5 hover:border-primary/30 transition-all min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 shrink-0">
            <BookOpen className="size-4 stroke-[2.2]" />
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md truncate"
          >
            {isTeacher
              ? kpi.curriculum.badges.teacher
              : (kpi.curriculum.badges as any).dean || (kpi.curriculum.badges as any).admin}
          </Badge>
        </div>
        <div className="min-w-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground block truncate">
            {isTeacher ? handledCategoriesCount : totalCategories}
          </span>
          <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
            {isTeacher
              ? kpi.curriculum.labels.teacher
              : (kpi.curriculum.labels as any).dean || (kpi.curriculum.labels as any).admin}
          </p>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium gap-1 min-w-0">
          <span className="truncate">{kpi.curriculum.subtitle}</span>
          <Link
            to="/subject-management"
            className="text-primary font-semibold flex items-center gap-1 hover:underline shrink-0 text-xs"
          >
            {kpi.curriculum.actionSubjects} <ArrowRight size={11} />
          </Link>
        </div>
      </Card>

      {/* Card 3: Enrolled Students */}
      <Card className="bg-card border border-border rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between gap-2.5 hover:border-primary/30 transition-all min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="p-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20 shrink-0">
            <GraduationCap className="size-4 stroke-[2.2]" />
          </div>
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md truncate"
          >
            {kpi.enrolledStudents.badge}
          </Badge>
        </div>
        <div className="min-w-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground block truncate">{totalStudents}</span>
          <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
            {kpi.enrolledStudents.label}
          </p>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium gap-1 min-w-0">
          <span className="truncate">{kpi.enrolledStudents.subtitle}</span>
          <Link
            to="/student-management"
            className="text-primary font-semibold flex items-center gap-1 hover:underline shrink-0 text-xs"
          >
            {kpi.enrolledStudents.actionRoster} <ArrowRight size={11} />
          </Link>
        </div>
      </Card>

      {/* Card 4: Users / Accounts */}
      <Card className="bg-card border border-border rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col justify-between gap-2.5 hover:border-primary/30 transition-all min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="p-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg border border-blue-500/20 shrink-0">
            <Users className="size-4 stroke-[2.2]" />
          </div>
          <Badge
            variant="outline"
            className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded-md truncate"
          >
            Users
          </Badge>
        </div>
        <div className="min-w-0">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground block truncate">
            {totalFaculties}
          </span>
          <p className="text-xs font-medium text-muted-foreground mt-0.5 truncate">
            Active Users
          </p>
        </div>
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground font-medium gap-1 min-w-0">
          <span className="truncate">User Directory</span>
          <Link
            to="/faculty-management"
            className="text-primary font-semibold flex items-center gap-1 hover:underline shrink-0 text-xs"
          >
            View Users <ArrowRight size={11} />
          </Link>
        </div>
      </Card>
    </div>
  );
}
