import { QuestionStatus, UserRole, type Question } from '../../../types/question';
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

  const currentUserId = auth?.data?.user?.id;
  const currentUserRole = auth?.data?.user?.role;

  const authorName = typeof item?.author === 'object' 
    ? item?.author?.name 
    : item?.author;

  const authorId = typeof item?.author === 'object'
    ? (item?.author as any).id
    : (item as any)?.authorId;

  const isAuthor = authorId === currentUserId;
  const canEdit = currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.DEAN || currentUserRole === UserRole.TEAMLEAD || (currentUserRole === UserRole.TEACHER && isAuthor);
  const canDelete = currentUserRole === UserRole.SUPERADMIN || currentUserRole === UserRole.DEAN || (currentUserRole === UserRole.TEACHER && isAuthor);

  return (
    <Card className="w-full border-border shadow-xs font-sans bg-card text-foreground overflow-hidden flex flex-col">
      <CardHeader className="pb-0">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-2 py-1 text-[11px] font-bold tracking-wide text-muted-foreground border border-border">
              {item ? `Q-${item.id.slice(-4)}` : 'Q-XXXX'}
            </span>
            <span className="rounded bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {item?.category?.name || 'Subject'}
            </span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest ${getStatusColor(
                item?.status
              )}`}
            >
              {item?.status}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4 flex-1 flex flex-col justify-between">
        {/* Main Question Content */}
        <div>
          <h3 className="text-base font-bold leading-snug text-foreground">
            {item?.text || (item as any)?.question}
          </h3>


        </div>

        {/* Tags Row */}
        <div className="mt-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
            <Tag size={12} className="text-muted-foreground" />
            {item?.topic || 'Topic'}
          </div>
          <div
            className={`rounded-md border px-2.5 py-1 text-xs font-medium shadow-2xs ${getDifficultyColor(
              item?.difficulty
            )}`}
          >
            {item?.difficulty}
          </div>
          <div className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground shadow-2xs">
            {item?.type}
          </div>
        </div>
      </CardContent>

      <div className="px-5">
        <div className="h-px w-full bg-border"></div>
      </div>

      <CardFooter className="pt-4 !bg-transparent !border-t-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary border border-primary/20">
            {getInitials(authorName)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground">
              {authorName || 'Unknown Author'}
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">Author</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView?.(item?.id || '')}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          
          {item && canEdit && (
            <button
              onClick={() => navigate(`/question-bank/edit/${item.id}`)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-2xs transition-colors hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer"
              title="Edit Question"
            >
              <Edit size={16} />
            </button>
          )}

          {item && canDelete && (
            <button
              onClick={() => onDelete?.(item.id)}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-destructive/30 bg-card text-destructive shadow-2xs transition-colors hover:bg-destructive/10 focus:outline-none cursor-pointer"
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
