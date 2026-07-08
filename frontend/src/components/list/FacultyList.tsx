import { useEffect, useState } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { DataTable } from "@/components/ui/data-table";
import { QuestionBankColumn } from "@/components/list/columns/questionBankColumn";
import type { Question } from "@/types/question";
import { AlertCircle, RefreshCcw, FileQuestion } from "lucide-react";

type FetchState =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: Question[] }
    | { status: "error"; message: string };

function SkeletonRow() {
    return (
        <div className="flex gap-4 px-4 py-3 border-b border-gray-50 animate-pulse">
            <div className="h-4 bg-gray-100 rounded flex-[3]" />
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-20" />
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded flex-1" />
            <div className="h-4 bg-gray-100 rounded w-24" />
        </div>
    );
}

function FacultyList() {
    const axiosPrivate = useAxiosPrivate();
    const [state, setState] = useState<FetchState>({ status: "idle" });

    const fetchQuestions = async () => {
        setState({ status: "loading" });
        try {
            const response = await axiosPrivate.get("/questions/get");
            // API shape: { data: { questions: [...] }, message, success }
            const questions: Question[] = response.data?.data?.questions ?? [];
            console.log("questions:", questions);
            setState({ status: "success", data: questions });
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to fetch questions.";
            setState({ status: "error", message });
        }
    };

    useEffect(() => {
        fetchQuestions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col gap-6 p-8 w-full">

            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                        Question Bank
                    </h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Browse and manage all exam questions.
                    </p>
                </div>

                {state.status !== "loading" && (
                    <button
                        id="question-bank-refresh-btn"
                        onClick={fetchQuestions}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-[#A70202] transition-all duration-150 shadow-sm"
                    >
                        <RefreshCcw size={14} />
                        Refresh
                    </button>
                )}
            </div>

            {/* ── Loading skeleton ── */}
            {state.status === "loading" && (
                <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {/* Fake header */}
                    <div className="flex gap-4 px-4 py-3 bg-gray-50/80 border-b border-gray-100 animate-pulse">
                        {["flex-[3]", "flex-1", "w-20", "flex-1", "w-16", "flex-1", "w-24"].map(
                            (cls, i) => (
                                <div key={i} className={`h-3 bg-gray-200 rounded ${cls}`} />
                            )
                        )}
                    </div>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <SkeletonRow key={i} />
                    ))}
                </div>
            )}

            {/* ── Error state ── */}
            {state.status === "error" && (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-100 bg-red-50 py-16 text-center">
                    <AlertCircle size={36} className="text-[#A70202]" />
                    <div>
                        <p className="font-semibold text-gray-800">Something went wrong</p>
                        <p className="text-sm text-gray-500 mt-1">{state.message}</p>
                    </div>
                    <button
                        onClick={fetchQuestions}
                        className="mt-2 rounded-xl bg-[#A70202] px-5 py-2 text-sm font-medium text-white hover:bg-[#8f0101] transition-colors"
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* ── Empty state ── */}
            {state.status === "success" && state.data.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-gray-100 bg-white py-16 text-center shadow-sm">
                    <FileQuestion size={36} className="text-gray-300" />
                    <p className="font-semibold text-gray-600">No questions yet</p>
                    <p className="text-sm text-gray-400">Add your first question to get started.</p>
                </div>
            )}

            {/* ── Data table ── */}
            {state.status === "success" && state.data.length > 0 && (
                <>
                    {/* Result count pill */}
                    <div className="flex items-center gap-2">
                        <span className="rounded-full bg-[#E9B0B0] px-3 py-0.5 text-xs font-semibold text-[#A70202]">
                            {state.data.length} question{state.data.length !== 1 ? "s" : ""}
                        </span>
                    </div>

                    <DataTable
                        columns={QuestionBankColumn}
                        data={state.data}
                        searchPlaceholder="Search questions, tags, type..."
                    />
                </>
            )}
        </div>
    );
}

export default FacultyList;