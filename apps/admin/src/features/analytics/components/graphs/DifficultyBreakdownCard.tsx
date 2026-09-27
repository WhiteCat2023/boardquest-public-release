import { Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

interface DifficultyMetric {
  attempted: number;
  accuracy: number;
}

interface DifficultyBreakdownCardProps {
  easyData: DifficultyMetric;
  mediumData: DifficultyMetric;
  hardData: DifficultyMetric;
}

export default function DifficultyBreakdownCard({
  easyData,
  mediumData,
  hardData,
}: DifficultyBreakdownCardProps) {
  const difficultyTiers = [
    {
      key: "easy",
      label: "Easy Difficulty",
      data: easyData,
      theme: {
        container: "bg-emerald-500/10 border-emerald-500/20",
        title: "text-emerald-700 dark:text-emerald-400",
        accuracy: "text-emerald-600 dark:text-emerald-400",
      },
    },
    {
      key: "medium",
      label: "Medium Difficulty",
      data: mediumData,
      theme: {
        container: "bg-amber-500/10 border-amber-500/20",
        title: "text-amber-700 dark:text-amber-400",
        accuracy: "text-amber-600 dark:text-amber-400",
      },
    },
    {
      key: "hard",
      label: "Hard / Board Level",
      data: hardData,
      theme: {
        container: "bg-rose-500/10 border-rose-500/20",
        title: "text-rose-700 dark:text-rose-400",
        accuracy: "text-rose-600 dark:text-rose-400",
      },
    },
  ];

  return (
    <Card className="xl:col-span-5 border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Zap size={14} className="text-amber-500 shrink-0" />
          Performance by Difficulty
        </h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {difficultyTiers.map((tier) => (
          <div
            key={tier.key}
            className={`p-2.5 sm:p-3 border rounded-xl flex items-center justify-between gap-2 min-w-0 ${tier.theme.container}`}
          >
            <div className="min-w-0">
              <h4
                className={`text-xs font-bold uppercase tracking-wide truncate ${tier.theme.title}`}
              >
                {tier.label}
              </h4>
              <span className="text-[10px] text-muted-foreground truncate">
                {tier.data.attempted} Questions Answered
              </span>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`text-sm sm:text-base font-black ${tier.theme.accuracy}`}
              >
                {tier.data.accuracy}%
              </span>
              <span className="block text-[8px] font-extrabold text-muted-foreground uppercase">
                Accuracy
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
