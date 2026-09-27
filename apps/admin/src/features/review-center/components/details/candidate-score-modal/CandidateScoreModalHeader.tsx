import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { getCandidateInitials } from "./candidateScoreTypes";

interface CandidateScoreModalHeaderProps {
  displayName: string;
  schoolId?: string | null;
  email?: string;
  schoolYear?: string;
  companyName?: string;
}

export default function CandidateScoreModalHeader({
  displayName,
  schoolId,
  email,
  schoolYear,
  companyName,
}: CandidateScoreModalHeaderProps) {
  const initials = getCandidateInitials(displayName);

  return (
    <DialogHeader>
      <div className="flex items-center gap-3">
        <div className="size-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-base shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <DialogTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
            <span className="truncate">{displayName}</span>
            {schoolId && (
              <Badge
                variant="outline"
                className="font-mono text-[10px] shrink-0"
              >
                {schoolId}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-0.5">
            {email || "Enrolled Student"} • SY {schoolYear || "2026-2027"}
            {companyName && ` • ${companyName}`}
          </DialogDescription>
        </div>
      </div>
    </DialogHeader>
  );
}
