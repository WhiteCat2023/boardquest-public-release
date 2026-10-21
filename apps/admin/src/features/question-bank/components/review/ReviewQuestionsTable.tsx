import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { type Question, UserRole, QuestionStatus } from "@/types/question";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getDifficultyColor, getStatusColor } from "@/utils/style";
import { getCognitiveLevelMapping } from "@/utils/cognitiveLevel";
import {
  Tag,
  FileCheck2,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  X,
  Loader2,
  AlertTriangle,
  Eye,
  Edit,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { showFeedback } from "@/components/modal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ReviewQuestionsTableProps {
  questions: Question[];
  isLoading: boolean;
  onSelectQuestion: (question: Question, index: number) => void;
  selectedAuthor?: any;
  onRefresh?: () => void;
}

export default function ReviewQuestionsTable({
  questions,
  isLoading,
  onSelectQuestion,
  selectedAuthor,
  onRefresh,
}: ReviewQuestionsTableProps) {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [singleDeleteId, setSingleDeleteId] = useState<string | null>(null);

  const currentUserId = (auth as any)?.data?.user?.id;
  const currentUserRole = (auth as any)?.data?.user?.role;
  const r = String(currentUserRole || "").toUpperCase();
  const isLeadOrAdmin =
    r === "SUPERADMIN" ||
    r === "DEAN" ||
    r === "TEAMLEAD" ||
    currentUserRole === UserRole.SUPERADMIN ||
    currentUserRole === UserRole.DEAN ||
    currentUserRole === UserRole.TEAMLEAD;
  const isTeacher = r === "TEACHER" || currentUserRole === UserRole.TEACHER;

  // Clear selections when switching authors or when question set changes
  useEffect(() => {
    setSelectedIds([]);
  }, [selectedAuthor?.id]);

  // Bulk Approve Mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await axiosPrivate.post("/questions/bulk/approve", { ids });
    },
    onSuccess: (_, ids) => {
      showFeedback.success(
        `Successfully approved ${ids.length} question${ids.length !== 1 ? "s" : ""}!`,
      );
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
      onRefresh?.();
    },
    onError: (err: any) => {
      showFeedback.error(
        err.response?.data?.message || "Failed to bulk approve questions.",
      );
    },
  });

  // Bulk Delete Mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await axiosPrivate.post("/questions/bulk/delete", { ids });
    },
    onSuccess: (_, ids) => {
      showFeedback.success(
        `Successfully deleted ${ids.length} question${ids.length !== 1 ? "s" : ""}.`,
      );
      setSelectedIds([]);
      setSingleDeleteId(null);
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["pendingReviewAuthors"] });
      onRefresh?.();
    },
    onError: (err: any) => {
      showFeedback.error(
        err.response?.data?.message || "Failed to delete questions.",
      );
    },
  });

  const isAllSelected =
    questions.length > 0 && selectedIds.length === questions.length;
  const isSomeSelected =
    selectedIds.length > 0 && selectedIds.length < questions.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(questions.map((q) => q.id));
    }
  };

  const handleToggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    bulkApproveMutation.mutate(selectedIds);
  };

  const handleConfirmDelete = () => {
    if (singleDeleteId) {
      bulkDeleteMutation.mutate([singleDeleteId]);
      return;
    }
    if (selectedIds.length === 0) return;
    bulkDeleteMutation.mutate(selectedIds);
  };

  if (isLoading) {
    return (
      <div className="w-full bg-card border border-border rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-2.5 px-3 border-b border-border bg-muted/40 flex items-center justify-between">
          <Skeleton className="h-3.5 w-24 bg-muted" />
          <Skeleton className="h-3.5 w-16 bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="p-2.5 px-3 flex items-center justify-between gap-3"
            >
              <Skeleton className="h-4 w-4 rounded bg-muted shrink-0" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-3/4 bg-muted" />
                <div className="flex items-center gap-1.5 pt-0.5">
                  <Skeleton className="h-4 w-20 rounded-md bg-muted" />
                  <Skeleton className="h-4 w-24 rounded-md bg-muted" />
                  <Skeleton className="h-4 w-12 rounded-md bg-muted" />
                  <Skeleton className="h-4 w-16 rounded-md bg-muted" />
                  <Skeleton className="h-4 w-20 rounded-full bg-muted" />
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Skeleton className="h-7 w-7 rounded-md bg-muted" />
                <Skeleton className="h-7 w-7 rounded-md bg-muted" />
                <Skeleton className="h-7 w-7 rounded-md bg-muted" />
              </div>
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

  const deleteCount = singleDeleteId ? 1 : selectedIds.length;

  return (
    <div className="w-full bg-card border border-border rounded-2xl shadow-2xs overflow-hidden flex flex-col font-sans animate-in fade-in duration-150">
      {/* Bulk Actions Bar — shown when items are selected */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between w-full border-b border-border bg-muted/40 px-4 py-3 gap-3 transition-all duration-200 font-sans">
          {/* Left side: Selection info */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold animate-in fade-in duration-150">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {selectedIds.length}
              </span>
              <span className="text-primary font-semibold">
                {selectedIds.length === 1
                  ? "1 question selected"
                  : `${selectedIds.length} questions selected`}
              </span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="ml-1 flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X size={12} />
                Clear
              </button>
            </div>
          </div>

          {/* Right side: Action buttons */}
          <div className="flex items-center gap-2 animate-in fade-in duration-150">
            <button
              type="button"
              onClick={handleBulkApprove}
              disabled={
                bulkApproveMutation.isPending || bulkDeleteMutation.isPending
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-600/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {bulkApproveMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <CheckCircle2 size={13} />
              )}
              <span>Approve ({selectedIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSingleDeleteId(null);
                setIsDeleteDialogOpen(true);
              }}
              disabled={
                bulkApproveMutation.isPending || bulkDeleteMutation.isPending
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/20 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {bulkDeleteMutation.isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Trash2 size={13} />
              )}
              <span>Delete ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Table Content — Unified Row Layout matching All Questions QuestionTable */}
      <div className="relative w-full overflow-x-auto">
        <Table className="w-full table-fixed">
          <TableHeader className="bg-muted/40 border-b border-border" data-shimmer-ignore>
            <TableRow className="border-b border-border hover:bg-transparent">
              {/* Checkbox Header */}
              <TableHead className="w-10 sm:w-12 px-2 text-center shrink-0">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) {
                        input.indeterminate = isSomeSelected;
                      }
                    }}
                    onChange={handleToggleSelectAll}
                    className="rounded border-border text-primary focus:ring-ring/20 h-4 w-4 cursor-pointer accent-primary"
                    aria-label="Select all questions"
                  />
                </div>
              </TableHead>
              <TableHead className="w-full min-w-0 max-w-0 px-3 overflow-hidden text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider py-2.5">
                Question
              </TableHead>
              <TableHead className="w-24 sm:w-28 text-right pr-2.5 sm:pr-4 shrink-0 text-[9.5px] font-bold text-muted-foreground uppercase tracking-wider py-2.5">
                <div className="text-right pr-1 sm:pr-2">Actions</div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {questions.map((question, index) => {
              const isSelected = selectedIds.includes(question.id);
              const qContent =
                (question as any).question ||
                question.text ||
                "Untitled Question";
              const subjectName =
                question.category?.name ||
                (question as any).subject?.name;
              const topicName = question.topic;
              const hasPromptImage = Boolean(question.imageUrl);
              const hasChoiceImages = Boolean(
                (question as any).choiceImages?.some(
                  (img: string) => img && img.trim(),
                ),
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

              const authorId =
                typeof question.author === "object"
                  ? (question.author as any).id
                  : (question as any).authorId;
              const isAuthor = authorId === currentUserId;

              const canEdit =
                isLeadOrAdmin ||
                (isTeacher &&
                  isAuthor &&
                  question.status !== QuestionStatus.APPROVED);
              const canDelete =
                isLeadOrAdmin ||
                (isTeacher &&
                  isAuthor &&
                  question.status !== QuestionStatus.APPROVED);

              return (
                <TableRow
                  key={question.id}
                  onClick={() => onSelectQuestion(question, index)}
                  className={`border-b border-border transition-colors cursor-pointer group ${
                    isSelected
                      ? "bg-accent/70 hover:bg-accent/80"
                      : "hover:bg-accent/40"
                  }`}
                >
                  {/* Row Checkbox */}
                  <TableCell
                    className="w-10 sm:w-12 px-2 text-center shrink-0 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectRow(question.id)}
                        className="rounded border-border text-primary focus:ring-ring/20 h-4 w-4 cursor-pointer accent-primary"
                        aria-label={`Select question ${question.id}`}
                      />
                    </div>
                  </TableCell>

                  {/* Question Stem + Badges row layout */}
                  <TableCell className="w-full min-w-0 max-w-0 px-3 overflow-hidden py-2 align-middle">
                    <div className="flex flex-col gap-1.5 min-w-0 w-full overflow-hidden py-1">
                      <p
                        className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate block w-full leading-normal"
                        title={qContent}
                      >
                        {qContent}
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap overflow-hidden pt-0.5">
                        {subjectName && (
                          <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary tracking-tight truncate max-w-[150px] shrink-0">
                            {subjectName}
                          </span>
                        )}
                        {topicName && (
                          <span className="rounded-md bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground flex items-center gap-1 truncate max-w-[150px] shrink-0">
                            <Tag
                              size={10}
                              className="text-muted-foreground/60 shrink-0"
                            />
                            <span className="truncate">{topicName}</span>
                          </span>
                        )}
                        {question.type && (
                          <span className="rounded-md bg-muted/70 border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground shrink-0">
                            {question.type}
                          </span>
                        )}
                        {(hasPromptImage || hasChoiceImages) && (
                          <span
                            className="rounded-md bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 shrink-0"
                            title={
                              hasPromptImage && hasChoiceImages
                                ? "Question & choice images attached"
                                : hasPromptImage
                                  ? "Question prompt image attached"
                                  : "Choice images attached"
                            }
                          >
                            <ImageIcon size={10} />
                            <span>Image</span>
                          </span>
                        )}
                        {question.difficulty &&
                          (() => {
                            const cognitiveInfo = getCognitiveLevelMapping(
                              question.difficulty,
                            );
                            return (
                              <span
                                className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold shrink-0 flex items-center gap-1 ${getDifficultyColor(question.difficulty)}`}
                                title={`Cognitive Level: ${cognitiveInfo.label} (${cognitiveInfo.fullTitle})\nTypical Focus: ${cognitiveInfo.typicalFocus}`}
                              >
                                <span>{question.difficulty}</span>
                                <span className="opacity-50">•</span>
                                <span className="font-bold text-[10px]">
                                  {cognitiveInfo.label}
                                </span>
                              </span>
                            );
                          })()}
                        {displayStatus && (
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusColor(displayStatus)}`}
                          >
                            {displayStatus}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  {/* Actions column */}
                  <TableCell className="w-24 sm:w-28 text-right pr-2.5 sm:pr-4 shrink-0 align-middle">
                    <div className="flex items-center justify-end gap-1 pr-1 sm:pr-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectQuestion(question, index);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer shrink-0"
                        title="Review Question"
                      >
                        <Eye size={13} />
                      </button>

                      {canEdit && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/question-bank/edit/${question.id}`);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer shrink-0"
                          title="Edit Question"
                        >
                          <Edit size={13} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSingleDeleteId(question.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-destructive/30 bg-card text-destructive shadow-2xs transition-colors hover:bg-destructive/10 focus:outline-none cursor-pointer shrink-0"
                          title="Delete Question"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setSingleDeleteId(null);
        }}
      >
        <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-2xl max-w-md text-foreground font-sans">
          <AlertDialogHeader className="text-left space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <AlertDialogTitle className="text-base font-bold text-foreground">
                  Delete {deleteCount} Question{deleteCount !== 1 ? "s" : ""}?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to permanently delete{" "}
                  {singleDeleteId
                    ? "this question"
                    : `${deleteCount} selected questions`}
                  ? This action cannot be undone.
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4 mt-2">
            <AlertDialogCancel
              disabled={bulkDeleteMutation.isPending}
              className="rounded-xl text-xs font-semibold h-9 px-4 border-border hover:bg-muted cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={bulkDeleteMutation.isPending}
              className="rounded-xl text-xs font-semibold h-9 px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer shadow-xs"
            >
              {bulkDeleteMutation.isPending ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 size={13} className="animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
