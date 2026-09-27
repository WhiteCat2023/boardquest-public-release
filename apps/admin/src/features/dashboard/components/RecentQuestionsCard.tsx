import { Link, useNavigate } from "react-router-dom";
import { FileQuestion, HelpCircle, ArrowRight, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import appContent from "@/constants/appContent";
import { getDifficultyColor, getStatusColor } from "@/utils/style";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useDashboardQuestions } from "../api/useDashboardQuestions";

interface RecentQuestionsCardProps {
  isTeacher?: boolean;
  isTeamLead?: boolean;
  questions?: any[];
  currentUserName?: string;
}

export function RecentQuestionsCard({
  isTeacher: propIsTeacher,
  isTeamLead: propIsTeamLead,
  questions: propQuestions,
  currentUserName: propUserName,
}: RecentQuestionsCardProps = {}) {
  const navigate = useNavigate();
  const { isTeacher: roleIsTeacher, isTeamLead: roleIsTeamLead, currentUser } = useRoleFlags();

  const isTeacher = propIsTeacher ?? roleIsTeacher;
  const isTeamLead = propIsTeamLead ?? roleIsTeamLead;
  const currentUserName =
    propUserName ??
    currentUser?.name ??
    (appContent.dashboard.recentQuestions as any).defaultAuthor ??
    "Faculty Member";

  // Colocated data query: fetch when propQuestions is not provided
  const shouldFetch = propQuestions === undefined;
  const { data: fetchedData, isLoading } = useDashboardQuestions(
    20,
    isTeacher ? currentUser?.id : undefined
  );

  const rawQuestions =
    propQuestions ??
    (Array.isArray(fetchedData?.questions)
      ? fetchedData.questions
      : Array.isArray(fetchedData?.items)
        ? fetchedData.items
        : Array.isArray(fetchedData)
          ? fetchedData
          : []);

  const content = appContent.dashboard.recentQuestions;
  const displayQuestions = rawQuestions.slice(0, 5);
  const targetLink = isTeacher ? "/question-bank/my-questions" : "/question-bank";

  return (
    <Card className="lg:col-span-2 bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileQuestion className="text-primary size-4" />
          {isTeacher ? content.titles.teacher : content.titles.admin}
        </h2>
        <Link
          to={targetLink}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          {isTeacher ? "My Questions" : isTeamLead ? content.actions.teamlead : content.actions.admin} <ArrowRight size={12} />
        </Link>
      </div>

      {isLoading && shouldFetch ? (
        <div className="flex flex-col gap-2.5 py-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-2">
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-2.5 w-1/3 rounded" />
              </div>
              <Skeleton className="h-5 w-14 rounded-md" />
            </div>
          ))}
        </div>
      ) : rawQuestions.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <HelpCircle size={30} className="mx-auto text-muted-foreground/40 mb-1.5" />
          <p className="text-xs font-semibold">
            {isTeacher ? content.emptyStates.teacher : content.emptyStates.admin}
          </p>
          {isTeacher && (
            <Link to="/question-bank/create">
              <Button className="mt-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-lg px-3 py-1 h-7 cursor-pointer">
                {content.emptyStates.createQuestionButton}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayQuestions.map((q: any) => {
            const commentsCount =
              q._count?.comments ??
              q._count?.questionComments ??
              (Array.isArray(q.comments) ? q.comments.length : 0);

            return (
              <div
                key={q.id}
                onClick={() => navigate(`/question-bank/view/${q.id}`)}
                className="py-2 flex items-start justify-between gap-3 hover:bg-accent/40 px-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                    {q.question || q.text || "Sample Question Item"}
                  </p>
                  <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground font-medium flex-wrap">
                    <span className="font-semibold text-foreground/80 truncate max-w-[140px]">
                      {q.category?.name || content.fallbackSubject}
                    </span>
                    &bull;
                    <span className="truncate max-w-[140px]">
                      {content.authorPrefix} {q.author?.name || currentUserName}
                    </span>
                    {commentsCount > 0 && (
                      <>
                        &bull;
                        <span className="flex items-center gap-1 text-primary font-bold">
                          <MessageSquare size={10} />
                          {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {q.status && (
                    <Badge
                      variant="outline"
                      className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full ${getStatusColor(q.status)}`}
                    >
                      {q.status}
                    </Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-md ${getDifficultyColor(q.difficulty)}`}
                  >
                    {q.difficulty || "MEDIUM"}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
