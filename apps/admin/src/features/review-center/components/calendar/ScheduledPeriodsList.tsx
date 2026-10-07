import React, { useState, useMemo } from "react";
import {
  Clock,
  Search,
  X,
  Plus,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTablePagination from "@/components/custom/pagination/DataTablePagination";
import type { ReviewSchedule } from "../../types/types";
import { ScheduleCardItem } from "./ScheduleCardItem";

interface ScheduledPeriodsListProps {
  schedules: ReviewSchedule[];
  selectedScheduleId?: string | null;
  onSelectSchedule?: (schedule: ReviewSchedule) => void;
  onClearSelection?: () => void;
  isLoading: boolean;
  canManage?: boolean;
  onAddSchedule: () => void;
  onEditSchedule: (schedule: ReviewSchedule) => void;
  onDeleteSchedule: (schedule: ReviewSchedule) => void;
}

const ITEMS_PER_PAGE = 10;

export function ScheduledPeriodsList({
  schedules,
  selectedScheduleId,
  onSelectSchedule,
  onClearSelection,
  isLoading,
  canManage = true,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}: ScheduledPeriodsListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const sortedSchedules = useMemo(() => {
    return [...(schedules || [])].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (timeA && timeB && timeA !== timeB) return timeB - timeA;
      return (b.id || "").localeCompare(a.id || "");
    });
  }, [schedules]);

  const filteredSchedules = useMemo(() => {
    if (!searchQuery.trim()) return sortedSchedules;
    const q = searchQuery.toLowerCase().trim();
    return sortedSchedules.filter((sched) => {
      return (
        sched.title?.toLowerCase().includes(q) ||
        sched.companyName?.toLowerCase().includes(q) ||
        sched.category?.toLowerCase().includes(q) ||
        sched.startDate?.toLowerCase().includes(q) ||
        sched.endDate?.toLowerCase().includes(q) ||
        sched.description?.toLowerCase().includes(q)
      );
    });
  }, [sortedSchedules, searchQuery]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSchedules.length / ITEMS_PER_PAGE),
  );

  const paginatedSchedules = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSchedules.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredSchedules, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-xs space-y-3 font-sans">
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
              onClick={onClearSelection}
              className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
            >
              Clear Filter
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
        ) : sortedSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-border rounded-xl">
            <AlertCircle className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-xs font-bold text-foreground">
              No Review Periods
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {canManage
                ? 'Click "Schedule Review Period" to set review dates and timelines.'
                : "No review periods have been scheduled yet."}
            </p>
            {canManage && (
              <Button
                size="sm"
                onClick={onAddSchedule}
                className="mt-3 h-7.5 text-xs rounded-lg bg-primary text-primary-foreground font-semibold cursor-pointer"
              >
                <Plus size={13} className="mr-1" /> Set Schedule
              </Button>
            )}
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
          paginatedSchedules.map((sched) => (
            <ScheduleCardItem
              key={sched.id}
              schedule={sched}
              isSelected={selectedScheduleId === sched.id}
              canManage={canManage}
              onSelect={onSelectSchedule}
              onEdit={onEditSchedule}
              onDelete={onDeleteSchedule}
            />
          ))
        )}
      </div>

      {/* Pagination Footer */}
      {filteredSchedules.length > 0 && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSchedules.length}
          pageSize={ITEMS_PER_PAGE}
          hasNextPage={currentPage < totalPages}
          hasPreviousPage={currentPage > 1}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
          itemLabel="periods"
          variant="table-footer"
          className="-mx-4 sm:-mx-5 -mb-4 sm:-mb-5 mt-2 rounded-b-2xl border-t border-border/80"
        />
      )}
    </div>
  );
}

export default ScheduledPeriodsList;
