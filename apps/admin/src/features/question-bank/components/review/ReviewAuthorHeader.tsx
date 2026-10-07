import React from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useRoleFlags from "@/hooks/useRoleFlags";
import type { PendingReviewAuthor } from "../../api/useQuestionBank";

interface ReviewAuthorHeaderProps {
  selectedAuthor?: PendingReviewAuthor;
  totalPendingAcrossAuthors: number;
  onApproveAllForAuthor: () => void;
  isApproving?: boolean;
}

export function ReviewAuthorHeader({
  selectedAuthor,
  totalPendingAcrossAuthors,
  onApproveAllForAuthor,
  isApproving = false,
}: ReviewAuthorHeaderProps) {
  const { isStaff } = useRoleFlags();

  if (selectedAuthor) {
    const initials = selectedAuthor.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <div className="p-3 px-4 rounded-xl bg-card border border-border shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-foreground truncate">
                {selectedAuthor.name}
              </h2>
              <Badge
                variant="outline"
                className="text-[9.5px] font-semibold bg-muted text-muted-foreground border-border px-1.5 py-0"
              >
                {selectedAuthor.role}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {selectedAuthor.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
          <Badge
            variant="outline"
            className="text-[11px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 px-2.5 py-0.5 rounded-lg"
          >
            {selectedAuthor.pendingCount} Pending Question
            {selectedAuthor.pendingCount !== 1 ? "s" : ""}
          </Badge>

          {isStaff && (
            <Button
              variant="success"
              size="sm"
              onClick={onApproveAllForAuthor}
              disabled={isApproving}
              className="h-8 px-3 text-xs font-bold rounded-lg gap-1.5 cursor-pointer shadow-2xs"
            >
              <CheckCircle2 size={13} />
              Approve All for Author
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 px-4 rounded-xl bg-card border border-border shadow-2xs flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-primary" />
        <span className="text-xs font-bold text-foreground">Review Queue</span>
      </div>
      <Badge
        variant="outline"
        className="text-xs font-semibold px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 rounded-lg"
      >
        {totalPendingAcrossAuthors} Total Awaiting Review
      </Badge>
    </div>
  );
}

export default ReviewAuthorHeader;
