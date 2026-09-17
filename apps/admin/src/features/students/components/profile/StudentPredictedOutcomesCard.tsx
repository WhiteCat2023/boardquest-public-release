import { useMemo } from "react";
import { Percent } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Student } from "../../types/types";

interface StudentPredictedOutcomesCardProps {
  student: Student;
  readinessScore?: number;
}

export function StudentPredictedOutcomesCard({ student, readinessScore: propReadinessScore }: StudentPredictedOutcomesCardProps) {
  const scorecard = student.scorecardSummary;
  const metrics = student.subjectMetrics || [];
  const settings = student.userSettings;

  // Accurate Readiness Score matching the KPI strip (scorecardSummary.avgProficiency)
  const readinessScore = propReadinessScore ?? scorecard?.avgProficiency ?? (
    metrics.length > 0
      ? Number((metrics.reduce((acc, m) => acc + (m.proficiency || 0), 0) / metrics.length).toFixed(1))
      : 0
  );

  // Weakest and strongest subjects
  const sorted = [...metrics].sort((a, b) => (a.proficiency || 0) - (b.proficiency || 0));
  const weakest = sorted[0] || { subject: "Hematology", proficiency: 48 };
  const strongest = sorted[sorted.length - 1] || { subject: "Clinical Chemistry", proficiency: 86 };

  // Gauge geometry
  const radius = 82;
  const cx = 110;
  const cy = 95;
  const totalTicks = 36;
  const activeTicks = Math.round((Math.min(100, Math.max(0, readinessScore)) / 100) * totalTicks);

  const ticks = useMemo(() => {
    const list = [];
    for (let i = 0; i <= totalTicks; i++) {
      // Angle from 180 deg (left) to 0 deg (right)
      const angleDeg = 180 - (i / totalTicks) * 180;
      const angleRad = (angleDeg * Math.PI) / 180;

      const innerR = radius - 10;
      const outerR = radius;

      const x1 = cx + innerR * Math.cos(angleRad);
      const y1 = cy - innerR * Math.sin(angleRad);
      const x2 = cx + outerR * Math.cos(angleRad);
      const y2 = cy - outerR * Math.sin(angleRad);

      const isActive = i <= activeTicks;
      list.push({ i, x1, y1, x2, y2, isActive });
    }
    return list;
  }, [cx, cy, radius, totalTicks, activeTicks]);

  // Main drivers dynamically compiled from student status
  const mainDrivers = [
    student.streak === 0 ? "Inactivity detected on recent practice" : `${student.streak}-day active practice consistency`,
    `High accuracy anchor: ${strongest.subject} (${strongest.proficiency}%)`,
    `Stalled discipline: ${weakest.subject} (${weakest.proficiency}% accuracy)`,
  ];

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Percent size={14} />
          </div>
          <h3 className="text-sm font-bold text-foreground">Readiness Score</h3>
        </div>
        <span className="text-[11px] font-semibold text-muted-foreground">
          Benchmark: 75% Passing
        </span>
      </div>

      {/* Radial Speedometer Gauge */}
      <div className="flex flex-col items-center justify-center relative my-1">
        <svg width="220" height="120" viewBox="0 0 220 120" className="overflow-visible">
          {/* Tick marks along the arc */}
          {ticks.map((tick) => (
            <line
              key={tick.i}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={
                tick.isActive
                  ? readinessScore >= 75
                    ? "oklch(0.6 0.18 145)" // emerald/green
                    : readinessScore >= 60
                    ? "oklch(0.7 0.18 80)" // amber
                    : "oklch(0.6 0.22 25)" // red
                  : "var(--border)"
              }
              strokeWidth={tick.isActive ? 2.5 : 1.5}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          ))}

          {/* Scale range labels */}
          <text x="18" y="105" className="text-[10px] font-bold fill-muted-foreground/80">
            00
          </text>
          <text x="186" y="105" className="text-[10px] font-bold fill-muted-foreground/80">
            100
          </text>
        </svg>

        {/* Big centered stat */}
        <div className="absolute top-12 flex flex-col items-center justify-center text-center">
          <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight">
            {readinessScore}%
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">
            Readiness Score
          </span>
        </div>
      </div>

      {/* Main Drivers Section */}
      <div className="mt-2 pt-2.5 border-t border-border/70 space-y-1.5">
        <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
          Main Drivers
        </div>
        <div className="space-y-1">
          {mainDrivers.map((driver, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-xs text-foreground/85">
              <span className="size-1 rounded-full bg-primary/70 shrink-0" />
              <span className="truncate">{driver}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export { StudentPredictedOutcomesCard as StudentReadinessScoreCard };
