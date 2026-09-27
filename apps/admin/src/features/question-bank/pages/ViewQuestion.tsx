import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Spinner } from "@/components/ui/spinner";
import {
  useQuestionDetail,
  useQuestionComments,
  useQuestionPermissions,
  QuestionNotFoundState,
  QuestionBackButton,
  QuestionCardHeader,
  QuestionMetaStrip,
  QuestionContentBody,
  QuestionDetailActionsBar,
  QuestionCommentsPanel,
} from "@/features/question-bank";
import QuestionLifecycleStepper from "../components/QuestionLifecycleStepper";

export default function ViewQuestion() {
  const { questionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from || null;

  const handleBackNav = () => {
    if (from) {
      navigate(from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/question-bank");
    }
  };

  const { data: question, isLoading, error } = useQuestionDetail(questionId);
  const [showComments, setShowComments] = useState(false);
  const { data: comments = [] } = useQuestionComments(questionId);
  const commentsCount =
    comments.length || (question as any)?._count?.comments || 0;
  const unresolvedCommentsCount = comments.filter((c) => !c.isResolved).length;

  const { canEdit, canDelete, canApprove } = useQuestionPermissions(question);

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="lg" variant="default" />
      </div>
    );
  }

  if (error || !question) {
    return <QuestionNotFoundState />;
  }

  return (
    <div
      className={`flex flex-col lg:flex-row items-start gap-5 p-4 md:p-6 w-full ${
        showComments ? "max-w-6xl" : "max-w-3xl"
      } mx-auto font-sans bg-background text-foreground animate-in fade-in duration-300 transition-all`}
    >
      {/* ── Main Column: Question Details ── */}
      <div className="flex-1 w-full min-w-0 flex flex-col gap-5">
        {/* Back navigation */}
        <QuestionBackButton from={from} onBack={handleBackNav} />

        {/* Visual Question Lifecycle Stepper */}
        <QuestionLifecycleStepper status={question.status} />

        {/* Main Question Card Container */}
        <div className="bg-card border border-border/80 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all duration-300">
          {/* Header Section */}
          <QuestionCardHeader
            question={question}
            showComments={showComments}
            onToggleComments={() => setShowComments(!showComments)}
            commentsCount={commentsCount}
          />

          {/* Question Meta Strip */}
          <QuestionMetaStrip
            format={question.type}
            difficulty={question.difficulty}
            topic={question.topic}
          />

          {/* Body Section */}
          <QuestionContentBody question={question} />

          {/* Action Footer Bar */}
          <QuestionDetailActionsBar
            question={question}
            showComments={showComments}
            onToggleComments={() => setShowComments(!showComments)}
            commentsCount={commentsCount}
            unresolvedCommentsCount={unresolvedCommentsCount}
            canEdit={canEdit}
            canDelete={canDelete}
            canApprove={canApprove}
            onOpenComments={() => setShowComments(true)}
          />
        </div>
      </div>

      {/* ── Custom Right Sidebar: Question Discussion & Comments ── */}
      {showComments && questionId && (
        <aside className="w-full lg:w-[320px] shrink-0 self-start sticky top-6 transition-all duration-300 animate-in slide-in-from-right-4">
          <QuestionCommentsPanel
            questionId={questionId}
            questionStatus={question?.status}
            onClose={() => setShowComments(false)}
          />
        </aside>
      )}
    </div>
  );
}
