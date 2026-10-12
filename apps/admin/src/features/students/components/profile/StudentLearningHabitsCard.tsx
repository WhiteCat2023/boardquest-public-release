import { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Target,
  Flame,
  FileText,
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
  priority?: string;
  goal?: string;
  targetQuestions?: number;
  targetAccuracy?: number;
  notes?: string;
  studyStatus?: string;
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
          priority: p.priority,
          goal: p.goal,
          targetQuestions: p.targetQuestions,
          targetAccuracy: p.targetAccuracy,
          notes: p.notes,
          studyStatus: p.status,
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

  // Helper to compute calendar pace lag for any study target
  const computePaceForTarget = (target: SubjectTargetConfig | null) => {
    if (!target) return null;

    const now = new Date();
    const startDate = target.startDate;
    const endDate = target.endDate;
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();

    let expectedPercent = 0;
    if (totalDuration > 0) {
      expectedPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
    } else {
      expectedPercent = now >= endDate ? 100 : 0;
    }

    const normTarget = target.subject.trim().toLowerCase();

    // 1. Check matching metric from student.subjectMetrics
    const matchedMetric = student?.subjectMetrics?.find((m) => {
      const s = (m.subject || "").trim().toLowerCase();
      return s === normTarget || s.includes(normTarget) || normTarget.includes(s);
    });

    let actualPercent = matchedMetric?.completion ?? 0;

    // 2. If metric completion is 0, check lessonCompletions directly
    if (actualPercent === 0 && student?.lessonCompletions) {
      const completedCount = student.lessonCompletions.filter((c: any) => {
        const s = (c.subject || "").trim().toLowerCase();
        return (s === normTarget || s.includes(normTarget) || normTarget.includes(s)) && c.status === "completed";
      }).length;
      actualPercent = Math.min(100, Math.round((completedCount / 2) * 100));
    }

    // 3. If student.calendarPace matches this active subject, prefer the backend's official calendarPace
    const calPace = student?.calendarPace;
    if (
      calPace &&
      calPace.activeSubject &&
      (calPace.activeSubject.toLowerCase().includes(normTarget) || normTarget.includes(calPace.activeSubject.toLowerCase()))
    ) {
      return {
        status: calPace.status,
        expectedPercent: calPace.expectedPercent,
        actualPercent: calPace.actualPercent,
        lagPercent: calPace.lagPercent,
      };
    }

    const lagPercent = actualPercent - expectedPercent;

    let status: "ON_TRACK" | "BEHIND" | "CRITICAL";
    if (now > endDate && actualPercent < 100) {
      status = "CRITICAL";
    } else if (lagPercent < -25) {
      status = "CRITICAL";
    } else if (lagPercent < -10) {
      status = "BEHIND";
    } else {
      status = "ON_TRACK";
    }

    return {
      status,
      expectedPercent,
      actualPercent,
      lagPercent,
    };
  };

  const activeTargetPace = useMemo(() => {
    return computePaceForTarget(activeTarget);
  }, [activeTarget, student?.subjectMetrics, student?.lessonCompletions, student?.calendarPace]);

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
          <div
            className={`flex items-center justify-between p-2.5 rounded-xl border mb-2.5 transition-colors ${
              activeTarget.status === "Active"
                ? activeTargetPace?.status === "BEHIND"
                  ? "bg-amber-500/[0.06] border-amber-500/30"
                  : activeTargetPace?.status === "CRITICAL"
                  ? "bg-rose-500/[0.08] border-rose-500/35"
                  : "bg-emerald-500/[0.06] border-emerald-500/25"
                : "bg-muted/30 border-border/70"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                  activeTarget.status === "Active"
                    ? activeTargetPace?.status === "BEHIND"
                      ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      : activeTargetPace?.status === "CRITICAL"
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                      : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <CalendarIcon size={14} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-muted-foreground leading-none mb-1">
                  Study Period Target
                </span>
                <span className="text-xs font-black text-foreground truncate">
                  {formatDateRange(activeTarget.startDate, activeTarget.endDate)}
                </span>
                {activeTarget.status === "Active" && activeTargetPace && (
                  <span
                    className={`text-[9.5px] font-bold mt-0.5 truncate flex items-center gap-1 ${
                      activeTargetPace.status === "BEHIND"
                        ? "text-amber-600 dark:text-amber-400"
                        : activeTargetPace.status === "CRITICAL"
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <span>{activeTargetPace.actualPercent}% done</span>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="text-muted-foreground">{activeTargetPace.expectedPercent}% exp</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
              {activeTarget.status === "Active" ? (
                <>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border-border/80"
                  >
                    Active
                  </Badge>
                  {activeTargetPace?.status === "BEHIND" && (
                    <Badge
                      variant="outline"
                      className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/35 flex items-center gap-1 shadow-2xs"
                    >
                      <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                      Behind ({activeTargetPace.lagPercent}%)
                    </Badge>
                  )}
                  {activeTargetPace?.status === "CRITICAL" && (
                    <Badge
                      variant="destructive"
                      className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/35 flex items-center gap-1 shadow-2xs"
                    >
                      <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                      Critical Lag ({activeTargetPace.lagPercent}%)
                    </Badge>
                  )}
                  {activeTargetPace?.status === "ON_TRACK" && (
                    <Badge
                      variant="outline"
                      className="text-[9.5px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 flex items-center gap-1 shadow-2xs"
                    >
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      On Track
                    </Badge>
                  )}
                </>
              ) : (
                <Badge
                  variant="outline"
                  className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md ${
                    activeTarget.status === "Completed"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {activeTarget.status === "Completed" ? "Completed" : "Upcoming"}
                </Badge>
              )}
            </div>
          </div>

          {/* Milestone Targets & Goal Callout */}
          {(activeTarget.priority || activeTarget.goal || activeTarget.notes || activeTarget.targetQuestions || activeTarget.targetAccuracy) && (
            <div className="mb-2.5 p-2 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1 text-xs">
              <div className="flex items-center justify-between flex-wrap gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {activeTarget.priority && (
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase ${
                        activeTarget.priority.toUpperCase() === "HIGH"
                          ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : activeTarget.priority.toUpperCase() === "LOW"
                          ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {activeTarget.priority.toUpperCase() === "HIGH" && <Flame size={9} />}
                      {activeTarget.priority} Priority
                    </span>
                  )}
                  {activeTarget.studyStatus && (
                    <Badge variant="outline" className="text-[8.5px] font-bold px-1.5 py-0">
                      {activeTarget.studyStatus.replace("_", " ")}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                  <span className="text-indigo-600 dark:text-indigo-400">
                    🎯 {activeTarget.targetQuestions ?? 50} Qs
                  </span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    📈 {activeTarget.targetAccuracy ?? 75}% Acc
                  </span>
                </div>
              </div>

              {activeTarget.goal && (
                <div className="flex items-start gap-1.5 pt-0.5 text-[10.5px]">
                  <Target size={12} className="text-primary shrink-0 mt-0.5" />
                  <p className="font-semibold text-foreground truncate" title={activeTarget.goal}>
                    Goal: &ldquo;{activeTarget.goal}&rdquo;
                  </p>
                </div>
              )}

              {activeTarget.notes && (
                <div className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                  <FileText size={11} className="shrink-0 mt-0.5" />
                  <p className="italic truncate" title={activeTarget.notes}>
                    Notes: {activeTarget.notes}
                  </p>
                </div>
              )}
            </div>
          )}

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
              <span
                className={`font-extrabold ${
                  activeTarget.status === "Active" && activeTargetPace?.status === "BEHIND"
                    ? "text-amber-600 dark:text-amber-400"
                    : activeTarget.status === "Active" && activeTargetPace?.status === "CRITICAL"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-primary"
                }`}
              >
                {activeTarget.shortName}
                {activeTarget.status === "Active" && activeTargetPace?.status === "BEHIND" && " (Behind)"}
                {activeTarget.status === "Active" && activeTargetPace?.status === "CRITICAL" && " (Critical)"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {subjectTargets.map((item) => {
                const isSelected = item.subject === selectedSubject;
                const itemPace = computePaceForTarget(item);
                return (
                  <button
                    key={item.id || item.subject}
                    type="button"
                    onClick={() => handleSelectSubject(item.subject)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-extrabold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-foreground text-background shadow-xs scale-102"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.status === "Active" && (
                      <span
                        className={`size-1.5 rounded-full animate-pulse ${
                          itemPace?.status === "BEHIND"
                            ? "bg-amber-500"
                            : itemPace?.status === "CRITICAL"
                            ? "bg-rose-500"
                            : "bg-emerald-500"
                        }`}
                      />
                    )}
                    {item.status === "Completed" && (
                      <CheckCircle2 size={10} className="text-blue-500" />
                    )}
                    <span>{item.shortName}</span>
                    {item.status === "Active" && itemPace?.status === "BEHIND" && (
                      <span
                        className={`text-[8.5px] font-bold ${
                          isSelected ? "text-amber-300" : "text-amber-500"
                        }`}
                      >
                        ({itemPace.lagPercent}%)
                      </span>
                    )}
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

