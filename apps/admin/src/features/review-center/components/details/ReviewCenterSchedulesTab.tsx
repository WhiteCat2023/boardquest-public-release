import {
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useCalendar } from "../../api/useCalendar";
import type { ReviewCenterRepresentative } from "../../types/types";
import { evaluateScheduleStatus } from "../../utils/scheduleUtils";

interface ReviewCenterSchedulesTabProps {
  reviewCenter: ReviewCenterRepresentative | null | undefined;
}

export default function ReviewCenterSchedulesTab({
  reviewCenter,
}: ReviewCenterSchedulesTabProps) {
  const { data: schedules = [], isLoading } = useCalendar({
    company: reviewCenter?.companyName,
  });

  const formatScheduleDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-3 bg-card border border-border/80 p-3 rounded-2xl shadow-2xs">
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

      {/* Schedules Table */}
      <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden w-full p-0">
        {!isLoading && schedules.length === 0 ? (
          <div className="py-20 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-3.5">
            <div className="p-4 rounded-3xl bg-muted/60 border border-border/80 text-muted-foreground/60 shadow-2xs">
              <Calendar size={40} className="stroke-[1.5]" />
            </div>
            <div className="flex flex-col items-center gap-1 max-w-sm">
              <p className="font-bold text-foreground text-sm tracking-tight">
                No Review Schedules Found
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No active or upcoming review batches have been scheduled by {reviewCenter?.companyName || "this partner institution"} yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="w-full text-left border-collapse">
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow className="border-b border-border hover:bg-transparent">
                  <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Program / Batch Title
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Category Focus
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Duration & Dates
                  </TableHead>
                  <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right sm:text-left h-auto">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {schedules.map((schedule) => (
                  <TableRow
                    key={schedule.id}
                    className="hover:bg-accent/40 transition-colors group border-b border-border"
                  >
                    {/* Program Title & Notes */}
                    <TableCell className="py-2.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-xs">
                          {schedule.title}
                        </span>
                        {schedule.description && (
                          <span className="text-[10px] text-muted-foreground truncate max-w-xs">
                            {schedule.description}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="hidden sm:table-cell py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20 text-[9.5px] font-bold"
                      >
                        {schedule.category || "Board Review"}
                      </Badge>
                    </TableCell>

                    {/* Duration & Dates */}
                    <TableCell className="hidden sm:table-cell py-2.5 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock size={12} className="text-muted-foreground/70 shrink-0" />
                        <span>
                          {formatScheduleDate(schedule.startDate)} - {formatScheduleDate(schedule.endDate)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Schedule Status */}
                    <TableCell className="py-2.5 px-4 text-right sm:text-left">
                      {(() => {
                        const currentStatus =
                          schedule.startDate && schedule.endDate
                            ? evaluateScheduleStatus(schedule.startDate, schedule.endDate)
                            : (schedule.status || "UPCOMING");
                        const isOngoing = currentStatus === "ONGOING" || currentStatus === "ACTIVE";
                        const isCompleted = currentStatus === "COMPLETED";

                        return (
                          <Badge
                            variant="outline"
                            className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              isOngoing
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : isCompleted
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            }`}
                          >
                            <CheckCircle2 size={10} className="mr-1 inline" />
                            {isOngoing ? "ONGOING" : currentStatus}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
