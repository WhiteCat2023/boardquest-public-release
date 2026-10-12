import { useNavigate } from "react-router-dom";
import {
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  kpiContentForAdmin,
  kpiContentForTeachers,
} from "./list/kpiCardContent";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useDashboardQuestionStats } from "../../api/useDashboardQuestions";
import { useSubjects } from "@/features/users";
import { useSubjectsTotalCount } from "@/features/question-bank";
import { useStudents } from "@/features/students";
import { useUsers } from "@/features/users";


export function DashboardKpiCards() {
  const navigate = useNavigate();
  const { isTeacher, currentUser } = useRoleFlags();

  const authorId = isTeacher
    ? currentUser?.id || (currentUser as any)?._id
    : undefined;

  // Colocated queries for KPI metrics
  const { data: statsData, isLoading: isStatsLoading } =
    useDashboardQuestionStats(authorId);
  const { data: dbCategories = [] } = useSubjects();
  const { data: categoriesTotalCount } = useSubjectsTotalCount();
  const { data: studentData, isLoading: isStudentsLoading } = useStudents({ skip: 0, take: 1 });
  const { data: facultyData, isLoading: isFacultiesLoading } = useUsers({ limit: 1, status: "ACTIVE" });

  const teacherAuthoredCount = statsData?.teacherAuthoredCount ?? 0;
  const totalQuestions = isTeacher
      ? statsData?.teacherAuthoredCount ?? 0
      : statsData?.totalQuestions ?? 0;

  const handledCategoriesCount = (Array.isArray(dbCategories)
      ? dbCategories.length
      : currentUser?.handledCategories?.length || 0);

  const totalStudents = ((studentData as any)?.total ?? (Array.isArray(studentData) ? studentData.length : (studentData as any)?.students?.length || 0));
  const totalFaculties = ((facultyData as any)?.total ?? (Array.isArray(facultyData) ? facultyData.length : (facultyData as any)?.faculties?.length || 0));

  const isDataLoading = isStatsLoading || isStudentsLoading || isFacultiesLoading;

  const formatCount = (count: number) => {
    if (count >= 0 && count < 10) {
      return `0${count}`;
    }
    return count.toLocaleString();
  };

  const cards = isTeacher
    ? kpiContentForTeachers(
        teacherAuthoredCount,
        handledCategoriesCount,
        totalStudents,
        totalFaculties,
      )
    : kpiContentForAdmin(
        totalQuestions,
        handledCategoriesCount,
        totalStudents,
        totalFaculties,
      );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 font-sans">
      {cards.map((card) => {
        const IconComponent = card.icon;

        return (
          <div
            key={card.id}
            onClick={() => navigate(card.link)}
            className="group relative bg-card border border-border/80 rounded-2xl p-3.5 sm:p-4 shadow-2xs hover:border-border hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between min-w-0"
          >
            {/* Top Row: Icon + Title + More Options */}
            <div className="flex items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="size-6 sm:size-7 rounded-lg bg-muted/60 border border-border/40 flex items-center justify-center text-foreground/75 shrink-0">
                  <IconComponent className="size-3.5 sm:size-4 stroke-[2]" />
                </div>
                <span className="text-[10px] sm:text-[11px] font-bold text-foreground/80 tracking-wider uppercase truncate">
                  {card.title}
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => e.stopPropagation()}
                    className="p-1 -mr-1 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer shrink-0"
                    title="Options"
                  >
                    <MoreHorizontal className="size-3.5 sm:size-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-36 rounded-xl p-1 text-xs shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={() => navigate(card.link)}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <ExternalLink className="size-3.5 text-muted-foreground" />
                    <span>View details</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Middle Row: Large Value */}
            <div className="mt-3 sm:mt-3.5">
              {isDataLoading ? (
                <Skeleton className="h-8 w-16 rounded mt-1" />
              ) : (
                <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground block truncate font-mono">
                  {formatCount(card.count)}
                </span>
              )}
            </div>

            {/* Bottom Row: Context Subtitle */}
            <div className="mt-1">
              <p className="text-[10.5px] sm:text-[11.5px] text-muted-foreground truncate leading-tight">
                {card.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default DashboardKpiCards;
