import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { BadgesManagementTab } from "../components/BadgesManagementTab";
import { RanksManagementTab } from "../components/RanksManagementTab";
import GameManagementHeader from "../components/GameManagementHeader";
import { Award, Crown } from "lucide-react";

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
      <div className="flex items-center gap-2 border-b border-border/80 pb-3 pt-0.5 overflow-x-auto scrollbar-none shrink-0">
        <button
          type="button"
          onClick={() => handleTabChange("badges")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "badges"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Award className="w-4 h-4" /> Badges Catalog
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("ranks")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            activeTab === "ranks"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Crown
            className={`w-4 h-4 ${
              activeTab === "ranks" ? "text-amber-300" : "text-amber-500"
            }`}
          />{" "}
          Aspirant Ranks
        </button>
      </div>

      {/* Tab Contents - Independent Colocated Widgets */}
      <div className="flex-1 min-h-0 w-full">
        {activeTab === "badges" && <BadgesManagementTab />}
        {activeTab === "ranks" && <RanksManagementTab />}
      </div>
    </div>
  );
}

export default GameManagementPage;

