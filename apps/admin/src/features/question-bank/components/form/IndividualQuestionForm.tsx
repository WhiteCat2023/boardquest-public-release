import React from "react";
import BulkParaphraseDialog from "../dialog/BulkParaphraseDialog";
import { QuestionMetaFields } from "./QuestionMetaFields";
import {
  QuestionFormatSelector,
  type QuestionFormat,
} from "./QuestionFormatSelector";
import { QuestionAnswersSection } from "./QuestionAnswersSection";
import { IndividualQuestionHeader } from "./IndividualQuestionHeader";
import { QuestionStemSection } from "./QuestionStemSection";
import { IndividualQuestionActionBar } from "./IndividualQuestionActionBar";
import { useIndividualQuestionForm } from "./useIndividualQuestionForm";

interface IndividualQuestionFormProps {
  questionId?: string;
  isEditMode?: boolean;
  onSuccessNavigate: () => void;
  onCancel: () => void;
}

export function IndividualQuestionForm({
  questionId,
  isEditMode = false,
  onSuccessNavigate,
  onCancel,
}: IndividualQuestionFormProps) {
  const {
    authorName,
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
    imageUrl,
    setImageUrl,
    status,
    mcqChoices,
    mcqChoiceImages,
    mcqCorrectIndex,
    setMcqCorrectIndex,
    handleMcqChoiceChange,
    handleChoiceImageChange,
    handleAddChoice,
    handleRemoveChoice,
    tfCorrect,
    setTfCorrect,
    saCorrectAnswer,
    setSaCorrectAnswer,
    isParaphraseOpen,
    setIsParaphraseOpen,
    originalBackup,
    isNotOriginalQuestion,
    handleOpenParaphraser,
    handleApplyParaphrase,
    handleRestoreOriginal,
    isSubmitting,
    handleSubmit,
  } = useIndividualQuestionForm({
    questionId,
    isEditMode,
    onSuccessNavigate,
  });

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border/80 rounded-xl shadow-2xs overflow-hidden flex flex-col font-sans"
      >
        {/* Header Bar */}
        <IndividualQuestionHeader
          isEditMode={isEditMode}
          authorName={authorName}
        />

        {/* Form Body */}
        <div className="p-4 md:p-5 flex flex-col gap-3.5">
          {/* Section 1: Subject, Topic, Difficulty */}
          <QuestionMetaFields
            categoryId={categoryId}
            onCategoryChange={setCategoryId}
            topic={topic}
            onTopicChange={setTopic}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
          />

          {/* Section 2: Question Format */}
          <QuestionFormatSelector
            format={(format as QuestionFormat) || "MCQ"}
            onFormatChange={(fmt) => setFormat(fmt)}
          />

          {/* Section 3: Question Text & Image */}
          <QuestionStemSection
            questionWording={questionWording}
            setQuestionWording={setQuestionWording}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            isNotOriginalQuestion={isNotOriginalQuestion}
            onRestoreOriginal={handleRestoreOriginal}
          />

          {/* Section 4: Option Specifications & Correct Key Designation */}
          <QuestionAnswersSection
            format={(format as QuestionFormat) || "MCQ"}
            mcqChoices={mcqChoices}
            mcqChoiceImages={mcqChoiceImages}
            mcqCorrectIndex={mcqCorrectIndex}
            onMcqChoiceChange={handleMcqChoiceChange}
            onChoiceImageChange={handleChoiceImageChange}
            onSetMcqCorrectIndex={setMcqCorrectIndex}
            onAddMcqChoice={handleAddChoice}
            onRemoveMcqChoice={handleRemoveChoice}
            tfCorrect={tfCorrect}
            onTfCorrectChange={setTfCorrect}
            saCorrectAnswer={saCorrectAnswer}
            onSaCorrectAnswerChange={setSaCorrectAnswer}
          />
        </div>

        {/* Section 5: Action Bar */}
        <IndividualQuestionActionBar
          isEditMode={isEditMode}
          status={status}
          isSubmitting={isSubmitting}
          isNotOriginalQuestion={isNotOriginalQuestion}
          onCancel={onCancel}
          onRestoreOriginal={handleRestoreOriginal}
          onOpenParaphraser={handleOpenParaphraser}
        />
      </form>

      {/* AI Question Paraphraser Modal */}
      <BulkParaphraseDialog
        open={isParaphraseOpen}
        onOpenChange={setIsParaphraseOpen}
        selectedQuestions={[
          {
            id: questionId || "active-form-question",
            question: originalBackup?.question || questionWording,
            topic: topic || "General",
            difficulty: (difficulty as any) || "MEDIUM",
          } as any,
        ]}
        onApplyToForm={handleApplyParaphrase}
      />
    </>
  );
}

export default IndividualQuestionForm;
