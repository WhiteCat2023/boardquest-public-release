import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  HelpCircle, 
  Sparkles, 
  PlusCircle, 
  RotateCcw,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import CustomSelectWithLabel from "@/components/custom/select/Select";
import CardButton from "./buttons/CardButton";
import TrueOrFalseInput from "./TOFInput";
import ShortAnswerInput from "./ShortAnswerInput";
import MultipleChoiceInput from "./MCQInput";
import QuestionInput from "./QuestionInput";
import QuestionSynthesizerDialog, { type SynthesizedResult } from "./dialog/QuestionSynthesizerDialog";
import { useQuestionFormStore, useExtractedQuestionsStore } from "@/store/QuestionBankStore";
import UploadZone from "./UploadZone";
import ExtractedFilePreview from "./ExtractedFilePreview";
import { Spinner } from "@/components/ui/spinner";
import { useQuestionQualityCheck } from "@/features/question-bank";

type QuestionFormat = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

export default function AddQuestion() {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { questionId } = useParams();
  const { auth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const isEditMode = !!questionId;
  const currentUserRole = (auth as any)?.data?.user?.role;

  // Active Tab: "individual" | "bulk"
  const initialTab = searchParams.get("tab") === "bulk" || location.pathname.includes("/import") ? "bulk" : "individual";
  const [activeTab, setActiveTab] = useState<"individual" | "bulk">(initialTab);

  const handleTabChange = (tab: "individual" | "bulk") => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const { extractedQuestions } = useExtractedQuestionsStore();

  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ""}`
    : location.state?.from || null;

  const handleBackNav = () => {
    if (from) {
      navigate(from);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/question-bank");
    }
  };

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
      description: "Multiple Options",
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

  // Pre-populate form when editing or initialize defaults
  useEffect(() => {
    if (isEditMode && existingQuestion) {
      setCategoryId(existingQuestion.categoryId || existingQuestion.category?.id || "");
      setTopic(existingQuestion.topic || "");
      setDifficulty(existingQuestion.difficulty || "MEDIUM");
      setFormat(existingQuestion.type || "MCQ");
      setQuestionWording(existingQuestion.question || "");
      setStatus(existingQuestion.status || "PENDING_REVIEW");
      
      if (existingQuestion.type === "MCQ") {
        setMcqChoices(existingQuestion.choices && existingQuestion.choices.length >= 2 ? existingQuestion.choices : ["", ""]);
        const correctIdx = existingQuestion.choices ? existingQuestion.choices.indexOf(existingQuestion.correctAnswer) : -1;
        setMcqCorrectIndex(correctIdx >= 0 ? correctIdx : 0);
      } else if (existingQuestion.type === "TRUE_FALSE") {
        setTfCorrect(existingQuestion.correctAnswer === "True" ? "True" : "False");
      } else if (existingQuestion.type === "SHORT_ANSWER") {
        setSaCorrectAnswer(existingQuestion.correctAnswer || "");
      }
    } else if (!isEditMode) {
      if (!difficulty) setDifficulty("MEDIUM");
      if (!format) setFormat("MCQ");
      if (!status) setStatus("PENDING_REVIEW");
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

  const { validateQuestionQuality } = useQuestionQualityCheck();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateQuestionQuality({
      questionWording,
      format,
      mcqChoices,
      mcqCorrectIndex,
      tfCorrect,
      saCorrectAnswer,
      categoryId,
    });

    if (!isValid) return;

    let computedCorrectAnswer = "";
    let finalChoices: string[] = [];

    if (format === "MCQ") {
      computedCorrectAnswer = mcqChoices[mcqCorrectIndex];
      finalChoices = mcqChoices;
    } else if (format === "TRUE_FALSE") {
      computedCorrectAnswer = tfCorrect;
      finalChoices = ["True", "False"];
    } else if (format === "SHORT_ANSWER") {
      computedCorrectAnswer = saCorrectAnswer.trim();
      finalChoices = [];
    }

    setIsSubmitting(true);

    const payload = {
      question: questionWording,
      type: format || "MCQ",
      categoryId,
      topic: topic || "General",
      difficulty: difficulty || "MEDIUM",
      correctAnswer: computedCorrectAnswer,
      choices: finalChoices,
      status: (status && status !== "") ? status : "PENDING_REVIEW",
    };

    try {
      if (isEditMode) {
        await axiosPrivate.put(`/questions/update/${questionId}`, payload);
        toast.success("Question updated successfully!");
      } else {
        // If user applied AI wording, preserve their original base draft in MongoDB as well
        if (originalQuestionDraft && originalQuestionDraft !== questionWording) {
          await axiosPrivate.post("/questions/create", {
            ...payload,
            question: originalQuestionDraft,
            status: "DRAFT",
          }).catch(() => {});
        }

        await axiosPrivate.post("/questions/create", payload);
        toast.success("New question added to repository!");
      }
      handleBackNav();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isSynthesizerOpen, setIsSynthesizerOpen] = useState(false);

  const getFormPayload = () => {
    let computedCorrectAnswer = "";
    let finalChoices: string[] = [];

    if (format === "MCQ") {
      computedCorrectAnswer = mcqChoices[mcqCorrectIndex] || mcqChoices[0] || "";
      finalChoices = mcqChoices;
    } else if (format === "TRUE_FALSE") {
      computedCorrectAnswer = tfCorrect;
      finalChoices = ["True", "False"];
    } else if (format === "SHORT_ANSWER") {
      computedCorrectAnswer = saCorrectAnswer.trim();
      finalChoices = [];
    }

    return {
      question: questionWording,
      type: format,
      categoryId,
      topic: topic || "General",
      difficulty,
      correctAnswer: computedCorrectAnswer,
      choices: finalChoices,
    };
  };

  const [originalQuestionDraft, setOriginalQuestionDraft] = useState<string | null>(null);
  const [originalBackup, setOriginalBackup] = useState<{
    question: string;
    choices: string[];
    correctAnswer: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    format: QuestionFormat;
  } | null>(null);

  const captureOriginalBackup = () => {
    if (!originalBackup && questionWording.trim()) {
      let computedCorrectAnswer = "";
      let finalChoices: string[] = [];

      if (format === "MCQ") {
        computedCorrectAnswer = mcqChoices[mcqCorrectIndex] || mcqChoices[0] || "";
        finalChoices = [...mcqChoices];
      } else if (format === "TRUE_FALSE") {
        computedCorrectAnswer = tfCorrect;
        finalChoices = ["True", "False"];
      } else if (format === "SHORT_ANSWER") {
        computedCorrectAnswer = saCorrectAnswer.trim();
        finalChoices = [];
      }

      setOriginalBackup({
        question: questionWording,
        choices: finalChoices,
        correctAnswer: computedCorrectAnswer,
        difficulty: (difficulty as any) || "MEDIUM",
        format: format as QuestionFormat,
      });
    }
  };

  const handleRestoreOriginal = () => {
    if (!originalBackup) return;
    setQuestionWording(originalBackup.question);
    setDifficulty(originalBackup.difficulty);
    setFormat(originalBackup.format);

    if (originalBackup.format === "MCQ") {
      setMcqChoices(originalBackup.choices);
      const matchIndex = originalBackup.choices.findIndex(
        (c) => c.trim().toLowerCase() === originalBackup.correctAnswer.trim().toLowerCase()
      );
      setMcqCorrectIndex(matchIndex >= 0 ? matchIndex : 0);
    } else if (originalBackup.format === "TRUE_FALSE") {
      setTfCorrect(originalBackup.correctAnswer === "True" ? "True" : "False");
    } else if (originalBackup.format === "SHORT_ANSWER") {
      setSaCorrectAnswer(originalBackup.correctAnswer);
    }

    toast.success("Restored original base question to form!");
  };

  const handleOpenSynthesizer = () => {
    if (!questionWording.trim()) {
      toast.error("Please enter the question text before synthesizing with AI.");
      return;
    }
    if (!categoryId) {
      toast.error("Please select an academic subject category.");
      return;
    }
    // Track original question draft & full backup
    setOriginalQuestionDraft(questionWording);
    captureOriginalBackup();
    setIsSynthesizerOpen(true);
  };

  const handleSaveBoth = async (synthesized: SynthesizedResult) => {
    const originalPayload = getFormPayload();
    if (originalQuestionDraft) {
      originalPayload.question = originalQuestionDraft;
    }
    const synthesizedPayload = {
      ...originalPayload,
      question: synthesized.question,
      choices: synthesized.choices,
      correctAnswer: synthesized.correctAnswer,
      difficulty: synthesized.difficulty,
    };

    try {
      // Save Original Question Draft
      await axiosPrivate.post("/questions/create", {
        ...originalPayload,
        status: "DRAFT",
      });
      // Save AI Synthesized Question Variant
      await axiosPrivate.post("/questions/create", synthesizedPayload);

      toast.success("Both Original Draft and AI Synthesized question saved to database!");
      handleBackNav();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save questions.");
      throw err;
    }
  };

  const handleSaveSynthesizedOnly = async (synthesized: SynthesizedResult) => {
    const originalPayload = getFormPayload();
    if (originalQuestionDraft) {
      originalPayload.question = originalQuestionDraft;
    }
    const synthesizedPayload = {
      ...originalPayload,
      question: synthesized.question,
      choices: synthesized.choices,
      correctAnswer: synthesized.correctAnswer,
      difficulty: synthesized.difficulty,
    };

    try {
      // Preserve Original Base Question in DB
      await axiosPrivate.post("/questions/create", {
        ...originalPayload,
        status: "DRAFT",
      }).catch(() => {});

      // Save AI Synthesized Question
      await axiosPrivate.post("/questions/create", synthesizedPayload);

      toast.success("AI Synthesized Question saved (Original Draft preserved in database)!");
      handleBackNav();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save synthesized question.");
      throw err;
    }
  };

  const handleApplyToForm = (synthesized: SynthesizedResult) => {
    captureOriginalBackup();
    if (!originalQuestionDraft) {
      setOriginalQuestionDraft(questionWording);
    }
    setQuestionWording(synthesized.question);
    setDifficulty(synthesized.difficulty);
    if (format === "MCQ") {
      setMcqChoices(synthesized.choices);
      const matchIndex = synthesized.choices.findIndex(
        (c) => c.trim().toLowerCase() === synthesized.correctAnswer.trim().toLowerCase()
      );
      setMcqCorrectIndex(matchIndex >= 0 ? matchIndex : 0);
    } else if (format === "SHORT_ANSWER") {
      setSaCorrectAnswer(synthesized.correctAnswer);
    }
  };

  const handleCancel = () => {
    handleBackNav();
  };

  const isNotOriginalQuestion =
    originalBackup !== null &&
    questionWording.trim().toLowerCase() !== originalBackup.question.trim().toLowerCase();

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 w-full max-w-5xl mx-auto font-sans bg-background text-foreground animate-in fade-in duration-300">
      
      {/* ── Header & Back Navigation with Segmented Pill Tabs ── */}
      <div className="flex flex-col gap-2.5 sticky top-0 bg-background/95 backdrop-blur-md pb-2.5 pt-1 -mt-1 z-10 border-b border-border/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleBackNav}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors group cursor-pointer"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
            Back to Question Bank
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
              <div className="p-1.5 bg-primary/10 text-primary rounded-xl border border-primary/20">
                {activeTab === "individual" ? (
                  <PlusCircle size={16} className="stroke-[2.5]" />
                ) : (
                  <FileSpreadsheet size={16} className="stroke-[2.5]" />
                )}
              </div>
              {activeTab === "individual"
                ? (isEditMode ? "Curriculum Revision Desk" : "Add New Question")
                : "Bulk Import Questions"}
            </h1>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {activeTab === "individual"
                ? "Formulate evaluation questions linked to standard benchmarks"
                : "Batch upload multiple exam questions via CSV file spreadsheet."}
            </p>
          </div>

          {/* ── Segmented Pill Tabs: Add Question(individual) & Add Questions(bulk) ── */}
          {!isEditMode && (
            <div className="flex items-center p-0.5 bg-muted/60 border border-border/80 rounded-xl w-fit shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange("individual")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "individual"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PlusCircle size={13} />
                Add Question(individual)
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("bulk")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "bulk"
                    ? "bg-card text-foreground shadow-2xs border border-border/80"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileSpreadsheet size={13} />
                Add Questions(bulk)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "individual" ? (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* Header Bar */}
          <div className="p-4 md:p-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-3 bg-muted/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-full bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                <PlusCircle size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground tracking-tight">
                  {isEditMode ? "Curriculum Revision Desk" : "Curriculum Drafting Desk"}
                </h2>
                <p className="text-[11px] text-muted-foreground font-medium">Formulate evaluation questions linked to standard benchmarks</p>
              </div>
            </div>
            
            <div className="flex flex-col items-start md:items-end text-xs text-muted-foreground font-medium md:text-right border-l-2 md:border-l-0 md:border-r-2 border-primary/30 pl-3 md:pl-0 md:pr-3 py-0.5">
              <span className="text-[9px] text-muted-foreground/70 font-semibold uppercase tracking-wider">Authoring profile</span>
              <span className="text-foreground font-bold text-xs">{(auth as any)?.data?.user?.name || "Faculty Reviewer"}</span>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-5">

            {/* Section 1: Subject, Topic, Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
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
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Benchmark Topic
                </Label>
                <Input
                  type="text"
                  placeholder="e.g. Clinical Chemistry"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-muted/40 border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-xs h-9 placeholder:text-muted-foreground"
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

            </div>

            {/* Section 2: Question Format */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Question Format
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              {isNotOriginalQuestion && (
                <div className="flex items-center justify-between pb-1 animate-in fade-in duration-200">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <RotateCcw size={11} /> AI Synthesized Wording Active
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRestoreOriginal}
                    className="text-[11px] font-bold border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 cursor-pointer h-6 px-2.5 rounded-md flex items-center gap-1 shadow-2xs"
                  >
                    <RotateCcw size={12} />
                    Use Original Question
                  </Button>
                </div>
              )}
              <QuestionInput
                questionWording={questionWording}
                setQuestionWording={setQuestionWording}
              />
            </div>

            {/* Section 4: Option Specifications & Correct Key Designation */}
            <div className="border border-border rounded-xl bg-muted/20 overflow-hidden">
              <div className="p-3 px-4 border-b border-border bg-muted/40 flex flex-col sm:flex-row justify-between sm:items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-primary" />
                  <span className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                    Option Specifications & Correct Key Designation
                  </span>
                </div>
                <span className="text-[9.5px] font-bold text-muted-foreground uppercase tracking-wide">
                  Toggle selection to set answer key
                </span>
              </div>

              <div className="p-4 flex flex-col gap-3">
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

          {/* Section 5: Action Bar */}
          <div className="p-4 border-t border-border flex flex-wrap items-center justify-end gap-2.5 bg-muted/20">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="cursor-pointer border-border hover:bg-accent text-foreground font-semibold px-4 h-9 rounded-xl text-xs"
            >
              Cancel Draft
            </Button>

            {isNotOriginalQuestion && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRestoreOriginal}
                className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-bold px-4 h-9 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs animate-in fade-in duration-200"
              >
                <RotateCcw size={14} />
                Use Original Question
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={handleOpenSynthesizer}
              disabled={isSubmitting}
              className="border-primary/40 text-primary hover:bg-primary/10 font-bold px-4 h-9 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Sparkles size={14} className="text-primary" />
              AI Synthesizer & Preview
            </Button>
            
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer font-semibold px-5 h-9 rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting ? (
                <Spinner size="xs" variant="current" />
              ) : (
                <Sparkles size={14} />
              )}
              Save & Submit Draft
            </Button>
          </div>
        </form>
      ) : (
        /* ── BULK CSV UPLOAD TAB ── */
        <div className="animate-in fade-in duration-200">
          {extractedQuestions.length === 0 ? (
            <UploadZone categories={categories} />
          ) : (
            <ExtractedFilePreview />
          )}
        </div>
      )}

      {/* AI Question Synthesizer Preview Modal */}
      <QuestionSynthesizerDialog
        open={isSynthesizerOpen}
        onOpenChange={setIsSynthesizerOpen}
        originalData={{
          question: originalBackup?.question || questionWording,
          choices: originalBackup?.choices || (format === "MCQ" ? mcqChoices : format === "TRUE_FALSE" ? ["True", "False"] : []),
          correctAnswer: originalBackup?.correctAnswer || (format === "MCQ" ? (mcqChoices[mcqCorrectIndex] || mcqChoices[0] || "") : format === "TRUE_FALSE" ? tfCorrect : saCorrectAnswer),
          topic: topic || "General",
          difficulty: (difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
          type: (format as "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER") || "MCQ",
          categoryId,
          status,
        }}
        onSaveBoth={handleSaveBoth}
        onSaveSynthesizedOnly={handleSaveSynthesizedOnly}
        onApplyToForm={handleApplyToForm}
        onRestoreOriginal={isNotOriginalQuestion ? handleRestoreOriginal : undefined}
      />
    </div>
  );
}