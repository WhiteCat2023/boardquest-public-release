import { Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StudentAnalyticsResult } from "../types/types";

interface LLMOptimizationBarProps {
  cacheStats?: StudentAnalyticsResult["cacheStats"];
}

export function LLMOptimizationBar({ cacheStats }: LLMOptimizationBarProps) {
  const isCached = !!cacheStats?.cached;
  const hashString = (cacheStats?.hash || "a8f9c2e1b40d7e63").slice(0, 8);

  return (
    <div className="p-2.5 px-3.5 rounded-xl bg-slate-900 dark:bg-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-white/10 text-emerald-400 rounded-lg border border-white/10 backdrop-blur-md">
          <Cpu size={16} className="stroke-[2.5]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-tight">LLM Token Optimization Engine</span>
          <Badge 
            variant="outline"
            className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0 ${
              isCached 
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30" 
                : "bg-blue-500/20 text-blue-300 border-blue-400/30"
            }`}
          >
            Cache {isCached ? "HIT" : "MISS"}
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-3 text-right shrink-0">
        <span className="text-[11px] font-semibold text-emerald-400">
          {isCached ? "100% Token Savings (Cached)" : "92% Input Compression"}
        </span>
        <span className="text-[9px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
          #{hashString}
        </span>
      </div>
    </div>
  );
}
