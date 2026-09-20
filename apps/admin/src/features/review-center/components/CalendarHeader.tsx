import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  onAddSchedule: () => void;
}

export default function CalendarHeader({ onAddSchedule }: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur-md pb-3 pt-3.5 -mt-4 -mx-4 md:-mt-6 md:-mx-6 px-4 md:px-6 border-b border-border z-10 font-sans">
      <div>
        <h1 className="text-lg md:text-xl font-bold text-foreground tracking-tight flex items-center gap-2">
          <CalendarIcon className="text-primary size-5" />
          Academic Calendar
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Set and manage institutional game final review periods, mock exams, and review center timelines.
        </p>
      </div>

      <Button
        onClick={onAddSchedule}
        className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer shrink-0"
      >
        <Plus size={14} />
        <span>Schedule Review Period</span>
      </Button>
    </div>
  );
}
