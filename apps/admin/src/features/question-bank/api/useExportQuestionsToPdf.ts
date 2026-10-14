import { useState, useCallback } from "react";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  exportApprovedQuestionsToPdf,
  type ExportApprovedQuestionsParams,
} from "../services/questionPdfExportService";

export interface UseExportQuestionsToPdfOptions {
  currentCategory?: string;
  currentCategoryName?: string;
  totalApprovedCount?: number;
}

export function useExportQuestionsToPdf(options?: UseExportQuestionsToPdfOptions) {
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const currentUserName = (auth as any)?.data?.user?.name || "Faculty Reviewer";

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDirectExporting, setIsDirectExporting] = useState(false);
  const [dialogSelectedTypes, setDialogSelectedTypes] = useState<string[] | undefined>(undefined);

  /**
   * Export all approved questions in one go programmatically.
   * Directly fetches, compiles, and opens the PDF print/save dialog.
   */
  const exportAllApproved = useCallback(
    async (overrideParams?: Partial<ExportApprovedQuestionsParams>) => {
      setIsDirectExporting(true);
      const loadingToastId = toast.loading("Compiling all approved questions for PDF...");

      try {
        const result = await exportApprovedQuestionsToPdf({
          axiosPrivate,
          category: overrideParams?.category || options?.currentCategory,
          categoryName: overrideParams?.categoryName || options?.currentCategoryName || "All Subjects",
          generatedBy: currentUserName,
          ...overrideParams,
        });

        toast.dismiss(loadingToastId);
        return result;
      } catch (err: any) {
        toast.dismiss(loadingToastId);
        toast.error(err?.message || "Failed to export approved questions to PDF.");
        throw err;
      } finally {
        setIsDirectExporting(false);
      }
    },
    [axiosPrivate, currentUserName, options?.currentCategory, options?.currentCategoryName]
  );

  const openExportDialog = useCallback((defaultTypes?: string[]) => {
    setDialogSelectedTypes(defaultTypes && defaultTypes.length > 0 ? defaultTypes : undefined);
    setIsExportDialogOpen(true);
  }, []);

  const closeExportDialog = useCallback(() => {
    setIsExportDialogOpen(false);
  }, []);

  return {
    isExportDialogOpen,
    setIsExportDialogOpen,
    dialogSelectedTypes,
    openExportDialog,
    closeExportDialog,
    isDirectExporting,
    exportAllApproved,
  };
}
