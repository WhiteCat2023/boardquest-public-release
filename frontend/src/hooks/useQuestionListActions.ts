import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { UserRole } from "@/types/question";
import { toast } from "sonner";
import { showUndoToast } from "@/utils/toast";
import { useQuestionBank, type QuestionFilters } from "@/hooks/useQuestionBank";
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
        navigate(`/question-bank/view/${id}`);
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

    const bulkPublishMutation = useMutation({
        mutationFn: async ({ ids, isPublished }: { ids: string[]; isPublished: boolean }) => {
            await axiosPrivate.post("/questions/bulk/publish", { ids, isPublished });
        },
        onSuccess: (_, variables) => {
            toast.success(
                `Successfully ${variables.isPublished ? "published" : "unpublished"} ${variables.ids.length} questions.`
            );
            clearRowSelection();
            queryClient.invalidateQueries({ queryKey: ["questions"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to bulk update publish state.");
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

    // Bulk Action Handlers
    const handleBulkDelete = () => {
        const hasPublished = selectedQuestions.some((q) => q.isPublished);
        if (hasPublished) {
            toast.error("Cannot delete published questions. Please unpublish them first.");
            return;
        }

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

        if (window.confirm(`Are you sure you want to delete the ${selectedIds.length} selected questions?`)) {
            bulkDeleteMutation.mutate(selectedIds);
        }
    };

    const handleBulkPublish = (isPublished: boolean) => {
        if (!canManageBulk) {
            toast.error("Only administrators can publish/unpublish questions.");
            return;
        }

        if (isPublished) {
            const hasUnapproved = selectedQuestions.some((q) => q.status !== "APPROVED");
            if (hasUnapproved) {
                toast.error("Only approved questions can be published. Please check your selection.");
                return;
            }
        }

        bulkPublishMutation.mutate({ ids: selectedIds, isPublished });
    };

    const handleBulkFeedbackSubmit = async (feedback: string) => {
        await bulkFeedbackMutation.mutateAsync({ ids: selectedIds, feedback });
    };

    const handleBulkFeedbackOpen = () => {
        if (!canManageBulk) {
            toast.error("Only administrators can request question revisions.");
            return;
        }

        const hasPublished = selectedQuestions.some((q) => q.isPublished);
        if (hasPublished) {
            toast.error("Cannot request revision on published questions. Please unpublish them first.");
            return;
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
        bulkPublishMutation,
        bulkFeedbackMutation,
        bulkDeleteMutation,
        handleView,
        handleDelete,
        handleItemsPerPageChange,
        handleBulkDelete,
        handleBulkPublish,
        handleBulkFeedbackOpen,
        handleBulkFeedbackSubmit,
        handleNext,
        handlePrevious,
        handlePageSelect,
        setRowSelection,
        setIsFeedbackOpen,
    };
}
