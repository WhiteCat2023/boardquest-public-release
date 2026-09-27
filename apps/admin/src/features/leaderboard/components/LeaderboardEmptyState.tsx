import { Card } from "@/components/ui/card";
import { UserX, RotateCcw } from "lucide-react";

interface LeaderboardEmptyStateProps {
  searchTerm?: string;
  onResetSearch?: () => void;
}

export default function LeaderboardEmptyState({
  searchTerm,
  onResetSearch,
}: LeaderboardEmptyStateProps) {
  return (
    <Card className="border-border p-16 flex flex-col items-center justify-center text-center gap-3 bg-card rounded-2xl">
      <div className="p-3.5 rounded-3xl bg-muted/60 text-muted-foreground/60 border border-border">
        <UserX className="w-8 h-8" />
      </div>
      <h3 className="text-sm font-bold text-foreground">
        No Candidate Rankings Available
      </h3>
      <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
        {searchTerm
          ? `No student matching "${searchTerm}" was found.`
          : "Enrolled student candidates will automatically appear on the live leaderboard as they complete evaluation quests."}
      </p>
      {searchTerm && onResetSearch && (
        <button
          onClick={onResetSearch}
          className="mt-2 text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw size={12} />
          Reset Search
        </button>
      )}
    </Card>
  );
}
