import { Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MedtechSimulationCardProps {
  simulation?: {
    gwa?: number | null;
    generalWeightedAverage?: number | null;
    passed?: boolean;
    conditionFailed?: boolean;
    remarks?: string;
    failedSubjects?: string[];
    belowThresholdSubjects?: string[];
  } | null;
}

export default function MedtechSimulationCard({
  simulation,
}: MedtechSimulationCardProps) {
  if (!simulation) return null;

  const gwa = simulation.gwa ?? simulation.generalWeightedAverage ?? 0;
  const passed = Boolean(simulation.passed);
  const conditionFailed = Boolean(simulation.conditionFailed);
  const failedSubjects = simulation.failedSubjects || [];

  return (
    <div
      className={`p-4 rounded-xl border ${
        passed
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-amber-500/10 border-amber-500/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="size-5 text-primary" />
          <div>
            <h4 className="text-xs font-black uppercase tracking-wide text-foreground">
              Simulated PRC MedTech Licensure Rating
            </h4>
            <p className="text-[11px] text-muted-foreground">
              Official PRC Board Exam Weights (20/20/20/20/10/10)
            </p>
          </div>
        </div>
        <Badge
          className={`text-xs font-black uppercase px-2.5 py-0.5 ${
            passed
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
        >
          {passed ? "PASSED (Rating >= 75%)" : "CONDITION / NEEDS REVIEW"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-border/50">
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            General Weighted Avg (GWA)
          </span>
          <div className="text-xl font-black text-foreground">
            {gwa > 0 ? `${gwa.toFixed(1)}%` : "N/A"}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            Passing Criteria (75%)
          </span>
          <div className="text-sm font-bold text-foreground mt-0.5">
            {gwa >= 75 ? (
              <span className="text-emerald-600 font-bold">Met Standard</span>
            ) : (
              <span className="text-amber-600 font-bold">Below 75% Cutoff</span>
            )}
          </div>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            Condition Rule (No subj &lt; 50%)
          </span>
          <div className="text-sm font-bold text-foreground mt-0.5">
            {!conditionFailed ? (
              <span className="text-emerald-600 font-bold">All &ge; 50%</span>
            ) : (
              <span className="text-destructive font-bold">
                Failed: {failedSubjects.join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
