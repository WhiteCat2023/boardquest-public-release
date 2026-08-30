import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function SchedulesPage() {
  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Evaluation Schedules
        </h1>
        <p className="text-xs text-muted-foreground">
          Scheduled mock board exams, live drills, and evaluation calendar.
        </p>
      </div>

      <Card className="rounded-3xl border-border bg-card p-12 text-center shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
          <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Calendar className="size-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-black text-foreground">
              No Evaluation Sessions Scheduled
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Upcoming diagnostic exams and mock board exam windows will be synchronized here with the BoardQuest evaluation calendar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SchedulesPage;
