import { useState, useMemo } from 'react';
import { UserRole, type Question } from '@/types/question';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import useAxiosPrivate from '@/hooks/useAxiosPrivate';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import BulkFeedbackDialog from '../dialog/BulkFeedbackDialog';
import { getQuestionColumns } from './columns';
import BulkActionsToolbar from './BulkActionsToolbar';

interface QuestionTableProps {
  questions: Question[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function QuestionTable({ questions, onView, onDelete }: QuestionTableProps) {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();

  const currentUserId = (auth as any)?.data?.user?.id;
  const currentUserRole = (auth as any)?.data?.user?.role;

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Mutations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await axiosPrivate.post("/questions/bulk/delete", { ids });
    },
    onSuccess: (_, ids) => {
      toast.success(`Successfully deleted ${ids.length} questions.`);
      setRowSelection({});
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to bulk delete questions.");
    }
  });

  const bulkPublishMutation = useMutation({
    mutationFn: async ({ ids, isPublished }: { ids: string[]; isPublished: boolean }) => {
      await axiosPrivate.post("/questions/bulk/publish", { ids, isPublished });
    },
    onSuccess: (_, variables) => {
      toast.success(`Successfully ${variables.isPublished ? "published" : "unpublished"} ${variables.ids.length} questions.`);
      setRowSelection({});
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to bulk update publish state.");
    }
  });

  const bulkFeedbackMutation = useMutation({
    mutationFn: async ({ ids, feedback }: { ids: string[]; feedback: string }) => {
      await axiosPrivate.post("/questions/bulk/feedback", { ids, feedback });
    },
    onSuccess: (_, variables) => {
      toast.success(`Sent revision feedback for ${variables.ids.length} questions.`);
      setRowSelection({});
      setIsFeedbackOpen(false);
      queryClient.invalidateQueries({ queryKey: ["questions"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to bulk send feedback.");
    }
  });

  // Get Columns
  const columns = useMemo(() => getQuestionColumns({
    currentUserId,
    currentUserRole,
    onView,
    onDelete,
    navigate,
  }), [currentUserId, currentUserRole, onView, onDelete, navigate]);

  const table = useReactTable({
    data: questions,
    columns,
    state: {
      rowSelection,
    },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const selectedRows = table.getSelectedRowModel().rows;
  const selectedQuestions = selectedRows.map(row => row.original);
  const selectedIds = selectedQuestions.map(q => q.id);

  // Bulk actions handlers
  const handleBulkDelete = () => {
    const hasPublished = selectedQuestions.some(q => q.isPublished);
    if (hasPublished) {
      toast.error("Cannot delete published questions. Please unpublish them first.");
      return;
    }

    const canDeleteAll = selectedQuestions.every(q => {
      const authorId = typeof q.author === 'object' ? (q.author as any).id : q.authorId;
      return currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.ADMIN || authorId === currentUserId;
    });

    if (!canDeleteAll) {
      toast.error("You do not have permission to delete one or more of the selected questions.");
      return;
    }

    if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected questions?`)) {
      bulkDeleteMutation.mutate(selectedIds);
    }
  };

  const handleBulkPublish = (isPublished: boolean) => {
    const canPublishAll = currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.TEAMLEAD;
    if (!canPublishAll) {
      toast.error("Only administrators can publish/unpublish questions.");
      return;
    }

    if (isPublished) {
      const hasUnapproved = selectedQuestions.some(q => q.status !== "APPROVED");
      if (hasUnapproved) {
        toast.error("Only approved questions can be published. Please check your selection.");
        return;
      }
    }

    bulkPublishMutation.mutate({ ids: selectedIds, isPublished });
  };

  const handleBulkFeedbackSubmit = async (feedback: string) => {
    await bulkFeedbackMutation.mutateAsync({ ids: selectedIds, feedback });
  };

  const handleBulkFeedbackOpen = () => {
    const canFeedbackAll = currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.TEAMLEAD;
    if (!canFeedbackAll) {
      toast.error("Only administrators can request question revisions.");
      return;
    }

    const hasPublished = selectedQuestions.some(q => q.isPublished);
    if (hasPublished) {
      toast.error("Cannot request revision on published questions. Please unpublish them first.");
      return;
    }

    setIsFeedbackOpen(true);
  };

  const canManageBulk = currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.ADMIN || currentUserRole === UserRole.TEAMLEAD;

  return (
    <div className="relative w-full">
      <div className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden font-sans">
        <Table>
          <TableHeader className="bg-slate-50/50" data-shimmer-ignore>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="border-b border-slate-100 hover:bg-transparent">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow 
                  key={row.id} 
                  className={`border-b border-slate-100 hover:bg-slate-50/40 transition-colors ${
                    row.getIsSelected() ? 'bg-slate-50/80' : ''
                  }`}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-500 font-medium">
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bulk Actions Floating Toolbar */}
      {selectedIds.length > 0 && (
        <BulkActionsToolbar
          selectedCount={selectedIds.length}
          canManageBulk={canManageBulk}
          onPublish={() => handleBulkPublish(true)}
          onUnpublish={() => handleBulkPublish(false)}
          onFeedback={handleBulkFeedbackOpen}
          onDelete={handleBulkDelete}
          onClear={() => setRowSelection({})}
          isPublishPending={bulkPublishMutation.isPending}
          isFeedbackPending={bulkFeedbackMutation.isPending}
          isDeletePending={bulkDeleteMutation.isPending}
        />
      )}

      {/* Bulk Revision Feedback Dialog */}
      <BulkFeedbackDialog
        open={isFeedbackOpen}
        onOpenChange={setIsFeedbackOpen}
        onSubmit={handleBulkFeedbackSubmit}
        isPending={bulkFeedbackMutation.isPending}
        selectedCount={selectedIds.length}
      />
    </div>
  );
}
