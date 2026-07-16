import type { Question } from '@/types/question';
import { Eye, Trash2, Edit, Tag } from 'lucide-react';
import { getDifficultyColor, getInitials, getStatusColor } from '@/utils/style';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

interface QuestionTableProps {
  questions: Question[];
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function QuestionTable({ questions, onView, onDelete }: QuestionTableProps) {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const currentUserId = (auth as any)?.data?.user?.id;
  const currentUserRole = (auth as any)?.data?.user?.role;

  return (
    <div className="w-full bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden font-sans">
      <Table>
        <TableHeader className="bg-slate-50/50" data-shimmer-ignore>
          <TableRow className="border-b border-slate-100 hover:bg-transparent">
            <TableHead className="w-[100px] text-xs font-bold text-slate-400 uppercase tracking-wider pl-6 py-4">ID</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Question</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Topic</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Type</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Difficulty</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Author</TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">Status</TableHead>
            <TableHead className="w-[120px] text-right text-xs font-bold text-slate-400 uppercase tracking-wider pr-6 py-4">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((item) => {
            const authorName = typeof item?.author === 'object' 
              ? item?.author?.name 
              : item?.author;

            const authorId = typeof item?.author === 'object'
              ? (item?.author as any).id
              : (item as any)?.authorId;

            const isAuthor = authorId === currentUserId;
            const canEdit = currentUserRole === 'SUPERADMIN' || currentUserRole === 'ADMIN' || currentUserRole === 'TEAMLEAD' || (currentUserRole === 'TEACHER' && isAuthor);
            const canDelete = currentUserRole === 'SUPERADMIN' || currentUserRole === 'ADMIN' || (currentUserRole === 'TEACHER' && isAuthor);

            // Handle text or question property variation
            const questionContent = (item as any)?.question || item?.text || '';

            return (
              <TableRow key={item.id} className="border-b border-slate-100 hover:bg-slate-50/40 transition-colors">
                {/* ID Column */}
                <TableCell className="pl-6 py-4">
                  <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold tracking-wide text-slate-600">
                    Q-{item.id.slice(-4)}
                  </span>
                </TableCell>

                {/* Question & Category Column */}
                <TableCell className="py-4 max-w-[280px]">
                  <div className="flex flex-col gap-1.5">
                    <span 
                      className="text-sm font-semibold text-slate-800 line-clamp-2 leading-relaxed" 
                      title={questionContent}
                    >
                      {questionContent}
                    </span>
                    <div className="flex">
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-600 tracking-wide">
                        {item?.category?.name || 'Subject'}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Topic Column */}
                <TableCell className="py-4">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    <Tag size={10} className="text-slate-400" />
                    {item?.topic || 'Topic'}
                  </span>
                </TableCell>

                {/* Type Column */}
                <TableCell className="py-4">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {item?.type}
                  </span>
                </TableCell>

                {/* Difficulty Column */}
                <TableCell className="py-4">
                  <span className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getDifficultyColor(item?.difficulty)}`}>
                    {item?.difficulty}
                  </span>
                </TableCell>

                {/* Author Column */}
                <TableCell className="py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-[10px] font-bold text-indigo-700 shrink-0">
                      {getInitials(authorName)}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]" title={authorName}>
                      {authorName || 'Unknown'}
                    </span>
                  </div>
                </TableCell>

                {/* Status Column */}
                <TableCell className="py-4">
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(item?.status)}`}>
                    {item?.status}
                  </span>
                </TableCell>

                {/* Actions Column */}
                <TableCell className="pr-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onView?.(item.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>
                    
                    {canEdit && (
                      <button
                        onClick={() => navigate(`/question-bank/edit/${item.id}`)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none cursor-pointer"
                        title="Edit Question"
                      >
                        <Edit size={14} />
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => onDelete?.(item.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 size={14} />
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
  );
}
