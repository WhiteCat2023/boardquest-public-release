import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { 
  BookOpen, 
  CheckCircle, 
  Edit3, 
  MessageSquare, 
  Eye, 
  HelpCircle, 
  Filter, 
  Clock, 
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDifficultyColor } from "@/utils/style";

interface Question {
  id: string;
  question: string;
  choices: string[];
  correctAnswer: string;
  status: "DRAFT" | "PENDING_REVIEW" | "NEEDS_REVISION" | "APPROVED";
  difficulty: "EASY" | "MEDIUM" | "HARD";
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  topic: string;
  feedback?: string;
  category: {
    id: string;
    name: string;
  };
  author: {
    name: string;
  } | string;
  createdAt: string;
}

export default function ReviewCenter() {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  
  // Current user info
  const userRole = (auth as any)?.data?.user?.role;
  const isApprover = userRole === "ADMIN" || userRole === "SUPERADMIN";

  // Selected question for reviewing
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Query: Get all questions with PENDING_REVIEW status
  const { data: questions = [], isLoading, refetch } = useQuery<Question[]>({
    queryKey: ["pendingQuestions"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/get", {
        params: { status: "PENDING_REVIEW" }
      });
      // Handle response structure which might contain paging info
      return response.data?.data?.questions ?? response.data?.data ?? [];
    }
  });

  // Review Mutations
  const reviewMutation = useMutation({
    mutationFn: async ({ id, status, feedbackText }: { id: string; status: string; feedbackText: string }) => {
      return await axiosPrivate.put(`/questions/${id}`, {
        status,
        feedback: feedbackText,
        // Since we are changing status, we need to pass back the required schema fields
        // In backend, schema validation is enforced, so we should fetch the full question details and pass them
        question: selectedQuestion?.question,
        choices: selectedQuestion?.choices,
        correctAnswer: selectedQuestion?.correctAnswer,
        categoryId: selectedQuestion?.category.id,
        authorId: typeof selectedQuestion?.author === "object" ? (selectedQuestion?.author as any).id || (selectedQuestion as any).authorId : selectedQuestion?.author,
        topic: selectedQuestion?.topic,
        difficulty: selectedQuestion?.difficulty,
        type: selectedQuestion?.type,
        id: selectedQuestion?.id,
      });
    },
    onSuccess: (_, variables) => {
      const action = variables.status === "APPROVED" ? "approved" : "sent for revision";
      setSuccessMsg(`Question successfully ${action}!`);
      queryClient.invalidateQueries({ queryKey: ["pendingQuestions"] });
      
      setTimeout(() => {
        setSelectedQuestion(null);
        setFeedback("");
        setSuccessMsg("");
      }, 1500);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || "Failed to update question status.");
    }
  });

  const handleReviewAction = (status: "APPROVED" | "NEEDS_REVISION") => {
    if (!selectedQuestion) return;
    setErrorMsg("");
    setSuccessMsg("");

    if (status === "NEEDS_REVISION" && !feedback.trim()) {
      setErrorMsg("Please provide feedback comments for revision.");
      return;
    }

    reviewMutation.mutate({
      id: selectedQuestion.id,
      status,
      feedbackText: status === "NEEDS_REVISION" ? feedback.trim() : "",
    });
  };

  const getAuthorName = (author: any) => {
    if (typeof author === "object" && author !== null) {
      return author.name;
    }
    return author || "Faculty Member";
  };

  return (
    <div className="flex flex-col gap-6 p-8 w-full min-h-full font-sans bg-slate-50/50">
      {/* Page Header */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 border-b border-slate-100 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BookOpen className="text-[#A70202]" />
            Peer Review Center
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Review questions submitted by faculty members, request revisions, or approve for active exams.
          </p>
        </div>
      </div>

      {/* Main Review Dashboard Area */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Left Side: Question queue */}
        <div className="w-full lg:w-3/5 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-slate-700 px-1 font-semibold">
            <Clock size={16} className="text-[#A70202]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Needs Review ({questions.length})</span>
          </div>

          {isLoading ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 w-full">
              <div className="animate-spin inline-block border-3 border-[#A70202] border-t-transparent rounded-full w-8 h-8 mb-4"></div>
              <p className="text-sm font-medium">Fetching evaluation queue...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3 w-full shadow-xs">
              <CheckCircle size={48} className="text-emerald-400 stroke-[1.5]" />
              <p className="font-bold text-slate-700">Queue is Clear!</p>
              <p className="text-sm max-w-sm">All evaluation questions have been reviewed and processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 w-full">
              {questions.map((q) => (
                <div 
                  key={q.id}
                  onClick={() => {
                    setSelectedQuestion(q);
                    setFeedback("");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`bg-white border p-5 rounded-2xl shadow-xs transition-all duration-200 cursor-pointer flex flex-col gap-3 hover:border-[#A70202]/30 hover:shadow-sm ${
                    selectedQuestion?.id === q.id 
                      ? "border-[#A70202] ring-2 ring-[#A70202]/5 bg-red-50/5" 
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        {`Q-${q.id.slice(-4)}`}
                      </span>
                      <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600">
                        {q.category?.name || "Subject"}
                      </span>
                    </div>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-700 leading-snug line-clamp-2">
                    {q.question}
                  </p>

                  <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 border-t border-slate-50 pt-2.5">
                    <span>Topic: <b className="text-slate-500">{q.topic}</b></span>
                    <span>By: <b className="text-slate-500">{getAuthorName(q.author)}</b></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Active Review Panel */}
        <div className="w-full lg:w-2/5 shrink-0 sticky top-28 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5 min-h-[400px]">
          {selectedQuestion ? (
            <div className="flex flex-col gap-5 animate-in fade-in duration-200">
              {/* Review Panel Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Evaluation Desk</span>
                  <span className="text-sm font-extrabold text-slate-800">Reviewing Q-{selectedQuestion.id.slice(-4)}</span>
                </div>
                <button 
                  onClick={() => setSelectedQuestion(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Status messages */}
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-[#A70202] border border-red-100 rounded-xl text-xs font-semibold">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs font-semibold">
                  <CheckCircle size={14} className="shrink-0 animate-bounce" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Question wording */}
              <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <HelpCircle size={12} className="text-[#A70202]" />
                  Question Wording Prompt
                </h4>
                <p className="text-sm font-bold text-slate-800 leading-relaxed">
                  {selectedQuestion.question}
                </p>
              </div>

              {/* Choices / Answers */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option Specifications</span>
                <div className="space-y-1.5">
                  {selectedQuestion.choices.map((choice, index) => {
                    const label = String.fromCharCode(65 + index);
                    const isCorrect = choice.toLowerCase().trim() === selectedQuestion.correctAnswer.toLowerCase().trim();
                    return (
                      <div 
                        key={index} 
                        className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                          isCorrect 
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
                            : "bg-white border-slate-100 text-slate-600"
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-black ${
                          isCorrect ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}>{label}</span>
                        <span className="flex-1">{choice}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Author & Info */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 border-t border-slate-100 pt-4">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Authoring Faculty</span>
                  <span className="text-slate-700 font-semibold">{getAuthorName(selectedQuestion.author)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Academic Topic</span>
                  <span className="text-slate-700 font-semibold truncate">{selectedQuestion.topic}</span>
                </div>
              </div>

              {/* Feedback form */}
              <div className="flex flex-col gap-2 border-t border-slate-100 pt-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <MessageSquare size={12} className="text-[#A70202]" />
                  Reviewer Revision Comments
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Explain details requiring revision (required if sending back to faculty)..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <Button
                  onClick={() => handleReviewAction("NEEDS_REVISION")}
                  disabled={reviewMutation.isPending}
                  className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 border-transparent cursor-pointer font-bold px-4 py-3 rounded-xl h-auto flex items-center justify-center gap-1 text-xs"
                >
                  <Edit3 size={14} />
                  Send Revision
                </Button>
                
                <Button
                  onClick={() => handleReviewAction("APPROVED")}
                  disabled={reviewMutation.isPending || !isApprover}
                  title={!isApprover ? "Co-Admins/Team Leads cannot approve questions" : "Approve this question"}
                  className={`w-full text-white cursor-pointer font-bold px-4 py-3 rounded-xl h-auto flex items-center justify-center gap-1 text-xs ${
                    isApprover 
                      ? "bg-[#A70202] hover:bg-[#8f0101]" 
                      : "bg-slate-300 hover:bg-slate-300 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <CheckCircle size={14} />
                  Approve Question
                </Button>
              </div>

              {!isApprover && (
                <p className="text-[9px] text-orange-500 font-bold text-center -mt-1 leading-snug">
                  * Note: Co-Admin accounts can request revisions but final approval requires Admin privileges.
                </p>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-slate-400 text-center py-20">
              <Eye size={40} className="text-slate-300 stroke-[1.5]" />
              <p className="font-bold text-slate-600">Select Question to Begin Review</p>
              <p className="text-xs max-w-[250px] leading-relaxed">
                Click any pending question from the list on the left to examine its prompt and options.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}