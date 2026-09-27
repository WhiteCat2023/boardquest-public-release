import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { BadgesManagementTab } from "../components/BadgesManagementTab";
import { RanksManagementTab } from "../components/RanksManagementTab";
import GameManagementHeader from "../components/GameManagementHeader";
import { Award, Crown } from "lucide-react";

export function GameManagementPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
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

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full min-h-full font-sans bg-background text-foreground">
      {/* Header */}
      <GameManagementHeader />

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("badges")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "badges"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Award className="w-4 h-4" /> Badges Catalog
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ranks")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "ranks"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-500" /> Aspirant Ranks 
        </button>
      </div>

      {/* Tab Contents - Independent Colocated Widgets */}
      <div>
        {activeTab === "badges" && <BadgesManagementTab />}
        {activeTab === "ranks" && <RanksManagementTab />}
      </div>
    </div>
  );
}

export default GameManagementPage;

