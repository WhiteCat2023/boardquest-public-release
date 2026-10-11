import { CheckCircle2, PlusCircleIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import MarronButton from "./MarronButton";
import useRoleFlags from "@/hooks/useRoleFlags";
import { useMyEncodingProgress } from "@/features/question-bank";
import { toast } from "sonner";

export default function AddQuestionButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isTeacher } = useRoleFlags();
  const { data: progress } = useMyEncodingProgress();

  const isQuotaMet =
    isTeacher &&
    Boolean(
      progress?.overall &&
        progress.overall.totalTarget > 0 &&
        progress.overall.remainingCount === 0,
    );

  const handleAddQuestion = () => {
    if (isQuotaMet) {
      toast.info(
        "Authoring Quota Met: You have completed all question authoring goals for this school year.",
        {
          description: `You authored ${progress?.overall.totalEncoded} of ${progress?.overall.totalTarget} assigned questions.`,
        },
      );
      return;
    }
    navigate("/question-bank/create", { state: { from: location } });
  };

  if (isQuotaMet) {
    return (
      <MarronButton
        icon={<CheckCircle2 size={15} />}
        label="Quota Completed"
        onClick={handleAddQuestion}
        className="bg-emerald-600 hover:bg-emerald-700 hover:text-white border-emerald-600 shadow-2xs"
      />
    );
  }

  return (
    <MarronButton
      icon={<PlusCircleIcon />}
      label="Add Question"
      onClick={handleAddQuestion}
    />
  );
}