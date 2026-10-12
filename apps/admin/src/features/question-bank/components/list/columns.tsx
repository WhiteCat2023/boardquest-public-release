import { type ColumnDef } from "@tanstack/react-table";
import { UserRole, QuestionStatus, type Question } from "@/types/question";
import { Eye, Trash2, Edit, Tag, Image as ImageIcon } from "lucide-react";
import { getDifficultyColor, getStatusColor } from "@/utils/style";
import { getCognitiveLevelMapping } from "@/utils/cognitiveLevel";

interface GetColumnsProps {
  currentUserId: string;
  currentUserRole: string;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  navigate: (path: string) => void;
}

export const getQuestionColumns = ({
  currentUserId,
  currentUserRole,
  onView,
  onDelete,
  navigate,
}: GetColumnsProps): ColumnDef<Question>[] => [
  {
    id: "select",
    meta: {
      className: "w-10 sm:w-12 px-2 text-center shrink-0",
    },
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-border text-primary focus:ring-ring/20 h-4 w-4 cursor-pointer accent-primary"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="rounded border-border text-primary focus:ring-ring/20 h-4 w-4 cursor-pointer accent-primary"
        />
      </div>
    ),
  },
  {
    accessorKey: "question",
    header: "Question",
    meta: {
      className: "w-full min-w-0 max-w-0 px-3 overflow-hidden",
    },
    cell: ({ row }) => {
      const questionContent =
        (row.original as any).question || row.original.text || "";
      const subjectName = row.original.category?.name;
      const topicName = row.original.topic;
      const questionType = row.original.type;
      const difficulty = row.original.difficulty;
      const status = row.original.status;
      const hasPromptImage = Boolean(row.original.imageUrl);
      const hasChoiceImages = Boolean(
        row.original.choiceImages?.some((img: string) => img && img.trim())
      );

      return (
        <div className="flex flex-col gap-1.5 min-w-0 w-full overflow-hidden py-1">
          <p
            className="text-xs sm:text-sm font-semibold text-foreground truncate block w-full leading-normal"
            title={questionContent}
          >
            {questionContent}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap overflow-hidden pt-0.5">
            {subjectName && (
              <span className="rounded-md bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-semibold text-primary tracking-tight truncate max-w-[150px] shrink-0">
                {subjectName}
              </span>
            )}
            {topicName && (
              <span className="rounded-md bg-muted border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground flex items-center gap-1 truncate max-w-[150px] shrink-0">
                <Tag size={10} className="text-muted-foreground/60 shrink-0" />
                <span className="truncate">{topicName}</span>
              </span>
            )}
            {questionType && (
              <span className="rounded-md bg-muted/70 border border-border px-2 py-0.5 text-[11px] font-medium text-muted-foreground shrink-0">
                {questionType}
              </span>
            )}
            {(hasPromptImage || hasChoiceImages) && (
              <span className="rounded-md bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 shrink-0" title={hasPromptImage && hasChoiceImages ? "Question & choice images attached" : hasPromptImage ? "Question prompt image attached" : "Choice images attached"}>
                <ImageIcon size={10} />
                <span>Image</span>
              </span>
            )}
            {difficulty && (() => {
              const cognitiveInfo = getCognitiveLevelMapping(difficulty);
              return (
                <span
                  className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold shrink-0 flex items-center gap-1 ${getDifficultyColor(difficulty)}`}
                  title={`Cognitive Level: ${cognitiveInfo.label} (${cognitiveInfo.fullTitle})\nTypical Focus: ${cognitiveInfo.typicalFocus}`}
                >
                  <span>{difficulty}</span>
                  <span className="opacity-50">•</span>
                  <span className="font-bold text-[10px]">{cognitiveInfo.label}</span>
                </span>
              );
            })()}
            {status && (
              <span
                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${getStatusColor(status)}`}
              >
                {status}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    meta: {
      className: "w-24 sm:w-28 text-right pr-2.5 sm:pr-4 shrink-0",
    },
    header: () => <div className="text-right pr-1 sm:pr-2">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      const authorId =
        typeof item.author === "object"
          ? (item.author as any).id
          : item.authorId;
      const isAuthor = authorId === currentUserId;
      const r = String(currentUserRole || "").toUpperCase();
      const isLeadOrAdmin =
        r === "SUPERADMIN" ||
        r === "DEAN" ||
        r === "TEAMLEAD" ||
        currentUserRole === UserRole.SUPERADMIN ||
        currentUserRole === UserRole.DEAN ||
        currentUserRole === UserRole.TEAMLEAD;
      const isTeacher = r === "TEACHER" || currentUserRole === UserRole.TEACHER;

      const canEdit =
        isLeadOrAdmin ||
        (isTeacher && isAuthor && item.status !== QuestionStatus.APPROVED);
      const canDelete =
        isLeadOrAdmin ||
        (isTeacher && isAuthor && item.status !== QuestionStatus.APPROVED);

      return (
        <div className="flex items-center justify-end gap-1 pr-1 sm:pr-2 shrink-0">
          <button
            onClick={() => onView?.(item.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer shrink-0"
            title="View Details"
          >
            <Eye size={13} />
          </button>

          {canEdit && (
            <button
              onClick={() => navigate(`/question-bank/edit/${item.id}`)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer shrink-0"
              title="Edit Question"
            >
              <Edit size={13} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete?.(item.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-destructive/30 bg-card text-destructive shadow-2xs transition-colors hover:bg-destructive/10 focus:outline-none cursor-pointer shrink-0"
              title="Delete Question"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      );
    },
  },
];
