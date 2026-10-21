import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/types/question";
import { showFeedback } from "@/components/modal";
import { showUndoToast } from "@/utils/toast";
import { useQuestionBank, type QuestionFilters } from "@/features/question-bank";
import { useQuestionListStore } from "@/store/QuestionListStore";

export function useQuestionListActions(filters?: QuestionFilters) {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const queryClient = useQueryClient();
    const pendingDeletes = useRef<{ [id: string]: any }>({});

    const {
        cursorsStack,
        setCursorsStack,
        currentPageIndex,
        setCurrentPageIndex,
        itemsPerPage,
        setItemsPerPage,
        rowSelection,
        setRowSelection,
        resetPagination,
        clearRowSelection,
    } = useQuestionListStore();

    const currentUserId = (auth as any)?.data?.user?.id;
    const currentUserRole = (auth as any)?.data?.user?.role;
    const r = String(currentUserRole || "").toUpperCase();
    const canManageBulk =
        r === "SUPERADMIN" ||
        r === "DEAN" ||
        r === "TEAMLEAD" ||
        currentUserRole === UserRole.SUPERADMIN ||
        currentUserRole === UserRole.DEAN ||
        currentUserRole === UserRole.TEAMLEAD;

    // Clean up pending delete timeouts on unmount
    useEffect(() => {
        return () => {
            Object.keys(pendingDeletes.current).forEach((id) => {
                const tId = pendingDeletes.current[id];
                clearTimeout(tId);
                axiosPrivate.delete(`/questions/${id}`).catch((err) => {
                    console.error("Failed to execute pending delete on unmount:", err);
                });
            });
        };
    }, [axiosPrivate]);

    // Reset pagination and row selection when search filters change
    useEffect(() => {
        resetPagination();
    }, [filters?.search, filters?.category, filters?.topic, filters?.difficulty, filters?.type, filters?.status, resetPagination]);

    const currentCursor = cursorsStack[currentPageIndex];

    const { data, isLoading: loading, error, refetch: fetchQuestions } = useQuestionBank({
        ...filters,
        cursor: currentCursor,
        limit: itemsPerPage,
    });

    const { questions = [], hasNextPage, nextCursor, total } = data ?? {};

    // Selection details
    const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
    const selectedQuestions = questions.filter((q) => rowSelection[q.id]);

    // Single item delete handler with Sonner undo toast
    const handleDelete = (id: string) => {
        const queryKey = ["questions", { ...filters, cursor: currentCursor, limit: itemsPerPage }];
        const previousData = queryClient.getQueryData<any>(queryKey);
        if (!previousData) return;

        const questionObj = previousData.questions.find((q: any) => q.id === id);
        const questionText = questionObj?.question || "Selected question";

        const updatedQuestions = previousData.questions.filter((q: any) => q.id !== id);
        queryClient.setQueryData(queryKey, {
            ...previousData,
            questions: updatedQuestions,
        });

        const timeoutId = setTimeout(async () => {
            delete pendingDeletes.current[id];
            try {
                await axiosPrivate.delete(`/questions/${id}`);
                queryClient.invalidateQueries({ queryKey: ["questions"] });
            } catch (err: any) {
                showFeedback.error(err.response?.data?.message || "Failed to delete question permanently.");
                queryClient.setQueryData(queryKey, previousData);
            }
        }, 4000);

        pendingDeletes.current[id] = timeoutId;

        showUndoToast({
            title: "Question Deleted",
            message: questionText,
            onUndo: () => {
                const tId = pendingDeletes.current[id];
                if (tId) {
                    clearTimeout(tId);
                    delete pendingDeletes.current[id];
                }
                queryClient.setQueryData(queryKey, previousData);
                showFeedback.success("Delete action undone.");
            },
            duration: 4000,
        });
    };

    const handleView = (id: string) => {
        navigate(`/question-bank/view/${id}`, {
            state: { from: window.location.pathname + window.location.search },
        });
    };

    const handleItemsPerPageChange = (newLimit: number) => {
        setItemsPerPage(newLimit);
    };

    // Bulk Mutations
    const bulkDeleteMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            await axiosPrivate.post("/questions/bulk/delete", { ids });
        },
        onSuccess: (_, ids) => {
            showFeedback.success(`Successfully deleted ${ids.length} questions.`);
            clearRowSelection();
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
        onError: (err: any) => {
            showFeedback.error(err.response?.data?.message || "Failed to bulk delete questions.");
        },
    });

    const bulkApproveMutation = useMutation({
        mutationFn: async (ids: string[]) => {
            await axiosPrivate.post("/questions/bulk/approve", { ids });
        },
        onSuccess: (_, ids) => {
            clearRowSelection();
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            showUndoToast({
                title: "Questions Approved",
                message: `${ids.length} question${ids.length !== 1 ? "s" : ""} marked as Approved`,
                duration: 5000,
                onUndo: async () => {
                    try {
                        await axiosPrivate.post("/questions/bulk/status", {
                            ids,
                            status: "PENDING_REVIEW",
                        });
                        showFeedback.info(`Reverted status for ${ids.length} question(s).`);
                        queryClient.invalidateQueries({ queryKey: ["questions"] });
                    } catch (err: any) {
                        showFeedback.error(err.response?.data?.message || "Failed to undo question approval.");
                    }
                },
            });
        },
        onError: (err: any) => {
            showFeedback.error(err.response?.data?.message || "Failed to bulk approve questions.");
        },
    });

    // Bulk Action Handlers
    const handleBulkApprove = () => {
        if (!canManageBulk) {
            showFeedback.error("Only administrators and team leads can approve questions.");
            return;
        }

        bulkApproveMutation.mutate(selectedIds);
    };

    const handleBulkDelete = () => {
        const canDeleteAll = selectedQuestions.every((q) => {
            const authorId = typeof q.author === "object" ? (q.author as any).id : q.authorId;
            return (
                r === "SUPERADMIN" ||
                r === "DEAN" ||
                r === "TEAMLEAD" ||
                currentUserRole === UserRole.SUPERADMIN ||
                currentUserRole === UserRole.DEAN ||
                currentUserRole === UserRole.TEAMLEAD ||
                ((r === "TEACHER" || currentUserRole === UserRole.TEACHER) && authorId === currentUserId && q.status !== "APPROVED")
            );
        });

        if (!canDeleteAll) {
            showFeedback.error("You do not have permission to delete some of the selected questions.");
            return;
        }

        const idsToDelete = [...selectedIds];
        const queryKey = ["questions", { ...filters, cursor: currentCursor, limit: itemsPerPage }];
        const previousData = queryClient.getQueryData<any>(queryKey);

        if (previousData) {
            const updatedQuestions = previousData.questions.filter((q: any) => !idsToDelete.includes(q.id));
            queryClient.setQueryData(queryKey, {
                ...previousData,
                questions: updatedQuestions,
            });
        }

        clearRowSelection();

        const batchKey = `batch_${Date.now()}`;
        const timeoutId = setTimeout(async () => {
            delete pendingDeletes.current[batchKey];
            try {
                await axiosPrivate.post("/questions/bulk/delete", { ids: idsToDelete });
                queryClient.invalidateQueries({ queryKey: ["questions"] });
            } catch (err: any) {
                showFeedback.error(err.response?.data?.message || "Failed to permanently delete questions.");
                if (previousData) {
                    queryClient.setQueryData(queryKey, previousData);
                }
            }
        }, 5000);

        pendingDeletes.current[batchKey] = timeoutId;

        showUndoToast({
            title: "Questions Deleted",
            message: `${idsToDelete.length} question(s) scheduled for deletion`,
            duration: 5000,
            onUndo: () => {
                const tId = pendingDeletes.current[batchKey];
                if (tId) {
                    clearTimeout(tId);
                    delete pendingDeletes.current[batchKey];
                }
                if (previousData) {
                    queryClient.setQueryData(queryKey, previousData);
                }
                showFeedback.success("Bulk delete action undone.");
            },
        });
    };

    // Pagination Navigation Handlers
    const handleNext = () => {
        if (hasNextPage && nextCursor) {
            setCursorsStack((prev) => {
                const nextStack = [...prev];
                nextStack[currentPageIndex + 1] = nextCursor;
                return nextStack;
            });
            setCurrentPageIndex((prev) => prev + 1);
            clearRowSelection();
        }
    };

    const handlePrevious = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex((prev) => prev - 1);
            clearRowSelection();
        }
    };

    const handlePageSelect = (page: number) => {
        const pageIndex = page - 1;
        if (pageIndex >= 0 && pageIndex < cursorsStack.length) {
            setCurrentPageIndex(pageIndex);
            clearRowSelection();
        }
    };

    // Paraphrase Dialog state
    const [isParaphraseOpen, setIsParaphraseOpen] = useState(false);

    const handleOpenParaphrase = () => {
        if (selectedQuestions.length === 0) {
            showFeedback.error("Please select at least one question to paraphrase.");
            return;
        }
        if (selectedQuestions.length > 5) {
            showFeedback.error(
                `Bulk paraphrasing has a limit of 5 questions per batch. You currently have ${selectedQuestions.length} questions selected.`
            );
            return;
        }
        setIsParaphraseOpen(true);
    };

    const handleParaphraseSuccess = () => {
        clearRowSelection();
        queryClient.invalidateQueries({ queryKey: ["questions"] });
    };

    return {
        questions,
        hasNextPage,
        total,
        loading,
        error,
        fetchQuestions,
        currentPageIndex,
        cursorsStack,
        itemsPerPage,
        rowSelection,
        selectedIds,
        selectedQuestions,
        canManageBulk,
        bulkApproveMutation,
        bulkDeleteMutation,
        handleView,
        handleDelete,
        handleItemsPerPageChange,
        handleBulkApprove,
        handleBulkDelete,
        handleNext,
        handlePrevious,
        handlePageSelect,
        setRowSelection,
        isParaphraseOpen,
        setIsParaphraseOpen,
        handleOpenParaphrase,
        handleParaphraseSuccess,
    };
}
