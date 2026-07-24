import { Link } from "react-router-dom";
import { FileQuestion, HelpCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import appContent from "@/constants/appContent";

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
  currentUserName = appContent.dashboard.recentQuestions.defaultAuthor || "Faculty Member",
}: RecentQuestionsCardProps) {
  const content = appContent.dashboard.recentQuestions;
  const displayQuestions = questions.slice(0, 5);

  return (
    <Card className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileQuestion className="text-[#A70202]" size={18} />
          {isTeacher ? content.titles.teacher : content.titles.admin}
        </h2>
        <Link
          to={isTeamLead ? "/review-center" : "/question-bank"}
          className="text-xs font-bold text-[#A70202] hover:underline flex items-center gap-1"
        >
          {isTeamLead ? content.actions.teamlead : content.actions.admin} <ArrowRight size={13} />
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="py-12 text-center text-slate-400">
          <HelpCircle size={36} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-semibold">
            {isTeacher ? content.emptyStates.teacher : content.emptyStates.admin}
          </p>
          {isTeacher && (
            <Link to="/question-bank">
              <Button className="mt-3 bg-[#A70202] text-white hover:bg-[#8e0202] text-xs font-bold rounded-xl px-4 py-1.5 cursor-pointer">
                {content.emptyStates.createQuestionButton}
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {displayQuestions.map((q: any) => (
            <div
              key={q.id}
              className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-800 line-clamp-1">
                  {q.question || q.text || "Sample Question Item"}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                  <span className="font-semibold text-slate-600">
                    {q.category?.name || content.fallbackSubject}
                  </span>
                  &bull;
                  <span>
                    {content.authorPrefix} {q.author?.name || currentUserName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    q.isPublished || q.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {q.isPublished || q.status === "APPROVED"
                    ? content.badges.published
                    : content.badges.underReview}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
