import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { useFaculties, useCategories } from "@/view/admin/faculty/hooks/useFaculty";
import { useStudents } from "@/view/admin/student_management/hooks/useStudent";
import {
  Users,
  GraduationCap,
  HelpCircle,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  BarChart3,
  Shield,
  Award,
  FlaskConical,
  Dna,
  Droplet,
  Microscope,
  ShieldCheck,
  BookOpenCheck,
  Plus,
  Layers,
  FileQuestion,
  UserCheck,
  FileEdit,
  CheckCircle,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MAJOR_SUBJECTS = [
  {
    code: "CC-301",
    name: "Clinical Chemistry",
    icon: FlaskConical,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    barColor: "bg-emerald-500",
    proficiency: 84,
  },
  {
    code: "MB-302",
    name: "Microbiology & Parasitology",
    icon: Dna,
    color: "bg-purple-50 text-purple-700 border-purple-200",
    barColor: "bg-purple-500",
    proficiency: 78,
  },
  {
    code: "HE-303",
    name: "Hematology & Coagulation",
    icon: Droplet,
    color: "bg-red-50 text-red-700 border-red-200",
    barColor: "bg-red-500",
    proficiency: 88,
  },
  {
    code: "CM-304",
    name: "Clinical Microscopy",
    icon: Microscope,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    barColor: "bg-blue-500",
    proficiency: 72,
  },
  {
    code: "IS-305",
    name: "Immunology & Blood Bank",
    icon: ShieldCheck,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
    barColor: "bg-indigo-500",
    proficiency: 81,
  },
  {
    code: "HP-306",
    name: "Histopath & MT Laws",
    icon: BookOpenCheck,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    barColor: "bg-amber-500",
    proficiency: 69,
  },
];

export default function Dashboard() {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUser = (auth as any)?.data?.user || (auth as any)?.user;
  const userRole = (currentUser?.role || "ADMIN") as "SUPERADMIN" | "ADMIN" | "TEAMLEAD" | "TEACHER";

  const isTeacher = userRole === "TEACHER";
  const isTeamLead = userRole === "TEAMLEAD";
  const isAdminOrSuper = userRole === "ADMIN" || userRole === "SUPERADMIN";

  // Data Queries
  const { data: facultyData, isLoading: isFacultyLoading } = useFaculties();
  const { data: studentData, isLoading: isStudentLoading } = useStudents(0, 10);
  const { data: categoryData, isLoading: isCategoryLoading } = useCategories();

  // Fetch Questions
  const { data: questionData, isLoading: isQuestionLoading } = useQuery({
    queryKey: ["dashboard-questions", userRole, currentUser?.id],
    queryFn: async () => {
      const url = isTeacher ? `/questions/get?authorId=${currentUser?.id}` : "/questions/get?limit=20";
      const response = await axiosPrivate.get(url);
      return response.data?.data;
    },
    staleTime: 1000 * 60 * 3,
  });

  const isLoading = isFacultyLoading || isStudentLoading || isCategoryLoading || isQuestionLoading;

  const totalFaculties = facultyData?.total ?? (facultyData?.faculties || []).length;
  const totalStudents = studentData?.total ?? (studentData?.students || []).length;
  const totalCategories = (categoryData || []).length;
  const handledCategoriesCount = currentUser?.handledCategories?.length || (categoryData || []).length;

  const rawQuestions = Array.isArray(questionData?.questions) 
    ? questionData.questions 
    : Array.isArray(questionData?.items) 
    ? questionData.items 
    : Array.isArray(questionData) 
    ? questionData 
    : [];

  const teacherAuthoredQuestions = isTeacher
    ? rawQuestions
    : rawQuestions.filter((q: any) => q.authorId === currentUser?.id || q.author?.id === currentUser?.id);

  const teacherDraftCount = teacherAuthoredQuestions.filter((q: any) => !q.isPublished && q.status !== "APPROVED").length;
  const teacherPublishedCount = teacherAuthoredQuestions.filter((q: any) => q.isPublished || q.status === "APPROVED").length;

  const totalQuestions = isTeacher ? teacherAuthoredQuestions.length : (questionData?.total || rawQuestions.length);
  const publishedQuestions = rawQuestions.filter((q: any) => q.isPublished || q.status === "APPROVED").length;
  const pendingReviewQuestions = rawQuestions.filter((q: any) => !q.isPublished && q.status !== "APPROVED").length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getPortalTitle = () => {
    switch (userRole) {
      case "SUPERADMIN":
        return "Super Administrator Portal";
      case "ADMIN":
        return "Administrator Portal";
      case "TEAMLEAD":
        return "Team Lead Portal";
      case "TEACHER":
        return "Faculty Portal";
      default:
        return "Executive Portal";
    }
  };

  const getPortalDescription = () => {
    switch (userRole) {
      case "TEACHER":
        return "Personal teaching workspace, question authoring repository, and student evaluation progress.";
      case "TEAMLEAD":
        return "Curriculum evaluation oversight, question review queue, and academic performance monitoring.";
      case "SUPERADMIN":
      case "ADMIN":
      default:
        return "Overview of curriculum evaluation metrics, student progress, faculty status, and question bank statistics.";
    }
  };

  return (
    <phantom-ui loading={isLoading}>
      <div className="flex flex-col gap-8 p-6 md:p-8 w-full max-w-7xl mx-auto font-sans bg-slate-50/50 min-h-full">
        {/* Welcome Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-[#A70202]/10 text-[#A70202] border-[#A70202]/20 text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full">
                {getPortalTitle()}
              </Badge>
              <span className="text-xs text-slate-400 font-medium">&bull; System Live & Synced</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              {getGreeting()}, {currentUser?.name || "Faculty Member"}
            </h1>
            <p className="text-xs md:text-sm text-slate-500">
              {getPortalDescription()}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isTeacher && (
              <>
                <Link to="/question-bank">
                  <Button className="bg-[#A70202] text-white hover:bg-[#8e0202] rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-xs">
                    <Plus size={15} />
                    Add New Question
                  </Button>
                </Link>
                <Link to="/question-bank">
                  <Button variant="outline" className="bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer">
                    <FileEdit size={15} className="text-[#A70202]" />
                    My Drafts ({teacherDraftCount})
                  </Button>
                </Link>
              </>
            )}

            {isTeamLead && (
              <>
                <Link to="/review-center">
                  <Button className="bg-[#A70202] text-white hover:bg-[#8e0202] rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-xs">
                    <Clock size={15} />
                    Review Queue ({pendingReviewQuestions})
                  </Button>
                </Link>
                <Link to="/question-bank">
                  <Button variant="outline" className="bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer">
                    <Plus size={15} className="text-[#A70202]" />
                    Add Question
                  </Button>
                </Link>
              </>
            )}

            {isAdminOrSuper && (
              <>
                <Link to="/question-bank">
                  <Button className="bg-[#A70202] text-white hover:bg-[#8e0202] rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer shadow-xs">
                    <Plus size={15} />
                    Add Question
                  </Button>
                </Link>
                <Link to="/student-management">
                  <Button variant="outline" className="bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 rounded-2xl px-4 py-2 text-xs font-bold gap-1.5 cursor-pointer">
                    <GraduationCap size={15} className="text-[#A70202]" />
                    Student Roster
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Dynamic 4 Top KPI Cards based on Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1 */}
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
                <HelpCircle size={22} className="stroke-[2.2]" />
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] font-bold">
                {isTeacher ? "My Questions" : isTeamLead ? "Needs Review" : "Item Bank"}
              </Badge>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-800">
                {isTeacher ? teacherAuthoredQuestions.length : isTeamLead ? pendingReviewQuestions : totalQuestions}
              </span>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {isTeacher ? "Authored Questions" : isTeamLead ? "Pending Evaluation Queue" : "Board Questions Bank"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>
                {isTeacher ? `${teacherPublishedCount} Approved` : isTeamLead ? `${publishedQuestions} Published` : `${publishedQuestions} Approved`}
              </span>
              <Link to={isTeamLead ? "/review-center" : "/question-bank"} className="text-[#A70202] font-bold flex items-center gap-0.5 hover:underline">
                View <ArrowRight size={11} />
              </Link>
            </div>
          </Card>

          {/* Card 2 */}
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <BookOpen size={22} className="stroke-[2.2]" />
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                {isTeacher ? "Handled Subjects" : "Curriculum"}
              </Badge>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-800">
                {isTeacher ? handledCategoriesCount : totalCategories || 6}
              </span>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {isTeacher ? "Assigned Subject Categories" : "Curriculum Subject Scope"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Academic Curriculum</span>
              <Link to="/subject-management" className="text-[#A70202] font-bold flex items-center gap-0.5 hover:underline">
                Subjects <ArrowRight size={11} />
              </Link>
            </div>
          </Card>

          {/* Card 3 */}
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                <GraduationCap size={22} className="stroke-[2.2]" />
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                Enrolled
              </Badge>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-800">{totalStudents}</span>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Active Platform Students</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Tracked Aspirants</span>
              <Link to="/student-management" className="text-[#A70202] font-bold flex items-center gap-0.5 hover:underline">
                Roster <ArrowRight size={11} />
              </Link>
            </div>
          </Card>

          {/* Card 4 */}
          <Card className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-red-50 text-[#A70202] rounded-2xl border border-red-100">
                {isTeacher ? <FileEdit size={22} className="stroke-[2.2]" /> : <Users size={22} className="stroke-[2.2]" />}
              </div>
              <Badge variant="outline" className="bg-[#A70202]/10 text-[#A70202] border-[#A70202]/20 text-[10px] font-bold">
                {isTeacher ? "Draft Items" : "Instructors"}
              </Badge>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-800">
                {isTeacher ? teacherDraftCount : totalFaculties}
              </span>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                {isTeacher ? "Questions Saved as Draft" : "Faculty & Educators"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>{isTeacher ? "Private to you" : "Faculty Roster"}</span>
              <Link to={isTeacher ? "/question-bank" : "/faculty-management"} className="text-[#A70202] font-bold flex items-center gap-0.5 hover:underline">
                {isTeacher ? "Manage Drafts" : "Faculty List"} <ArrowRight size={11} />
              </Link>
            </div>
          </Card>
        </div>

        {/* 6 Major Board Licensure Examination Subjects Performance Overview */}
        <Card className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
                <BarChart3 className="text-[#A70202]" size={22} />
                6 Major Licensure Examination Subjects Overview
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current evaluation performance benchmark across the 6 core Medical Technology board examination domains.
              </p>
            </div>

            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 text-xs font-bold px-3 py-1 rounded-full w-fit">
              Passing Mark: 75% Benchmark
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MAJOR_SUBJECTS.map((subj) => {
              const IconComp = subj.icon;
              return (
                <div
                  key={subj.code}
                  className="p-5 bg-slate-50/60 hover:bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col justify-between gap-4 transition-all hover:shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl border ${subj.color} shrink-0`}>
                      <IconComp size={20} className="stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {subj.code}
                      </span>
                      <h3 className="text-sm font-bold text-slate-800 leading-snug group-hover:text-[#A70202] transition-colors">
                        {subj.name}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-slate-500">Average Class Proficiency</span>
                      <span className="text-emerald-700 font-extrabold">{subj.proficiency}%</span>
                    </div>

                    <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${subj.barColor}`}
                        style={{ width: `${subj.proficiency}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Operational Grid: Questions Queue & Student Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Question Bank Stream (Filtered for Teacher if role is Teacher) */}
          <Card className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FileQuestion className="text-[#A70202]" size={18} />
                {isTeacher ? "My Authored Questions" : "Recent Question Submissions"}
              </h2>
              <Link to={isTeamLead ? "/review-center" : "/question-bank"} className="text-xs font-bold text-[#A70202] hover:underline flex items-center gap-1">
                {isTeamLead ? "Review Queue" : "View All"} <ArrowRight size={13} />
              </Link>
            </div>

            {(isTeacher ? teacherAuthoredQuestions : rawQuestions).length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <HelpCircle size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">
                  {isTeacher ? "You have not authored any question items yet." : "No question submissions recorded yet."}
                </p>
                {isTeacher && (
                  <Link to="/question-bank">
                    <Button className="mt-3 bg-[#A70202] text-white hover:bg-[#8e0202] text-xs font-bold rounded-xl px-4 py-1.5 cursor-pointer">
                      Create Your First Question
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {(isTeacher ? teacherAuthoredQuestions : rawQuestions).slice(0, 5).map((q: any) => (
                  <div key={q.id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {q.question || q.text || "Sample Question Item"}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="font-semibold text-slate-600">{q.category?.name || "General Subject"}</span>
                        &bull;
                        <span>Author: {q.author?.name || currentUser?.name || "Faculty Member"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          q.isPublished || q.status === "APPROVED"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {q.isPublished || q.status === "APPROVED" ? "Published" : "Under Review"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Right Col: Recently Enrolled Students */}
          <Card className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="text-[#A70202]" size={18} />
                Student Roster
              </h2>
              <Link to="/student-management" className="text-xs font-bold text-[#A70202] hover:underline flex items-center gap-1">
                View All <ArrowRight size={13} />
              </Link>
            </div>

            {(studentData?.students || []).length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <GraduationCap size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">No students registered yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(studentData?.students || []).slice(0, 5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between p-2.5 bg-slate-50/60 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-slate-200 bg-red-50 text-[#A70202]">
                        <AvatarFallback className="font-bold text-xs bg-[#A70202]/10 text-[#A70202] uppercase">
                          {(s.name || "ST").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-snug">{s.name}</p>
                        <p className="text-[10px] text-slate-400">{s.email}</p>
                      </div>
                    </div>

                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] font-bold">
                      Lvl {s.level || 1}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </phantom-ui>
  );
}