import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bell, Loader2, Send } from "lucide-react";
import type { FacultyTrackItem } from "../../types/encodingTracker.types";
import {
  useSendTeacherNudgeMutation,
  useSendBulkTeacherNudgesMutation,
} from "../../api/useEncodingTracker";
import { showFeedback } from "@/components/modal";

interface NudgeTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: FacultyTrackItem | null;
  isBulk?: boolean;
  incompleteCount?: number;
  selectedSubject?: string;
  schoolYear?: string;
}

export function NudgeTeacherModal({
  isOpen,
  onClose,
  item,
  isBulk = false,
  incompleteCount = 0,
  selectedSubject,
  schoolYear,
}: NudgeTeacherModalProps) {
  const [customMessage, setCustomMessage] = useState<string>("");

  const singleNudgeMutation = useSendTeacherNudgeMutation();
  const bulkNudgeMutation = useSendBulkTeacherNudgesMutation();

  useEffect(() => {
    if (isBulk) {
      setCustomMessage(
        "Hi, this is a reminder from the Academic Team to complete your assigned question encoding quota. Please log in to your question bank to continue encoding your remaining items.",
      );
    } else if (item) {
      const remaining = item.remainingCount;
      const target = item.targetCount;
      const subject = item.subject.name;
      setCustomMessage(
        `Hi ${item.teacher.name}, this is a reminder that you have ${remaining} questions remaining out of your target of ${target} for ${subject}. Please take some time to continue authoring your questions.`,
      );
    }
  }, [item, isBulk]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBulk) {
      try {
        const res = await bulkNudgeMutation.mutateAsync({
          subjectId: selectedSubject === "ALL" ? undefined : selectedSubject,
          schoolYear,
        });
        showFeedback.success(
          `Reminders dispatched to ${res.data?.totalNudged || incompleteCount} faculty members!`,
        );
        onClose();
      } catch (err: any) {
        showFeedback.error(
          err?.response?.data?.message || "Failed to dispatch bulk reminders",
        );
      }
    } else if (item) {
      try {
        await singleNudgeMutation.mutateAsync({
          teacherId: item.teacher.id,
          subjectId: item.subject.id,
          customMessage: customMessage.trim() || undefined,
        });
        showFeedback.success(`Reminder sent to ${item.teacher.name}!`);
        onClose();
      } catch (err: any) {
        showFeedback.error(
          err?.response?.data?.message || "Failed to send reminder to teacher",
        );
      }
    }
  };

  const isPending = singleNudgeMutation.isPending || bulkNudgeMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isBulk
                  ? `Nudge Incomplete Faculty (${incompleteCount})`
                  : `Nudge ${item?.teacher.name}`}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isBulk
                  ? "Sends in-app notifications to all faculty with incomplete quotas."
                  : `${item?.subject.name} • ${item?.remainingCount} items remaining`}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs">
              Notification Message
            </Label>
            <Textarea
              id="message"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="text-xs resize-none"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              This message will appear in the teacher's notification center with a
              direct shortcut to author questions.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {isBulk ? "Send Bulk Reminders" : "Send Reminder"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
