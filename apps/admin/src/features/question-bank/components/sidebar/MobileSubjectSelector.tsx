import React from "react";
import { BookOpen } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MobileSubjectSelectorProps {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  totalQuestionsCount: number;
  getQuestionCount: (cat: any) => number;
}

export function MobileSubjectSelector({
  categories,
  selectedCategory,
  onSelectCategory,
  totalQuestionsCount,
  getQuestionCount,
}: MobileSubjectSelectorProps) {
  return (
    <div className="lg:hidden flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-card shadow-2xs font-sans">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <BookOpen size={13} className="text-primary" /> Subject Filter (
          {categories.length})
        </span>
        {selectedCategory && selectedCategory !== "ALL" && (
          <button
            type="button"
            onClick={() => onSelectCategory("ALL")}
            className="text-[10.5px] font-bold text-primary hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
      <Select
        value={selectedCategory || "ALL"}
        onValueChange={(val) => onSelectCategory(val)}
      >
        <SelectTrigger className="w-full h-8.5 text-xs font-semibold bg-background border-border rounded-lg">
          <SelectValue placeholder="All Subjects" />
        </SelectTrigger>
        <SelectContent className="max-h-64">
          <SelectItem value="ALL">
            <span className="font-bold flex items-center gap-2">
              <span>All Subjects</span>
              <span className="text-[10px] font-mono font-normal text-muted-foreground">
                ({totalQuestionsCount})
              </span>
            </span>
          </SelectItem>
          {categories.map((cat: any) => {
            const count = getQuestionCount(cat);
            return (
              <SelectItem key={cat.id} value={cat.id}>
                <span className="flex items-center gap-2">
                  <span className="font-medium">{cat.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    ({count})
                  </span>
                </span>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export default MobileSubjectSelector;
