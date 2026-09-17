import { type Question } from "@/types/question";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getDifficultyColor, getStatusColor } from "@/utils/style";
import {
  BookOpen,
  Tag,
  FileCheck2,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

interface ReviewQuestionsTableProps {
  questions: Question[];
  isLoading: boolean;
  onSelectQuestion: (question: Question, index: number) => void;
  selectedAuthor?: any;
}

export default function ReviewQuestionsTable({
  questions,
  isLoading,
  onSelectQuestion,
  selectedAuthor,
}: ReviewQuestionsTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-3 px-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <Skeleton className="h-4 w-36 bg-muted" />
          <Skeleton className="h-4 w-24 bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-3 px-4 flex items-center justify-between gap-4">
              <div className="flex-1 space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <Skeleton className="h-3 w-1/3 bg-muted" />
              </div>
              <Skeleton className="h-5 w-24 rounded-md bg-muted shrink-0" />
              <Skeleton className="h-5 w-20 rounded-md bg-muted shrink-0" />
              <Skeleton className="h-5 w-16 rounded-md bg-muted shrink-0" />
              <Skeleton className="h-5 w-24 rounded-full bg-muted shrink-0" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-card border border-border rounded-2xl font-sans shadow-2xs">
        <div className="p-3.5 rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-3 animate-in zoom-in-50">
          <FileCheck2 size={32} />
        </div>
        <h3 className="text-base font-bold text-foreground">
          All Questions Reviewed!
        </h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          {selectedAuthor
            ? `There are no remaining questions awaiting review for ${selectedAuthor.name}.`
            : "No pending questions match the selected filter criteria."}
        </p>
      </div>
    );
  }

  const formatQuestionType = (type: string) => {
    switch (type) {
      case "MCQ":
        return "Multiple Choice";
      case "TRUE_FALSE":
        return "True / False";
      case "SHORT_ANSWER":
        return "Identification";
      default:
        return type || "MCQ";
    }
  };

  return (
    <div className="w-full bg-card border border-border rounded-2xl shadow-2xs overflow-hidden flex flex-col font-sans animate-in fade-in duration-150">
      {/* Table Header Bar */}
      <div className="p-3 px-4 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">
            Questions Awaiting Review
          </span>
          <Badge
            variant="outline"
            className="text-[10px] font-mono font-bold bg-muted text-muted-foreground border-border px-1.5 py-0"
          >
            {questions.length} item{questions.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <Sparkles size={12} className="text-primary" />
          <span>Click any row to open the interactive review workspace</span>
        </div>
      </div>

      {/* Table Content */}
      <div className="relative w-full overflow-x-auto">
        <Table className="w-full text-left">
          <TableHeader className="bg-muted/40 border-b border-border">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="min-w-[280px] text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2.5 px-3">
                Question Details
              </TableHead>
              <TableHead className="w-36 text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2.5 px-3">
                Subject
              </TableHead>
              <TableHead className="w-32 text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2.5 px-3">
                Type
              </TableHead>
              <TableHead className="w-28 text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2.5 px-3">
                Difficulty
              </TableHead>
              <TableHead className="w-36 text-[10px] font-bold text-muted-foreground uppercase tracking-wider py-2.5 px-3">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {questions.map((question, index) => {
              const qContent =
                (question as any).question || question.text || "Untitled Question";
              const subjectName =
                question.category?.name || (question as any).subject?.name || "Subject";
              const topicName = question.topic;
              const hasImage = Boolean(
                question.imageUrl ||
                  (question as any).choiceImages?.some(
                    (img: string) => img && img.trim()
                  )
              );

              const qAny = question as any;
              const commentsCount =
                qAny?._count?.comments ??
                qAny?._count?.questionComments ??
                (Array.isArray(qAny?.comments) ? qAny.comments.length : 0);

              const displayStatus =
                (question.status === "PENDING_REVISION" ||
                  (question.status as any) === "NEEDS_REVISION") &&
                commentsCount === 0
                  ? "PENDING_REVIEW"
                  : question.status || "PENDING_REVIEW";

              return (
                <TableRow
                  key={question.id}
                  onClick={() => onSelectQuestion(question, index)}
                  className="hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer group"
                >
                  {/* Question Stem + Metadata tags */}
                  <TableCell className="py-3 px-3 align-middle max-w-md">
                    <div className="flex flex-col gap-1 min-w-0">
                      <p
                        className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-relaxed"
                        title={qContent}
                      >
                        {qContent}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {topicName && (
                          <span className="rounded-md bg-muted border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                            <Tag size={9} className="text-muted-foreground/60" />
                            <span className="truncate max-w-[150px]">{topicName}</span>
                          </span>
                        )}
                        {hasImage && (
                          <span className="rounded-md bg-muted/80 border border-border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                            <ImageIcon size={9} className="text-primary" />
                            <span>Has Image</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Subject */}
                  <TableCell className="py-3 px-3 align-middle">
                    <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary flex items-center gap-1 w-fit">
                      <BookOpen size={10} />
                      <span className="truncate max-w-[130px]">{subjectName}</span>
                    </span>
                  </TableCell>

                  {/* Question Type */}
                  <TableCell className="py-3 px-3 align-middle">
                    <span className="text-xs font-medium text-muted-foreground">
                      {formatQuestionType(question.type)}
                    </span>
                  </TableCell>

                  {/* Difficulty */}
                  <TableCell className="py-3 px-3 align-middle">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty}
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 px-3 align-middle">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ${getStatusColor(
                        displayStatus
                      )}`}
                    >
                      {displayStatus}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
