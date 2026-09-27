import React from "react";
import { Tag } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CategoriesEmptyStateProps {
  searchTerm?: string;
}

export function CategoriesEmptyState({ searchTerm }: CategoriesEmptyStateProps) {
  return (
    <Card className="py-14 text-center flex flex-col items-center justify-center gap-2.5 bg-card border border-border rounded-xl p-6 shadow-2xs font-sans">
      <Tag size={36} className="text-muted-foreground/40 stroke-[1.5]" />
      <p className="font-bold text-foreground text-xs">No Subjects Found</p>
      <p className="text-[11px] max-w-xs text-muted-foreground">
        {searchTerm
          ? `No subject categories match "${searchTerm}".`
          : "No subject categories created yet."}
      </p>
    </Card>
  );
}

export default CategoriesEmptyState;
