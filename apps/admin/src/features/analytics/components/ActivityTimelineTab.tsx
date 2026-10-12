import { useState, useEffect } from "react";
import {
  Clock,
  Activity,
  Award,
  Sparkles,
  CheckCircle2,
  Calendar,
  ChevronDown,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Maximize2,
  Camera,
  Copy,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudentAnalyticsResult } from "../types/types";

interface ActivityTimelineTabProps {
  report: StudentAnalyticsResult;
}

const PAGE_SIZE = 20;

function formatIncidentType(type?: string | null): string {
  if (!type) return "None recorded";
  switch (type) {
    case "FULLSCREEN_EXIT":
      return "Fullscreen Exit";
    case "TAB_SWITCH":
      return "Tab / Window Switch";
    case "SCREENSHOT_ATTEMPT":
      return "Screenshot Attempt";
    case "COPY_ATTEMPT":
      return "Clipboard / Text Copy";
    default:
      return type.replace(/_/g, " ");
  }
}

export function ActivityTimelineTab({ report }: ActivityTimelineTabProps) {
  const [timelineFilter, setTimelineFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Reset pagination when filter or student changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [timelineFilter, report?.studentInfo?.id]);

  const timelineList = Array.isArray(report?.timeline) ? report.timeline : [];
  
  const cheatingCount = timelineList.filter(
    (item) => item?.type === "cheating_incident" || item?.type === "warning"
  ).length;

  const filteredTimeline = timelineList.filter((item) => {
    if (!item) return false;
    if (timelineFilter === "all") return true;
    if (timelineFilter === "cheating_incident") {
      return item.type === "cheating_incident" || item.type === "warning";
    }
    return item.type === timelineFilter;
  });

  const displayedTimeline = filteredTimeline.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTimeline.length;

  // Student Warning Summary Telemetry (populated from BoardQuesters)
  const warningSummary = report?.warningSummary;
  const warningIncidents = Array.isArray(report?.warningIncidents) ? report.warningIncidents : [];

  const totalWarnings = warningSummary?.totalWarnings ?? warningSummary?.allTimeWarnings ?? cheatingCount;
  const riskLevel = (
    warningSummary?.riskLevel || 
    (totalWarnings >= 6 ? "HIGH" : totalWarnings >= 3 ? "MEDIUM" : "LOW")
  ).toUpperCase();

  const isHighRisk = riskLevel === "HIGH";
  const isMediumRisk = riskLevel === "MEDIUM";

  const tabSwitches = warningSummary?.tabSwitches ?? warningIncidents.filter(i => i.incidentType === "TAB_SWITCH").length;
  const fullscreenExits = warningSummary?.fullscreenExits ?? warningIncidents.filter(i => i.incidentType === "FULLSCREEN_EXIT").length;
  const screenshots = warningSummary?.screenshots ?? warningIncidents.filter(i => i.incidentType === "SCREENSHOT_ATTEMPT").length;
  const copyAttempts = warningSummary?.copyAttempts ?? warningIncidents.filter(i => i.incidentType === "COPY_ATTEMPT").length;

  const weeklyWarnings = warningSummary?.weeklyWarnings ?? 0;
  const weeklyRiskLevel = warningSummary?.weeklyRiskLevel || riskLevel;
  const currentWeekKey = warningSummary?.currentWeekKey || "";

  const lastIncidentType = warningSummary?.lastIncidentType || warningIncidents[0]?.incidentType || null;
  const lastIncidentAt = warningSummary?.lastIncidentAt || warningIncidents[0]?.timestamp || null;

  const subjectsAffected = (warningSummary?.subjectsAffected && warningSummary.subjectsAffected.length > 0)
    ? warningSummary.subjectsAffected
    : Array.from(new Set(warningIncidents.map(i => i.subject).filter(Boolean)));

  const formattedLastDate = lastIncidentAt
    ? new Date(lastIncidentAt).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-150 min-w-0">
      {/* 1. STUDENT WARNING SUMMARY (BOARDQUESTERS INTEGRITY TELEMETRY) */}
      <Card className="border border-border/80 rounded-2xl bg-card shadow-xs overflow-hidden p-0">
        {/* Header Strip */}
        <div className={`p-4 pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
          isHighRisk
            ? "border-rose-500/25 bg-rose-500/[0.04]"
            : isMediumRisk
            ? "border-amber-500/25 bg-amber-500/[0.04]"
            : "border-border/60 bg-muted/20"
        }`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`h-8.5 w-8.5 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              isHighRisk
                ? "bg-rose-500/15 text-rose-600 border border-rose-500/30"
                : isMediumRisk
                ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
            }`}>
              {isHighRisk ? (
                <ShieldAlert size={18} className="animate-pulse" />
              ) : isMediumRisk ? (
                <AlertTriangle size={18} />
              ) : (
                <ShieldCheck size={18} />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs font-black text-foreground tracking-tight uppercase truncate">
                  Exam Integrity & Cheating Activity Summary
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[9px] font-black px-2 py-0.5 tracking-wider uppercase ${
                    isHighRisk
                      ? "bg-rose-500/15 text-rose-600 border-rose-500/30"
                      : isMediumRisk
                      ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                  }`}
                >
                  ● {riskLevel} RISK INTEGRITY STATUS
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">
                Telemetry and active cheating detection captured during BoardQuesters Arena trials.
              </p>
            </div>
          </div>

          {/* Quick jump to cheating logs */}
          {totalWarnings > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setTimelineFilter("cheating_incident");
                setVisibleCount(PAGE_SIZE);
              }}
              className={`h-8 px-3 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-all ${
                timelineFilter === "cheating_incident"
                  ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700"
                  : "border-rose-500/30 text-rose-600 bg-rose-500/10 hover:bg-rose-500/20"
              }`}
            >
              <Filter size={12} className="mr-1.5" />
              <span>View Cheating Alerts ({totalWarnings})</span>
            </Button>
          )}
        </div>

        {/* Metric Cards Grid */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total Warnings */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${
            totalWarnings > 0
              ? "bg-rose-500/5 border-rose-500/20 text-rose-950 dark:text-rose-100"
              : "bg-muted/30 border-border/60"
          }`}>
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Warnings</span>
              <AlertTriangle size={13} className={totalWarnings > 0 ? "text-rose-500" : "text-muted-foreground"} />
            </div>
            <div className={`text-xl font-black ${totalWarnings > 0 ? "text-rose-600" : "text-foreground"}`}>
              {totalWarnings}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              All-time Arena strikes
            </span>
          </div>

          {/* Weekly Window */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Weekly Active</span>
              <Calendar size={13} className="text-primary" />
            </div>
            <div className="text-xl font-black text-foreground">
              {weeklyWarnings}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              {currentWeekKey ? `${currentWeekKey} (${weeklyRiskLevel})` : "Current 7-day cycle"}
            </span>
          </div>

          {/* Tab Switches */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Tab Switches</span>
              <ExternalLink size={13} className="text-amber-500" />
            </div>
            <div className="text-xl font-black text-foreground">
              {tabSwitches}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              Window blur / Alt-Tab
            </span>
          </div>

          {/* Fullscreen Exits */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Fullscreen Exits</span>
              <Maximize2 size={13} className="text-indigo-500" />
            </div>
            <div className="text-xl font-black text-foreground">
              {fullscreenExits}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              Exited locked mode
            </span>
          </div>

          {/* Screenshots */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Screenshots</span>
              <Camera size={13} className="text-purple-500" />
            </div>
            <div className="text-xl font-black text-foreground">
              {screenshots}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              PrintScreen keys
            </span>
          </div>

          {/* Copy Attempts */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 flex flex-col gap-1">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">Copy Attempts</span>
              <Copy size={13} className="text-rose-500" />
            </div>
            <div className="text-xl font-black text-foreground">
              {copyAttempts}
            </div>
            <span className="text-[10px] text-muted-foreground font-medium truncate">
              Text clipboard copies
            </span>
          </div>
        </div>

        {/* Incident Footer Strip */}
        <div className="px-4 py-3 bg-muted/30 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-muted-foreground font-medium">Last Detected Incident:</span>
            {lastIncidentType ? (
              <Badge variant="secondary" className="font-bold text-[10px] px-2 py-0 bg-rose-500/10 text-rose-600 border border-rose-500/20">
                {formatIncidentType(lastIncidentType)}
              </Badge>
            ) : (
              <span className="text-foreground font-semibold">None recorded</span>
            )}

            {formattedLastDate && (
              <span className="text-muted-foreground font-semibold">
                at {formattedLastDate}
              </span>
            )}
          </div>

          {subjectsAffected.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-muted-foreground font-medium">Affected Subjects:</span>
              {subjectsAffected.map((subj) => (
                <Badge key={subj} variant="outline" className="text-[9px] font-bold px-1.5 py-0 border-border/70">
                  {subj}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 2. CHRONOLOGICAL LEARNING ACTIVITY & INTEGRITY LOG */}
      <Card className="border border-border/70 rounded-2xl bg-card shadow-2xs overflow-hidden flex flex-col min-w-0 p-0">
        <div className="p-3.5 sm:p-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 min-w-0">
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-foreground tracking-tight flex items-center gap-1.5 uppercase truncate">
              <Clock size={14} className="text-primary shrink-0" />
              Learning Activity & Cheating Incident Log
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">
              Chronological audit of exams, cheating alerts, achievements, and lesson completions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border/60 overflow-x-auto scrollbar-none max-w-full shrink-0">
            {[
              { id: "all", label: "All" },
              { id: "exam", label: "Exams" },
              { id: "cheating_incident", label: "Cheating Alerts", count: cheatingCount },
              { id: "achievement", label: "Achievements" },
              { id: "lesson", label: "Lessons" },
            ].map((filter) => {
              const isActive = timelineFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => {
                    setTimelineFilter(filter.id);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md transition-all capitalize cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? filter.id === "cheating_incident"
                        ? "bg-rose-600 text-white shadow-2xs"
                        : "bg-background text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>{filter.label}</span>
                  {filter.count !== undefined && filter.count > 0 && (
                    <span
                      className={`text-[8px] font-black px-1.5 py-0 rounded-full ${
                        isActive
                          ? "bg-white text-rose-600"
                          : "bg-rose-500/15 text-rose-600"
                      }`}
                    >
                      {filter.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline Items Feed */}
        <div className="p-3.5 sm:p-4 min-w-0">
          {filteredTimeline.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground italic font-medium">
              No activity log entries found for this filter.
            </div>
          ) : (
            <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
              {displayedTimeline.map((item) => {
                const isExam = item.type === "exam";
                const isAch = item.type === "achievement";
                const isLevel = item.type === "level_up";
                const isCheating = item.type === "cheating_incident" || item.type === "warning";
                const itemTypeFormatted = isCheating ? "Security Alert" : (item.type || "").replace("_", " ");

                return (
                  <div key={item.id} className="relative flex items-start gap-3 group">
                    {/* Dot Indicator */}
                    <div
                      className={`absolute -left-5 top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center text-white z-10 ${
                        isCheating
                          ? "bg-rose-500"
                          : isExam
                          ? "bg-primary"
                          : isAch
                          ? "bg-amber-500"
                          : isLevel
                          ? "bg-indigo-500"
                          : "bg-emerald-500"
                      }`}
                    >
                      {isCheating ? (
                        <ShieldAlert size={8} />
                      ) : isExam ? (
                        <Activity size={8} />
                      ) : isAch ? (
                        <Award size={8} />
                      ) : isLevel ? (
                        <Sparkles size={8} />
                      ) : (
                        <CheckCircle2 size={8} />
                      )}
                    </div>

                    {/* Event Card */}
                    <div
                      className={`flex-1 border rounded-xl p-3 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0 ${
                        isCheating
                          ? "bg-rose-500/[0.04] border-rose-500/30 hover:border-rose-500/50"
                          : "bg-muted/20 border-border/60 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0 pr-1">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <Badge
                            variant="outline"
                            className={`text-[8px] font-extrabold uppercase px-1.5 py-0 shrink-0 ${
                              isCheating
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/25"
                                : isExam
                                ? "bg-primary/10 text-primary border-primary/20"
                                : isAch
                                ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            }`}
                          >
                            {itemTypeFormatted}
                          </Badge>
                          <span className={`text-xs font-bold truncate ${isCheating ? "text-rose-950 dark:text-rose-200" : "text-foreground"}`}>
                            {item.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug break-words">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {/* Cheating Strike Badge */}
                        {isCheating && item.metadata?.strikeCount !== undefined && (
                          <Badge className="text-[9px] font-black px-1.5 py-0 bg-rose-500 text-white">
                            Strike #{item.metadata.strikeCount}
                          </Badge>
                        )}

                        {/* Exam Score Badge */}
                        {item.metadata?.score !== undefined && (
                          <Badge
                            className={`text-[9px] font-extrabold px-1.5 py-0 ${
                              item.metadata.score >= 75
                                ? "bg-emerald-500 text-white"
                                : "bg-amber-500 text-white"
                            }`}
                          >
                            Score: {item.metadata.score}%
                          </Badge>
                        )}

                        {/* XP Badge */}
                        {item.metadata?.xp && (
                          <Badge
                            variant="secondary"
                            className="text-[9px] font-extrabold bg-amber-500/10 text-amber-600 border-amber-500/20 px-1.5 py-0"
                          >
                            +{item.metadata.xp} XP
                          </Badge>
                        )}

                        {/* Date Timestamp */}
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
        </div>

        {/* View More / Load More Section */}
        {hasMore ? (
          <div className="p-3.5 flex justify-center items-center bg-muted/10 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              className="h-8.5 px-5 rounded-xl border-border bg-card hover:bg-accent text-foreground text-xs font-semibold shadow-2xs gap-2 transition-all cursor-pointer"
            >
              <ChevronDown size={14} className="text-muted-foreground" />
              <span>View More Activities</span>
            </Button>
          </div>
        ) : filteredTimeline.length > 0 ? (
          <div className="py-3 px-4 text-center border-t border-border/60 bg-muted/5">
            <p className="text-[11px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
              <CheckCircle2 size={12} className="text-emerald-500/80" />
              <span>You're all caught up. No more activities to load.</span>
            </p>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
