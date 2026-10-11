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
import { Sliders, Loader2 } from "lucide-react";
import type { FacultyTrackItem } from "../../types/encodingTracker.types";
import { useUpsertQuotaMutation } from "../../api/useEncodingTracker";
import { toast } from "sonner";

interface SetQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FacultyTrackItem | null;
}

export function SetQuotaModal({ isOpen, onClose, item }: SetQuotaModalProps) {
  const [targetCount, setTargetCount] = useState<number>(50);
  const [deadline, setDeadline] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const upsertMutation = useUpsertQuotaMutation();

  useEffect(() => {
    if (item) {
      setTargetCount(item.targetCount || 50);
      setDeadline(
        item.deadline ? new Date(item.deadline).toISOString().split("T")[0] : "",
      );
      setNotes(item.notes || "");
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetCount <= 0) {
      toast.error("Target question count must be greater than 0");
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        teacherId: item.teacher.id,
        subjectId: item.subject.id,
        schoolYear: item.schoolYear,
        targetCount: Number(targetCount),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        notes: notes.trim() || undefined,
      });

      toast.success(
        `Quota updated for ${item.teacher.name} (${item.subject.name})`,
      );
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update quota");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                Set Authoring Quota & Deadline
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.teacher.name} • {item.subject.name}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Target Count */}
          <div className="space-y-1.5">
            <Label htmlFor="targetCount" className="text-xs">
              Target Question Quota
            </Label>
            <Input
              id="targetCount"
              type="number"
              min="1"
              value={targetCount}
              onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="h-9 text-xs"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Currently encoded: {item.encodedCount} questions.
            </p>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="deadline" className="text-xs">
              Target Completion Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-9 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Optional deadline date for this school year ({item.schoolYear}).
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs">
              Instructional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="e.g. Focus on high-yield parasitology diagnostics..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="text-xs resize-none"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={upsertMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={upsertMutation.isPending}
              className="gap-1.5"
            >
              {upsertMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              Save Quota
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
