import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function LeaderboardLoadingState() {
  return (
    <Card className="border-border p-16 flex flex-col items-center justify-center text-center gap-3 bg-card rounded-2xl">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-xs text-muted-foreground font-medium">
        Fetching candidate standings from database...
      </p>
    </Card>
  );
}
