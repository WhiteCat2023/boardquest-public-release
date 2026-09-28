import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import type {
  ParaphraseTone,
  ParaphrasedItemState,
  BulkParaphraseDialogProps,
} from "./paraphraseTypes";

export function useBulkParaphrase({
  open,
  onOpenChange,
  selectedQuestions,
  onSuccess,
  onApplyToForm,
}: Pick<
  BulkParaphraseDialogProps,
  "open" | "onOpenChange" | "selectedQuestions" | "onSuccess" | "onApplyToForm"
>) {
  const axiosPrivate = useAxiosPrivate();

  const [tone, setTone] = useState<ParaphraseTone>("BOARD_EXAM");
  const [items, setItems] = useState<ParaphrasedItemState[]>([]);
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Initialize questions state whenever dialog opens
  useEffect(() => {
    if (open && selectedQuestions.length > 0) {
      if (selectedQuestions.length > 5) {
        toast.error(
          `Bulk paraphrasing has a limit of 5 questions per batch. You selected ${selectedQuestions.length} questions.`
        );
        onOpenChange(false);
        return;
      }

      const initialItems: ParaphrasedItemState[] = selectedQuestions.slice(0, 5).map(
        (q): ParaphrasedItemState => ({
          id: q.id,
          original: q.question || "",
          current: q.question || "",
          alternatives: [],
          status: "idle",
          isReverted: true,
          topic: q.topic || "General",
          difficulty: q.difficulty || "MEDIUM",
          variationIndex: 0,
        })
      );
      setItems(initialItems);

      // Auto-trigger bulk paraphrase upon opening
      triggerBulkParaphrase(initialItems, "BOARD_EXAM");
    } else {
      setItems([]);
    }
  }, [open, selectedQuestions]);

  // Bulk paraphrase API call
  const triggerBulkParaphrase = async (
    targetItems: ParaphrasedItemState[],
    selectedTone: ParaphraseTone
  ) => {
    if (targetItems.length === 0) return;

    if (targetItems.length > 5) {
      toast.error("Bulk paraphrasing is limited to a maximum of 5 questions per batch.");
      return;
    }

    setIsBulkLoading(true);
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        status: "loading",
      }))
    );

    try {
      const payload = {
        tone: selectedTone,
        questions: targetItems.map((it) => ({
          id: it.id,
          question: it.original,
          topic: it.topic,
          difficulty: it.difficulty,
          variationIndex: it.variationIndex,
        })),
      };

      const response = await axiosPrivate.post(
        "/questions/bulk/paraphrase",
        payload
      );
      const results: Array<{
        id: string;
        original: string;
        paraphrased: string;
        alternatives?: string[];
      }> = response.data?.data?.results || [];

      const resultMap = new Map(results.map((r) => [r.id, r]));

      setItems((prev) =>
        prev.map((item) => {
          const res = resultMap.get(item.id);
          if (res && res.paraphrased) {
            return {
              ...item,
              current: res.paraphrased,
              alternatives: res.alternatives || [],
              status: "paraphrased",
              isReverted: false,
            };
          }
          return {
            ...item,
            status: "error",
          };
        })
      );

      toast.success(`Paraphrased ${results.length} question(s) successfully!`);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          "Failed to paraphrase selected questions."
      );
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          status: it.isReverted ? "reverted" : "idle",
        }))
      );
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Single question re-paraphrase handler
  const handleSingleReParaphrase = async (id: string) => {
    const targetIndex = items.findIndex((it) => it.id === id);
    if (targetIndex === -1) return;

    const targetItem = items[targetIndex];
    const nextVariationIndex = targetItem.variationIndex + 1;

    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, status: "loading", variationIndex: nextVariationIndex }
          : it
      )
    );

    try {
      const payload = {
        tone,
        questions: [
          {
            id: targetItem.id,
            question: targetItem.original,
            topic: targetItem.topic,
            difficulty: targetItem.difficulty,
            variationIndex: nextVariationIndex,
          },
        ],
      };

      const response = await axiosPrivate.post(
        "/questions/bulk/paraphrase",
        payload
      );
      const results = response.data?.data?.results || [];
      const res = results[0];

      if (res && res.paraphrased) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === id
              ? {
                  ...it,
                  current: res.paraphrased,
                  alternatives: res.alternatives || it.alternatives,
                  status: "paraphrased",
                  isReverted: false,
                  variationIndex: nextVariationIndex,
                }
              : it
          )
        );
        toast.success("New question variant generated!");
      } else {
        throw new Error("No variant returned");
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to re-paraphrase question."
      );
      setItems((prev) =>
        prev.map((it) =>
          it.id === id
            ? { ...it, status: it.isReverted ? "reverted" : "paraphrased" }
            : it
        )
      );
    }
  };

  // Revert a single question back to its original phrasing
  const handleRevertSingle = (id: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return {
            ...it,
            current: it.original,
            status: "reverted",
            isReverted: true,
          };
        }
        return it;
      })
    );
    toast.info("Reverted back to original wording.");
  };

  // Revert all questions back to original
  const handleRevertAll = () => {
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        current: it.original,
        status: "reverted",
        isReverted: true,
      }))
    );
    toast.info("Reverted all questions to original wording.");
  };

  // Apply an alternative variant directly
  const handleSelectAlternative = (id: string, altText: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          return {
            ...it,
            current: altText,
            status: "paraphrased",
            isReverted: false,
          };
        }
        return it;
      })
    );
  };

  // Manual inline text edit
  const handleManualEdit = (id: string, newText: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const isIdentical = newText.trim() === it.original.trim();
          return {
            ...it,
            current: newText,
            status: isIdentical ? "reverted" : "paraphrased",
            isReverted: isIdentical,
          };
        }
        return it;
      })
    );
  };

  // Apply & Save changes to backend
  const handleApplyChanges = async () => {
    const modifiedItems = items.filter(
      (it) =>
        it.current.trim().length > 0 &&
        it.current.trim() !== it.original.trim()
    );

    if (modifiedItems.length === 0) {
      toast.info(
        "No modifications detected. Questions remain at original wording."
      );
      onOpenChange(false);
      return;
    }

    if (onApplyToForm && items.length > 0) {
      onApplyToForm(items[0].current.trim());
      onOpenChange(false);
      return;
    }

    setIsSaving(true);
    try {
      const updates = modifiedItems.map((it) => ({
        id: it.id,
        question: it.current.trim(),
      }));

      await axiosPrivate.post("/questions/bulk/paraphrase/apply", {
        updates,
      });

      toast.success(
        `Successfully updated ${updates.length} question stem${
          updates.length !== 1 ? "s" : ""
        }!`
      );

      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to save paraphrased questions."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Statistics
  const changedCount = useMemo(() => {
    return items.filter(
      (it) =>
        it.current.trim().length > 0 &&
        it.current.trim() !== it.original.trim()
    ).length;
  }, [items]);

  const revertedCount = useMemo(() => {
    return items.filter((it) => it.isReverted).length;
  }, [items]);

  return {
    tone,
    setTone,
    items,
    isBulkLoading,
    isSaving,
    changedCount,
    revertedCount,
    triggerBulkParaphrase,
    handleSingleReParaphrase,
    handleRevertSingle,
    handleRevertAll,
    handleSelectAlternative,
    handleManualEdit,
    handleApplyChanges,
  };
}
