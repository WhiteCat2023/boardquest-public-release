import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Trash2, X, Edit, Check, Sparkles } from "lucide-react";
import { useEditBulkQuestionStore } from "@/store/QuestionBankStore";
import { getDifficultyColor } from "@/utils/style";
import { toast } from "sonner";
import { useExtractedQuestionsStore } from "../../../../../store/QuestionBankStore";

interface QuestionTableProps {
  onSynthesizeRow?: (index: number) => void;
}

export default function QuestionTable({ onSynthesizeRow }: QuestionTableProps = {}) {
    const {
        editingIndex,
        editWording,
        editChoices,
        editCorrectAnswer,
        editTopic,
        editDifficulty,
        editType,
        editFeedback,
        setEditingIndex,
        setEditWording,
        setEditChoices,
        setEditCorrectAnswer,
        setEditTopic,
        setEditDifficulty,
        setEditType,
        setEditFeedback,
    } = useEditBulkQuestionStore();
        
    const { extractedQuestions, setExtractedQuestions } = useExtractedQuestionsStore();

    const startEdit = (index: number) => {
        const q = extractedQuestions[index];
        setEditingIndex(index);
        setEditWording(q.question);
        setEditChoices(q.choices.join("; "));
        setEditCorrectAnswer(q.correctAnswer);
        setEditTopic(q.topic);
        setEditDifficulty(q.difficulty);
        setEditType(q.type);
        setEditFeedback(q.feedback || "");
    };

    const cancelEdit = () => {
        setEditingIndex(null);
    };

    const deleteRow = (index: number) => {
        const updated = extractedQuestions.filter((_, idx) => idx !== index);
        setExtractedQuestions(updated);
        toast.info("Question removed from upload list.");
    };

    const saveEdit = (index: number) => {
        const choicesArr = editChoices.split(/[;|\n]/).map(c => c.trim()).filter(Boolean);
        
        if (!editWording.trim()) {
          toast.error("Question wording cannot be empty.");
          return;
        }
        if (!editCorrectAnswer.trim()) {
          toast.error("Correct answer is required.");
          return;
        }

        const updated = [...extractedQuestions];
        updated[index] = {
          ...updated[index],
          question: editWording.trim(),
          choices: choicesArr,
          correctAnswer: editCorrectAnswer.trim(),
          topic: editTopic.trim() || "General",
          difficulty: editDifficulty,
          type: editType,
          feedback: editFeedback.trim(),
        };
        setExtractedQuestions(updated);
        setEditingIndex(null);
        toast.success("Question updated locally.");
    };

    return (
        <Table className="font-sans text-foreground text-xs w-full border-collapse">
        <TableHeader className="bg-muted/60 border-b border-border">
            <TableRow className="border-b border-border hover:bg-transparent">
            <TableHead className="w-[40px] text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider pl-3 py-2 align-middle whitespace-nowrap">
                #
            </TableHead>
            <TableHead className="min-w-[280px] text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider py-2 px-2.5 align-middle whitespace-nowrap">
                Question
            </TableHead>
            <TableHead className="min-w-[180px] text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider py-2 px-2.5 align-middle whitespace-nowrap">
                Choices (MCQ)
            </TableHead>
            <TableHead className="min-w-[120px] text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider py-2 px-2.5 align-middle whitespace-nowrap">
                Correct Answer
            </TableHead>
            <TableHead className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider py-2 px-2.5 align-middle whitespace-nowrap">
                Topic
            </TableHead>
            <TableHead className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider py-2 px-2.5 align-middle whitespace-nowrap">
                Type
            </TableHead>
            <TableHead className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider py-2 px-2.5 align-middle whitespace-nowrap">
                Difficulty
            </TableHead>
            <TableHead className="w-[80px] text-right text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider pr-3 py-2 align-middle whitespace-nowrap">
                Actions
            </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border">
            {extractedQuestions.map((q, idx) => {
            const isEditing = editingIndex === idx;

            return (
                <TableRow
                key={idx}
                className="border-b border-border/70 hover:bg-muted/30 transition-colors"
                >
                {/* Row Index */}
                <TableCell className="pl-3 py-1.5 align-top whitespace-normal font-bold text-muted-foreground text-xs">
                    {idx + 1}
                </TableCell>

                {/* Question Text & Explanation */}
                <TableCell className="py-1.5 px-2.5 align-top whitespace-normal">
                    {isEditing ? (
                    <div className="flex flex-col gap-1.5">
                        <textarea
                            value={editWording}
                            onChange={(e) => setEditWording(e.target.value)}
                            placeholder="Question wording..."
                            className="w-full text-xs font-medium p-1.5 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-16 resize-y leading-snug"
                        />
                        <textarea
                            value={editFeedback}
                            onChange={(e) => setEditFeedback(e.target.value)}
                            placeholder="Explanation / Rationale..."
                            className="w-full text-[11px] p-1.5 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-muted-foreground h-12 resize-y leading-snug"
                        />
                    </div>
                    ) : (
                    <div className="flex flex-col gap-0.5 min-w-[220px] max-w-[360px]">
                        <p className="text-xs font-bold text-foreground leading-snug break-words">
                        {q.question}
                        </p>
                        {q.feedback && (
                        <p className="text-[10.5px] text-muted-foreground/80 italic font-medium leading-snug break-words mt-0.5">
                            Explanation: {q.feedback}
                        </p>
                        )}
                    </div>
                    )}
                </TableCell>

                {/* Choices */}
                <TableCell className="py-1.5 px-2.5 align-top whitespace-normal">
                    {isEditing ? (
                    <textarea
                        value={editChoices}
                        onChange={(e) => setEditChoices(e.target.value)}
                        placeholder="Choice A; Choice B; Choice C..."
                        className="w-full text-xs p-1.5 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground h-16 resize-y leading-snug"
                    />
                    ) : (
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {q.choices.length > 0 ? (
                        q.choices.map((c: string, cIdx: number) => (
                            <span
                            key={cIdx}
                            className="bg-muted/70 border border-border/80 text-[9.5px] font-medium text-foreground px-1.5 py-0.5 rounded leading-tight"
                            >
                            {c}
                            </span>
                        ))
                        ) : (
                        <span className="text-[10px] text-muted-foreground italic font-medium">
                            None
                        </span>
                        )}
                    </div>
                    )}
                </TableCell>

                {/* Correct Answer */}
                <TableCell className="py-1.5 px-2.5 align-top whitespace-normal">
                    {isEditing ? (
                    <input
                        value={editCorrectAnswer}
                        onChange={(e) => setEditCorrectAnswer(e.target.value)}
                        className="w-full text-xs p-1.5 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-7"
                    />
                    ) : (
                    <span className="text-[11px] font-extrabold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded inline-block leading-tight break-words">
                        {q.correctAnswer}
                    </span>
                    )}
                </TableCell>

                {/* Topic */}
                <TableCell className="py-1.5 px-2.5 align-top whitespace-normal">
                    {isEditing ? (
                    <input
                        value={editTopic}
                        onChange={(e) => setEditTopic(e.target.value)}
                        className="w-full text-xs p-1.5 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-7"
                    />
                    ) : (
                    <span className="text-[11px] font-medium text-muted-foreground block leading-tight">
                        {q.topic || "General"}
                    </span>
                    )}
                </TableCell>

                {/* Type */}
                <TableCell className="py-1.5 px-2.5 align-top whitespace-normal">
                    {isEditing ? (
                    <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="w-full text-xs p-1 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-7 cursor-pointer"
                    >
                        <option value="MCQ">MCQ</option>
                        <option value="TRUE_FALSE">True/False</option>
                        <option value="SHORT_ANSWER">Short Answer</option>
                    </select>
                    ) : (
                    <span className="rounded border border-border bg-muted/80 px-1.5 py-0.5 text-[9.5px] font-bold text-muted-foreground leading-tight">
                        {q.type}
                    </span>
                    )}
                </TableCell>

                {/* Difficulty */}
                <TableCell className="py-1.5 px-2.5 align-top whitespace-normal">
                    {isEditing ? (
                    <select
                        value={editDifficulty}
                        onChange={(e) => setEditDifficulty(e.target.value)}
                        className="w-full text-xs p-1 bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary text-foreground h-7 cursor-pointer"
                    >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                    ) : (
                    <span
                        className={`rounded border px-1.5 py-0.5 text-[9.5px] font-extrabold leading-tight ${getDifficultyColor(q.difficulty)}`}
                    >
                        {q.difficulty}
                    </span>
                    )}
                </TableCell>

                {/* Actions */}
                <TableCell className="pr-3 py-1.5 align-top whitespace-normal text-right">
                    <div className="flex items-center justify-end gap-1">
                    {isEditing ? (
                        <>
                        <button
                            onClick={() => saveEdit(idx)}
                            className="flex h-6 w-6 items-center justify-center rounded border border-emerald-500/30 bg-card text-emerald-600 dark:text-emerald-400 shadow-2xs hover:bg-emerald-500/10 focus:outline-none cursor-pointer"
                            title="Save changes"
                        >
                            <Check size={12} />
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="flex h-6 w-6 items-center justify-center rounded border border-border bg-card text-muted-foreground shadow-2xs hover:bg-accent focus:outline-none cursor-pointer"
                            title="Cancel"
                        >
                            <X size={12} />
                        </button>
                        </>
                    ) : (
                        <>
                        <button
                            onClick={() => onSynthesizeRow && onSynthesizeRow(idx)}
                            disabled={editingIndex !== null}
                            className="flex h-6 w-6 items-center justify-center rounded border border-primary/30 bg-primary/10 text-primary shadow-2xs hover:bg-primary/20 focus:outline-none cursor-pointer disabled:opacity-50"
                            title="AI Synthesize & Enhance Question"
                        >
                            <Sparkles size={12} />
                        </button>
                        <button
                            onClick={() => startEdit(idx)}
                            disabled={editingIndex !== null}
                            className="flex h-6 w-6 items-center justify-center rounded border border-border bg-card text-muted-foreground shadow-2xs hover:bg-accent hover:text-foreground focus:outline-none cursor-pointer disabled:opacity-50"
                            title="Edit Row"
                        >
                            <Edit size={12} />
                        </button>
                        <button
                            onClick={() => deleteRow(idx)}
                            disabled={editingIndex !== null}
                            className="flex h-6 w-6 items-center justify-center rounded border border-destructive/30 bg-card text-destructive shadow-2xs hover:bg-destructive/10 focus:outline-none cursor-pointer disabled:opacity-50"
                            title="Delete Row"
                        >
                            <Trash2 size={12} />
                        </button>
                        </>
                    )}
                    </div>
                </TableCell>
                </TableRow>
            );
            })}
        </TableBody>
        </Table>
    );
}
