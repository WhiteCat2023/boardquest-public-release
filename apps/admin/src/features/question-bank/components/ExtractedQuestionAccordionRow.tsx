import {
  type ExtractedQuestionItem,
  type ExtractedQuestionAccordionRowProps,
  normalizeChoices,
} from "./extracted/extractedTypes";
import {
  ExtractedQuestionSummaryRow,
  ExtractedQuestionDetailPanel,
} from "./extracted";

export type { ExtractedQuestionItem, ExtractedQuestionAccordionRowProps };
export { normalizeChoices };

export default function ExtractedQuestionAccordionRow({
  index,
  question,
  isExpanded,
  isDuplicate,
  onToggleExpand,
  onUpdateQuestion,
  onDelete,
}: ExtractedQuestionAccordionRowProps) {
  const choices = normalizeChoices(question.choices);
  const currentCorrectAnswer = question.correctAnswer || "";

  const handleFieldChange = (
    field: keyof ExtractedQuestionItem,
    value: any
  ) => {
    onUpdateQuestion({
      ...question,
      [field]: value,
    });
  };

  const handleTypeChange = (newType: string) => {
    let updatedChoices = choices;
    let updatedCorrectAnswer = currentCorrectAnswer;

    if (newType === "TRUE_FALSE") {
      updatedChoices = ["True", "False"];
      if (updatedCorrectAnswer.toLowerCase() !== "false") {
        updatedCorrectAnswer = "True";
      } else {
        updatedCorrectAnswer = "False";
      }
    } else if (newType === "MCQ") {
      if (updatedChoices.length < 2) {
        updatedChoices = ["Option 1", "Option 2", "Option 3", "Option 4"];
        updatedCorrectAnswer = updatedChoices[0];
      }
    }

    onUpdateQuestion({
      ...question,
      type: newType,
      choices: updatedChoices,
      correctAnswer: updatedCorrectAnswer,
    });
  };

  const handleChoicesChange = (
    newChoices: string[],
    newCorrectAnswer?: string
  ) => {
    onUpdateQuestion({
      ...question,
      choices: newChoices,
      ...(newCorrectAnswer !== undefined
        ? { correctAnswer: newCorrectAnswer }
        : {}),
    });
  };

  return (
    <>
      <ExtractedQuestionSummaryRow
        index={index}
        question={question}
        choices={choices}
        isExpanded={isExpanded}
        isDuplicate={isDuplicate}
        onToggleExpand={onToggleExpand}
        onDelete={onDelete}
      />

      {isExpanded && (
        <ExtractedQuestionDetailPanel
          index={index}
          question={question}
          choices={choices}
          onFieldChange={handleFieldChange}
          onTypeChange={handleTypeChange}
          onChoicesChange={handleChoicesChange}
          onToggleExpand={onToggleExpand}
          onDelete={onDelete}
        />
      )}
    </>
  );
}
