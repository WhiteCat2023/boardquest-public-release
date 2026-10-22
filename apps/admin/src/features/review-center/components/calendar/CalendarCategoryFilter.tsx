import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CategoryFilterItem } from "./types";

interface CalendarCategoryFilterProps {
  categories: CategoryFilterItem[];
  onToggleCategory: (id: string) => void;
}

export function CalendarCategoryFilter({
  categories,
  onToggleCategory,
}: CalendarCategoryFilterProps) {
  return (
    <div className="bg-card border border-border/80 rounded-2xl p-3 shadow-2xs font-sans">
      <h3 className="text-xs font-bold text-foreground tracking-tight mb-2.5">
        My Calendars
      </h3>

      <div className="space-y-2">
        {categories.map((cat) => (
          <label
            key={cat.id}
            className="flex items-center gap-2 cursor-pointer text-[11px] font-medium text-foreground/90 hover:text-primary transition-colors select-none group"
          >
            <Checkbox
              checked={cat.checked}
              onCheckedChange={() => onToggleCategory(cat.id)}
              className="size-3.5 rounded-sm border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <span className="truncate group-hover:underline">{cat.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default CalendarCategoryFilter;
