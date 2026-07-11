import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  BookOpen, 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  PlusCircle, 
  XCircle,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type QuestionFormat = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

export default function AddQuestion() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { auth } = useAuth();

  // Form States
  const [categoryId, setCategoryId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [format, setFormat] = useState<QuestionFormat>("MCQ");
  const [questionWording, setQuestionWording] = useState("");
  
  // MCQ States
  const [mcqChoices, setMcqChoices] = useState<string[]>(["", "", "", ""]);
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState<number>(0);

  // True/False States
  const [tfCorrect, setTfCorrect] = useState<"True" | "False">("True");

  // Short Answer States
  const [saCorrectAnswer, setSaCorrectAnswer] = useState("");

  // Visual/Feedback States
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/category/get");
      return response.data?.data?.categories ?? [];
    },
  });

  // Set default category when loaded
  useEffect(() => {
    if (categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleMcqChoiceChange = (index: number, value: string) => {
    setMcqChoices((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleCancel = () => {
    navigate("/question-bank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    // Validations
    if (!categoryId) {
      setErrorMsg("Please select an academic subject category.");
      setIsSubmitting(false);
      return;
    }
    if (!topic.trim()) {
      setErrorMsg("Please enter a benchmark topic.");
      setIsSubmitting(false);
      return;
    }
    if (!questionWording.trim()) {
      setErrorMsg("Please write the question wording prompt.");
      setIsSubmitting(false);
      return;
    }

    let finalChoices: string[] = [];
    let finalCorrectAnswer = "";

    if (format === "MCQ") {
      // Validate choices
      if (mcqChoices.some((choice) => !choice.trim())) {
        setErrorMsg("All MCQ options must be written.");
        setIsSubmitting(false);
        return;
      }
      finalChoices = mcqChoices.map(c => c.trim());
      finalCorrectAnswer = mcqChoices[mcqCorrectIndex].trim();
    } else if (format === "TRUE_FALSE") {
      finalChoices = ["True", "False"];
      finalCorrectAnswer = tfCorrect;
    } else {
      // SHORT_ANSWER
      if (!saCorrectAnswer.trim()) {
        setErrorMsg("Please provide the correct answer wording.");
        setIsSubmitting(false);
        return;
      }
      finalChoices = [saCorrectAnswer.trim()]; // satisfying choices: z.array(z.string()).min(1)
      finalCorrectAnswer = saCorrectAnswer.trim();
    }

    const authorId = (auth as any)?.data?.user?.id;
    if (!authorId) {
      setErrorMsg("User authentication lost. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    const payload = {
      question: questionWording.trim(),
      choices: finalChoices,
      correctAnswer: finalCorrectAnswer,
      categoryId,
      authorId,
      topic: topic.trim(),
      difficulty,
      type: format,
      status: "DRAFT", // Default to draft as per flow
    };

    try {
      await axiosPrivate.post("/questions/create", payload);
      setSuccessMsg("Question draft created successfully!");
      setTimeout(() => {
        navigate("/question-bank");
      }, 1500);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || "Failed to save question.";
      setErrorMsg(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 w-full max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Back link */}
      <Link 
        to="/question-bank" 
        className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#A70202] transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft size={16} />
        Back to Question Bank
      </Link>

      {/* Main Drafting Desk Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden flex flex-col">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-red-50 text-[#A70202] border border-[#A70202]/10 shadow-xs">
              <PlusCircle size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Curriculum Drafting Desk</h2>
              <p className="text-xs text-slate-400 font-medium">Formulate evaluation questions linked to standard benchmarks</p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end text-xs text-slate-500 font-medium md:text-right border-l-2 md:border-l-0 md:border-r-2 border-[#A70202]/30 pl-3 md:pl-0 md:pr-3 py-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Authoring profile</span>
            <span className="text-slate-800 font-bold text-sm">{(auth as any)?.data?.user?.name || "Faculty Reviewer"}</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 flex flex-col gap-6">
          
          {/* Feedback Messages */}
          {errorMsg && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-red-50 text-[#A70202] border border-red-100 text-sm font-medium">
              <XCircle size={18} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm font-medium">
              <CheckCircle2 size={18} className="shrink-0 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Subject, Topic, Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Academic Subject
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm text-slate-700 transition-all duration-150"
              >
                {categories.length === 0 && <option value="">Loading Subjects...</option>}
                {categories.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Benchmark Topic */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Benchmark Topic
              </label>
              <Input
                type="text"
                placeholder="e.g. Clinical Chemistry, Immunology"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="h-11 bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
              />
            </div>

            {/* Difficulty Level */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Curriculum Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm text-slate-700 transition-all duration-150"
              >
                <option value="EASY">Easy Level</option>
                <option value="MEDIUM">Medium Level</option>
                <option value="HARD">Hard Level</option>
              </select>
            </div>

          </div>

          {/* Section 2: Question Format */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Question Format
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* MCQ CARD */}
              <button
                type="button"
                onClick={() => setFormat("MCQ")}
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 ${
                  format === "MCQ"
                    ? "bg-[#A70202]/5 border-[#A70202] text-[#A70202] shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="text-sm font-extrabold tracking-wide">MCQ</span>
                <span className="text-[10px] opacity-70 mt-0.5">Multiple Option Keys</span>
              </button>

              {/* TRUE/FALSE CARD */}
              <button
                type="button"
                onClick={() => setFormat("TRUE_FALSE")}
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 ${
                  format === "TRUE_FALSE"
                    ? "bg-[#A70202]/5 border-[#A70202] text-[#A70202] shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="text-sm font-extrabold tracking-wide">True/False</span>
                <span className="text-[10px] opacity-70 mt-0.5">Binary Key</span>
              </button>

              {/* SHORT ANSWER CARD */}
              <button
                type="button"
                onClick={() => setFormat("SHORT_ANSWER")}
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer text-center transition-all duration-200 ${
                  format === "SHORT_ANSWER"
                    ? "bg-[#A70202]/5 border-[#A70202] text-[#A70202] shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span className="text-sm font-extrabold tracking-wide">Short Answer</span>
                <span className="text-[10px] opacity-70 mt-0.5">Descriptive Wording</span>
              </button>

            </div>
          </div>

          {/* Section 3: Question Wording / Prompt */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Question Wording / Prompt
            </label>
            <textarea
              rows={4}
              placeholder="Formulate the complete problem statement or testing prompt. Support Markdown formatting if needed."
              value={questionWording}
              onChange={(e) => setQuestionWording(e.target.value)}
              className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] transition-all duration-150 resize-y"
            />
          </div>

          {/* Section 4: Option Specifications & Correct Key Designation */}
          <div className="border border-slate-200 rounded-2xl bg-slate-50/30 overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle size={15} className="text-[#A70202]" />
                <span className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                  Option Specifications & Correct Key Designation
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                Toggle the selection to set the correct answer
              </span>
            </div>

            <div className="p-6 flex flex-col gap-4">
              
              {/* MCQ LAYOUT */}
              {format === "MCQ" && (
                <div className="flex flex-col gap-3.5">
                  {mcqChoices.map((choice, index) => {
                    const label = String.fromCharCode(65 + index); // A, B, C, D
                    const isCorrect = mcqCorrectIndex === index;
                    return (
                      <div key={index} className="flex items-center gap-3 w-full">
                        {/* Custom radio button */}
                        <button
                          type="button"
                          onClick={() => setMcqCorrectIndex(index)}
                          className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all duration-150 ${
                            isCorrect 
                              ? "border-[#A70202] bg-white text-[#A70202]" 
                              : "border-slate-300 hover:border-slate-400 bg-white"
                          }`}
                        >
                          {isCorrect && (
                            <div className="w-3 h-3 rounded-full bg-[#A70202]" />
                          )}
                        </button>
                        
                        {/* Option Wording Input */}
                        <Input
                          type="text"
                          placeholder={`Wording for Option ${label}`}
                          value={choice}
                          onChange={(e) => handleMcqChoiceChange(index, e.target.value)}
                          className="h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm flex-1"
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TRUE/FALSE LAYOUT */}
              {format === "TRUE_FALSE" && (
                <div className="flex flex-col gap-3.5">
                  {(["True", "False"] as const).map((option) => {
                    const isSelected = tfCorrect === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setTfCorrect(option)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all duration-150 ${
                          isSelected
                            ? "bg-[#A70202]/5 border-[#A70202] text-[#A70202] font-semibold"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-[#A70202]" : "border-slate-300"
                        }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#A70202]" />}
                        </div>
                        <span className="text-sm">{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* SHORT ANSWER LAYOUT */}
              {format === "SHORT_ANSWER" && (
                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Correct Answer Wording
                  </label>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-slate-400 shrink-0" />
                    <Input
                      type="text"
                      placeholder="Type the exact expected answer text..."
                      value={saCorrectAnswer}
                      onChange={(e) => setSaCorrectAnswer(e.target.value)}
                      className="h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm flex-1"
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Bottom Actions Bar */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="cursor-pointer border-slate-200 hover:bg-slate-100 font-semibold px-6 py-2.5 rounded-xl h-auto"
          >
            Cancel Draft
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#A70202] text-white hover:bg-[#8e0202] cursor-pointer font-semibold px-6 py-2.5 rounded-xl h-auto flex items-center gap-2 shadow-xs"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
            ) : (
              <Sparkles size={16} />
            )}
            Save & Submit Draft
          </Button>
        </div>

      </form>
    </div>
  );
}