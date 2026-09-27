import React from "react";
import { BookOpen, PanelLeftOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AddQuestionButton from "@/components/custom/button/AddQuestionButton";

interface QuestionLibraryHeaderProps {
  title: string;
  description: string;
  badgeLabel: string;
  isSidebarOpen: boolean;
  onOpenSidebar: () => void;
}

export function QuestionLibraryHeader({
  title,
  description,
  badgeLabel,
  isSidebarOpen,
  onOpenSidebar,
}: QuestionLibraryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border font-sans">
      <div className="flex items-center gap-2.5">
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={onOpenSidebar}
            className="hidden lg:flex p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted border border-border rounded-lg transition-colors cursor-pointer"
            title="Show subjects panel"
          >
            <PanelLeftOpen size={16} />
          </button>
        )}
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
            {title}
            <Badge
              variant="outline"
              className="gap-1.5 px-2.5 py-0.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full border-primary/20 shadow-2xs"
            >
              <BookOpen size={12} />
              {badgeLabel}
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <AddQuestionButton />
      </div>
    </div>
  );
}

export default QuestionLibraryHeader;
