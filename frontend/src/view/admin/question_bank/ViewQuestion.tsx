import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Tag, 
  User, 
  Check,
  GraduationCap,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { showUndoToast } from "@/utils/toast";
import { getDifficultyColor, getInitials, getStatusColor } from "@/utils/style";

export default function ViewQuestion() {
  const { questionId } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();

  const currentUserId = (auth as any)?.data?.user?.id;
  const currentUserRole = (auth as any)?.data?.user?.role;

  // Fetch question details
  const { data: question, isLoading, error } = useQuery({
    queryKey: ["questionDetail", questionId],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/questions/get/${questionId}`);
      return response.data?.data?.question || response.data?.data;
    },
  });

  const handleDelete = () => {
    // Optimistically update lists cache to hide the question immediately
    queryClient.setQueriesData<any>({ queryKey: ["questions"] }, (old: any) => {
      if (!old) return old;
      if (old.questions) {
        return {
          ...old,
          questions: old.questions.filter((q: any) => q.id !== questionId),
        };
      }
      return old;
    });

    // Navigate back to the question bank
    navigate("/question-bank");

    // Set a 4-second timeout to execute the actual API deletion
    const timeoutId = setTimeout(async () => {
      try {
        await axiosPrivate.delete(`/questions/${questionId}`);
        queryClient.invalidateQueries({ queryKey: ["questions"] });
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete question permanently.");
        queryClient.invalidateQueries({ queryKey: ["questions"] });
      }
    }, 4000);

    const questionText = question?.question || "Selected question";

    // Trigger Sonner toast with the reusable showUndoToast helper
    showUndoToast({
      title: "Question Deleted",
      message: questionText,
      onUndo: () => {
        clearTimeout(timeoutId);
        queryClient.invalidateQueries({ queryKey: ["questions"] });
        toast.success("Delete action undone.");
      },
      duration: 4000,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="animate-spin border-4 border-[#A70202] border-t-transparent rounded-full w-12 h-12" />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertCircle size={40} className="text-[#A70202]" />
        <div>
          <h3 className="text-lg font-bold text-slate-800">Question Not Found</h3>
          <p className="text-sm text-slate-500 mt-1">
            This question could not be retrieved from the database.
          </p>
        </div>
        <Link to="/question-bank">
          <Button className="bg-[#A70202] text-white hover:bg-[#8f0101] rounded-xl px-5">
            Back to Question Bank
          </Button>
        </Link>
      </div>
    );
  }

  const authorName = typeof question?.author === "object" 
    ? question?.author?.name 
    : question?.author;

  const authorId = typeof question?.author === "object"
    ? (question?.author as any).id
    : question?.authorId;

  const isAuthor = authorId === currentUserId;
  const canEdit = currentUserRole === "SUPERADMIN" || currentUserRole === "ADMIN" || currentUserRole === "TEAMLEAD" || (currentUserRole === "TEACHER" && isAuthor);
  const canDelete = currentUserRole === "SUPERADMIN" || currentUserRole === "ADMIN" || (currentUserRole === "TEACHER" && isAuthor);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Back navigation */}
      <Link 
        to="/question-bank" 
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#A70202] transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        Back to Question Bank
      </Link>

      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="rounded bg-slate-100 px-3 py-1.5 text-xs font-extrabold tracking-wide text-slate-600">
              Q-{question.id.slice(-6).toUpperCase()}
            </span>
            <span className="rounded bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 tracking-wide">
              {question.category?.name || "Subject Category"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${getStatusColor(question.status)}`}>
              {question.status}
            </span>
          </div>
        </div>

        {/* Question Details Section */}
        <div className="p-6 md:p-8 flex flex-col gap-8">
          
          {/* Question text */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question Prompt</span>
            <h2 className="text-xl font-bold text-slate-800 leading-relaxed">
              {question.question}
            </h2>
          </div>

          {/* Revision Comments (if status is NEEDS_REVISION) */}
          {question.status === "NEEDS_REVISION" && question.feedback && (
            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 text-sm font-medium text-rose-700">
              <span className="font-extrabold uppercase text-[10px] tracking-wider block mb-1">Revision Comments / Notes:</span>
              {question.feedback}
            </div>
          )}

          {/* Options Section */}
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {question.type === "MCQ" ? "Options & Key" : question.type === "TRUE_FALSE" ? "True / False Key" : "Correct Answer Wording"}
            </span>

            <div className="flex flex-col gap-3">
              {question.type === "MCQ" && (
                question.choices.map((choice: string, idx: number) => {
                  const isCorrect = choice.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isCorrect 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold shadow-xs" 
                          : "bg-slate-50/50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCorrect 
                          ? "bg-emerald-500 text-white" 
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {isCorrect ? <Check size={14} className="stroke-[3]" /> : String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-sm leading-relaxed">{choice}</span>
                    </div>
                  );
                })
              )}

              {question.type === "TRUE_FALSE" && (
                ["True", "False"].map((choice, idx) => {
                  const isCorrect = choice.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                        isCorrect 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold shadow-xs" 
                          : "bg-slate-50/50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isCorrect 
                          ? "bg-emerald-500 text-white" 
                          : "bg-slate-200 text-slate-500"
                      }`}>
                        {isCorrect ? <Check size={14} className="stroke-[3]" /> : (idx === 0 ? "T" : "F")}
                      </div>
                      <span className="text-sm leading-relaxed">{choice}</span>
                    </div>
                  );
                })
              )}

              {question.type === "SHORT_ANSWER" && (
                <div className="flex items-center gap-3 p-4 rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold shadow-xs">
                  <Check size={16} className="text-emerald-600 stroke-[3]" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wide">Correct Wording:</span>
                    <span className="text-sm leading-relaxed">{question.correctAnswer}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            {/* Topic */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-500 rounded-xl">
                <Tag size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Topic Benchmark</span>
                <span className="text-sm font-semibold text-slate-700">{question.topic || "N/A"}</span>
              </div>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-500 rounded-xl">
                <GraduationCap size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Difficulty Level</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${getDifficultyColor(question.difficulty)}`}>
                  {question.difficulty}
                </span>
              </div>
            </div>

            {/* Type */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 text-slate-500 rounded-xl">
                <Calendar size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Question Type</span>
                <span className="text-sm font-semibold text-slate-700">{question.type}</span>
              </div>
            </div>
          </div>

          {/* Author profile & creation timestamp */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-sm font-extrabold text-indigo-700">
                {getInitials(authorName)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-slate-800">{authorName || "Faculty Reviewer"}</span>
                <span className="text-[10px] font-semibold text-slate-400">Author Profile</span>
              </div>
            </div>
            <div className="text-right text-[11px] font-medium text-slate-400">
              <span>Created on: </span>
              <span className="font-semibold text-slate-600">{new Date(question.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

        </div>

        {/* Action Footer Bar */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3.5">
          {canDelete && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className="cursor-pointer border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold px-5 py-2.5 rounded-xl h-auto flex items-center gap-2"
            >
              <Trash2 size={16} />
              Delete Question
            </Button>
          )}

          {canEdit && (
            <Button
              type="button"
              onClick={() => navigate(`/question-bank/edit/${questionId}`)}
              className="bg-[#A70202] text-white hover:bg-[#8e0202] cursor-pointer font-semibold px-6 py-2.5 rounded-xl h-auto flex items-center gap-2 shadow-xs"
            >
              <Edit size={16} />
              Edit Question
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
