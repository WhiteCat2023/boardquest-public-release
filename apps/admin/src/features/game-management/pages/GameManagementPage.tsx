import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { BadgesManagementTab } from "../components/BadgesManagementTab";
import { RanksManagementTab } from "../components/RanksManagementTab";
import GameManagementHeader from "../components/GameManagementHeader";
import { Award, Crown } from "lucide-react";
import { StandardNavTabs } from "@/components/custom/tabs";

export function GameManagementPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isRanksRoute = location.pathname.includes("rank");
  const tabParam = searchParams.get("tab");
  const initialTab =
    tabParam === "ranks" || isRanksRoute ? "ranks" : "badges";

  const [activeTab, setActiveTab] = useState<"badges" | "ranks">(
    initialTab
  );

  useEffect(() => {
    const p = searchParams.get("tab");
    if (p === "ranks" || location.pathname.includes("rank")) {
      setActiveTab("ranks");
    } else if (p === "badges") {
      setActiveTab("badges");
    }
  }, [searchParams, location.pathname]);

  const handleTabChange = (tab: "badges" | "ranks") => {
    setActiveTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* Header */}
      <GameManagementHeader />

      {/* Main Tabs Navigation */}
      <StandardNavTabs
        tabs={[
          { id: "badges", label: "Badges Catalog", icon: Award },
          { id: "ranks", label: "Aspirant Ranks", icon: Crown },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Contents - Independent Colocated Widgets */}
      <div className="flex-1 min-h-0 w-full">
        {activeTab === "badges" && <BadgesManagementTab />}
        {activeTab === "ranks" && <RanksManagementTab />}
      </div>
    </div>
  );
}

export default GameManagementPage;

