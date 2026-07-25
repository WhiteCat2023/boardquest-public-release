import { useMemo } from 'react';
import { type Question } from '@/types/question';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
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
import { getQuestionColumns } from './columns';
import BulkActionsToolbar from './BulkActionsToolbar';

interface QuestionTableProps {
  questions: Question[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  itemsPerPage: number;
  onItemsPerPageChange: (val: number) => void;
  canManageBulk: boolean;
  onApprove?: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onFeedback: () => void;
  onBulkDelete: () => void;
  onClear: () => void;
  isApprovePending?: boolean;
  isPublishPending: boolean;
  isFeedbackPending: boolean;
  isDeletePending: boolean;
}

export default function QuestionTable({
  questions,
  onView,
  onDelete,
  rowSelection,
  onRowSelectionChange,
  itemsPerPage,
  onItemsPerPageChange,
  canManageBulk,
  onApprove,
  onPublish,
  onUnpublish,
  onFeedback,
  onBulkDelete,
  onClear,
  isApprovePending,
  isPublishPending,
  isFeedbackPending,
  isDeletePending,
}: QuestionTableProps) {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const currentUserId = (auth as any)?.data?.user?.id;
  const currentUserRole = (auth as any)?.data?.user?.role;

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
    onRowSelectionChange: onRowSelectionChange,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  const selectedRows = table.getSelectedRowModel().rows;

  return (
    <div className="relative w-full flex flex-col gap-0 font-sans text-foreground">
      <div className="w-full bg-card border border-border shadow-sm rounded-2xl overflow-hidden">
        {/* Datagrid Top Header Toolbar */}
        <BulkActionsToolbar
          totalCount={questions.length}
          selectedCount={selectedRows.length}
          canManageBulk={canManageBulk}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          onApprove={onApprove}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          onFeedback={onFeedback}
          onDelete={onBulkDelete}
          onClear={onClear}
          isApprovePending={isApprovePending}
          isPublishPending={isPublishPending}
          isFeedbackPending={isFeedbackPending}
          isDeletePending={isDeletePending}
        />

        <Table>
          <TableHeader className="bg-muted/40 border-b border-border" data-shimmer-ignore>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id} className="border-b border-border hover:bg-transparent">
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id} className="text-xs font-bold text-muted-foreground uppercase tracking-wider py-4">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <TableRow 
                  key={row.id} 
                  className={`border-b border-border hover:bg-accent/40 transition-colors ${
                    row.getIsSelected() ? 'bg-accent/70' : ''
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
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground font-medium">
                  No questions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
