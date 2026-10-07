import React from "react";
import { Calendar as CalendarIcon, Edit3, Trash2, CheckCircle2 } from "lucide-react";
import type { ReviewSchedule } from "../../types/types";
import { evaluateScheduleStatus } from "../../utils/scheduleUtils";

interface ScheduleCardItemProps {
  schedule: ReviewSchedule;
  isSelected?: boolean;
  canManage?: boolean;
  onSelect?: (schedule: ReviewSchedule) => void;
  onEdit: (schedule: ReviewSchedule) => void;
  onDelete: (schedule: ReviewSchedule) => void;
}

export function ScheduleCardItem({
  schedule,
  isSelected = false,
  canManage = true,
  onSelect,
  onEdit,
  onDelete,
}: ScheduleCardItemProps) {
  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "ONGOING":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle2 size={10} /> Ongoing
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full shrink-0">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full shrink-0">
            Upcoming
          </span>
        );
    }
  };

  const status =
    schedule.startDate && schedule.endDate
      ? evaluateScheduleStatus(schedule.startDate, schedule.endDate)
      : schedule.status;

  return (
    <div
      onClick={() => onSelect?.(schedule)}
      className={`p-3 rounded-xl border transition-all flex flex-col gap-2 group font-sans cursor-pointer relative ${
        isSelected
          ? "border-primary bg-primary/10 ring-2 ring-primary/30 shadow-xs"
          : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4
              className={`text-xs font-bold truncate ${
                isSelected ? "text-primary" : "text-foreground"
              }`}
            >
              {schedule.title}
            </h4>
            {isSelected && (
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-primary text-primary-foreground shadow-2xs">
                Active on Calendar
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-medium truncate block mt-0.5">
            {schedule.companyName &&
            schedule.companyName !== "Institutional (BoardQuest)"
              ? `${schedule.companyName} • ${schedule.category || "Board Review"}`
              : schedule.category || "Board Review"}
          </span>
        </div>
        {getStatusBadge(status)}
      </div>

      {/* Dates & Duration */}
      <div
        className={`flex items-center gap-1.5 text-[11px] font-mono px-2 py-1 rounded-md border ${
          isSelected
            ? "bg-background text-primary font-bold border-primary/30"
            : "bg-background/80 text-muted-foreground border-border/60"
        }`}
      >
        <CalendarIcon className="size-3 text-primary shrink-0" />
        <span>
          {schedule.startDate} → {schedule.endDate}
        </span>
      </div>

      {/* Description if present */}
      {schedule.description && (
        <p className="text-[11px] text-muted-foreground/80 line-clamp-2 italic">
          &quot;{schedule.description}&quot;
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground font-medium">
          {isSelected ? "Click to deselect" : "Click to view on calendar"}
        </span>
        {canManage && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(schedule);
              }}
              className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-semibold"
            >
              <Edit3 size={12} /> Edit
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(schedule);
              }}
              className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-semibold ml-1"
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScheduleCardItem;
