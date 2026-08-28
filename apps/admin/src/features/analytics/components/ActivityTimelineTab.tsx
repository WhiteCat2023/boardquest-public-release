import { useState } from "react";
import { Clock, Activity, Award, Sparkles, CheckCircle2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { StudentAnalyticsResult } from "../types/types";

interface ActivityTimelineTabProps {
  report: StudentAnalyticsResult;
}

export function ActivityTimelineTab({ report }: ActivityTimelineTabProps) {
  const [timelineFilter, setTimelineFilter] = useState<string>("all");

  const timelineList = Array.isArray(report?.timeline) ? report.timeline : [];
  const filteredTimeline = timelineList.filter(item => {
    if (!item) return false;
    if (timelineFilter === "all") return true;
    return item.type === timelineFilter;
  });

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 animate-in fade-in duration-150 min-w-0">
      <Card className="border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3.5 sm:gap-4 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3 min-w-0">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5 uppercase truncate">
              <Clock size={14} className="text-primary shrink-0" />
              Learning Activity Log
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              Chronological record of exams, achievements, and lesson completions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 overflow-x-auto scrollbar-none max-w-full shrink-0">
            {["all", "exam", "achievement", "lesson"].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimelineFilter(filter)}
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md transition-all capitalize cursor-pointer shrink-0 ${
                  timelineFilter === filter
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Items Feed */}
        {filteredTimeline.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground italic font-medium">
            No activity log entries found for this filter.
          </div>
        ) : (
          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            {filteredTimeline.map((item) => {
              const isExam = item.type === "exam";
              const isAch = item.type === "achievement";
              const isLevel = item.type === "level_up";
              const itemTypeFormatted = (item.type || "").replace("_", " ");

              return (
                <div key={item.id} className="relative flex items-start gap-3 group">
                  {/* Dot Indicator */}
                  <div className={`absolute -left-5 top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center text-white z-10 ${
                    isExam ? "bg-primary" : isAch ? "bg-amber-500" : isLevel ? "bg-indigo-500" : "bg-emerald-500"
                  }`}>
                    {isExam ? <Activity size={8} /> : isAch ? <Award size={8} /> : isLevel ? <Sparkles size={8} /> : <CheckCircle2 size={8} />}
                  </div>

                  {/* Event Card */}
                  <div className="flex-1 bg-muted/20 border border-border/60 hover:border-primary/40 rounded-xl p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
                    <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <Badge 
                          variant="outline" 
                          className={`text-[8px] font-extrabold uppercase px-1.5 py-0 shrink-0 ${
                            isExam ? "bg-primary/10 text-primary border-primary/20" : isAch ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          }`}
                        >
                          {itemTypeFormatted}
                        </Badge>
                        <span className="text-xs font-bold text-foreground truncate">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug break-words">{item.description}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {item.metadata?.score !== undefined && (
                        <Badge className={`text-[9px] font-extrabold px-1.5 py-0 ${item.metadata.score >= 75 ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                          Score: {item.metadata.score}%
                        </Badge>
                      )}
                      {item.metadata?.xp && (
                        <Badge variant="secondary" className="text-[9px] font-extrabold bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 py-0">
                          +{item.metadata.xp} XP
                        </Badge>
                      )}
                      <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Calendar size={10} />
                        {item.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

