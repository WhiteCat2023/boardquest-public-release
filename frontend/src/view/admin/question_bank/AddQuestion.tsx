import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  HelpCircle, 
  Sparkles, 
  PlusCircle, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import CustomSelectWithLabel from "../../../components/custom/select/Select";
import CardButton from "./components/buttons/CardButton";
import TrueOrFalseInput from "./components/TOFInput";
import ShortAnswerInput from "./components/ShortAnswerInput";
import MultipleChoiceInput from "./components/MCQInput";
import QuestionInput from "./components/QuestionInput";
import { useQuestionFormStore } from "../../../store/QuestionBankStore";

type QuestionFormat = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

export default function AddQuestion() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { questionId } = useParams();
  const { auth } = useAuth();

  const isEditMode = !!questionId;
  const currentUserRole = (auth as any)?.data?.user?.role;

  const {
    categoryId,
    setCategoryId,
    topic,
    setTopic,
    difficulty,
    setDifficulty,
    format,
    setFormat,
    questionWording,
    setQuestionWording,
    status,
    setStatus,
  } = useQuestionFormStore();
  
  // MCQ States
  const [mcqChoices, setMcqChoices] = useState<string[]>(["", "", "", ""]);
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState<number>(0);

  // True/False States
  const [tfCorrect, setTfCorrect] = useState<"True" | "False">("True");

  // Short Answer States
  const [saCorrectAnswer, setSaCorrectAnswer] = useState("");

  // Visual/Feedback States
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Question Format Options
  const QuestionFormatOptions: {
    value: QuestionFormat;
    label: string;
    description: string;
  }[] = [
    {
      value: "MCQ",
      label: "MCQ",
      description: "Multiple Option Keys",
    },
    {
      value: "TRUE_FALSE",
      label: "True/False",
      description: "Binary Key",
    },
    {
      value: "SHORT_ANSWER",
      label: "Short Answer",
      description: "Descriptive Wording",
    },
  ];

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosPrivate.get("/questions/category/get");
      return response.data?.data?.categories ?? response.data?.data ?? [];
    },
  });

  // Fetch existing question details (only when editing)
  const { data: existingQuestion } = useQuery({
    queryKey: ["questionDetail", questionId],
    queryFn: async () => {
      const response = await axiosPrivate.get(`/questions/get/${questionId}`);
      return response.data?.data?.question || response.data?.data;
    },
    enabled: isEditMode,
  });

  // Pre-populate form when editing
  useEffect(() => {
    if (existingQuestion) {
      setCategoryId(existingQuestion.categoryId || existingQuestion.category?.id || "");
      setTopic(existingQuestion.topic || "");
      setDifficulty(existingQuestion.difficulty || "MEDIUM");
      setFormat(existingQuestion.type || "MCQ");
      setQuestionWording(existingQuestion.question || "");
      setStatus(existingQuestion.status || "DRAFT");
      
      if (existingQuestion.type === "MCQ") {
        setMcqChoices(existingQuestion.choices || ["", "", "", ""]);
        const correctIdx = existingQuestion.choices.indexOf(existingQuestion.correctAnswer);
        setMcqCorrectIndex(correctIdx >= 0 ? correctIdx : 0);
      } else if (existingQuestion.type === "TRUE_FALSE") {
        setTfCorrect(existingQuestion.correctAnswer === "True" ? "True" : "False");
      } else {
        setSaCorrectAnswer(existingQuestion.correctAnswer || "");
      }
    }
  }, [existingQuestion]);

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
    setIsSubmitting(true);

    // Validations
    if (!categoryId) {
      toast.error("Please select an academic subject category.");
      setIsSubmitting(false);
      return;
    }
    if (!topic.trim()) {
      toast.error("Please enter a benchmark topic.");
      setIsSubmitting(false);
      return;
    }
    if (!questionWording.trim()) {
      toast.error("Please write the question wording prompt.");
      setIsSubmitting(false);
      return;
    }

    let finalChoices: string[] = [];
    let finalCorrectAnswer = "";

    if (format === "MCQ") {
      if (mcqChoices.some((choice) => !choice.trim())) {
        toast.error("All MCQ options must be written.");
        setIsSubmitting(false);
        return;
      }
      finalChoices = mcqChoices.map(c => c.trim());
      finalCorrectAnswer = mcqChoices[mcqCorrectIndex].trim();
    } else if (format === "TRUE_FALSE") {
      finalChoices = ["True", "False"];
      finalCorrectAnswer = tfCorrect;
    } else {
      if (!saCorrectAnswer.trim()) {
        toast.error("Please provide the correct answer wording.");
        setIsSubmitting(false);
        return;
      }
      finalChoices = [saCorrectAnswer.trim()];
      finalCorrectAnswer = saCorrectAnswer.trim();
    }

    const authorId = (auth as any)?.data?.user?.id;
    if (!authorId) {
      toast.error("User authentication lost. Please log in again.");
      setIsSubmitting(false);
      return;
    }

    // Forced status constraints based on roles
    let finalStatus = status;
    if (currentUserRole === "TEACHER") {
      finalStatus = "DRAFT"; // Teachers can only save questions as DRAFT
    }

    const payload = {
      id: questionId, // required for UpdateQuestionSchema validation
      question: questionWording.trim(),
      choices: finalChoices,
      correctAnswer: finalCorrectAnswer,
      categoryId,
      authorId: existingQuestion?.authorId || authorId,
      topic: topic.trim(),
      difficulty,
      type: format,
      status: finalStatus,
    };

    try {
      if (isEditMode) {
        await axiosPrivate.put(`/questions/${questionId}`, payload);
        toast.success("Question updated successfully!");
      } else {
        await axiosPrivate.post("/questions/create", payload);
        toast.success("Question draft created successfully!");
      }
      setTimeout(() => {
        navigate("/question-bank");
      }, 1500);
    } catch (err: any) {
      const serverMsg = err.response?.data?.message || "Failed to save question.";
      toast.error(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusOptions = () => {
    if (currentUserRole === "SUPERADMIN" || currentUserRole === "ADMIN") {
      return [
        { value: "DRAFT", label: "Draft" },
        { value: "PENDING_REVIEW", label: "Pending Review" },
        { value: "NEEDS_REVISION", label: "Needs Revision" },
        { value: "APPROVED", label: "Approved" },
      ];
    }
    if (currentUserRole === "TEAMLEAD") {
      return [
        { value: "DRAFT", label: "Draft" },
        { value: "PENDING_REVIEW", label: "Pending Review" },
        { value: "NEEDS_REVISION", label: "Needs Revision" },
      ];
    }
    return [{ value: "DRAFT", label: "Draft" }];
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
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                {isEditMode ? "Curriculum Revision Desk" : "Curriculum Drafting Desk"}
              </h2>
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

          {/* Section 1: Subject, Topic, Difficulty, Status */}
          <div className={`grid grid-cols-1 ${currentUserRole !== 'TEACHER' ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6`}>
            
            {/* Category selection */}
            <div className="flex flex-col gap-1.5">
              <CustomSelectWithLabel
                label="Academic Subject"
                value={categoryId}
                onValueChange={setCategoryId}
              >
                {categories.length === 0 && (
                  <SelectItem value="loading" disabled>Loading Subjects...</SelectItem>
                )}
                {categories.map((cat: any) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </CustomSelectWithLabel>
            </div>

            {/* Benchmark Topic */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Benchmark Topic
              </Label>
              <Input
                type="text"
                placeholder="e.g. Clinical Chemistry"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className=" bg-slate-50 border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#A70202]/10 focus:border-[#A70202] text-sm"
              />
            </div>

            {/* Difficulty Level */}
            <div className="flex flex-col gap-1.5">
              <CustomSelectWithLabel
                label="Curriculum Difficulty"
                value={difficulty}
                onValueChange={setDifficulty}
              >
                <SelectItem value="EASY">Easy Level</SelectItem>
                <SelectItem value="MEDIUM">Medium Level</SelectItem>
                <SelectItem value="HARD">Hard Level</SelectItem>
              </CustomSelectWithLabel>
            </div>

            {/* Status Selection (only for non-teachers) */}
            {currentUserRole !== "TEACHER" && (
              <div className="flex flex-col gap-1.5">
                <CustomSelectWithLabel
                  label="Review Status"
                  value={status}
                  onValueChange={setStatus}
                >
                  {getStatusOptions().map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </CustomSelectWithLabel>
              </div>
            )}

          </div>

          {/* Section 2: Question Format */}
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Question Format
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {QuestionFormatOptions.map((opt) => (
                <CardButton
                  key={opt.value}
                  title={opt.label}
                  description={opt.description}
                  selected={format === opt.value}
                  onClick={() => setFormat(opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Section 3: Question Wording / Prompt */}
          <div className="flex flex-col gap-1.5">
            <QuestionInput
              questionWording={questionWording}
              setQuestionWording={setQuestionWording}
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

              {format === "MCQ" ?(
                <MultipleChoiceInput
                  mcqChoices={mcqChoices}
                  mcqCorrectIndex={mcqCorrectIndex}
                  handleChange={handleMcqChoiceChange}
                  setMcqCorrectIndex={setMcqCorrectIndex}
                />
              ) : format === "TRUE_FALSE" ? (
                <TrueOrFalseInput tfCorrect={tfCorrect} setTfCorrect={setTfCorrect} />
              ) : (
                <ShortAnswerInput saCorrectAnswer={saCorrectAnswer} setSaCorrectAnswer={setSaCorrectAnswer} />
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