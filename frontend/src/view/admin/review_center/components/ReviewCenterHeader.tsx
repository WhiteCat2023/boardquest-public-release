import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewCenterHeaderProps {
  onAddClick: () => void;
  canAdd?: boolean;
}

export default function ReviewCenterHeader({ onAddClick, canAdd = true }: ReviewCenterHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-4 pt-6 -mt-6 -mx-6 md:-mt-8 md:-mx-8 px-6 md:px-8 border-b border-border z-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
          <Building2 className="text-primary" size={26} />
          Review Center Directory & Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage affiliated review centers, representative accounts, and institutional partner details.
        </p>
      </div>

      {canAdd && (
        <div className="flex items-center gap-3">
          <Button
            onClick={onAddClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Add Review Center
          </Button>
        </div>
      )}
    </div>
  );
}
