import { BarChart2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MasteryItem {
  subject: string;
  proficiency: number;
}

interface CategoryProficiencyCardProps {
  masteryList: MasteryItem[];
}

export default function CategoryProficiencyCard({
  masteryList,
}: CategoryProficiencyCardProps) {
  return (
    <Card className="xl:col-span-7 border border-border/70 rounded-2xl bg-card p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 min-w-0">
      <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <BarChart2 size={14} className="text-primary shrink-0" />
          Category Proficiency vs Target (75%)
        </h3>
      </div>
      <div className="flex flex-col gap-3">
        {masteryList.length === 0 ? (
          <div className="text-center py-4 text-xs text-muted-foreground italic">
            No category proficiency data recorded yet.
          </div>
        ) : (
          masteryList.map((m: any, idx: number) => {
            const isPassing = m.proficiency >= 75;
            const barColor = isPassing
              ? "bg-emerald-500"
              : m.proficiency >= 55
                ? "bg-amber-500"
                : "bg-rose-500";
            const textColor = isPassing
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-amber-600";

            return (
              <div key={idx} className="flex flex-col gap-1 min-w-0">
                <div className="flex justify-between items-center text-xs gap-2 min-w-0">
                  <span className="font-bold text-foreground truncate min-w-0">
                    {m.subject}
                  </span>
                  <span className={`font-black shrink-0 ${textColor}`}>
                    {m.proficiency}%
                  </span>
                </div>
                <div className="relative w-full h-2.5 bg-muted/60 rounded-full overflow-hidden border border-border/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                    style={{ width: `${m.proficiency}%` }}
                  />
                  <div className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-foreground/60 z-10" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
