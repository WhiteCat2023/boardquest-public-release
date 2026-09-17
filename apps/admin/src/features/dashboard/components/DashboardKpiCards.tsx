import { useNavigate } from "react-router-dom";
import {
  HelpCircle,
  BookOpen,
  GraduationCap,
  Users,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserRole } from "./DashboardBanner";

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
  const navigate = useNavigate();
  const isTeacher = userRole === "TEACHER";

  const formatCount = (count: number) => {
    if (count >= 0 && count < 10) {
      return `0${count}`;
    }
    return count.toLocaleString();
  };

  const cards = [
    {
      id: "questions",
      title: isTeacher ? "MY QUESTIONS" : "QUESTION BANK",
      count: isTeacher ? teacherAuthoredCount : totalQuestions,
      subtitle: isTeacher ? "Authored in draft & review" : "In question repository",
      icon: HelpCircle,
      link: isTeacher ? "/question-bank/my-questions" : "/question-bank/shared-library",
    },
    {
      id: "curriculum",
      title: isTeacher ? "HANDLED SUBJECTS" : "EXAM SUBJECTS",
      count: isTeacher ? handledCategoriesCount : totalCategories,
      subtitle: isTeacher ? "Assigned subject areas" : "Board licensure subjects",
      icon: BookOpen,
      link: "/subject-management",
    },
    {
      id: "students",
      title: "ENROLLED STUDENTS",
      count: totalStudents,
      subtitle: "Across all active cohorts",
      icon: GraduationCap,
      link: "/student-management",
    },
    {
      id: "users",
      title: isTeacher ? "FACULTY PEERS" : "ACTIVE FACULTY",
      count: totalFaculties,
      subtitle: "Registered teaching staff",
      icon: Users,
      link: "/faculty-management",
    },
  ];

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
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground block truncate">
                {formatCount(card.count)}
              </span>
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
