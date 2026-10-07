import { MapPin, Building2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";
import { useActiveSchoolYear } from "@/context/SchoolYearContext";

export function DashboardHeader() {
  const { user } = useReviewCenterAuth();
  const { activeSchoolYear } = useActiveSchoolYear();

  return (
    <div className="p-6 rounded-3xl bg-card border border-border shadow-2xs relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="space-y-2 z-10">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-primary bg-primary/10 border-primary/20 gap-1.5 py-0.5">
            <Building2 className="size-3" />
            <span>{user?.companyName || user?.reviewCenter?.name || "Partner Review Center"}</span>
          </Badge>
          <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            VERIFIED
          </Badge>
          <Badge variant="outline" className="text-foreground bg-muted/60 border-border gap-1.5 py-0.5 font-bold">
            <Calendar className="size-3 text-primary" />
            <span>S.Y. {activeSchoolYear}</span>
          </Badge>
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
          Welcome back, {user?.name || "Representative"}!
        </h1>

        <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
          Review Center Management Portal. Monitor candidate cohort performance for S.Y. {activeSchoolYear}, synchronize board licensure evaluation milestones, and manage review program schedules.
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs bg-muted/40 p-3.5 px-4 rounded-2xl border border-border/80 shrink-0 z-10">
        <MapPin className="size-4 text-primary shrink-0" />
        <div>
          <div className="font-bold text-foreground">Center Location</div>
          <div className="text-muted-foreground text-[11px] font-medium">
            {user?.location || "Philippines"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
