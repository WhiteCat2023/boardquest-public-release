import { useState } from "react";
import {
  Calendar,
  CalendarPlus,
  Clock,
  CheckCircle2,
  Trash2,
  Edit3,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { useCalendar, useDeleteCalendarEvent } from "../../api/useCalendar";
import SetReviewScheduleModal from "../SetReviewScheduleModal";
import type { ReviewCenterRepresentative, ReviewSchedule } from "../../types/types";
import { useConfirm } from "@/components/modal";
import { toast } from "sonner";

interface ReviewCenterSchedulesTabProps {
  reviewCenter: ReviewCenterRepresentative | null | undefined;
  canManage: boolean;
}

export default function ReviewCenterSchedulesTab({
  reviewCenter,
  canManage,
}: ReviewCenterSchedulesTabProps) {
  const { data: schedules = [], isLoading } = useCalendar({
    company: reviewCenter?.companyName,
  });
  const deleteMutation = useDeleteCalendarEvent();
  const { confirm } = useConfirm();

  const [isSetScheduleOpen, setIsSetScheduleOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ReviewSchedule | null>(null);

  const formatScheduleDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = async (schedule: ReviewSchedule) => {
    const confirmed = await confirm({
      title: "Delete Review Schedule",
      description: `Are you sure you want to delete the schedule "${schedule.title}"?`,
      variant: "destructive",
      confirmText: "Delete Schedule",
    });

    if (!confirmed) return;

    deleteMutation.mutate(schedule.id, {
      onSuccess: () => toast.success("Review schedule deleted."),
      onError: (err: any) =>
        toast.error(err.response?.data?.message || "Failed to delete schedule."),
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 font-sans">
      {/* Top Action Bar */}
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

        {canManage && (
          <Button
            size="sm"
            onClick={() => {
              setEditingSchedule(null);
              setIsSetScheduleOpen(true);
            }}
            className="h-8.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl px-3.5 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <CalendarPlus size={13} />
            Add Schedule
          </Button>
        )}
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
                No active or upcoming review batches have been scheduled for this partner institution yet.
              </p>
            </div>
            {canManage && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingSchedule(null);
                  setIsSetScheduleOpen(true);
                }}
                className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl h-8.5 px-4 shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarPlus size={14} />
                <span>Create Schedule</span>
              </Button>
            )}
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
                    Duration
                  </TableHead>
                  <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                    Status
                  </TableHead>
                  <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {schedules.map((schedule) => (
                  <TableRow
                    key={schedule.id}
                    className="hover:bg-accent/40 transition-colors group border-b border-border"
                  >
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

                    <TableCell className="hidden sm:table-cell py-2.5 px-3">
                      <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[9.5px] font-bold">
                        {schedule.category || "Board Review"}
                      </Badge>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell py-2.5 px-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Clock size={12} className="text-muted-foreground/70 shrink-0" />
                        <span>
                          {formatScheduleDate(schedule.startDate)} - {formatScheduleDate(schedule.endDate)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell py-2.5 px-3">
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[9.5px] font-bold"
                      >
                        <CheckCircle2 size={10} className="mr-1 inline" />
                        {schedule.status || "ACTIVE"}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-2.5 px-4 text-right">
                      {canManage && (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setEditingSchedule(schedule);
                              setIsSetScheduleOpen(true);
                            }}
                            className="size-7 text-muted-foreground hover:text-primary rounded-lg"
                            title="Edit Schedule"
                          >
                            <Edit3 size={13} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(schedule)}
                            className="size-7 text-muted-foreground hover:text-destructive rounded-lg"
                            title="Delete Schedule"
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Set Review Schedule Modal */}
      {isSetScheduleOpen && (
        <SetReviewScheduleModal
          isOpen={isSetScheduleOpen}
          onClose={() => {
            setIsSetScheduleOpen(false);
            setEditingSchedule(null);
          }}
          initialData={editingSchedule}
          prefilledCompany={reviewCenter?.companyName}
        />
      )}
    </div>
  );
}
