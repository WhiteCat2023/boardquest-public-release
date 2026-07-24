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
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 size={10} /> Active
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            <Clock size={10} /> Upcoming
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Calendar Top Control Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-[#A70202]/10 text-[#A70202] flex items-center justify-center font-bold">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-slate-400">Review schedule and date range overview</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="h-9 text-xs font-semibold text-slate-700 border-slate-200 rounded-xl px-3 cursor-pointer"
          >
            Today
          </Button>

          <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/60 p-0.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <Button
            onClick={onAddSchedule}
            className="h-9 bg-[#A70202] hover:bg-[#8b0101] text-white font-semibold text-xs px-3.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <Plus size={15} />
            Schedule Review Period
          </Button>
        </div>
      </div>

      {/* Main Grid & Side Panel Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Grid View (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs space-y-4">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center border-b border-slate-100 pb-3">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName, idx) => (
              <div key={idx} className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {dayName}
              </div>
            ))}
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty padding cells for start weekday */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <div key={`empty-${idx}`} className="min-h-[84px] bg-slate-50/40 rounded-xl border border-transparent" />
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
                      ? "bg-red-50/30 border-[#A70202]/40 shadow-xs"
                      : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold size-6 rounded-full flex items-center justify-center ${
                        currentDayIsToday
                          ? "bg-[#A70202] text-white font-bold"
                          : "text-slate-700"
                      }`}
                    >
                      {dayNum}
                    </span>
                    {daySchedules.length > 0 && (
                      <span className="size-2 rounded-full bg-[#A70202] animate-pulse" />
                    )}
                  </div>

                  {/* Schedule Pills on Calendar Day */}
                  <div className="space-y-1 mt-1">
                    {daySchedules.slice(0, 2).map((sched) => (
                      <div
                        key={sched.id}
                        onClick={() => onEditSchedule(sched)}
                        className="text-[9px] font-semibold p-1 rounded-md bg-[#A70202]/10 text-[#A70202] hover:bg-[#A70202] hover:text-white transition-colors cursor-pointer truncate"
                        title={`${sched.title} (${sched.startDate} to ${sched.endDate})`}
                      >
                        {sched.title}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <span className="text-[9px] font-bold text-slate-400 pl-0.5">
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
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-2xs flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-[#A70202]" />
              Scheduled Review Periods
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {schedules.length}
            </span>
          </div>

          {/* List of Schedules with Start/End Dates */}
          <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
            {schedules.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                <AlertCircle size={24} className="text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No Review Periods Scheduled</p>
                <p className="text-[11px] text-slate-400">Click 'Schedule Review Period' to set review start and end dates.</p>
              </div>
            ) : (
              schedules.map((sched) => (
                <div
                  key={sched.id}
                  className="bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/80 rounded-2xl p-4 transition-all space-y-2.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate" title={sched.title}>
                        {sched.title}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Building2 size={12} className="text-slate-400 shrink-0" />
                        {sched.companyName}
                      </p>
                    </div>
                    {getStatusBadge(sched.status)}
                  </div>

                  {/* START DATE & END DATE BADGES */}
                  <div className="flex items-center gap-1.5 p-2 bg-white border border-slate-200/60 rounded-xl text-[11px]">
                    <CalendarIcon size={13} className="text-[#A70202] shrink-0" />
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <span>{sched.startDate}</span>
                      <span className="text-slate-400 font-normal">to</span>
                      <span>{sched.endDate}</span>
                    </div>
                  </div>

                  {sched.category && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                      <Tag size={11} className="text-slate-400" />
                      <span>{sched.category}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditSchedule(sched)}
                      className="h-7 text-[11px] font-semibold text-slate-600 hover:text-[#A70202] hover:bg-red-50 rounded-lg px-2 cursor-pointer gap-1"
                    >
                      <Edit3 size={12} />
                      Set / Change Dates
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteSchedule(sched)}
                      className="size-7 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
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
