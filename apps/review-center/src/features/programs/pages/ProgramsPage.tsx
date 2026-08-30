import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ProgramsPage() {
  return (
    <div className="space-y-6 max-w-7xl w-full mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-black text-foreground tracking-tight">
          Review Programs & Modules
        </h1>
        <p className="text-xs text-muted-foreground">
          Curated review tracks and licensure preparation subject modules.
        </p>
      </div>

      <Card className="rounded-3xl border-border bg-card p-12 text-center shadow-2xs">
        <CardContent className="flex flex-col items-center justify-center p-0 space-y-3">
          <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
            <BookOpen className="size-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h3 className="text-base font-black text-foreground">
              No Active Programs Configured
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your partner organization review modules and curriculum tracks will appear here once assigned by the administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ProgramsPage;
