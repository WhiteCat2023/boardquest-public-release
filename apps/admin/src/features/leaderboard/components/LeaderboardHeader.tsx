import { Trophy } from "lucide-react";

export default function LeaderboardHeader() {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-3.5 -mt-4 -mx-4 md:-mt-6 md:-mx-6 px-4 md:px-6 border-b border-border z-10 font-sans">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <Trophy className="text-primary size-5" />
          Leaderboards
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time student rankings compiled from activity and quiz performance.
        </p>
      </div>
    </div>
  );
}
