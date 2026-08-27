import { Link } from "react-router-dom";
import { FileQuestion, HelpCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import appContent from "@/constants/appContent";
import { getDifficultyColor } from "@/utils/style";

interface RecentQuestionsCardProps {
  isTeacher: boolean;
  isTeamLead: boolean;
  questions: any[];
  currentUserName?: string;
}

export function RecentQuestionsCard({
  isTeacher,
  isTeamLead,
  questions,
  currentUserName = (appContent.dashboard.recentQuestions as any).defaultAuthor || "Faculty Member",
}: RecentQuestionsCardProps) {
  const content = appContent.dashboard.recentQuestions;
  const displayQuestions = questions.slice(0, 5);

  return (
    <Card className="lg:col-span-2 bg-card border border-border rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col gap-3 font-sans">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
          <FileQuestion className="text-primary size-4" />
          {isTeacher ? content.titles.teacher : content.titles.admin}
        </h2>
        <Link
          to="/question-bank"
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
        >
          {isTeamLead ? content.actions.teamlead : content.actions.admin} <ArrowRight size={12} />
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <HelpCircle size={30} className="mx-auto text-muted-foreground/40 mb-1.5" />
          <p className="text-xs font-semibold">
            {isTeacher ? content.emptyStates.teacher : content.emptyStates.admin}
          </p>
          {isTeacher && (
            <Link to="/question-bank">
              <Button className="mt-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-lg px-3 py-1 h-7 cursor-pointer">
                {content.emptyStates.createQuestionButton}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-border">
          {displayQuestions.map((q: any) => (
            <div
              key={q.id}
              className="py-1.5 flex items-start justify-between gap-3 hover:bg-accent/40 px-1.5 rounded-lg transition-colors"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">
                  {q.question || q.text || "Sample Question Item"}
                </p>
                <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground font-medium">
                  <span className="font-semibold text-foreground/80 truncate max-w-[120px]">
                    {q.category?.name || content.fallbackSubject}
                  </span>
                  &bull;
                  <span className="truncate max-w-[120px]">
                    {content.authorPrefix} {q.author?.name || currentUserName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-md ${getDifficultyColor(q.difficulty)}`}
                >
                  {q.difficulty || "MEDIUM"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
