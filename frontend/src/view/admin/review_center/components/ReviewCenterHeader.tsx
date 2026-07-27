import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewCenterHeaderProps {
  onAddClick: () => void;
  canAdd?: boolean;
}

export default function ReviewCenterHeader({ onAddClick, canAdd = true }: ReviewCenterHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-3.5 -mt-4 -mx-4 md:-mt-6 md:-mx-6 px-4 md:px-6 border-b border-border z-10 font-sans">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Building2 className="text-primary size-5" />
          Review Center Directory & Management
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage affiliated review centers, representative accounts, and institutional partner details.
        </p>
      </div>

      {canAdd && (
        <div className="flex items-center gap-2">
          <Button
            onClick={onAddClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-3.5 h-8 rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            Add Review Center
          </Button>
        </div>
      )}
    </div>
  );
}
