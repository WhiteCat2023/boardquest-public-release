import { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Target,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Student, StudyPlanItem } from "../../types/types";

interface StudentLearningHabitsCardProps {
  student?: Student;
}

interface SubjectTargetConfig {
  subject: string;
  shortName: string;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Upcoming" | "Completed";
  color: string;
}

const STANDARD_SUBJECTS = [
  "Clinical Chemistry",
  "Microbiology",
  "Hematology",
  "Clinical Microscopy & Parasitology",
  "Immunology & Serology and Immunohematology",
  "Histopathology and Medtech Laws",
];

const DEFAULT_SCHEDULE: Record<string, { start: string; end: string; status: "Active" | "Upcoming" | "Completed" }> = {
  "Clinical Chemistry": { start: "2026-09-15", end: "2026-09-24", status: "Active" },
  "Microbiology": { start: "2026-09-25", end: "2026-10-05", status: "Upcoming" },
  "Hematology": { start: "2026-10-06", end: "2026-10-18", status: "Upcoming" },
  "Clinical Microscopy & Parasitology": { start: "2026-10-19", end: "2026-10-30", status: "Upcoming" },
  "Immunology & Serology and Immunohematology": { start: "2026-11-01", end: "2026-11-15", status: "Upcoming" },
  "Histopathology and Medtech Laws": { start: "2026-11-16", end: "2026-11-30", status: "Upcoming" },
};

export function StudentLearningHabitsCard({ student }: StudentLearningHabitsCardProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("Clinical Chemistry");

  // Compile subject targets from student.studyPlans or default schedule
  const subjectTargets: SubjectTargetConfig[] = useMemo(() => {
    const plans: StudyPlanItem[] = student?.studyPlans || [];

    return STANDARD_SUBJECTS.map((subjectName) => {
      const match = plans.find(
        (p) =>
          p.subject?.toLowerCase().trim() === subjectName.toLowerCase().trim() ||
          p.subject?.toLowerCase().includes(subjectName.toLowerCase()) ||
          subjectName.toLowerCase().includes(p.subject?.toLowerCase() || "")
      );

      const def = DEFAULT_SCHEDULE[subjectName] || {
        start: "2026-09-15",
        end: "2026-09-24",
        status: "Upcoming",
      };

      const startDate = match?.startDate ? new Date(match.startDate) : new Date(def.start);
      const endDate = match?.endDate ? new Date(match.endDate) : (match?.targetDate ? new Date(match.targetDate) : new Date(def.end));

      const now = new Date();
      let status: "Active" | "Upcoming" | "Completed" = def.status;
      if (now >= startDate && now <= endDate) {
        status = "Active";
      } else if (now > endDate) {
        status = "Completed";
      } else {
        status = "Upcoming";
      }

      return {
        subject: subjectName,
        shortName: subjectName.split(" ")[0],
        startDate,
        endDate,
        status,
        color: "text-rose-500",
      };
    });
  }, [student?.studyPlans]);

  const activeTarget =
    subjectTargets.find((t) => t.subject === selectedSubject) || subjectTargets[0];

  // Calendar Month Navigation
  const [currentYear, setCurrentYear] = useState<number>(activeTarget.startDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(activeTarget.startDate.getMonth()); // 0-indexed

  // When subject changes, automatically adjust calendar month if needed
  const handleSelectSubject = (subjectName: string) => {
    setSelectedSubject(subjectName);
    const target = subjectTargets.find((t) => t.subject === subjectName);
    if (target) {
      setCurrentYear(target.startDate.getFullYear());
      setCurrentMonth(target.startDate.getMonth());
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  // Calendar Geometry
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  // Check if a calendar day falls inside activeTarget date range
  const isDayInTarget = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    const start = new Date(
      activeTarget.startDate.getFullYear(),
      activeTarget.startDate.getMonth(),
      activeTarget.startDate.getDate()
    );
    const end = new Date(
      activeTarget.endDate.getFullYear(),
      activeTarget.endDate.getMonth(),
      activeTarget.endDate.getDate()
    );
    return d >= start && d <= end;
  };

  const isRangeStart = (day: number) => {
    return (
      currentYear === activeTarget.startDate.getFullYear() &&
      currentMonth === activeTarget.startDate.getMonth() &&
      day === activeTarget.startDate.getDate()
    );
  };

  const isRangeEnd = (day: number) => {
    return (
      currentYear === activeTarget.endDate.getFullYear() &&
      currentMonth === activeTarget.endDate.getMonth() &&
      day === activeTarget.endDate.getDate()
    );
  };

  const now = new Date();
  const isToday = (day: number) => {
    return (
      currentYear === now.getFullYear() &&
      currentMonth === now.getMonth() &&
      day === now.getDate()
    );
  };

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-border/70">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <CalendarIcon size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Study Period Targets</h3>
            <p className="text-[10.5px] text-muted-foreground leading-tight">
              Subject Milestones &amp; Calendar Pinpoints
            </p>
          </div>
        </div>

        {/* Month Switcher */}
        <div className="flex items-center gap-1 bg-muted/40 border border-border/80 rounded-lg p-0.5">
          <button
            type="button"
            onClick={prevMonth}
            className="size-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <ChevronLeft size={13} />
          </button>
          <span className="text-[11px] font-extrabold px-1.5 text-foreground min-w-[95px] text-center">
            {monthName}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="size-5 rounded hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Target Period Badge (Exact Match from BoardQuesters) */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/25 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <CalendarIcon size={14} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-muted-foreground leading-none mb-1">
              Study Period Target
            </span>
            <span className="text-xs font-black text-foreground truncate">
              {formatDateRange(activeTarget.startDate, activeTarget.endDate)}
            </span>
          </div>
        </div>

        <Badge
          variant="outline"
          className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md ${
            activeTarget.status === "Active"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-muted text-muted-foreground border-border"
          }`}
        >
          {activeTarget.status === "Active" ? "Active Target" : "Upcoming"}
        </Badge>
      </div>

      {/* Interactive Mini-Calendar Grid */}
      <div className="space-y-1.5 my-auto">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mb-1">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium">
          {/* Empty prefix slots */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-6" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const inRange = isDayInTarget(day);
            const start = isRangeStart(day);
            const end = isRangeEnd(day);
            const today = isToday(day);

            return (
              <div
                key={`day-${day}`}
                className={`h-6 flex items-center justify-center text-[11px] transition-all relative ${
                  inRange
                    ? "bg-rose-500/20 text-rose-700 dark:text-rose-300 font-black rounded-md"
                    : "text-foreground hover:bg-muted/60 rounded-md"
                } ${start || end ? "ring-1.5 ring-rose-500 bg-rose-500 text-white font-black" : ""}`}
              >
                <span>{day}</span>
                {today && !start && !end && (
                  <span className="absolute bottom-0.5 size-1 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Chips Pinpoint Selector */}
      <div className="pt-2 mt-2 border-t border-border/70 space-y-1.5">
        <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <span>Target Disciplines</span>
          <span className="text-primary font-extrabold">{selectedSubject.split(" ")[0]}</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {subjectTargets.map((item) => {
            const isSelected = item.subject === selectedSubject;
            return (
              <button
                key={item.subject}
                type="button"
                onClick={() => handleSelectSubject(item.subject)}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-foreground text-background shadow-xs scale-102"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {item.status === "Active" && (
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                <span>{item.shortName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

export { StudentLearningHabitsCard as StudentStudyCalendarCard };
