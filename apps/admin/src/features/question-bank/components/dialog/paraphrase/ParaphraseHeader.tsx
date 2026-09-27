import { Sparkles } from "lucide-react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface ParaphraseHeaderProps {
  itemsCount: number;
  changedCount: number;
  revertedCount: number;
}

export default function ParaphraseHeader({
  itemsCount,
  changedCount,
  revertedCount,
}: ParaphraseHeaderProps) {
  return (
    <DialogHeader className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-border/80 bg-card shrink-0">
      <div className="flex items-center justify-between pr-6">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Sparkles size={16} />
          </div>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-sm sm:text-base font-bold text-foreground">
              AI Question Paraphraser
            </DialogTitle>
            <Badge
              variant="outline"
              className="bg-primary/10 text-primary border-primary/25 font-bold px-2 py-0.2 text-[10.5px] rounded-full"
            >
              {itemsCount} Selected
            </Badge>
          </div>
        </div>

        {/* Quick summary indicators */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            {changedCount} Paraphrased
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full border border-border">
            {revertedCount} Original
          </span>
        </div>
      </div>
    </DialogHeader>
  );
}
