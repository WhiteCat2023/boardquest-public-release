import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import CustomSelectWithLabel from "@/components/custom/select/Select";
import { useCategories } from "@/features/question-bank";

interface QuestionMetaFieldsProps {
  categoryId: string;
  onCategoryChange: (val: string) => void;
  topic: string;
  onTopicChange: (val: string) => void;
  difficulty: string;
  onDifficultyChange: (val: string) => void;
}

export function QuestionMetaFields({
  categoryId,
  onCategoryChange,
  topic,
  onTopicChange,
  difficulty,
  onDifficultyChange,
}: QuestionMetaFieldsProps) {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {/* Category selection */}
      <div className="flex flex-col gap-1">
        <CustomSelectWithLabel
          label="Subject"
          value={categoryId}
          onValueChange={onCategoryChange}
        >
          {isLoading ? (
            <SelectItem value="loading" disabled>
              Loading Subjects...
            </SelectItem>
          ) : categories.length === 0 ? (
            <SelectItem value="none" disabled>
              No Subjects Available
            </SelectItem>
          ) : (
            categories.map((cat: any) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))
          )}
        </CustomSelectWithLabel>
      </div>

      {/* Benchmark Topic */}
      <div className="flex flex-col gap-1">
        <Label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider">
          Topic
        </Label>
        <Input
          type="text"
          placeholder="e.g. Clinical Chemistry"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          className="bg-muted/40 border-border rounded-lg focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground text-xs h-8 placeholder:text-muted-foreground"
        />
      </div>

      {/* Difficulty Level */}
      <div className="flex flex-col gap-1">
        <CustomSelectWithLabel
          label="Difficulty"
          value={difficulty}
          onValueChange={onDifficultyChange}
        >
          <SelectItem value="EASY">Easy Level</SelectItem>
          <SelectItem value="MEDIUM">Medium Level</SelectItem>
          <SelectItem value="HARD">Hard Level</SelectItem>
        </CustomSelectWithLabel>
      </div>
    </div>
  );
}

export default QuestionMetaFields;
