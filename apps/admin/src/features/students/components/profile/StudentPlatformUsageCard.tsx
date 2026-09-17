import { Laptop } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StudentPlatformUsageCard() {
  const desktopPercent = 78;
  const mobilePercent = 22;

  return (
    <Card className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
      {/* Card Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="size-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          <Laptop size={14} />
        </div>
        <h3 className="text-sm font-bold text-foreground">Device Usage</h3>
      </div>

      {/* Progress Bars Container */}
      <div className="space-y-4 my-auto">
        {/* Desktop */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Desktop</span>
          </div>
          <div className="relative w-full h-3 bg-muted/60 rounded-full flex items-center overflow-visible">
            <div
              style={{ width: `${desktopPercent}%` }}
              className="h-full bg-primary rounded-full relative transition-all duration-500"
            >
              {/* Floating Tooltip Bubble with Pointer */}
              <div className="absolute right-0 -top-7 translate-x-1/2 flex flex-col items-center pointer-events-none">
                <span className="bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                  {desktopPercent}%
                </span>
                <span className="w-1.5 h-1 bg-neutral-900 dark:bg-neutral-100 rotate-45 -mt-0.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
            <span>Mobile</span>
          </div>
          <div className="w-full h-3 bg-muted/60 rounded-full flex items-center overflow-hidden">
            <div
              style={{ width: `${mobilePercent}%` }}
              className="h-full bg-sky-500/80 rounded-full transition-all duration-500"
            />
          </div>
        </div>

        {/* Axis Ticks */}
        <div className="flex justify-between text-[9.5px] font-medium text-muted-foreground/70 pt-1 px-0.5 border-t border-border/50">
          <span>0</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Insight Footer */}
      <div className="mt-3 pt-2.5 border-t border-border/70 text-xs text-muted-foreground leading-relaxed">
        <strong className="text-foreground font-semibold mr-1">Insight:</strong>
        Student primarily uses desktop for comprehensive review exams. Mobile usage suggests on-the-go daily quiz engagement.
      </div>
    </Card>
  );
}
