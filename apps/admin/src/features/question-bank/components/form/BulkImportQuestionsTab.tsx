import React from "react";
import { useCategories } from "@/features/question-bank";
import { useExtractedQuestionsStore } from "@/store/QuestionBankStore";
import UploadZone from "../UploadZone";
import ExtractedFilePreview from "../../pages/ExtractedFilePreview";

export function BulkImportQuestionsTab() {
  const { data: categories = [] } = useCategories();
  const { extractedQuestions } = useExtractedQuestionsStore();

  return (
    <div className="animate-in fade-in duration-200">
      {extractedQuestions.length === 0 ? (
        <UploadZone categories={categories} />
      ) : (
        <ExtractedFilePreview />
      )}
    </div>
  );
}

export default BulkImportQuestionsTab;
