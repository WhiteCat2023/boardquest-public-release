import {
  Calendar,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCalendar } from "../../api/useCalendar";
import type { ReviewCenterRepresentative } from "../../types/types";
import ReviewCalendarView from "../ReviewCalendarView";

interface ReviewCenterSchedulesTabProps {
  reviewCenter: ReviewCenterRepresentative | null | undefined;
}

export default function ReviewCenterSchedulesTab({
  reviewCenter,
}: ReviewCenterSchedulesTabProps) {
  const { data: schedules = [], isLoading } = useCalendar({
    company: reviewCenter?.companyName,
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-primary" />
          <span className="text-xs font-bold text-foreground">
            {reviewCenter?.companyName || "Review Center"} Batch Schedules
          </span>
          <Badge variant="outline" className="text-[10px] font-semibold">
            {schedules.length} Scheduled
          </Badge>
        </div>

        {/* Read-Only Status Indicator */}
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-xl border border-border/60">
          <Lock size={11} className="text-muted-foreground/70" />
          <span>Managed by Review Center (Read-Only)</span>
        </div>
      </div>

      {/* Main View: Calendar */}
      <div className="min-h-[580px] flex flex-col w-full">
        <ReviewCalendarView
          schedules={schedules}
          isLoading={isLoading}
          canManage={false}
        />
      </div>
    </div>
  );
}
