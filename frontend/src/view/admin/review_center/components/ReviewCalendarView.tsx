import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Building2, 
  Tag, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReviewSchedule } from "../types";

interface ReviewCalendarViewProps {
  schedules: ReviewSchedule[];
  isLoading: boolean;
  onAddSchedule: () => void;
  onEditSchedule: (schedule: ReviewSchedule) => void;
  onDeleteSchedule: (schedule: ReviewSchedule) => void;
}

export default function ReviewCalendarView({
  schedules,
  isLoading,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}: ReviewCalendarViewProps) {
  // Calendar month state (default to July 2026 or current month)
  const [currentDate, setCurrentDate] = useState(new Date("2026-07-01"));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Days in month calculation
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  // Helper to check if a specific day is in range of a schedule
  const getSchedulesForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const targetDate = new Date(dayStr);

    return schedules.filter((sched) => {
      if (!sched.startDate || !sched.endDate) return false;
      const start = new Date(sched.startDate);
      const end = new Date(sched.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      targetDate.setHours(12, 0, 0, 0);

      return targetDate >= start && targetDate <= end;
    });
  };

  const todayDate = new Date();
  const isToday = (day: number) => {
    return (
      todayDate.getDate() === day &&
      todayDate.getMonth() === month &&
      todayDate.getFullYear() === year
    );
  };

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={10} /> Active
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            <Clock size={10} /> Upcoming
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Calendar Top Control Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-muted-foreground">Review schedule and date range overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-9 text-xs font-semibold text-foreground border-border bg-card hover:bg-accent rounded-xl px-3 cursor-pointer"
          >
            Today
          </Button>

          <div className="flex items-center border border-border rounded-xl bg-muted/40 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <Button
            onClick={onAddSchedule}
            className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <Plus size={15} />
            Schedule Review Period
          </Button>
        </div>
      </div>

      {/* Main Grid & Side Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Grid View (2 Columns) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-5 shadow-2xs space-y-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-border pb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
              <div key={idx} className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty padding cells for start weekday */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[84px] bg-muted/20 rounded-xl border border-transparent" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const daySchedules = getSchedulesForDay(dayNum);
              const currentDayIsToday = isToday(dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`min-h-[84px] p-1.5 rounded-xl border transition-all flex flex-col justify-between group ${
                    currentDayIsToday
                      ? "bg-primary/5 border-primary/40 shadow-xs"
                      : "bg-card border-border/80 hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold size-6 rounded-full flex items-center justify-center ${
                        currentDayIsToday
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="size-2 rounded-full bg-primary animate-pulse" />
                    )}
                  </div>

                  {/* Schedule Pills on Calendar Day */}
                  <div className="space-y-1 mt-1">
                    {daySchedules.slice(0, 2).map((sched) => (
                      <div
                        key={sched.id}
                        onClick={() => onEditSchedule(sched)}
                        className="text-[9px] font-semibold p-1 rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer truncate"
                        title={`${sched.title} (${sched.startDate} to ${sched.endDate})`}
                      >
                        {sched.title}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <span className="text-[9px] font-bold text-muted-foreground pl-0.5">
                        +{daySchedules.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule List & Date Range Manager Side Panel (1 Column) */}
        <div className="bg-card border border-border rounded-3xl p-5 shadow-2xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              Scheduled Review Periods
            </h3>
            <span className="text-xs font-mono font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">
              {schedules.length}
            </span>
          </div>

          {/* List of Schedules with Start/End Dates */}
          <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
            {schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                <AlertCircle size={24} className="text-muted-foreground/40" />
                <p className="text-xs font-semibold text-foreground">No Review Periods Scheduled</p>
                <p className="text-[11px] text-muted-foreground">Click 'Schedule Review Period' to set review start and end dates.</p>
              </div>
            ) : (
              schedules.map((sched) => (
                <div
                  key={sched.id}
                  className="bg-muted/40 hover:bg-muted/70 border border-border rounded-2xl p-4 transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-foreground truncate" title={sched.title}>
                        {sched.title}
                      </h4>
                      <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <Building2 size={12} className="text-muted-foreground/70 shrink-0" />
                        {sched.companyName}
                      </p>
                    </div>
                    {getStatusBadge(sched.status)}
                  </div>

                  {/* START DATE & END DATE BADGES */}
                  <div className="flex items-center gap-1.5 p-2 bg-card border border-border rounded-xl text-[11px]">
                    <CalendarIcon size={13} className="text-primary shrink-0" />
                    <div className="flex items-center gap-1 font-semibold text-foreground">
                      <span>{sched.startDate}</span>
                      <span className="text-muted-foreground font-normal">to</span>
                      <span>{sched.endDate}</span>
                    </div>
                  </div>

                  {sched.category && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <Tag size={11} className="text-muted-foreground/70" />
                      <span>{sched.category}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSchedule(sched)}
                      className="h-7 text-[11px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg px-2 cursor-pointer gap-1"
                    >
                      <Edit3 size={12} />
                      Set / Change Dates
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteSchedule(sched)}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
                      title="Remove Schedule"
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
