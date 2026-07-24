import { Link } from "react-router-dom";
import {
  HelpCircle,
  BookOpen,
  GraduationCap,
  FileEdit,
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
  teacherPublishedCount: number;
  teacherDraftCount: number;
  pendingReviewQuestions: number;
  totalQuestions: number;
  publishedQuestions: number;
  handledCategoriesCount: number;
  totalCategories: number;
  totalStudents: number;
  totalFaculties: number;
}

export function DashboardKpiCards({
  userRole,
  teacherAuthoredCount,
  teacherPublishedCount,
  teacherDraftCount,
  pendingReviewQuestions,
  totalQuestions,
  publishedQuestions,
  handledCategoriesCount,
  totalCategories,
  totalStudents,
  totalFaculties,
}: DashboardKpiCardsProps) {
  const isTeacher = userRole === "TEACHER";
  const isTeamLead = userRole === "TEAMLEAD";
  const kpi = appContent.dashboard.kpiCards;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Question Bank / Needs Review / My Questions */}
      <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
            <HelpCircle size={22} className="stroke-[2.2]" />
          </div>
          <Badge
            variant="outline"
            className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold"
          >
            {isTeacher
              ? kpi.questionBank.badges.teacher
              : isTeamLead
              ? kpi.questionBank.badges.teamlead
              : kpi.questionBank.badges.admin}
          </Badge>
        </div>
        <div>
          <span className="text-3xl font-black text-slate-800">
            {isTeacher
              ? teacherAuthoredCount
              : isTeamLead
              ? pendingReviewQuestions
              : totalQuestions}
          </span>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {isTeacher
              ? kpi.questionBank.labels.teacher
              : isTeamLead
              ? kpi.questionBank.labels.teamlead
              : kpi.questionBank.labels.admin}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>
            {isTeacher
              ? `${teacherPublishedCount} ${kpi.questionBank.approved}`
              : isTeamLead
              ? `${publishedQuestions} ${kpi.questionBank.published}`
              : `${publishedQuestions} ${kpi.questionBank.approved}`}
          </span>
          <Link
            to={isTeamLead ? "/review-center" : "/question-bank"}
            className="text-[#A70202] font-bold flex items-center gap-0.5 hover:underline"
          >
            {kpi.questionBank.actionView} <ArrowRight size={11} />
          </Link>
        </div>
      </Card>

      {/* Card 2: Curriculum / Handled Subjects */}
      <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
            <BookOpen size={22} className="stroke-[2.2]" />
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold"
          >
            {isTeacher
              ? kpi.curriculum.badges.teacher
              : kpi.curriculum.badges.admin}
          </Badge>
        </div>
        <div>
          <span className="text-3xl font-black text-slate-800">
            {isTeacher ? handledCategoriesCount : totalCategories || 6}
          </span>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {isTeacher
              ? kpi.curriculum.labels.teacher
              : kpi.curriculum.labels.admin}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>{kpi.curriculum.subtitle}</span>
          <Link
            to="/subject-management"
            className="text-[#A70202] font-bold flex items-center gap-0.5 hover:underline"
          >
            {kpi.curriculum.actionSubjects} <ArrowRight size={11} />
          </Link>
        </div>
      </Card>

      {/* Card 3: Enrolled Students */}
      <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
            <GraduationCap size={22} className="stroke-[2.2]" />
          </div>
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold"
          >
            {kpi.enrolledStudents.badge}
          </Badge>
        </div>
        <div>
          <span className="text-3xl font-black text-slate-800">{totalStudents}</span>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {kpi.enrolledStudents.label}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>{kpi.enrolledStudents.subtitle}</span>
          <Link
            to="/student-management"
            className="text-[#A70202] font-bold flex items-center gap-0.5 hover:underline"
          >
            {kpi.enrolledStudents.actionRoster} <ArrowRight size={11} />
          </Link>
        </div>
      </Card>

      {/* Card 4: Draft Items / Instructors */}
      <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
        <div className="flex items-center justify-between">
          <div className="p-3 bg-red-50 text-[#A70202] rounded-2xl border border-red-100">
            {isTeacher ? (
              <FileEdit size={22} className="stroke-[2.2]" />
            ) : (
              <Users size={22} className="stroke-[2.2]" />
            )}
          </div>
          <Badge
            variant="outline"
            className="bg-[#A70202]/10 text-[#A70202] border-[#A70202]/20 text-[10px] font-bold"
          >
            {isTeacher
              ? kpi.instructorsAndDrafts.badges.teacher
              : kpi.instructorsAndDrafts.badges.admin}
          </Badge>
        </div>
        <div>
          <span className="text-3xl font-black text-slate-800">
            {isTeacher ? teacherDraftCount : totalFaculties}
          </span>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {isTeacher
              ? kpi.instructorsAndDrafts.labels.teacher
              : kpi.instructorsAndDrafts.labels.admin}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span>
            {isTeacher
              ? kpi.instructorsAndDrafts.subtitles.teacher
              : kpi.instructorsAndDrafts.subtitles.admin}
          </span>
          <Link
            to={isTeacher ? "/question-bank" : "/faculty-management"}
            className="text-[#A70202] font-bold flex items-center gap-0.5 hover:underline"
          >
            {isTeacher
              ? kpi.instructorsAndDrafts.actions.teacher
              : kpi.instructorsAndDrafts.actions.admin}{" "}
            <ArrowRight size={11} />
          </Link>
        </div>
      </Card>
    </div>
  );
}
