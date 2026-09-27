import { PlusCircle } from "lucide-react";

interface IndividualQuestionHeaderProps {
  isEditMode?: boolean;
  authorName: string;
}

export function IndividualQuestionHeader({
  isEditMode = false,
  authorName,
}: IndividualQuestionHeaderProps) {
  return (
    <div className="p-3 px-4.5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-2.5 bg-muted/40">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shadow-2xs">
          <PlusCircle size={16} className="stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground tracking-tight">
            {isEditMode
              ? "Curriculum Revision Desk"
              : "Curriculum Drafting Desk"}
          </h2>
          <p className="text-[10px] text-muted-foreground font-medium">
            Formulate evaluation questions linked to standard benchmarks
          </p>
        </div>
      </div>

      <div className="flex flex-col items-start md:items-end text-xs text-muted-foreground font-medium md:text-right border-l-2 md:border-l-0 md:border-r-2 border-primary/30 pl-2.5 md:pl-0 md:pr-2.5 py-0.5">
        <span className="text-[8px] text-muted-foreground/70 font-semibold uppercase tracking-wider">
          Authoring profile
        </span>
        <span className="text-foreground font-bold text-xs">
          {authorName}
        </span>
      </div>
    </div>
  );
}

export default IndividualQuestionHeader;
