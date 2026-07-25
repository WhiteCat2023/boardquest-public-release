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
  const [mcqChoices, setMcqChoices] = useState<string[]>(["", ""]);
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
        setMcqChoices(existingQuestion.choices && existingQuestion.choices.length >= 2 ? existingQuestion.choices : ["", ""]);
        const correctIdx = existingQuestion.choices ? existingQuestion.choices.indexOf(existingQuestion.correctAnswer) : -1;
        setMcqCorrectIndex(correctIdx >= 0 ? correctIdx : 0);
      } else if (existingQuestion.type === "TRUE_FALSE") {
        setTfCorrect(existingQuestion.correctAnswer === "True" ? "True" : "False");
      } else if (existingQuestion.type === "SHORT_ANSWER") {
        setSaCorrectAnswer(existingQuestion.correctAnswer || "");
      }
    }
  }, [existingQuestion, isEditMode, setCategoryId, setTopic, setDifficulty, setFormat, setQuestionWording, setStatus]);

  const handleMcqChoiceChange = (index: number, val: string) => {
    const updated = [...mcqChoices];
    updated[index] = val;
    setMcqChoices(updated);
  };

  const handleAddChoice = () => {
    setMcqChoices([...mcqChoices, ""]);
  };

  const handleRemoveChoice = (index: number) => {
    if (mcqChoices.length <= 2) return;
    const updated = mcqChoices.filter((_, i) => i !== index);
    setMcqChoices(updated);
    if (mcqCorrectIndex >= updated.length) {
      setMcqCorrectIndex(updated.length - 1);
    } else if (mcqCorrectIndex === index) {
      setMcqCorrectIndex(0);
    }
  };

  const getStatusOptions = () => {
    if (currentUserRole === "SUPERADMIN" || currentUserRole === "ADMIN") {
      return [
        { value: "DRAFT", label: "Drafting Mode" },
        { value: "NEEDS_REVISION", label: "Needs Revision" },
        { value: "APPROVED", label: "Approved for Pool" },
      ];
    }
    return [
      { value: "DRAFT", label: "Drafting Mode" },
      { value: "PENDING_REVIEW", label: "Submit for Approval" },
    ];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionWording.trim()) {
      toast.error("Please enter the question text/wording.");
      return;
    }

    if (!categoryId) {
      toast.error("Please select an academic subject category.");
      return;
    }

    let computedCorrectAnswer = "";
    let finalChoices: string[] = [];

    if (format === "MCQ") {
      if (mcqChoices.length < 2) {
        toast.error("Please add at least 2 options for multiple choice.");
        return;
      }
      if (mcqChoices.some((c) => !c.trim())) {
        toast.error("Please fill in all multiple choice options.");
        return;
      }
      computedCorrectAnswer = mcqChoices[mcqCorrectIndex];
      finalChoices = mcqChoices;
    } else if (format === "TRUE_FALSE") {
      computedCorrectAnswer = tfCorrect;
      finalChoices = ["True", "False"];
    } else if (format === "SHORT_ANSWER") {
      if (!saCorrectAnswer.trim()) {
        toast.error("Please specify the expected short answer key.");
        return;
      }
      computedCorrectAnswer = saCorrectAnswer.trim();
      finalChoices = [];
    }

    setIsSubmitting(true);

    const payload = {
      question: questionWording,
      type: format,
      categoryId,
      topic: topic || "General",
      difficulty,
      correctAnswer: computedCorrectAnswer,
      choices: finalChoices,
      status: currentUserRole === "TEACHER" ? "DRAFT" : status,
    };

    try {
      if (isEditMode) {
        await axiosPrivate.put(`/questions/update/${questionId}`, payload);
        toast.success("Question updated successfully!");
      } else {
        await axiosPrivate.post("/questions/create", payload);
        toast.success("New question added to repository!");
      }
      navigate("/question-bank");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 w-full max-w-6xl mx-auto font-sans bg-background text-foreground animate-in fade-in duration-300">
      {/* Back Button */}
      <div className="flex items-center gap-2">
        <Link
          to="/question-bank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Question Bank
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <PlusCircle size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground tracking-tight">
                {isEditMode ? "Curriculum Revision Desk" : "Curriculum Drafting Desk"}
              </h2>
              <p className="text-xs text-muted-foreground font-medium">Formulate evaluation questions linked to standard benchmarks</p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end text-xs text-muted-foreground font-medium md:text-right border-l-2 md:border-l-0 md:border-r-2 border-primary/30 pl-3 md:pl-0 md:pr-3 py-0.5">
            <span className="text-[10px] text-muted-foreground/70 font-semibold uppercase tracking-wider">Authoring profile</span>
            <span className="text-foreground font-bold text-sm">{(auth as any)?.data?.user?.name || "Faculty Reviewer"}</span>
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
              <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Benchmark Topic
              </Label>
              <Input
                type="text"
                placeholder="e.g. Clinical Chemistry"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-sm placeholder:text-muted-foreground"
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
            <Label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
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
          <div className="border border-border rounded-2xl bg-muted/20 overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/40 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <HelpCircle size={15} className="text-primary" />
                <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                  Option Specifications & Correct Key Designation
                </span>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                Toggle the selection to set the correct answer
              </span>
            </div>

            <div className="p-6 flex flex-col gap-4">
              {format === "MCQ" ?(
                <MultipleChoiceInput
                  mcqChoices={mcqChoices}
                  mcqCorrectIndex={mcqCorrectIndex}
                  handleChange={handleMcqChoiceChange}
                  setMcqCorrectIndex={setMcqCorrectIndex}
                  handleAddChoice={handleAddChoice}
                  handleRemoveChoice={handleRemoveChoice}
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
        <div className="p-6 border-t border-border bg-muted/40 flex justify-end gap-3.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-6 py-2.5 rounded-xl h-auto"
          >
            Cancel Draft
          </Button>
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-6 py-2.5 rounded-xl h-auto flex items-center gap-2 shadow-xs"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin border-2 border-primary-foreground border-t-transparent rounded-full w-4 h-4" />
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