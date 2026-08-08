import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/types/question";
import { toast } from "sonner";
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
        isFeedbackOpen,
        setIsFeedbackOpen,
        resetPagination,
        clearRowSelection,
    } = useQuestionListStore();

    const currentUserId = (auth as any)?.data?.user?.id;
    const currentUserRole = (auth as any)?.data?.user?.role;
    const canManageBulk =
        currentUserRole === UserRole.SUPERADMIN ||
        currentUserRole === UserRole.ADMIN ||
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
    }, [filters?.search, filters?.category, filters?.difficulty, filters?.type, filters?.status, resetPagination]);

    const currentCursor = cursorsStack[currentPageIndex];

    const { data, isLoading: loading, error, refetch: fetchQuestions } = useQuestionBank({
        ...filters,
        cursor: currentCursor,
        limit: itemsPerPage,
    });

    const { questions = [], hasNextPage, nextCursor } = data ?? {};

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
                toast.error(err.response?.data?.message || "Failed to delete question permanently.");
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
                toast.success("Delete action undone.");
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
            toast.success(`Successfully deleted ${ids.length} questions.`);
            clearRowSelection();
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to bulk delete questions.");
        },
    });

    const bulkFeedbackMutation = useMutation({
        mutationFn: async ({ ids, feedback }: { ids: string[]; feedback: string }) => {
            await axiosPrivate.post("/questions/bulk/feedback", { ids, feedback });
        },
        onSuccess: (_, variables) => {
            toast.success(`Sent revision feedback for ${variables.ids.length} questions.`);
            clearRowSelection();
            setIsFeedbackOpen(false);
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to bulk send feedback.");
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
                        toast.info(`Reverted status for ${ids.length} question(s).`);
                        queryClient.invalidateQueries({ queryKey: ["questions"] });
                    } catch (err: any) {
                        toast.error(err.response?.data?.message || "Failed to undo question approval.");
                    }
                },
            });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to bulk approve questions.");
        },
    });

    const bulkStatusMutation = useMutation({
        mutationFn: async ({ ids, status }: { ids: string[]; status: string }) => {
            await axiosPrivate.post("/questions/bulk/status", { ids, status });
        },
        onSuccess: (_, variables) => {
            toast.success(`Resubmitted ${variables.ids.length} question(s) for review.`);
            clearRowSelection();
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update review status.");
        },
    });

    const handleBulkResubmitForReview = () => {
        if (selectedIds.length === 0) return;
        bulkStatusMutation.mutate({ ids: selectedIds, status: "PENDING_REVIEW" });
    };

    // Bulk Action Handlers
    const handleBulkApprove = () => {
        if (!canManageBulk) {
            toast.error("Only administrators and team leads can approve questions.");
            return;
        }

        const pendingRevisionSelected = selectedQuestions.filter(
            (q) => q.status === "PENDING_REVISION" || (q.status as string) === "NEEDS_REVISION"
        );

        if (pendingRevisionSelected.length > 0) {
            if (pendingRevisionSelected.length === selectedQuestions.length) {
                toast.error(
                    `Cannot approve questions. All ${selectedQuestions.length} selected question(s) are in Pending Revision status and must be resubmitted by the author first.`
                );
                return;
            } else {
                const validIds = selectedQuestions
                    .filter((q) => q.status !== "PENDING_REVISION" && (q.status as string) !== "NEEDS_REVISION")
                    .map((q) => q.id);

                toast.warning(
                    `Warning: ${pendingRevisionSelected.length} selected question(s) are in Pending Revision status and cannot be approved. Approving ${validIds.length} question(s) in Pending Review.`
                );

                if (validIds.length > 0) {
                    bulkApproveMutation.mutate(validIds);
                }
                return;
            }
        }

        bulkApproveMutation.mutate(selectedIds);
    };

    const handleBulkDelete = () => {
        const canDeleteAll = selectedQuestions.every((q) => {
            const authorId = typeof q.author === "object" ? (q.author as any).id : q.authorId;
            return (
                currentUserRole === UserRole.SUPERADMIN ||
                currentUserRole === UserRole.ADMIN ||
                authorId === currentUserId
            );
        });

        if (!canDeleteAll) {
            toast.error("You do not have permission to delete one or more of the selected questions.");
            return;
        }

        const queryKey = ["questions", { ...filters, cursor: currentCursor, limit: itemsPerPage }];
        const previousData = queryClient.getQueryData<any>(queryKey);
        const idsToDelete = [...selectedIds];

        clearRowSelection();

        // Optimistically remove deleted items from current cache view
        if (previousData) {
            const updatedQuestions = previousData.questions.filter((q: any) => !idsToDelete.includes(q.id));
            queryClient.setQueryData(queryKey, {
                ...previousData,
                questions: updatedQuestions,
            });
        }

        const batchKey = `bulk_${Date.now()}`;
        const timeoutId = setTimeout(async () => {
            delete pendingDeletes.current[batchKey];
            try {
                await axiosPrivate.post("/questions/bulk/delete", { ids: idsToDelete });
                queryClient.invalidateQueries({ queryKey: ["questions"] });
            } catch (err: any) {
                toast.error(err.response?.data?.message || "Failed to delete questions permanently.");
                if (previousData) {
                    queryClient.setQueryData(queryKey, previousData);
                }
            }
        }, 5000);

        pendingDeletes.current[batchKey] = timeoutId;

        showUndoToast({
            title: "Questions Deleted",
            message: `${idsToDelete.length} question${idsToDelete.length !== 1 ? "s" : ""} deleted`,
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
                toast.success("Bulk delete action undone.");
            },
        });
    };

    const handleBulkFeedbackSubmit = async (feedback: string) => {
        await bulkFeedbackMutation.mutateAsync({ ids: selectedIds, feedback });
    };

    const handleBulkFeedbackOpen = (id?: string) => {
        if (!canManageBulk) {
            toast.error("Only administrators can request question revisions.");
            return;
        }

        if (id) {
            setRowSelection({ [id]: true });
        }

        setIsFeedbackOpen(true);
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

    return {
        questions,
        hasNextPage,
        loading,
        error,
        fetchQuestions,
        currentPageIndex,
        cursorsStack,
        itemsPerPage,
        rowSelection,
        selectedIds,
        isFeedbackOpen,
        canManageBulk,
        bulkApproveMutation,
        bulkFeedbackMutation,
        bulkDeleteMutation,
        bulkStatusMutation,
        handleView,
        handleDelete,
        handleItemsPerPageChange,
        handleBulkApprove,
        handleBulkDelete,
        handleBulkFeedbackOpen,
        handleBulkFeedbackSubmit,
        handleBulkResubmitForReview,
        handleNext,
        handlePrevious,
        handlePageSelect,
        setRowSelection,
        setIsFeedbackOpen,
    };
}
