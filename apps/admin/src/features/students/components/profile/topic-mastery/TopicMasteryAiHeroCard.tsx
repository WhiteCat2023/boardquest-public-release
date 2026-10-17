import React from "react";
import {
  Sparkles,
  Brain,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Sword,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TopicDiagnosticItem } from "@/features/analytics/types/types";

export interface TopicMasteryAiHeroCardProps {
  summary?: {
    overallTopicReadinessSummary: string;
    priorityWeakTopics: TopicDiagnosticItem[];
    masteredAnchorTopics: TopicDiagnosticItem[];
    coachingTip: string;
    overallAccuracy: number;
    totalTopicsCount: number;
    masteredCount: number;
    proficientCount: number;
    needsReviewCount: number;
    unattemptedCount: number;
  };
  studentName?: string;
  onOpenMatrixModal?: (subject?: string) => void;
  onPrescribeGuidance?: (item: TopicDiagnosticItem) => void;
  onReviewTopic?: (item: TopicDiagnosticItem) => void;
}

export function TopicMasteryAiHeroCard({
  summary,
  studentName: _studentName,
  onOpenMatrixModal,
  onPrescribeGuidance,
  onReviewTopic,
}: TopicMasteryAiHeroCardProps) {
  const priorityWeak = summary?.priorityWeakTopics || [];
  const masteredAnchors = summary?.masteredAnchorTopics || [];
  const readinessSummary =
    summary?.overallTopicReadinessSummary ||
    "Overall topic readiness is extremely low, with most high-yield areas unattempted or poorly understood.";
  const coachingTip =
    summary?.coachingTip ||
    "Remember R.I.C.E. for bacterial growth phases: Lag, Log, Stationary, Death. Practice active recall!";

  return (
    <div className="p-4 sm:p-5 md:p-6 rounded-2xl bg-gradient-to-b from-card via-card to-muted/20 border-2 border-primary/25 shadow-lg space-y-4 relative overflow-hidden font-sans">
      {/* Decorative background glow matching BoardQuesters */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/70 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-2xs">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-tight text-foreground flex items-center gap-1.5">
                Topic Mastery via AI Analytics
              </h3>
              <Badge className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-primary/15 text-primary border border-primary/30 shrink-0">
                Deep Concept Diagnostics
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              Granular subtopic performance analytics & targeted MTLE drill prescriptions
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onOpenMatrixModal?.()}
          className="h-7 px-2.5 rounded-xl text-[11px] font-bold border-primary/30 hover:bg-primary/10 text-primary flex items-center gap-1.5 shrink-0 self-start sm:self-auto cursor-pointer shadow-2xs transition-all active:scale-95"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>View Full Topic Matrix</span>
          <ChevronRight className="w-3 h-3" />
        </Button>
      </div>

      {/* 2. Overall Topic Synthesis Banner */}
      <div className="p-3 sm:p-3.5 rounded-xl bg-muted/40 border border-border/70 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5 relative z-10">
        <Brain className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11.5px] leading-relaxed text-foreground font-medium">
          {readinessSummary}
        </p>
      </div>

      {/* 3. 2-Column Grid: Priority Weak Topics vs Mastered Topic Anchors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4 relative z-10">
        
        {/* Left Column: Priority Weak Topics • Remediation (Blind Spots) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-rose-500/30 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider text-rose-500 truncate">
                Priority Weak Topics &bull; Remediation
              </h4>
            </div>
            <Badge
              variant="outline"
              className="text-[9px] font-bold border-rose-500/30 text-rose-500 uppercase px-1.5 py-0 shrink-0"
            >
              Blind Spots
            </Badge>
          </div>

          <div className="space-y-2.5">
            {priorityWeak.length > 0 ? (
              priorityWeak.map((topicItem, idx) => {
                const isUnattempted = topicItem.totalAttempts === 0 || topicItem.status === "Unattempted";
                return (
                  <div
                    key={`${topicItem.subject}-${topicItem.topic}-${idx}`}
                    className="p-2.5 rounded-xl bg-muted/40 border border-border/80 hover:border-rose-500/40 transition-all flex flex-col justify-between gap-2 group/topic"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-foreground group-hover/topic:text-rose-500 transition-colors">
                            {topicItem.topic}
                          </span>
                          <button
                            type="button"
                            onClick={() => onOpenMatrixModal?.(topicItem.subject)}
                            className="text-[9px] font-semibold px-1.5 py-0 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors"
                            title="Click to view all topics in this discipline"
                          >
                            {topicItem.subject}
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                          {topicItem.diagnosticNote}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 shrink-0 ${
                          isUnattempted
                            ? "bg-muted text-muted-foreground border-border"
                            : "bg-rose-500/10 text-rose-500 border-rose-500/30"
                        }`}
                      >
                        {isUnattempted ? "Unattempted" : `${topicItem.accuracy}% Acc`}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {topicItem.totalAttempts > 0
                          ? `${topicItem.totalAttempts} question${topicItem.totalAttempts === 1 ? "" : "s"} answered`
                          : "High-yield starting domain"}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onPrescribeGuidance?.(topicItem)}
                        className="h-6 px-2 text-[10.5px] font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        title={`Prescribe guidance and drill for ${topicItem.topic}`}
                      >
                        <Sword className="w-3 h-3 text-primary" />
                        <span>Drill Topic</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border text-center space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  No critical weak topics flagged.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Answer more questions to refine micro-topic sensitivity.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mastered Topic Anchors (Demonstrated) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-card border border-emerald-500/30 shadow-2xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-500 truncate">
                Mastered Topic Anchors
              </h4>
            </div>
            <Badge
              variant="outline"
              className="text-[9px] font-bold border-emerald-500/30 text-emerald-500 uppercase px-1.5 py-0 shrink-0"
            >
              Demonstrated
            </Badge>
          </div>

          <div className="space-y-2.5">
            {masteredAnchors.length > 0 ? (
              masteredAnchors.map((topicItem, idx) => (
                <div
                  key={`${topicItem.subject}-${topicItem.topic}-${idx}`}
                  className="p-2.5 rounded-xl bg-muted/40 border border-border/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-2 group/topic"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground group-hover/topic:text-emerald-500 transition-colors">
                          {topicItem.topic}
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenMatrixModal?.(topicItem.subject)}
                          className="text-[9px] font-semibold px-1.5 py-0 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors"
                          title="Click to view all topics in this discipline"
                        >
                          {topicItem.subject}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                        {topicItem.diagnosticNote}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className="text-[10px] font-mono font-bold px-1.5 py-0.5 shrink-0 bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    >
                      {topicItem.accuracy}% Acc
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {topicItem.totalAttempts} question{topicItem.totalAttempts === 1 ? "" : "s"} answered
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onReviewTopic?.(topicItem)}
                      className="h-6 px-2 text-[10.5px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                      title={`Review topic drill for ${topicItem.topic}`}
                    >
                      <Sword className="w-3 h-3 text-emerald-500" />
                      <span>Review Drill</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-muted/20 border border-dashed border-border text-center space-y-1">
                <p className="text-xs font-semibold text-muted-foreground">
                  Topic mastery anchors calibrate as candidate completes question sets.
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Score 80%+ on repeated topic drills to promote topics into anchors.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. High-Yield Licensure Coaching Tip Banner */}
      <div className="p-3 sm:p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-2.5 relative z-10">
        <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary block">
            High-Yield Licensure Coaching Tip
          </span>
          <p className="text-xs text-foreground font-medium leading-relaxed">
            {coachingTip}
          </p>
        </div>
      </div>
    </div>
  );
}
