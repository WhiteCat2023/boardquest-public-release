import { type ColumnDef } from "@tanstack/react-table";
import { UserRole, QuestionStatus, type Question } from "@/types/question";
import { Eye, Trash2, Edit, Tag, MessageSquare } from "lucide-react";
import { getDifficultyColor, getInitials, getStatusColor } from "@/utils/style";

interface GetColumnsProps {
  currentUserId: string;
  currentUserRole: string;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  onFeedback?: (id?: string) => void;
  navigate: (path: string) => void;
}

export const getQuestionColumns = ({
  currentUserId,
  currentUserRole,
  onView,
  onDelete,
  onFeedback,
  navigate,
}: GetColumnsProps): ColumnDef<Question>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center pl-4 pr-1">
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded border-border text-primary focus:ring-ring/20 h-4 w-4 cursor-pointer accent-primary"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center pl-4 pr-1">
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
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="rounded bg-muted px-2 py-1 text-[10px] font-bold tracking-wide text-muted-foreground border border-border">
        Q-{row.original.id.slice(-4).toUpperCase()}
      </span>
    ),
  },
  {
    accessorKey: "question",
    header: "Question",
    cell: ({ row }) => {
      const questionContent =
        (row.original as any).question || row.original.text || "";
      return (
        <div className="flex flex-col gap-1.5 max-w-[280px]">
          <span
            className="text-sm font-semibold text-foreground line-clamp-2 leading-relaxed"
            title={questionContent}
          >
            {questionContent}
          </span>
          <div className="flex">
            <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide">
              {row.original.category?.name || "Subject"}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "topic",
    header: "Topic",
    cell: ({ row }) => (
      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
        <Tag size={10} className="text-muted-foreground/60" />
        {row.original.topic || "Topic"}
      </span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    cell: ({ row }) => (
      <span
        className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getDifficultyColor(row.original.difficulty)}`}
      >
        {row.original.difficulty}
      </span>
    ),
  },
  {
    id: "author",
    header: "Author",
    cell: ({ row }) => {
      const authorName =
        typeof row.original.author === "object"
          ? row.original.author?.name
          : row.original.author;

      return (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary border border-primary/20 shrink-0">
            {getInitials(authorName)}
          </div>
          <span
            className="text-xs font-semibold text-foreground truncate max-w-[130px]"
            title={authorName}
          >
            {authorName || "Unknown"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 items-start">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(row.original.status)}`}
        >
          {row.original.status}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right pr-6">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      const authorId =
        typeof item.author === "object"
          ? (item.author as any).id
          : item.authorId;
      const isAuthor = authorId === currentUserId;
      const canEdit =
        currentUserRole === UserRole.SUPERADMIN ||
        currentUserRole === UserRole.ADMIN ||
        currentUserRole === UserRole.TEAMLEAD ||
        (currentUserRole === UserRole.TEACHER &&
          isAuthor &&
          item.status !== QuestionStatus.APPROVED);
      const canDelete =
        currentUserRole === UserRole.SUPERADMIN ||
        currentUserRole === UserRole.ADMIN ||
        (currentUserRole === UserRole.TEACHER &&
          isAuthor &&
          item.status === QuestionStatus.DRAFT);

      const canManageBulk =
        currentUserRole === UserRole.SUPERADMIN ||
        currentUserRole === UserRole.ADMIN ||
        currentUserRole === UserRole.TEAMLEAD;

      return (
        <div className="flex items-center justify-end gap-1.5 pr-6">
          <button
            onClick={() => onView?.(item.id)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer"
            title="View Details"
          >
            <Eye size={14} />
          </button>



          {canEdit && (
            <button
              onClick={() => navigate(`/question-bank/edit/${item.id}`)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer"
              title="Edit Question"
            >
              <Edit size={14} />
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete?.(item.id)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-destructive/30 bg-card text-destructive shadow-2xs transition-colors hover:bg-destructive/10 focus:outline-none cursor-pointer"
              title="Delete Question"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      );
    },
  },
];
