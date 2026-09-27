import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trophy, Sparkles, Flame, ShieldCheck, Search, X } from "lucide-react";
import type { LeaderboardCategory } from "../types/types";

interface LeaderboardToolbarProps {
  category: LeaderboardCategory;
  onCategoryChange: (category: LeaderboardCategory) => void;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  timeHorizon: string;
  onTimeHorizonChange: (timeHorizon: string) => void;
}

export default function LeaderboardToolbar({
  category,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  timeHorizon,
  onTimeHorizonChange,
}: LeaderboardToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-2.5 px-3 bg-card border border-border/80 rounded-2xl shadow-2xs">
      {/* Category Segmented Tabs */}
      <div className="flex items-center gap-1.5 bg-muted/50 p-1 border border-border/80 rounded-xl overflow-x-auto w-full lg:w-auto scrollbar-none">
        <button
          type="button"
          onClick={() => onCategoryChange("overall")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            category === "overall"
              ? "bg-card text-foreground shadow-2xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Trophy size={13} className="text-amber-500" />
          <span>Overall XP</span>
        </button>

        <button
          type="button"
          onClick={() => onCategoryChange("accuracy")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            category === "accuracy"
              ? "bg-card text-foreground shadow-2xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Sparkles size={13} className="text-emerald-500" />
          <span>Accuracy</span>
        </button>

        <button
          type="button"
          onClick={() => onCategoryChange("streak")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            category === "streak"
              ? "bg-card text-foreground shadow-2xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Flame size={13} className="text-orange-500" />
          <span>Streaks</span>
        </button>

        <button
          type="button"
          onClick={() => onCategoryChange("mastery")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
            category === "mastery"
              ? "bg-card text-foreground shadow-2xs border border-border/80"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldCheck size={13} className="text-blue-500" />
          <span>Subject Mastery</span>
        </button>
      </div>

      {/* Right Side: Search Input + Time Horizon Selector */}
      <div className="flex items-center gap-2 w-full lg:w-auto">
        <div className="relative flex-1 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5" />
          <Input
            type="text"
            placeholder="Search candidate by name..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-9 bg-muted/30 border border-border/80 rounded-xl text-xs text-foreground focus:ring-1 focus:ring-ring/20 focus:border-primary placeholder:text-muted-foreground w-full"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <Select value={timeHorizon} onValueChange={onTimeHorizonChange}>
          <SelectTrigger className="h-9 w-[125px] bg-muted/30 border-border/80 rounded-xl text-xs font-semibold text-foreground shrink-0">
            <SelectValue placeholder="Timeframe" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="all-time">All-Time</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
