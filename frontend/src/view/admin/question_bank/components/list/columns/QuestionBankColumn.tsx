import type { ColumnDef } from "@tanstack/react-table";
import type { Question } from "@/types/question";

// ── Badge helpers ──────────────────────────────────────────────────────────────

function DifficultyBadge({ level }: { level: string }) {
    const map: Record<string, string> = {
        Easy:   "bg-emerald-100 text-emerald-700 border-emerald-200",
        Medium: "bg-amber-100   text-amber-700   border-amber-200",
        Hard:   "bg-red-100     text-red-700     border-red-200",
    };
    const cls = map[level] ?? "bg-gray-100 text-gray-600 border-gray-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
            {level}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        Active:   "bg-[#E9B0B0] text-[#A70202] border-[#f5c6c6]",
        Inactive: "bg-gray-100  text-gray-500  border-gray-200",
        Pending:  "bg-amber-100 text-amber-700  border-amber-200",
        Archived: "bg-slate-100 text-slate-500  border-slate-200",
    };
    const cls = map[status] ?? "bg-gray-100 text-gray-600 border-gray-200";
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
            {status}
        </span>
    );
}

// ── Column definitions ─────────────────────────────────────────────────────────

export const QuestionBankColumn: ColumnDef<Question>[] = [
    {
        accessorKey: "text",
        header: "Question",
        cell: ({ row }) => {
            const promptText = (row.original as any).question || row.original.text || "";
            return (
                <p className="max-w-sm truncate text-sm text-foreground font-medium" title={promptText}>
                    {promptText}
                </p>
            );
        },
    },
    {
        accessorKey: "questionType",
        header: "Type",
        cell: ({ getValue }) => (
            <span className="text-sm text-gray-600">{getValue<string>()}</span>
        ),
    },
    {
        accessorKey: "difficultyLevel",
        header: "Difficulty",
        cell: ({ getValue }) => <DifficultyBadge level={getValue<string>()} />,
    },
    {
        accessorKey: "questionTags",
        header: "Tags",
        cell: ({ getValue }) => {
            const tags = getValue<string[]>();
            if (!tags?.length) return <span className="text-xs text-gray-400">—</span>;
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-600 border border-gray-200"
                        >
                            {tag}
                        </span>
                    ))}
                    {tags.length > 3 && (
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-400 border border-gray-200">
                            +{tags.length - 3}
                        </span>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "questionStatus",
        header: "Status",
        cell: ({ getValue }) => <StatusBadge status={getValue<string>()} />,
    },
    {
        accessorKey: "questionCreatedBy",
        header: "Created By",
        cell: ({ getValue }) => (
            <span className="text-sm text-gray-600">{getValue<string>()}</span>
        ),
    },
    {
        accessorKey: "questionCreatedDate",
        header: "Created At",
        cell: ({ getValue }) => {
            const date = getValue<string>();
            if (!date) return <span className="text-xs text-gray-400">—</span>;
            return (
                <span className="text-xs text-gray-500 tabular-nums">
                    {new Date(date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    })}
                </span>
            );
        },
    },
];
