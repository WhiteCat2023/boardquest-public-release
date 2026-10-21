import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CalendarPlus, Loader2 } from "lucide-react";
import type { FacultyTrackItem } from "../../types/encodingTracker.types";
import { useUpsertQuotaMutation } from "../../api/useEncodingTracker";
import { showFeedback } from "@/components/modal";

interface ExtendDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FacultyTrackItem | null;
}

export function ExtendDeadlineModal({
  isOpen,
  onClose,
  item,
}: ExtendDeadlineModalProps) {
  const [deadline, setDeadline] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const upsertMutation = useUpsertQuotaMutation();

  useEffect(() => {
    if (item) {
      if (item.deadline) {
        setDeadline(new Date(item.deadline).toISOString().split("T")[0]);
      } else {
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 14);
        setDeadline(defaultDate.toISOString().split("T")[0]);
      }
      setNotes(item.notes || "");
    }
  }, [item]);

  if (!item) return null;

  const handleAddDays = (days: number) => {
    const baseDate = item.deadline ? new Date(item.deadline) : new Date();
    const startFrom = baseDate < new Date() ? new Date() : baseDate;
    const newDate = new Date(startFrom);
    newDate.setDate(newDate.getDate() + days);
    setDeadline(newDate.toISOString().split("T")[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deadline) {
      showFeedback.error("Please specify a new deadline date");
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        teacherId: item.teacher.id,
        subjectId: item.subject.id,
        schoolYear: item.schoolYear,
        targetCount: Number(item.targetCount || 50),
        deadline: new Date(deadline).toISOString(),
        notes: notes.trim() || undefined,
        term: item.term,
        title: item.title || undefined,
      });

      const formatted = new Date(deadline).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

      showFeedback.success(
        `Deadline successfully extended to ${formatted} for ${item.teacher.name}`,
      );
      onClose();
    } catch (err: any) {
      showFeedback.error(
        err?.response?.data?.message || "Failed to extend authoring deadline",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarPlus className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Extend Authoring Deadline
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.teacher.name} • {item.subject.name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Current Status banner */}
          <div className="p-3 rounded-lg border border-border/70 bg-muted/30 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-muted-foreground block text-[11px]">
                Current Deadline
              </span>
              <span className="font-semibold text-foreground">
                {item.deadline
                  ? new Date(item.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "None assigned"}
              </span>
            </div>
            <div className="text-right space-y-0.5">
              <span className="text-muted-foreground block text-[11px]">
                Current Progress
              </span>
              <span className="font-semibold text-foreground font-mono">
                {item.encodedCount} / {item.targetCount} ({item.progressPercentage}%)
              </span>
            </div>
          </div>

          {/* Quick Extension Presets */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              Quick Extension Presets
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddDays(7)}
                className="h-8 text-xs font-medium cursor-pointer hover:border-primary/50 hover:bg-primary/5"
              >
                +7 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddDays(14)}
                className="h-8 text-xs font-medium cursor-pointer hover:border-primary/50 hover:bg-primary/5"
              >
                +14 Days
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleAddDays(30)}
                className="h-8 text-xs font-medium cursor-pointer hover:border-primary/50 hover:bg-primary/5"
              >
                +30 Days
              </Button>
            </div>
          </div>

          {/* Custom Date Input */}
          <div className="space-y-1.5">
            <Label htmlFor="extend-deadline" className="text-xs">
              New Target Deadline Date
            </Label>
            <div className="relative">
              <Input
                id="extend-deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>
          </div>

          {/* Optional notes */}
          <div className="space-y-1.5">
            <Label htmlFor="extend-notes" className="text-xs">
              Extension Note / Reason{" "}
              <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="extend-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Extended for second batch of clinical chemistry questions..."
              className="text-xs min-h-[64px] resize-none"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={upsertMutation.isPending}
              className="h-8 text-xs cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={upsertMutation.isPending}
              className="h-8 text-xs gap-1.5 cursor-pointer font-semibold"
            >
              {upsertMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CalendarPlus className="w-3.5 h-3.5" />
                  Confirm Extension
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
