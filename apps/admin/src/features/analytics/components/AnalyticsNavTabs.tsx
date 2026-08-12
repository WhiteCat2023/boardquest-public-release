import { Layers, TrendingUp, Clock, Target, Award } from "lucide-react";
import type { TabType } from "../types/types";

interface AnalyticsNavTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function AnalyticsNavTabs({ activeTab, setActiveTab }: AnalyticsNavTabsProps) {
  return (
    <div className="p-1 bg-muted/60 backdrop-blur border border-border/60 rounded-xl flex items-center gap-1 overflow-x-auto scrollbar-none">
      <button
        onClick={() => setActiveTab("overview")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
          activeTab === "overview" 
            ? "bg-background text-foreground shadow-2xs" 
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        }`}
      >
        <Layers size={13} />
        Overview
      </button>
      <button
        onClick={() => setActiveTab("graphs")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
          activeTab === "graphs" 
            ? "bg-background text-foreground shadow-2xs" 
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        }`}
      >
        <TrendingUp size={13} />
        Performance Graphs
      </button>
      <button
        onClick={() => setActiveTab("timeline")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
          activeTab === "timeline" 
            ? "bg-background text-foreground shadow-2xs" 
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        }`}
      >
        <Clock size={13} />
        Activity Timeline
      </button>
      <button
        onClick={() => setActiveTab("progress")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
          activeTab === "progress" 
            ? "bg-background text-foreground shadow-2xs" 
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        }`}
      >
        <Target size={13} />
        Syllabus & Readiness
      </button>
      <button
        onClick={() => setActiveTab("achievements")}
        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
          activeTab === "achievements" 
            ? "bg-background text-foreground shadow-2xs" 
            : "text-muted-foreground hover:text-foreground hover:bg-background/40"
        }`}
      >
        <Award size={13} />
        Achievements
      </button>
    </div>
  );
}
