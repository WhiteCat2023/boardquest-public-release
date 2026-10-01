import { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Student, StudyPlanItem } from "../../types/types";

interface StudentLearningHabitsCardProps {
  student?: Student;
}

interface SubjectTargetConfig {
  id?: string;
  subject: string;
  shortName: string;
  startDate: Date;
  endDate: Date;
  status: "Active" | "Upcoming" | "Completed";
  color: string;
}

export function StudentLearningHabitsCard({ student }: StudentLearningHabitsCardProps) {
  // Compile subject targets purely from student.studyPlans (real database records)
  const subjectTargets: SubjectTargetConfig[] = useMemo(() => {
    const plans: StudyPlanItem[] = student?.studyPlans || [];
    if (!Array.isArray(plans) || plans.length === 0) return [];

    const now = new Date();

    return plans
      .filter((p) => p && p.subject)
      .map((p): SubjectTargetConfig | null => {
        const rawStart = p.startDate || p.createdAt;
        const rawEnd = p.endDate || p.targetDate || p.startDate || p.createdAt;

        const startDate = rawStart ? new Date(rawStart) : new Date();
        let endDate = rawEnd
          ? new Date(rawEnd)
          : new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

        if (isNaN(startDate.getTime())) {
          return null;
        }
        if (isNaN(endDate.getTime()) || endDate < startDate) {
          endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        }

        let status: "Active" | "Upcoming" | "Completed";
        if (now >= startDate && now <= endDate) {
          status = "Active";
        } else if (now > endDate) {
          status = "Completed";
        } else {
          status = "Upcoming";
        }

        return {
          id: p.id,
          subject: p.subject,
          shortName: p.subject.split(" ")[0] || p.subject,
          startDate,
          endDate,
          status,
          color: "text-rose-500",
        };
      })
      .filter((t): t is SubjectTargetConfig => t !== null)
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [student?.studyPlans]);

  const [selectedSubject, setSelectedSubject] = useState<string>("");

  useEffect(() => {
    if (subjectTargets.length > 0) {
      const exists = subjectTargets.some((t) => t.subject === selectedSubject);
      if (!exists) {
        const objectiveMatch = student?.activeObjective?.subject
          ? subjectTargets.find(
              (t) =>
                t.subject.toLowerCase().trim() ===
                student.activeObjective?.subject.toLowerCase().trim(),
            )
          : null;
        const activeItem = subjectTargets.find((t) => t.status === "Active");
        setSelectedSubject(
          objectiveMatch?.subject || activeItem?.subject || subjectTargets[0].subject,
        );
      }
    } else {
      setSelectedSubject("");
    }
  }, [subjectTargets, student?.activeObjective, selectedSubject]);

  const activeTarget = useMemo(() => {
    if (subjectTargets.length === 0) return null;
    return (
      subjectTargets.find((t) => t.subject === selectedSubject) ||
      subjectTargets[0]
    );
  }, [subjectTargets, selectedSubject]);

  const [currentYear, setCurrentYear] = useState<number>(() =>
    new Date().getFullYear(),
  );
  const [currentMonth, setCurrentMonth] = useState<number>(() =>
    new Date().getMonth(),
  );

  // Automatically adjust calendar when active target changes
  useEffect(() => {
    if (activeTarget && !isNaN(activeTarget.startDate.getTime())) {
      setCurrentYear(activeTarget.startDate.getFullYear());
      setCurrentMonth(activeTarget.startDate.getMonth());
    }
  }, [activeTarget?.subject]);

  const handleSelectSubject = (subjectName: string) => {
    setSelectedSubject(subjectName);
    const target = subjectTargets.find((t) => t.subject === subjectName);
    if (target && !isNaN(target.startDate.getTime())) {
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

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = new Date(
    currentYear,
    currentMonth,
    1,
  ).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const formatDateRange = (start: Date, end: Date) => {
    const startStr = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endStr = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${startStr} - ${endStr}`;
  };

  const isDayInTarget = (day: number) => {
    if (!activeTarget) return false;
    const d = new Date(currentYear, currentMonth, day);
    const start = new Date(
      activeTarget.startDate.getFullYear(),
      activeTarget.startDate.getMonth(),
      activeTarget.startDate.getDate(),
    );
    const end = new Date(
      activeTarget.endDate.getFullYear(),
      activeTarget.endDate.getMonth(),
      activeTarget.endDate.getDate(),
    );
    return d >= start && d <= end;
  };

  const isRangeStart = (day: number) => {
    if (!activeTarget) return false;
    return (
      currentYear === activeTarget.startDate.getFullYear() &&
      currentMonth === activeTarget.startDate.getMonth() &&
      day === activeTarget.startDate.getDate()
    );
  };

  const isRangeEnd = (day: number) => {
    if (!activeTarget) return false;
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
            <h3 className="text-sm font-bold text-foreground">
              Study Period Targets
            </h3>
            <p className="text-[10.5px] text-muted-foreground leading-tight">
              Subject Milestones &amp; Calendar Pinpoints
            </p>
          </div>
        </div>

        {/* Month Switcher (visible when targets exist) */}
        {activeTarget && (
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
        )}
      </div>

      {subjectTargets.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center p-6 space-y-2 border border-dashed border-border/80 rounded-xl bg-muted/10 my-auto">
          <div className="size-10 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            <CalendarIcon className="size-5 text-muted-foreground/60" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-xs font-bold text-foreground">
              No Study Plans in Database
            </h4>
            <p className="text-[11px] text-muted-foreground">
              This candidate has not scheduled any study period targets or subject milestones in BoardQuesters yet.
            </p>
          </div>
        </div>
      ) : activeTarget ? (
        <>
          {/* Target Period Badge */}
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
                  : activeTarget.status === "Completed"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {activeTarget.status === "Active"
                ? "Active Target"
                : activeTarget.status === "Completed"
                ? "Completed"
                : "Upcoming"}
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
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-6" />
              ))}

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
                    } ${
                      start || end
                        ? "ring-1.5 ring-rose-500 bg-rose-500 text-white font-black"
                        : ""
                    }`}
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
              <span className="text-primary font-extrabold">
                {activeTarget.shortName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {subjectTargets.map((item) => {
                const isSelected = item.subject === selectedSubject;
                return (
                  <button
                    key={item.id || item.subject}
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
                    {item.status === "Completed" && (
                      <CheckCircle2 size={10} className="text-blue-500" />
                    )}
                    <span>{item.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}
    </Card>
  );
}

export { StudentLearningHabitsCard as StudentStudyCalendarCard };

