import { Layers, TrendingUp, Clock, Target, Award } from "lucide-react";
import type { TabType } from "../types/types";

interface AnalyticsNavTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function AnalyticsNavTabs({ activeTab, setActiveTab }: AnalyticsNavTabsProps) {
  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: Layers },
    { id: "graphs" as TabType, label: "Performance Graphs", icon: TrendingUp },
    { id: "timeline" as TabType, label: "Activity Timeline", icon: Clock },
    { id: "progress" as TabType, label: "Syllabus & Readiness", icon: Target },
    { id: "achievements" as TabType, label: "Achievements", icon: Award },
  ];

  return (
    <div className="w-full min-w-0 p-1 bg-muted/60 backdrop-blur border border-border/60 rounded-xl flex items-center gap-1 overflow-x-auto scrollbar-none touch-pan-x">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap ${
              isActive
                ? "bg-background text-foreground shadow-2xs"
                : "text-muted-foreground hover:text-foreground hover:bg-background/40"
            }`}
          >
            <Icon size={13} className="shrink-0" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

