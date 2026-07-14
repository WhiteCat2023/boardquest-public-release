import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Trash2, X, Edit, Check } from "lucide-react";
import { useEditBulkQuestionStore } from "@/store/QuestionBankStore";
import { getDifficultyColor } from "@/utils/style";
import { toast } from "sonner";
import { useExtractedQuestionsStore } from "../../../../../store/QuestionBankStore";

export default function QuestionTable() {
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
        
    const {extractedQuestions, setExtractedQuestions} = useExtractedQuestionsStore();

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
        <Table>
        <TableHeader className="bg-slate-50/30">
            <TableRow className="border-b border-slate-100 hover:bg-transparent">
            <TableHead className="w-[60px] text-xs font-bold text-slate-400 uppercase tracking-wider pl-6 py-4">
                Row
            </TableHead>
            <TableHead className="min-w-[200px] text-xs font-bold text-slate-400 uppercase tracking-wider py-4">
                Question
            </TableHead>
            <TableHead className="min-w-[160px] text-xs font-bold text-slate-400 uppercase tracking-wider py-4">
                Choices (MCQ)
            </TableHead>
            <TableHead className="min-w-[120px] text-xs font-bold text-slate-400 uppercase tracking-wider py-4">
                Correct Answer
            </TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">
                Topic
            </TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">
                Type
            </TableHead>
            <TableHead className="text-xs font-bold text-slate-400 uppercase tracking-wider py-4">
                Difficulty
            </TableHead>
            <TableHead className="w-[120px] text-right text-xs font-bold text-slate-400 uppercase tracking-wider pr-6 py-4">
                Actions
            </TableHead>
            </TableRow>
        </TableHeader>
        <TableBody>
            {extractedQuestions.map((q, idx) => {
            const isEditing = editingIndex === idx;

            return (
                <TableRow
                key={idx}
                className="border-b border-slate-100 hover:bg-slate-50/20 transition-colors"
                >
                {/* Row Index */}
                <TableCell className="pl-6 py-4 font-semibold text-slate-400 text-xs">
                    {idx + 1}
                </TableCell>

                {/* Question Text */}
                <TableCell className="py-4">
                    {isEditing ? (
                    <textarea
                        value={editWording}
                        onChange={(e) => setEditWording(e.target.value)}
                        className="w-full text-xs font-semibold p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-16 resize-none"
                    />
                    ) : (
                    <div className="flex flex-col gap-1 max-w-[280px]">
                        <span className="text-xs font-semibold text-slate-800 leading-relaxed block line-clamp-3">
                        {q.question}
                        </span>
                        {q.feedback && (
                        <span className="text-[10px] text-slate-400 italic font-medium line-clamp-1">
                            Explanation: {q.feedback}
                        </span>
                        )}
                    </div>
                    )}
                </TableCell>

                {/* Choices */}
                <TableCell className="py-4">
                    {isEditing ? (
                    <textarea
                        value={editChoices}
                        onChange={(e) => setEditChoices(e.target.value)}
                        placeholder="Choice A; Choice B; Choice C..."
                        className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-16 resize-none"
                    />
                    ) : (
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {q.choices.length > 0 ? (
                        q.choices.map((c: string, cIdx: number) => (
                            <span
                            key={cIdx}
                            className="bg-slate-100 border border-slate-200/50 text-[10px] font-medium text-slate-600 px-2 py-0.5 rounded-md"
                            >
                            {c}
                            </span>
                        ))
                        ) : (
                        <span className="text-[10px] text-slate-400 italic font-medium">
                            None
                        </span>
                        )}
                    </div>
                    )}
                </TableCell>

                {/* Correct Answer */}
                <TableCell className="py-4">
                    {isEditing ? (
                    <input
                        value={editCorrectAnswer}
                        onChange={(e) => setEditCorrectAnswer(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-9"
                    />
                    ) : (
                    <span className="text-xs font-bold text-slate-800 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md">
                        {q.correctAnswer}
                    </span>
                    )}
                </TableCell>

                {/* Topic */}
                <TableCell className="py-4">
                    {isEditing ? (
                    <input
                        value={editTopic}
                        onChange={(e) => setEditTopic(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-9"
                    />
                    ) : (
                    <span className="text-xs font-medium text-slate-600">
                        {q.topic || "General"}
                    </span>
                    )}
                </TableCell>

                {/* Type */}
                <TableCell className="py-4">
                    {isEditing ? (
                    <select
                        value={editType}
                        onChange={(e) => setEditType(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-9 bg-white cursor-pointer"
                    >
                        <option value="MCQ">MCQ</option>
                        <option value="TRUE_FALSE">True/False</option>
                        <option value="SHORT_ANSWER">Short Answer</option>
                    </select>
                    ) : (
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {q.type}
                    </span>
                    )}
                </TableCell>

                {/* Difficulty */}
                <TableCell className="py-4">
                    {isEditing ? (
                    <select
                        value={editDifficulty}
                        onChange={(e) => setEditDifficulty(e.target.value)}
                        className="w-full text-xs p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-[#A70202] h-9 bg-white cursor-pointer"
                    >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                    </select>
                    ) : (
                    <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getDifficultyColor(q.difficulty)}`}
                    >
                        {q.difficulty}
                    </span>
                    )}
                </TableCell>

                {/* Actions */}
                <TableCell className="pr-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                    {isEditing ? (
                        <>
                        <button
                            onClick={() => saveEdit(idx)}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-emerald-200 bg-white text-emerald-600 shadow-xs hover:bg-emerald-50 focus:outline-none cursor-pointer"
                            title="Save changes"
                        >
                            <Check size={14} />
                        </button>
                        <button
                            onClick={cancelEdit}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-slate-50 focus:outline-none cursor-pointer"
                            title="Cancel"
                        >
                            <X size={14} />
                        </button>
                        </>
                    ) : (
                        <>
                        <button
                            onClick={() => startEdit(idx)}
                            disabled={editingIndex !== null}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 shadow-xs hover:bg-slate-50 hover:text-slate-700 focus:outline-none cursor-pointer disabled:opacity-50"
                            title="Edit Row"
                        >
                            <Edit size={14} />
                        </button>
                        <button
                            onClick={() => deleteRow(idx)}
                            disabled={editingIndex !== null}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-rose-200 bg-white text-rose-500 shadow-xs hover:bg-rose-50 hover:text-rose-600 focus:outline-none cursor-pointer disabled:opacity-50"
                            title="Delete Row"
                        >
                            <Trash2 size={14} />
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

// Map custom Table components to standard ones if needed, or keeping it clean
const Body = TableBody;
