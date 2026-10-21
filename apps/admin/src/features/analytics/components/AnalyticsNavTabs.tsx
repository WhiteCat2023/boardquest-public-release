import { Layers, TrendingUp, Clock, Target, Award } from "lucide-react";
import { StandardNavTabs, type NavTabItem } from "@/components/custom/tabs";
import type { TabType } from "../types/types";

interface AnalyticsNavTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function AnalyticsNavTabs({ activeTab, setActiveTab }: AnalyticsNavTabsProps) {
  const tabs: NavTabItem<TabType>[] = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "graphs", label: "Performance Graphs", icon: TrendingUp },
    { id: "timeline", label: "Activity Timeline", icon: Clock },
    { id: "progress", label: "Syllabus & Readiness", icon: Target },
    { id: "achievements", label: "Achievements", icon: Award },
  ];

  return (
    <StandardNavTabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      variant="pills"
    />
  );
}


