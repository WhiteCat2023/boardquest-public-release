import { type ColumnDef } from "@tanstack/react-table";
import { UserRole, type Question } from "@/types/question";
import { Eye, Trash2, Edit, Tag } from "lucide-react";
import { getDifficultyColor, getInitials } from "@/utils/style";

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
  navigate,
}: GetColumnsProps): ColumnDef<Question>[] => [
  {
    id: "select",
    meta: {
      className: "w-10 sm:w-12 pl-2 sm:pl-3 pr-1 text-center shrink-0",
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
    accessorKey: "id",
    header: "ID",
    meta: {
      className: "hidden lg:table-cell",
    },
    cell: ({ row }) => (
      <span className="rounded bg-muted px-2 py-1 text-[10px] font-bold tracking-wide text-muted-foreground border border-border">
        Q-{row.original.id.slice(-4).toUpperCase()}
      </span>
    ),
  },
  {
    accessorKey: "question",
    header: "Question",
    meta: {
      className: "min-w-0 max-w-0 w-full overflow-hidden",
    },
    cell: ({ row }) => {
      const questionContent =
        (row.original as any).question || row.original.text || "";
      return (
        <div className="flex flex-col gap-1 min-w-0 w-full overflow-hidden">
          <p
            className="text-xs sm:text-sm font-semibold text-foreground truncate block w-full"
            title={questionContent}
          >
            {questionContent}
          </p>
          <div className="flex items-center gap-1.5 flex-nowrap overflow-hidden">
            <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 text-[9.5px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wide truncate max-w-[120px] shrink-0">
              {row.original.category?.name || "Subject"}
            </span>
            <span className="lg:hidden rounded bg-muted border border-border px-1.5 py-0.5 text-[8.5px] font-semibold text-muted-foreground shrink-0">
              {row.original.difficulty}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "topic",
    header: "Topic",
    meta: {
      className: "hidden lg:table-cell",
    },
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
    meta: {
      className: "hidden lg:table-cell",
    },
    cell: ({ row }) => (
      <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
        {row.original.type}
      </span>
    ),
  },
  {
    accessorKey: "difficulty",
    header: "Difficulty",
    meta: {
      className: "hidden lg:table-cell",
    },
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
    meta: {
      className: "hidden lg:table-cell",
    },
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
    id: "actions",
    meta: {
      className: "w-24 sm:w-28 lg:w-36 text-right pr-2 lg:pr-6 shrink-0",
    },
    header: () => <div className="text-right pr-1 lg:pr-4">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;
      const authorId =
        typeof item.author === "object"
          ? (item.author as any).id
          : item.authorId;
      const isAuthor = authorId === currentUserId;
      const canEdit =
        currentUserRole === UserRole.SUPERADMIN ||
        currentUserRole === UserRole.DEAN ||
        currentUserRole === UserRole.TEAMLEAD ||
        (currentUserRole === UserRole.TEACHER && isAuthor);
      const canDelete =
        currentUserRole === UserRole.SUPERADMIN ||
        currentUserRole === UserRole.DEAN ||
        currentUserRole === UserRole.TEAMLEAD ||
        (currentUserRole === UserRole.TEACHER && isAuthor);

      return (
        <div className="flex items-center justify-end gap-1 pr-1 lg:pr-4 shrink-0">
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
