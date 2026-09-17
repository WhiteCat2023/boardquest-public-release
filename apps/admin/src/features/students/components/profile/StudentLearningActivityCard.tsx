import { useState } from "react";
import { BarChart3, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Student } from "../../types/types";

interface StudentLearningActivityCardProps {
  student: Student;
}

interface DayActivity {
  day: string;
  fullName: string;
  value: number; // 0.0 to 1.0 (representing activity level or completion)
  questionsAnswered: number;
  statusText: string;
  statusType: "risk" | "success" | "neutral";
  badgeText: string;
}

export function StudentLearningActivityCard({ student }: StudentLearningActivityCardProps) {
  // Weekly simulation activity
  const weekData: DayActivity[] = [
    {
      day: "Mon",
      fullName: "Monday",
      value: 0.85,
      questionsAnswered: 48,
      statusText: "Active Practice",
      statusType: "success",
      badgeText: "TARGET MET",
    },
    {
      day: "Tue",
      fullName: "Tuesday",
      value: 0.65,
      questionsAnswered: 35,
      statusText: "Mock Exam Section",
      statusType: "success",
      badgeText: "TARGET MET",
    },
    {
      day: "Wed",
      fullName: "Wednesday",
      value: 0.9,
      questionsAnswered: 52,
      statusText: "High Engagement",
      statusType: "success",
      badgeText: "STREAK ACTIVE",
    },
    {
      day: "Thu",
      fullName: "Thursday",
      value: 0.05,
      questionsAnswered: 0,
      statusText: "No Activity",
      statusType: "risk",
      badgeText: "RISK INCREASED",
    },
    {
      day: "Fri",
      fullName: "Friday",
      value: 0.75,
      questionsAnswered: 40,
      statusText: "Flashcards Drill",
      statusType: "success",
      badgeText: "TARGET MET",
    },
    {
      day: "Sat",
      fullName: "Saturday",
      value: 0.8,
      questionsAnswered: 45,
      statusText: "Simulated Board Run",
      statusType: "success",
      badgeText: "PASSED SET",
    },
    {
      day: "Sun",
      fullName: "Sunday",
      value: 0.7,
      questionsAnswered: 38,
      statusText: "Weekly Review",
      statusType: "neutral",
      badgeText: "ON SCHEDULE",
    },
  ];

  // Default active day is Thursday (index 3) exactly as in the reference design
  const [activeDayIndex, setActiveDayIndex] = useState<number>(3);
  const activeDay = weekData[activeDayIndex];

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between relative overflow-visible">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <BarChart3 size={14} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Learning Activity</h3>
        </div>
        <span className="text-[10.5px] font-semibold text-muted-foreground">Past 7 Days</span>
      </div>

      {/* Chart Area */}
      <div className="relative pt-1 pb-2">
        {/* Floating Tooltip Card (positioned near the active day column) */}
        {activeDay && (
          <div
            className="absolute z-20 transition-all duration-200 pointer-events-none"
            style={{
              left: `${Math.min(78, Math.max(12, (activeDayIndex / (weekData.length - 1)) * 85 + 4))}%`,
              top: "22px",
              transform: "translateX(-50%)",
            }}
          >
            <div className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-3 py-2 rounded-xl shadow-xl border border-neutral-800 dark:border-neutral-200 text-[11px] min-w-[125px] flex flex-col gap-1">
              <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                {activeDay.fullName}
              </span>
              <span className="font-bold text-xs leading-tight">
                {activeDay.statusText}
              </span>
              <div className="mt-0.5">
                <Badge
                  className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md flex items-center gap-1 w-fit ${
                    activeDay.statusType === "risk"
                      ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {activeDay.statusType === "risk" ? (
                    <AlertTriangle size={9} />
                  ) : (
                    <CheckCircle2 size={9} />
                  )}
                  {activeDay.badgeText}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Grid and Bars Container */}
        <div className="flex items-end gap-2 sm:gap-3 h-44 sm:h-48 pt-6">
          {/* Y-Axis Labels */}
          <div className="flex flex-col justify-between h-full text-[10px] font-medium text-muted-foreground/70 pr-1 select-none">
            <span>1.0</span>
            <span>0.8</span>
            <span>0.6</span>
            <span>0.4</span>
            <span>0.2</span>
            <span>0.0</span>
          </div>

          {/* Bars */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 flex-1 h-full items-end border-b border-border/80 pb-1">
            {weekData.map((d, idx) => {
              const isSelected = activeDayIndex === idx;
              const barHeightPercent = Math.max(8, Math.round(d.value * 100));

              return (
                <div
                  key={d.day}
                  onClick={() => setActiveDayIndex(idx)}
                  onMouseEnter={() => setActiveDayIndex(idx)}
                  className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
                >
                  {/* Bar */}
                  <div className="w-full max-w-[26px] sm:max-w-[32px] bg-muted/50 rounded-t-md h-full flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${barHeightPercent}%` }}
                      className={`w-full rounded-t transition-all duration-300 ${
                        isSelected
                          ? d.statusType === "risk"
                            ? "bg-rose-500/80 shadow-xs"
                            : "bg-primary shadow-xs"
                          : "bg-primary/25 group-hover:bg-primary/50"
                      }`}
                    />
                  </div>

                  {/* X-Axis Day Label */}
                  <span
                    className={`text-[10.5px] font-semibold transition-colors ${
                      isSelected
                        ? "text-foreground font-extrabold"
                        : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
