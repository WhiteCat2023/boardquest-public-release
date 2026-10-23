import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Users,
  AlertTriangle,
  Hourglass,
  AlertCircle,
  ExternalLink,
  Bell,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Clock,
  UserPlus,
  CalendarPlus,
  FileCheck,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/custom/pagination";
import { ColumnHeaderFilter } from "@/components/custom/table";
import { getCategoryIcon } from "../IconPicker";
import { AssignFacultyModal } from "../subject-details/AssignFacultyModal";
import { ExtendDeadlineModal } from "./ExtendDeadlineModal";
import type {
  SubjectTrackItem,
  FacultyTrackItem,
  EncodingStatus,
} from "../../types/encodingTracker.types";

function getStatusBadge(status: EncodingStatus) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30 gap-1 text-[11px] font-medium">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          Completed 🎉
        </Badge>
      );
    case "IN_REVIEW":
      return (
        <Badge className="bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 border-sky-500/30 gap-1 text-[11px] font-medium">
          <Clock className="w-3 h-3 text-sky-500" />
          Review Pending
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/30 gap-1 text-[11px] font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
          </span>
          Overdue
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/30 gap-1 text-[11px] font-medium">
          <Hourglass className="w-3 h-3" />
          In Progress
        </Badge>
      );
    case "NOT_STARTED":
    default:
      return (
        <Badge className="bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-500/30 gap-1 text-[11px] font-medium">
          <AlertCircle className="w-3 h-3" />
          Not Started
        </Badge>
      );
  }
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "None";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusFilterOptions = [
  {
    label: "Completed",
    value: "COMPLETED",
    icon: <Sparkles className="w-3 h-3 text-emerald-500" />,
  },
  {
    label: "Review Pending",
    value: "IN_REVIEW",
    icon: <Clock className="w-3 h-3 text-sky-500" />,
  },
  {
    label: "In Progress",
    value: "IN_PROGRESS",
    icon: <Hourglass className="w-3 h-3 text-amber-500" />,
  },
  {
    label: "Overdue",
    value: "OVERDUE",
    icon: <AlertTriangle className="w-3 h-3 text-rose-500" />,
  },
  {
    label: "Not Started",
    value: "NOT_STARTED",
    icon: <AlertCircle className="w-3 h-3 text-slate-500" />,
  },
];

interface SubjectTeachersSubTableProps {
  teachers: FacultyTrackItem[];
  onExtendDeadlineClick?: (teacher: FacultyTrackItem) => void;
}

function SubjectTeachersSubTable({
  teachers,
  onExtendDeadlineClick,
}: SubjectTeachersSubTableProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.max(1, Math.ceil(teachers.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const paginatedTeachers = teachers.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              <th className="py-2.5 px-4">Teacher</th>
              <th className="py-2.5 px-4 min-w-[220px]">Quota & Approval Progress</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4">Deadline</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {teachers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-6 text-center text-xs text-muted-foreground"
                >
                  No assigned handlers found for this subject.
                </td>
              </tr>
            ) : (
              paginatedTeachers.map((teacherTrack) => {
                const initials = teacherTrack.teacher.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();

                const approvedCount = teacherTrack.breakdown?.approved ?? 0;
                const inReviewCount = teacherTrack.breakdown?.pendingReview ?? 0;
                const target = Math.max(1, teacherTrack.targetCount);
                const approvedPct = Math.min(
                  100,
                  Math.round((approvedCount / target) * 100),
                );
                const inReviewPct = Math.min(
                  100 - approvedPct,
                  Math.round((inReviewCount / target) * 100),
                );

                return (
                  <tr
                    key={teacherTrack.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Teacher Name & Contact */}
                    <td className="py-2.5 px-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border border-border shrink-0">
                          <AvatarImage
                            src={teacherTrack.teacher.avatarUrl || undefined}
                          />
                          <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-foreground truncate">
                              {teacherTrack.teacher.name}
                            </p>
                            {teacherTrack.term && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0 font-medium text-muted-foreground border-border/80"
                              >
                                {teacherTrack.term}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {teacherTrack.teacher.email}
                          </p>
                          {teacherTrack.completedAt && (
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Completed on {formatDate(teacherTrack.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Dual Stacked Progress Bar */}
                    <td className="py-2.5 px-4 align-middle">
                      <div className="space-y-1.5 max-w-sm">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-foreground">
                            {teacherTrack.encodedCount}{" "}
                            <span className="text-muted-foreground font-normal">
                              / {teacherTrack.targetCount}
                            </span>
                            <span className="text-[10px] font-normal text-muted-foreground ml-1">
                              ({approvedCount} approved)
                            </span>
                          </span>
                          <span className="font-semibold text-muted-foreground font-mono text-[11px]">
                            {teacherTrack.progressPercentage}%
                          </span>
                        </div>
                        {/* Dual Bar */}
                        <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted/60 flex">
                          <div
                            style={{ width: `${approvedPct}%` }}
                            className="h-full bg-emerald-500 transition-all duration-300"
                            title={`${approvedCount} Approved (${approvedPct}%)`}
                          />
                          <div
                            style={{ width: `${inReviewPct}%` }}
                            className="h-full bg-sky-400 transition-all duration-300"
                            title={`${inReviewCount} In Review (${inReviewPct}%)`}
                          />
                        </div>
                        {/* Mini breakdown legend */}
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                            {approvedCount} Approved
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-sky-400" />
                            {inReviewCount} In Review
                          </span>
                          {teacherTrack.breakdown?.pendingRevision > 0 && (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              {teacherTrack.breakdown.pendingRevision} Needs Fix
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-4 align-middle whitespace-nowrap">
                      {getStatusBadge(teacherTrack.status)}
                    </td>

                    {/* Deadline */}
                    <td className="py-2.5 px-4 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                        <span
                          className={
                            teacherTrack.isPastDeadline
                              ? "text-rose-600 font-semibold"
                              : "text-muted-foreground"
                          }
                        >
                          {formatDate(teacherTrack.deadline)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            navigate(
                              `/question-bank/review-questions?subjectId=${teacherTrack.subject.id}&authorId=${teacherTrack.teacher.id}`,
                            )
                          }
                          className="h-7 text-xs px-2 gap-1 font-medium cursor-pointer hover:border-primary/50 hover:bg-primary/5"
                          title={`Review questions submitted by ${teacherTrack.teacher.name}`}
                        >
                          <FileCheck className="w-3.5 h-3.5 text-primary" />
                          <span>Review</span>
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExtendDeadlineClick?.(teacherTrack)}
                          className="h-7 text-xs px-2 gap-1 font-medium text-muted-foreground hover:text-foreground cursor-pointer"
                          title={`Extend deadline for ${teacherTrack.teacher.name}`}
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>Extend</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {teachers.length > 0 && (
        <DataTablePagination
          currentPage={validCurrentPage}
          totalPages={totalPages}
          totalItems={teachers.length}
          pageSize={pageSize}
          pageSizeOptions={[5, 10, 20]}
          onPageSizeChange={handlePageSizeChange}
          hasNextPage={validCurrentPage < totalPages}
          hasPreviousPage={validCurrentPage > 1}
          onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
          onPageSelect={(p) => setCurrentPage(p)}
          itemLabel="teachers"
          variant="table-footer"
        />
      )}
    </div>
  );
}

interface SubjectEncodingTableProps {
  items: SubjectTrackItem[];
  isLoading?: boolean;
  onSetSubjectQuotaClick?: (subject: SubjectTrackItem) => void;
  onNudgeSubjectClick?: (subject: SubjectTrackItem) => void;
  pagination?: React.ReactNode;
  selectedSubject?: string;
  onSubjectChange?: (val: string) => void;
  subjects?: { id: string; name: string }[];
  selectedStatus?: string;
  onStatusChange?: (val: string) => void;
}

export function SubjectEncodingTable({
  items,
  isLoading,
  onSetSubjectQuotaClick,
  onNudgeSubjectClick,
  pagination,
  selectedSubject,
  onSubjectChange,
  subjects,
  selectedStatus,
  onStatusChange,
}: SubjectEncodingTableProps) {
  const navigate = useNavigate();
  const [expandedSubjectIds, setExpandedSubjectIds] = useState<Set<string>>(
    new Set(),
  );
  const [assignFacultySubject, setAssignFacultySubject] =
    useState<SubjectTrackItem | null>(null);
  const [extendTeacherItem, setExtendTeacherItem] =
    useState<FacultyTrackItem | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSubjectIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedSubjectIds(new Set(items.map((item) => item.id)));
  };

  const collapseAll = () => {
    setExpandedSubjectIds(new Set());
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted/60 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card p-12 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground">
          No subject quota records found
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No curriculum subjects match the current status or search filter.
        </p>
      </div>
    );
  }

  const isAllExpanded =
    items.length > 0 && expandedSubjectIds.size === items.length;

  return (
    <div className="space-y-3">
      {/* Table Card Container */}
      <div className="rounded-2xl border border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Top bar controls */}
        <div className="px-4 py-2.5 bg-muted/30 border-b border-border/60 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-primary" />
            <span className="font-semibold text-foreground">
              Subject Quota Overview
            </span>
            <span>•</span>
            <span>{items.length} Subjects</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isAllExpanded ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={collapseAll}
                className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Collapse All
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={expandAll}
                className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Expand All
              </Button>
            )}
          </div>
        </div>

        {/* Desktop / Tablet Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/15 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-4 w-10"></th>
                <th className="py-3 px-4">
                  {onSubjectChange && subjects && subjects.length > 0 ? (
                    <ColumnHeaderFilter
                      title="Subject"
                      selectedValue={selectedSubject || "ALL"}
                      onSelect={onSubjectChange}
                      options={subjects.map((sub) => ({
                        label: sub.name,
                        value: sub.id,
                      }))}
                      allOptionLabel="All Subjects"
                    />
                  ) : (
                    "Subject"
                  )}
                </th>
                <th className="py-3 px-4">Assigned Teachers</th>
                <th className="py-3 px-4 min-w-[200px]">
                  Total Quota Progress
                </th>
                <th className="py-3 px-4">Quality Breakdown</th>
                <th className="py-3 px-4">
                  {onStatusChange ? (
                    <ColumnHeaderFilter
                      title="Status"
                      selectedValue={selectedStatus || "ALL"}
                      onSelect={onStatusChange}
                      options={statusFilterOptions}
                      allOptionLabel="All Statuses"
                    />
                  ) : (
                    "Status"
                  )}
                </th>
                <th className="py-3 px-4">Earliest Deadline</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {items.map((item) => {
                const IconComp = getCategoryIcon(
                  item.subject.icon,
                  item.subject.name,
                );
                const isExpanded = expandedSubjectIds.has(item.id);
                const hasTeachers = item.assignedTeachers.length > 0;

                return (
                  <React.Fragment key={item.id}>
                    {/* Main Subject Row */}
                    <tr
                      className={`hover:bg-muted/40 transition-colors group ${
                        isExpanded ? "bg-muted/20" : ""
                      } ${
                        item.status === "OVERDUE"
                          ? "bg-rose-500/[0.03] hover:bg-rose-500/[0.06]"
                          : ""
                      }`}
                    >
                      {/* Accordion Expand Button — colored left stripe by status */}
                      <td
                        className={`py-3.5 pl-3 pr-1 text-center align-middle border-l-[3px] transition-colors ${
                          item.status === "OVERDUE"
                            ? "border-rose-500"
                            : item.status === "COMPLETED"
                              ? "border-emerald-500"
                              : item.status === "IN_PROGRESS"
                                ? "border-amber-400"
                                : "border-transparent"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleExpand(item.id)}
                          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
                          aria-label={
                            isExpanded
                              ? "Collapse subject details"
                              : "Expand subject details"
                          }
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 group-hover:text-primary transition-colors" />
                          )}
                        </button>
                      </td>

                      {/* Subject Name & Icon */}
                      <td className="py-3.5 px-4 align-middle">
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => toggleExpand(item.id)}
                        >
                          <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                            <IconComp size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-foreground hover:text-primary transition-colors text-xs block truncate max-w-[200px] sm:max-w-[260px]">
                              {item.subject.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              Licensure Subject Domain
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Teachers Avatar Stack & Count */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2 overflow-hidden shrink-0">
                            {item.assignedTeachers.slice(0, 3).map((t) => {
                              const initials = t.teacher.name
                                .split(" ")
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join("")
                                .toUpperCase();
                              return (
                                <Avatar
                                  key={t.teacher.id}
                                  className="size-6 border-2 border-background ring-1 ring-border/50"
                                >
                                  <AvatarImage
                                    src={t.teacher.avatarUrl || undefined}
                                  />
                                  <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                              );
                            })}
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-semibold px-2 py-0.5 gap-1 shrink-0"
                          >
                            <Users className="w-3 h-3 text-muted-foreground" />
                            {item.teacherCount}{" "}
                            {item.teacherCount === 1 ? "Teacher" : "Teachers"}
                          </Badge>
                        </div>
                      </td>

                      {/* Aggregated Quota Progress */}
                      <td className="py-3.5 px-4 align-middle min-w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-foreground">
                              {item.encodedCount}{" "}
                              <span className="text-muted-foreground font-normal text-[11px]">
                                / {item.targetCount}
                              </span>
                            </span>
                            <span className="text-[11px] font-bold text-foreground font-mono">
                              {item.progressPercentage}%
                            </span>
                          </div>
                          <Progress
                            value={item.progressPercentage}
                            className={`h-2 bg-muted/60 ${
                              item.status === "COMPLETED"
                                ? "[&>div]:bg-emerald-500"
                                : item.status === "IN_REVIEW"
                                  ? "[&>div]:bg-sky-400"
                                  : item.status === "OVERDUE"
                                    ? "[&>div]:bg-rose-500"
                                    : item.status === "IN_PROGRESS"
                                      ? "[&>div]:bg-amber-500"
                                      : "[&>div]:bg-slate-400"
                            }`}
                          />
                          <p className="text-[10px] text-muted-foreground">
                            {item.remainingCount > 0
                              ? `${item.remainingCount} questions remaining`
                              : "Curriculum quota reached"}
                          </p>
                        </div>
                      </td>

                      {/* Quality Breakdown */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            title="Approved Questions"
                            className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] border border-emerald-500/20 whitespace-nowrap"
                          >
                            {item.breakdown.approved} Approved
                          </span>
                          <span
                            title="Pending Review"
                            className="px-1.5 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold text-[10px] border border-sky-500/20 whitespace-nowrap"
                          >
                            {item.breakdown.pendingReview} In Review
                          </span>
                          {item.breakdown.pendingRevision > 0 && (
                            <span
                              title="Needs Revision"
                              className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-[10px] border border-amber-500/20 whitespace-nowrap"
                            >
                              {item.breakdown.pendingRevision} Needs Fix
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-middle">
                        {getStatusBadge(item.status)}
                      </td>

                      {/* Earliest Deadline */}
                      <td className="py-3.5 px-4 align-middle text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-muted-foreground/70" />
                          <span>{formatDate(item.earliestDeadline)}</span>
                        </div>
                      </td>

                      {/* Actions — collapsed into ⋮ dropdown */}
                      <td className="py-3.5 px-4 text-right align-middle whitespace-nowrap">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
                              title="Subject actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 font-sans text-xs">
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs font-medium"
                              onClick={() => onSetSubjectQuotaClick?.(item)}
                            >
                              <Sliders className="w-3.5 h-3.5 text-primary" />
                              Set Quota
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs font-medium text-amber-600 focus:text-amber-600"
                              onClick={() => onNudgeSubjectClick?.(item)}
                              disabled={
                                item.status === "COMPLETED" ||
                                item.teacherCount === 0
                              }
                            >
                              <Bell className="w-3.5 h-3.5" />
                              Nudge Handlers
                              {item.teacherCount === 0 && (
                                <span className="ml-auto text-[10px] text-muted-foreground">No handlers</span>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs font-medium"
                              onClick={() => navigate(`/subject-management/${item.id}`)}
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                              View Subject Details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>

                    {/* Expandable Teachers Breakdown (Accordion Row) */}
                    {isExpanded && (
                      <tr className="bg-muted/10 border-b border-border/70">
                        <td colSpan={8} className="p-0">
                          <div className="py-3.5 px-5 sm:pl-14 sm:pr-8 space-y-2.5 animate-in fade-in duration-150">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5 text-primary" />
                                Assigned Teacher Handlers for {item.subject.name}
                              </h4>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAssignFacultySubject(item)}
                                  className="h-6 text-[10px] px-2 gap-1 font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                                  title={`Assign or manage teachers for ${item.subject.name}`}
                                >
                                  <UserPlus className="w-3 h-3" />
                                  <span>Manage Teachers</span>
                                </Button>
                              </div>
                            </div>

                            {hasTeachers ? (
                              <SubjectTeachersSubTable
                                teachers={item.assignedTeachers}
                                onExtendDeadlineClick={(teacher) =>
                                  setExtendTeacherItem(teacher)
                                }
                              />
                            ) : (
                              <div className="p-6 rounded-xl border border-dashed border-border/80 bg-muted/20 text-center space-y-2.5">
                                <p className="text-xs text-muted-foreground">
                                  No teachers are currently assigned to handle{" "}
                                  {item.subject.name}.
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setAssignFacultySubject(item)}
                                  className="text-xs gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
                                >
                                  <UserPlus className="w-3.5 h-3.5" />
                                  Assign Teachers to Subject
                                </Button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination bar if provided */}
        {pagination && (
          <div className="border-t border-border/60">{pagination}</div>
        )}
      </div>

      {/* Modals mounted directly */}
      {assignFacultySubject && (
        <AssignFacultyModal
          isOpen={!!assignFacultySubject}
          onClose={() => setAssignFacultySubject(null)}
          categoryId={assignFacultySubject.id}
          categoryName={assignFacultySubject.subject.name}
          currentHandlerIds={assignFacultySubject.assignedTeachers.map(
            (t) => t.teacher.id,
          )}
        />
      )}

      {extendTeacherItem && (
        <ExtendDeadlineModal
          isOpen={!!extendTeacherItem}
          onClose={() => setExtendTeacherItem(null)}
          item={extendTeacherItem}
        />
      )}
    </div>
  );
}
