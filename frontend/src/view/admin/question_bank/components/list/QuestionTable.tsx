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
  rowSelection: Record<string, boolean>;
  onRowSelectionChange: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  itemsPerPage: number;
  onItemsPerPageChange: (val: number) => void;
  canManageBulk: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  onFeedback: () => void;
  onBulkDelete: () => void;
  onClear: () => void;
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
  onPublish,
  onUnpublish,
  onFeedback,
  onBulkDelete,
  onClear,
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
    <div className="relative w-full flex flex-col gap-0 font-sans">
      <div className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* Datagrid Top Header Toolbar */}
        <BulkActionsToolbar
          totalCount={questions.length}
          selectedCount={selectedRows.length}
          canManageBulk={canManageBulk}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
          onPublish={onPublish}
          onUnpublish={onUnpublish}
          onFeedback={onFeedback}
          onDelete={onBulkDelete}
          onClear={onClear}
          isPublishPending={isPublishPending}
          isFeedbackPending={isFeedbackPending}
          isDeletePending={isDeletePending}
        />

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
    </div>
  );
}
