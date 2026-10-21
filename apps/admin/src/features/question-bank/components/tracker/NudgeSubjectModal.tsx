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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Loader2, Send, Users } from "lucide-react";
import type { SubjectTrackItem } from "../../types/encodingTracker.types";
import { useSendBulkTeacherNudgesMutation } from "../../api/useEncodingTracker";
import { showFeedback } from "@/components/modal";

interface NudgeSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectTrackItem | null;
  schoolYear?: string;
}

export function NudgeSubjectModal({
  isOpen,
  onClose,
  subject,
  schoolYear,
}: NudgeSubjectModalProps) {
  const [customMessage, setCustomMessage] = useState<string>("");
  const bulkNudgeMutation = useSendBulkTeacherNudgesMutation();

  useEffect(() => {
    if (subject) {
      setCustomMessage(
        `Hi, this is a reminder from the Academic Team regarding ${subject.subject.name}. You have question authoring quotas to complete (${subject.remainingCount} questions remaining across the subject). Please log in to your question bank to continue authoring your assigned items.`,
      );
    }
  }, [subject]);

  if (!subject) return null;

  const incompleteHandlers = subject.assignedTeachers.filter(
    (t) => t.status !== "COMPLETED",
  );
  const targetCountToNudge = incompleteHandlers.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (targetCountToNudge === 0) {
      showFeedback.info("All handlers for this subject have already completed their authoring quotas!");
      onClose();
      return;
    }

    try {
      const res = await bulkNudgeMutation.mutateAsync({
        subjectId: subject.id,
        schoolYear: schoolYear || subject.schoolYear,
        customMessage: customMessage.trim() || undefined,
      });

      showFeedback.success(
        `Reminders successfully dispatched to ${res?.data?.totalNudged || targetCountToNudge} teacher handlers for ${subject.subject.name}!`,
      );
      onClose();
    } catch (err: any) {
      showFeedback.error(
        err?.response?.data?.message || "Failed to dispatch subject reminders",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden font-sans border border-border/80 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="p-5 bg-amber-500/10 border-b border-border/60">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Bell className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground">
                  Nudge Subject Handlers
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {subject.subject.name} • {targetCountToNudge} incomplete{" "}
                  {targetCountToNudge === 1 ? "handler" : "handlers"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Handlers preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                Recipients ({targetCountToNudge})
              </span>
              <span className="text-[10px] text-muted-foreground">
                {subject.remainingCount} questions remaining
              </span>
            </div>

            <div className="p-2.5 rounded-xl border border-border/70 bg-muted/20 max-h-36 overflow-y-auto space-y-1.5">
              {incompleteHandlers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  All teachers for this subject have completed their quotas!
                </p>
              ) : (
                incompleteHandlers.map((t) => {
                  const initials = t.teacher.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-card border border-border/50 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="size-5 shrink-0">
                          <AvatarImage src={t.teacher.avatarUrl || undefined} />
                          <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold truncate text-foreground text-[11px]">
                          {t.teacher.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {t.encodedCount}/{t.targetCount}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Message input */}
          <div className="space-y-1.5">
            <Label htmlFor="subjectNudgeMessage" className="text-xs font-semibold">
              Notification Message
            </Label>
            <Textarea
              id="subjectNudgeMessage"
              rows={4}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="text-xs resize-none"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              Dispatches an immediate priority in-app notification to all incomplete teacher handlers for this subject.
            </p>
          </div>

          <DialogFooter className="flex flex-row items-center justify-between pt-2 border-t border-border/60 w-full sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={bulkNudgeMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={bulkNudgeMutation.isPending || targetCountToNudge === 0}
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white cursor-pointer font-semibold"
            >
              {bulkNudgeMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Nudge {targetCountToNudge} Handlers
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default NudgeSubjectModal;
