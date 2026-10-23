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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, AlertTriangle, Users2 } from "lucide-react";
import type { SubjectTrackItem } from "../../types/encodingTracker.types";
import { useUpsertSubjectQuotaMutation } from "../../api/useEncodingTracker";
import { showFeedback } from "@/components/modal";
import { getCategoryIcon } from "../IconPicker";

interface SetSubjectQuotaModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectTrackItem | null;
}

export function SetSubjectQuotaModal({
  isOpen,
  onClose,
  subject,
}: SetSubjectQuotaModalProps) {
  const handlerCount = subject?.assignedTeachers.length || 0;
  const minAllowedQuota = Math.max(1, handlerCount);

  const [totalQuota, setTotalQuota] = useState<number>(100);
  const [deadline, setDeadline] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [allowOverQuota, setAllowOverQuota] = useState<boolean>(false);

  const upsertMutation = useUpsertSubjectQuotaMutation();

  useEffect(() => {
    if (subject) {
      const initial =
        subject.targetCount > 0
          ? Math.max(minAllowedQuota, subject.targetCount)
          : Math.max(minAllowedQuota, handlerCount * 50 || 100);
      setTotalQuota(initial);
      setDeadline(
        subject.earliestDeadline
          ? new Date(subject.earliestDeadline).toISOString().split("T")[0]
          : "",
      );
      setAllowOverQuota(subject.allowOverQuota ?? false);
      setNotes("");
    }
  }, [subject, minAllowedQuota, handlerCount]);

  if (!subject) return null;

  const IconComp = getCategoryIcon(subject.subject.icon, subject.subject.name);
  const isInvalidMin = handlerCount > 0 && totalQuota < handlerCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (handlerCount === 0) {
      showFeedback.error(
        "Cannot set quota: No teacher handlers are currently assigned to this subject.",
      );
      return;
    }

    if (totalQuota < handlerCount) {
      showFeedback.error(
        `Target quota must be at least ${handlerCount} (at least 1 question per assigned handler).`,
      );
      return;
    }

    try {
      await upsertMutation.mutateAsync({
        subjectId: subject.id,
        totalTargetCount: Number(totalQuota),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        notes: notes.trim() || undefined,
        schoolYear: subject.schoolYear,
        allowOverQuota,
      });

      showFeedback.success(
        `Subject quota of ${totalQuota} questions divided among ${handlerCount} handlers for ${subject.subject.name}!`,
      );
      onClose();
    } catch (err: any) {
      showFeedback.error(
        err?.response?.data?.message ||
          "Failed to update subject authoring quota",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden font-sans border border-border/80 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="p-5 bg-muted/20 border-b border-border/60">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 shadow-2xs">
                <IconComp size={20} />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold text-foreground">
                  Set Subject Quota
                </DialogTitle>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {subject.subject.name} • {handlerCount}{" "}
                  {handlerCount === 1 ? "Teacher Handler" : "Teacher Handlers"}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {handlerCount === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-rose-300 dark:border-rose-900/60 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">No Handlers Assigned</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  There are no teachers currently assigned to handle{" "}
                  <strong>{subject.subject.name}</strong>. Please assign faculty
                  instructors first before distributing an authoring quota.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Total Subject Quota Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="subjectQuotaInput"
                    className="text-xs font-bold text-foreground"
                  >
                    Total Curriculum Quota for Subject
                  </Label>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono text-muted-foreground"
                  >
                    Minimum: {handlerCount} items
                  </Badge>
                </div>
                <div className="relative">
                  <Input
                    id="subjectQuotaInput"
                    type="number"
                    min={handlerCount}
                    value={totalQuota || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setTotalQuota(isNaN(val) ? 0 : val);
                    }}
                    placeholder={`e.g. ${Math.max(handlerCount * 50, 100)}`}
                    className={`h-9 text-xs font-semibold ${
                      isInvalidMin
                        ? "border-rose-500 focus-visible:ring-rose-500/30"
                        : ""
                    }`}
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-medium text-muted-foreground pointer-events-none">
                    Questions
                  </span>
                </div>
                {isInvalidMin ? (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Minimum quota must be at least {handlerCount} (1 per
                    assigned handler).
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    This total quota will be divided evenly across all{" "}
                    {handlerCount} assigned teacher handlers
                    {handlerCount > 0 && totalQuota >= handlerCount
                      ? ` (~${Math.floor(totalQuota / handlerCount)} questions each).`
                      : "."}
                  </p>
                )}
              </div>

              {/* Deadline & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="subjectDeadlineInput"
                    className="text-xs font-semibold"
                  >
                    Target Completion Deadline
                  </Label>
                  <Input
                    id="subjectDeadlineInput"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="subjectNotesInput"
                    className="text-xs font-semibold"
                  >
                    Notes / Guideline (Optional)
                  </Label>
                  <Textarea
                    id="subjectNotesInput"
                    rows={1}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Prioritize clinical bacteriology items"
                    className="h-9 min-h-[36px] py-2 text-xs resize-none"
                  />
                </div>
              </div>

              {/* Allow Over Quota toggle */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border/60">
                <div>
                  <p className="text-xs font-semibold text-foreground">Allow Over Quota</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Teachers can upload beyond their assigned limit
                  </p>
                </div>
                <Switch
                  checked={allowOverQuota}
                  onCheckedChange={setAllowOverQuota}
                  className="cursor-pointer"
                />
              </div>

              {/* Distribution Preview */}
              {subject.assignedTeachers.length > 0 && totalQuota >= handlerCount && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <Users2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                      Distribution Preview
                    </p>
                    <span className="text-[10px] text-muted-foreground">— ~{Math.floor(totalQuota / handlerCount)} per handler</span>
                  </div>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-0.5">
                    {subject.assignedTeachers.map((t) => {
                      const share = Math.floor(totalQuota / handlerCount);
                      const encoded = t.encodedCount;
                      const pct = Math.min(100, Math.round((encoded / Math.max(1, share)) * 100));
                      const initials = t.teacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase();
                      return (
                        <div key={t.teacher.id} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/50">
                          <Avatar className="size-6 border border-border shrink-0">
                            <AvatarImage src={t.teacher.avatarUrl || undefined} />
                            <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[11px] font-semibold text-foreground truncate">
                                {t.teacher.name}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                                {encoded} / {share} enc.
                              </span>
                            </div>
                            <Progress
                              value={pct}
                              className={`h-1 ${
                                pct >= 100
                                  ? "[&>div]:bg-emerald-500"
                                  : t.isPastDeadline
                                    ? "[&>div]:bg-rose-500"
                                    : "[&>div]:bg-primary/70"
                              }`}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground shrink-0 w-8 text-right">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <DialogFooter className="flex flex-row items-center justify-between pt-2 border-t border-border/60 w-full sm:justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={upsertMutation.isPending}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={
                upsertMutation.isPending || handlerCount === 0 || isInvalidMin
              }
              className="gap-1.5 cursor-pointer font-semibold"
            >
              {upsertMutation.isPending && (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              )}
              Distribute Quota ({totalQuota})
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SetSubjectQuotaModal;
