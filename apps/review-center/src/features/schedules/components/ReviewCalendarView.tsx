import { useState, useMemo, useEffect } from "react";
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
  AlertCircle,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ReviewSchedule } from "../api/useCalendar";

interface ReviewCalendarViewProps {
  schedules: ReviewSchedule[];
  isLoading: boolean;
  onAddSchedule: () => void;
  onEditSchedule: (schedule: ReviewSchedule) => void;
  onDeleteSchedule: (schedule: ReviewSchedule) => void;
  activeSchoolYear?: string;
}

const ITEMS_PER_PAGE = 10;

export default function ReviewCalendarView({
  schedules,
  isLoading,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
  activeSchoolYear,
}: ReviewCalendarViewProps) {
  // Calendar month state
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Selected schedule state: null by default so calendar doesn't show all schedules automatically
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);

  const selectedSchedule = useMemo(() => {
    if (!selectedScheduleId) return null;
    return (schedules || []).find((s) => s.id === selectedScheduleId) || null;
  }, [schedules, selectedScheduleId]);

  const calendarSchedules = useMemo(() => {
    if (!selectedScheduleId) return [];
    return selectedSchedule ? [selectedSchedule] : [];
  }, [selectedScheduleId, selectedSchedule]);

  // Sync calendar view month to selected schedule's start date
  useEffect(() => {
    if (selectedSchedule?.startDate) {
      const d = new Date(selectedSchedule.startDate);
      if (!isNaN(d.getTime())) {
        setCurrentDate(d);
      }
    }
  }, [selectedSchedule]);

  // Sync calendar view month to active school year if no schedule is selected
  useEffect(() => {
    if (selectedScheduleId || !activeSchoolYear) return;
    const match = activeSchoolYear.match(/^(\d{4})-\d{4}$/);
    if (match) {
      const syStartYear = parseInt(match[1], 10);
      const today = new Date();
      const todayYear = today.getFullYear();
      if (todayYear === syStartYear || todayYear === syStartYear + 1) {
        setCurrentDate(today);
      } else {
        // Jump to August 1 of that academic year
        setCurrentDate(new Date(syStartYear, 7, 1));
      }
    }
  }, [activeSchoolYear, selectedScheduleId]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
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

  const activeSchedules = schedules || [];

  const sortedSchedules = useMemo(() => {
    return [...activeSchedules].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA && timeB && timeA !== timeB) return timeB - timeA;
      return (b.id || "").localeCompare(a.id || "");
    });
  }, [activeSchedules]);

  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return sortedSchedules;
    const q = searchQuery.toLowerCase().trim();
    return sortedSchedules.filter((sched) => {
      return (
        sched.title?.toLowerCase().includes(q) ||
        sched.category?.toLowerCase().includes(q) ||
        sched.startDate?.toLowerCase().includes(q) ||
        sched.endDate?.toLowerCase().includes(q) ||
        sched.description?.toLowerCase().includes(q)
      );
    });
  }, [sortedSchedules, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE));

  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSchedules.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSchedules, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // Helper to check if a specific day is in range of a schedule
  const getSchedulesForDay = (day: number) => {
    const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const targetDate = new Date(dayStr);

    return calendarSchedules.filter((sched) => {
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
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
            <CheckCircle2 size={10} /> Active
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 w-full font-sans">
      {/* ── Left 2 Cols: Monthly Calendar Grid ── */}
      <div className="xl:col-span-2 flex flex-col bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs">
        {/* Month Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-3 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <CalendarIcon className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                  {monthNames[month]} {year}
                </h2>
                {selectedSchedule ? (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                    <span>Showing: {selectedSchedule.title}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedScheduleId(null)}
                      className="ml-1 text-muted-foreground hover:text-foreground cursor-pointer font-extrabold"
                      title="Clear selection"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium text-muted-foreground bg-muted border border-border">
                    Click a schedule to view
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {selectedSchedule
                  ? `Active timeline: ${selectedSchedule.startDate} to ${selectedSchedule.endDate}`
                  : "Select a review period on the sidebar to display its schedule on the calendar"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-8 px-2.5 text-xs font-semibold rounded-lg border-border"
            >
              Today
            </Button>
            <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="w-px h-4 bg-border" />
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1">
          {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((d) => (
            <div
              key={d}
              className="py-1.5 text-[10px] sm:text-[11px] font-bold text-muted-foreground tracking-wider uppercase"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-1 flex-1 min-h-[360px] sm:min-h-[420px]">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="rounded-xl bg-muted/10 border border-transparent min-h-[60px] sm:min-h-[72px]"
            />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const daySchedules = getSchedulesForDay(day);
            const hasSchedules = daySchedules.length > 0;
            const today = isToday(day);

            return (
              <div
                key={`day-${day}`}
                className={`
                  flex flex-col p-1.5 rounded-xl border transition-all duration-150 relative min-h-[60px] sm:min-h-[72px] overflow-hidden
                  ${
                    today
                      ? "border-primary bg-primary/5 font-bold shadow-2xs"
                      : hasSchedules
                      ? "border-border/90 bg-muted/20 hover:bg-muted/40"
                      : "border-border/40 bg-card hover:bg-muted/20"
                  }
                `}
              >
                {/* Day Number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      text-[11px] sm:text-xs font-semibold leading-none
                      ${
                        today
                          ? "size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-[10px]"
                          : "text-foreground"
                      }
                    `}
                  >
                    {day}
                  </span>
                  {hasSchedules && (
                    <span className="size-1.5 rounded-full bg-primary" />
                  )}
                </div>

                {/* Day Events Indicator */}
                <div className="flex flex-col gap-0.5 overflow-y-auto max-h-[40px] sm:max-h-[48px] no-scrollbar">
                  {daySchedules.slice(0, 2).map((sched) => (
                    <div
                      key={sched.id}
                      onClick={() => onEditSchedule(sched)}
                      className="px-1 py-0.5 rounded text-[9px] font-bold bg-primary/15 text-primary border border-primary/25 truncate cursor-pointer hover:opacity-80 transition-opacity"
                      title={`${sched.title} (${sched.startDate} to ${sched.endDate})`}
                    >
                      {sched.title}
                    </div>
                  ))}
                  {daySchedules.length > 2 && (
                    <span className="text-[8px] font-bold text-muted-foreground pl-0.5">
                      +{daySchedules.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right Col: Scheduled Review Periods List ── */}
      <div className="flex flex-col bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2.5 border-b border-border/80">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Scheduled Review Periods
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {selectedScheduleId && (
              <button
                type="button"
                onClick={() => setSelectedScheduleId(null)}
                className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
            <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {filteredSchedules.length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex items-center shrink-0">
          <Search className="size-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search review periods..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8 pl-8 pr-7 text-xs bg-muted/30 border-border rounded-lg placeholder:text-muted-foreground/60 focus-visible:ring-1"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Clear search"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* Schedule List Items */}
        <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[460px] pr-0.5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground gap-2">
              <div className="size-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Loading review schedules...</span>
            </div>
          ) : activeSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl">
              <AlertCircle className="size-8 text-muted-foreground/50 mb-2" />
              <p className="text-xs font-bold text-foreground">
                No Review Periods
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {activeSchoolYear
                  ? `Click "Schedule Review Period" to set review dates for S.Y. ${activeSchoolYear}.`
                  : 'Click "Schedule Review Period" to set review dates and timelines.'}
              </p>
              <Button
                size="sm"
                onClick={onAddSchedule}
                className="mt-3 h-7.5 text-xs rounded-lg bg-primary text-primary-foreground font-semibold"
              >
                <Plus size={13} className="mr-1" /> Set Schedule
              </Button>
            </div>
          ) : filteredSchedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 border border-dashed border-border rounded-xl bg-muted/20">
              <Search size={18} className="text-muted-foreground/40" />
              <p className="text-xs font-bold text-foreground">
                No matching review periods
              </p>
              <p className="text-[11px] text-muted-foreground">
                No review periods found for &quot;{searchQuery}&quot;
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSearchChange("")}
                className="h-6 text-[10px] rounded-lg px-2 text-primary border-primary/20 hover:bg-primary/10 cursor-pointer"
              >
                Clear search
              </Button>
            </div>
          ) : (
            paginatedSchedules.map((sched) => {
              const isSelected = selectedScheduleId === sched.id;
              return (
                <div
                  key={sched.id}
                  onClick={() =>
                    setSelectedScheduleId((prev) => (prev === sched.id ? null : sched.id))
                  }
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
                          {sched.title}
                        </h4>
                        {isSelected && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-primary text-primary-foreground shadow-2xs">
                            Active on Calendar
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
                        {sched.category || "Board Review"}
                      </span>
                    </div>
                    {getStatusBadge(sched.status)}
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
                      {sched.startDate} → {sched.endDate}
                    </span>
                  </div>

                  {/* Description if present */}
                  {sched.description && (
                    <p className="text-[11px] text-muted-foreground/80 line-clamp-2 italic">
                      &quot;{sched.description}&quot;
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-border/50">
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {isSelected ? "Click to deselect" : "Click to view on calendar"}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditSchedule(sched);
                        }}
                        className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-semibold"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSchedule(sched);
                        }}
                        className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors cursor-pointer text-[11px] flex items-center gap-1 font-semibold ml-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pagination Footer ── */}
        {filteredSchedules.length > 0 && (
          <div className="flex items-center justify-between pt-2.5 border-t border-border/80 text-xs shrink-0">
            <span className="text-[11px] text-muted-foreground font-medium">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredSchedules.length)} of{" "}
              {filteredSchedules.length}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={14} />
              </button>

              <span className="text-[11px] font-bold text-foreground px-1.5 min-w-[3rem] text-center">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1 rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
