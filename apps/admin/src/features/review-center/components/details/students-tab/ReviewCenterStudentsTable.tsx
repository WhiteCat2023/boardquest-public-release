import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import type { ReviewCenterCandidateItem } from "../../../api/useReviewCenter";
import ReviewCenterStudentRow from "./ReviewCenterStudentRow";

interface ReviewCenterStudentsTableProps {
  candidates: ReviewCenterCandidateItem[];
  isLoading: boolean;
  searchTerm: string;
  companyName?: string;
  onSelectCandidateForScores: (candidate: ReviewCenterCandidateItem) => void;
}

export default function ReviewCenterStudentsTable({
  candidates,
  isLoading,
  searchTerm,
  companyName,
  onSelectCandidateForScores,
}: ReviewCenterStudentsTableProps) {
  return (
    <Card className="bg-card border border-border/80 rounded-2xl shadow-xs overflow-hidden w-full p-0">
      {!isLoading && candidates.length === 0 ? (
        <div className="py-20 px-4 text-center text-muted-foreground flex flex-col items-center justify-center gap-3.5">
          <div className="p-4 rounded-3xl bg-muted/60 border border-border/80 text-muted-foreground/60 shadow-2xs">
            <GraduationCap size={40} className="stroke-[1.5]" />
          </div>
          <div className="flex flex-col items-center gap-1 max-w-sm">
            <p className="font-bold text-foreground text-sm tracking-tight">
              No Enrolled Candidates Found
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {searchTerm
                ? `No students matching "${searchTerm}" found for ${companyName || "this review center"}.`
                : `There are currently no candidates enrolled under ${companyName || "this institution"}.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <Table className="w-full text-left border-collapse">
            <TableHeader className="bg-muted/50 border-b border-border">
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                  Student Candidate
                </TableHead>
                <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                  School Year
                </TableHead>
                <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                  BoardQuest Game Status
                </TableHead>
                <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                  Enrollment Status
                </TableHead>
                <TableHead className="hidden sm:table-cell py-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground h-auto">
                  Enrolled Date
                </TableHead>
                <TableHead className="py-3 px-4 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right h-auto">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {candidates.map((candidate, idx) => (
                <ReviewCenterStudentRow
                  key={candidate.id || idx}
                  candidate={candidate}
                  onSelectCandidateForScores={onSelectCandidateForScores}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
