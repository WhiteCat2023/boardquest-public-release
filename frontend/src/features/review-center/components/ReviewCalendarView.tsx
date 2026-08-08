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
import type { ReviewSchedule } from "@/features/review-center";

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
  // Calendar month state (defaults dynamically to the current month)
  const [currentDate, setCurrentDate] = useState(() => new Date());

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
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle2 size={10} /> Active
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[9.5px] font-semibold text-muted-foreground bg-muted border border-border px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] sm:text-[9.5px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
            <Clock size={10} /> Upcoming
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4 font-sans flex-1 h-full min-h-0">
      {/* Calendar Top Control Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3 bg-card border border-border p-2.5 sm:p-3 px-3 sm:px-4 rounded-xl shadow-2xs shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="size-7 sm:size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 shadow-2xs">
            <CalendarIcon size={16} className="sm:size-4.5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-foreground tracking-tight truncate">
              {monthNames[month]} {year}
            </h2>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
              Review schedule and timeline overview
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 self-stretch sm:self-auto justify-between sm:justify-end shrink-0 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-7 sm:h-8 text-[11px] sm:text-xs font-semibold text-foreground border-border bg-card hover:bg-accent rounded-lg px-2 sm:px-2.5 cursor-pointer"
            >
              Today
            </Button>

            <div className="flex items-center border border-border rounded-lg bg-muted/40 p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-card rounded-md transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={14} className="sm:size-[15px]" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1 text-muted-foreground hover:text-foreground hover:bg-card rounded-md transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={14} className="sm:size-[15px]" />
              </button>
            </div>
          </div>

          <Button
            onClick={onAddSchedule}
            className="h-7 sm:h-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-[11px] sm:text-xs px-2.5 sm:px-3 rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">Schedule Review Period</span>
            <span className="sm:hidden">Add Period</span>
          </Button>
        </div>
      </div>

      {/* Main Grid & Side Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 sm:gap-4 flex-1 h-full min-h-0">
        {/* Monthly Grid View (2 Columns on lg) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-2.5 sm:p-3.5 shadow-2xs space-y-2 sm:space-y-3 flex flex-col flex-1 h-full min-h-0 overflow-hidden">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-border pb-1.5 sm:pb-2 shrink-0">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
              <div key={idx} className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <span className="hidden sm:inline">{dayName}</span>
                <span className="sm:hidden">{dayName[0]}</span>
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 flex-1 h-full min-h-0 auto-rows-fr">
            {/* Empty padding cells for start weekday */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-full bg-muted/15 rounded-lg border border-transparent min-h-[50px] sm:min-h-[64px]" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const daySchedules = getSchedulesForDay(dayNum);
              const currentDayIsToday = isToday(dayNum);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-full min-h-[50px] sm:min-h-[64px] p-1 sm:p-1.5 rounded-lg border transition-all flex flex-col justify-between group overflow-hidden ${
                    currentDayIsToday
                      ? "bg-primary/5 border-primary/40 shadow-2xs"
                      : "bg-card border-border/70 hover:border-border hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold size-4.5 sm:size-5 rounded-full flex items-center justify-center shrink-0 ${
                        currentDayIsToday
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="size-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                    )}
                  </div>

                  {/* Schedule Pills on Calendar Day */}
                  <div className="space-y-0.5 mt-0.5 overflow-hidden">
                    {daySchedules.slice(0, 2).map((sched) => (
                      <div
                        key={sched.id}
                        onClick={() => onEditSchedule(sched)}
                        className="text-[8px] sm:text-[8.5px] font-semibold p-0.5 px-1 rounded bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer truncate"
                        title={`${sched.title} (${sched.startDate} to ${sched.endDate})`}
                      >
                        <span className="hidden sm:inline">{sched.title}</span>
                        <span className="sm:hidden">{sched.title.slice(0, 4)}..</span>
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <span className="text-[8px] font-bold text-muted-foreground block truncate">
                        +{daySchedules.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule List Side Panel (1 Column on lg) */}
        <div className="bg-card border border-border rounded-xl p-3 sm:p-3.5 shadow-2xs flex flex-col space-y-2.5 sm:space-y-3 flex-1 h-full min-h-0 max-h-[380px] lg:max-h-full">
          <div className="flex items-center justify-between border-b border-border pb-2 shrink-0">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Clock size={14} className="text-primary shrink-0" />
              Scheduled Review Periods
            </h3>
            <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md border border-border">
              {schedules.length}
            </span>
          </div>

          {/* List of Schedules with Start/End Dates */}
          <div className="space-y-2 sm:space-y-2.5 overflow-y-auto flex-1 h-full min-h-0 pr-0.5">
            {schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-1.5 border border-dashed border-border rounded-xl bg-muted/20">
                <AlertCircle size={20} className="text-muted-foreground/40" />
                <p className="text-xs font-bold text-foreground">No Review Periods</p>
                <p className="text-[11px] text-muted-foreground">
                  Click 'Schedule Review Period' to set dates.
                </p>
              </div>
            ) : (
              schedules.map((sched) => (
                <div
                  key={sched.id}
                  className="bg-muted/30 hover:bg-muted/60 border border-border rounded-xl p-2 sm:p-2.5 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4
                        className="text-xs font-bold text-foreground truncate"
                        title={sched.title}
                      >
                        {sched.title}
                      </h4>
                      <p className="text-[10px] sm:text-[10.5px] font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Building2 size={11} className="text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{sched.companyName}</span>
                      </p>
                    </div>
                    {getStatusBadge(sched.status)}
                  </div>

                  {/* START DATE & END DATE BADGES */}
                  <div className="flex items-center gap-1.5 p-1.5 bg-card border border-border rounded-lg text-[10px] sm:text-[10.5px]">
                    <CalendarIcon size={12} className="text-primary shrink-0" />
                    <div className="flex items-center gap-1 font-semibold text-foreground truncate">
                      <span>{sched.startDate}</span>
                      <span className="text-muted-foreground font-normal">to</span>
                      <span>{sched.endDate}</span>
                    </div>
                  </div>

                  {sched.category && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                      <Tag size={10} className="text-muted-foreground/70 shrink-0" />
                      <span className="truncate">{sched.category}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-border/60">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSchedule(sched)}
                      className="h-6 text-[10px] sm:text-[10.5px] font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md px-1.5 cursor-pointer gap-1"
                    >
                      <Edit3 size={11} />
                      Set / Change Dates
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteSchedule(sched)}
                      className="size-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer"
                      title="Remove Schedule"
                    >
                      <Trash2 size={12} />
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
