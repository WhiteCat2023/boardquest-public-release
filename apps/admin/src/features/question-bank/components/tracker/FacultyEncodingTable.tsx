import {
  Bell,
  Sliders,
  ExternalLink,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Hourglass,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { FacultyTrackItem } from "../../types/encodingTracker.types";
import { useNavigate } from "react-router-dom";

interface FacultyEncodingTableProps {
  items: FacultyTrackItem[];
  isLoading?: boolean;
  onNudgeClick: (item: FacultyTrackItem) => void;
  onSetQuotaClick: (item: FacultyTrackItem) => void;
  pagination?: React.ReactNode;
}

export function FacultyEncodingTable({
  items,
  isLoading,
  onNudgeClick,
  onSetQuotaClick,
  pagination,
}: FacultyEncodingTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/70 bg-card overflow-hidden p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 bg-muted/60 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card p-12 text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-base font-semibold text-foreground">
          No faculty records found
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
          No faculty members match the current filter criteria or handled subject
          allocations.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: FacultyTrackItem["status"]) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/30 gap-1 text-[11px] font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "OVERDUE":
        return (
          <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-500/30 gap-1 text-[11px] font-medium">
            <AlertTriangle className="w-3 h-3" />
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
  };

  const getDeadlineText = (deadlineStr: string | null) => {
    if (!deadlineStr) return { label: "No deadline", isUrgent: false };
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffDays = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays < 0) {
      return {
        label: `Overdue by ${Math.abs(diffDays)}d (${deadline.toLocaleDateString()})`,
        isUrgent: true,
      };
    }
    if (diffDays === 0) {
      return { label: "Due Today", isUrgent: true };
    }
    if (diffDays <= 5) {
      return {
        label: `${diffDays}d left (${deadline.toLocaleDateString()})`,
        isUrgent: true,
      };
    }
    return {
      label: deadline.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      isUrgent: false,
    };
  };

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border/70 text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
            <tr>
              <th className="py-3 px-4">Faculty Instructor</th>
              <th className="py-3 px-4">Handled Subject</th>
              <th className="py-3 px-4 min-w-[180px]">Encoding Progress</th>
              <th className="py-3 px-4">Quality Breakdown</th>
              <th className="py-3 px-4">Target Deadline</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map((item) => {
              const deadlineInfo = getDeadlineText(item.deadline);
              const initials = (item.teacher.name || "T")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <tr
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Faculty Details */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8 rounded-lg border border-border/60">
                        <AvatarImage
                          src={item.teacher.avatarUrl || undefined}
                          alt={item.teacher.name}
                        />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate max-w-[240px] xl:max-w-xs">
                          {item.teacher.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="truncate max-w-[200px] xl:max-w-xs">
                            {item.teacher.email}
                          </span>
                          {item.teacher.employeeId && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-muted font-mono">
                              #{item.teacher.employeeId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <span className="truncate max-w-[220px] xl:max-w-xs">
                        {item.subject.name}
                      </span>
                    </div>
                  </td>

                  {/* Progress Bar & Target */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-foreground">
                          {item.encodedCount}{" "}
                          <span className="font-normal text-muted-foreground">
                            / {item.targetCount} items
                          </span>
                        </span>
                        <span className="font-medium text-muted-foreground">
                          {item.progressPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={item.progressPercentage}
                        className={`h-2 ${
                          item.status === "COMPLETED"
                            ? "[&>div]:bg-emerald-500"
                            : item.status === "OVERDUE"
                            ? "[&>div]:bg-rose-500"
                            : item.status === "IN_PROGRESS"
                            ? "[&>div]:bg-amber-500"
                            : "[&>div]:bg-slate-400"
                        }`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {item.remainingCount > 0
                          ? `${item.remainingCount} questions remaining`
                          : "Target met"}
                      </span>
                    </div>
                  </td>

                  {/* Quality Breakdown */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        title="Approved questions"
                      >
                        ✓ {item.breakdown.approved} Appr.
                      </span>
                      <span
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        title="Pending Review"
                      >
                        ⏳ {item.breakdown.pendingReview} Pend.
                      </span>
                      {item.breakdown.pendingRevision > 0 && (
                        <span
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/10 text-rose-600 border border-rose-500/20"
                          title="Needs Revision"
                        >
                          ✎ {item.breakdown.pendingRevision} Rev.
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Deadline */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span
                        className={`truncate ${
                          deadlineInfo.isUrgent
                            ? "text-rose-500 font-medium"
                            : "text-foreground"
                        }`}
                      >
                        {deadlineInfo.label}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">{getStatusBadge(item.status)}</td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Nudge button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={item.status === "COMPLETED"}
                        onClick={() => onNudgeClick(item)}
                        title="Send in-app reminder"
                        className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </Button>

                      {/* Set Quota button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSetQuotaClick(item)}
                        title="Configure Target Quota & Deadline"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                      </Button>

                      {/* View author questions */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/question-bank/review-questions?authorId=${item.teacher.id}`,
                          )
                        }
                        title="View teacher questions in review queue"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pagination}
    </div>
  );
}
