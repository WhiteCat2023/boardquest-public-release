import type { Question } from '../../../types/question';
import { Tag, Eye, Trash2, Edit } from 'lucide-react';
import { getDifficultyColor, getInitials, getStatusColor } from '@/utils/style';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

interface AQCardProps {
  item?: Question;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function AdminQuestionCard({ item, onView, onDelete }: AQCardProps) {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const currentUserId = (auth as any)?.data?.user?.id;
  const currentUserRole = (auth as any)?.data?.user?.role;

  const authorName = typeof item?.author === 'object' 
    ? item?.author?.name 
    : item?.author;

  const authorId = typeof item?.author === 'object'
    ? (item?.author as any).id
    : (item as any)?.authorId;

  // Permissions:
  // - Admins, Superadmins, and Teamleads can edit any question.
  // - Teachers can only edit/delete their own questions.
  const isAuthor = authorId === currentUserId;
  const canEdit = currentUserRole === 'SUPERADMIN' || currentUserRole === 'ADMIN' || currentUserRole === 'TEAMLEAD' || (currentUserRole === 'TEACHER' && isAuthor);
  const canDelete = currentUserRole === 'SUPERADMIN' || currentUserRole === 'ADMIN' || (currentUserRole === 'TEACHER' && isAuthor);

  return (
    <Card className="w-full border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] font-sans bg-white overflow-hidden flex flex-col">
      <CardHeader className="pb-0">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-slate-100 px-2 py-1 text-[11px] font-bold tracking-wide text-slate-600">
              {item ? `Q-${item.id.slice(-4)}` : 'Q-XXXX'}
            </span>
            <span className="rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600">
              {item?.category?.name || 'Subject'}
            </span>
          </div>
          <div
            className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(
              item?.status
            )}`}
          >
            {item?.status}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4 flex-1 flex flex-col justify-between">
        {/* Main Question Content */}
        <div>
          <h3 className="text-base font-bold leading-snug text-slate-800">
            {item?.question}
          </h3>

          {/* Revision Feedback Banner */}
          {item?.status === 'NEEDS_REVISION' && item?.feedback && (
            <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs font-medium text-[#A70202] animate-in fade-in duration-200">
              <span className="font-bold uppercase text-[9px] tracking-wider block mb-0.5">Revision Comments:</span>
              {item.feedback}
            </div>
          )}
        </div>

        {/* Tags Row */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <Tag size={12} className="text-slate-400" />
            {item?.topic || 'Topic'}
          </div>
          <div
            className={`rounded-md border px-2.5 py-1 text-xs font-medium shadow-sm ${getDifficultyColor(
              item?.difficulty
            )}`}
          >
            {item?.difficulty}
          </div>
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm">
            {item?.type}
          </div>
        </div>
      </CardContent>

      <div className="px-5">
        <div className="h-px w-full bg-slate-100"></div>
      </div>

      <CardFooter className="pt-4 !bg-transparent !border-t-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700">
            {getInitials(authorName)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800">
              {authorName || 'Unknown Author'}
            </span>
            <span className="text-[11px] font-medium text-slate-400">Author</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView?.(item?.id || '')}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          
          {item && canEdit && (
            <button
              onClick={() => navigate(`/question-bank/edit/${item.id}`)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 cursor-pointer"
              title="Edit Question"
            >
              <Edit size={16} />
            </button>
          )}

          {item && canDelete && (
            <button
              onClick={() => onDelete?.(item.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 shadow-sm transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200 cursor-pointer"
              title="Delete Question"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
