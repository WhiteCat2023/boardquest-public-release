import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewCenterHeaderProps {
  onAddClick: () => void;
  canAdd?: boolean;
}

export default function ReviewCenterHeader({ onAddClick, canAdd = true }: ReviewCenterHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-slate-50/95 backdrop-blur-md pb-4 pt-8 -mt-8 -mx-8 px-8 border-b border-slate-100 z-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Building2 className="text-[#A70202]" size={26} />
          Review Center Directory & Management
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Manage affiliated review centers, representative accounts, and institutional partner details.
        </p>
      </div>

      {canAdd && (
        <div className="flex items-center gap-3">
          <Button
            onClick={onAddClick}
            className="bg-[#A70202] hover:bg-[#8b0101] text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            Add Review Center
          </Button>
        </div>
      )}
    </div>
  );
}
