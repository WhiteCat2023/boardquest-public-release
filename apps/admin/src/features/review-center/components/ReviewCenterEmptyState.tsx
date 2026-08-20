import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewCenterEmptyStateProps {
  hasActiveFilters: boolean;
  onResetFilters: () => void;
}

export default function ReviewCenterEmptyState({
  hasActiveFilters,
  onResetFilters,
}: ReviewCenterEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-card border border-border rounded-2xl md:rounded-3xl text-center space-y-3 min-h-[300px] shadow-2xs font-sans">
      <div className="size-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground">
        <Building2 size={30} />
      </div>
      <div className="max-w-sm space-y-1">
        <h3 className="text-base font-bold text-foreground">No Review Centers Found</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {hasActiveFilters
            ? "No partner review centers match your active search filters. Try adjusting your query or resetting filters."
            : "No review centers registered yet. Click 'Add Review Center' to create the first record."}
        </p>
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onResetFilters}
          className="mt-2 text-xs font-semibold text-foreground border-border rounded-xl px-4 cursor-pointer hover:bg-accent"
        >
          Clear Filters
        </Button>
      )}
    </div>
  );
}
