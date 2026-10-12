import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Send, Target, Calendar, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useSubjects } from "@/features/users";

export interface AssignGuidanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  student?: any;
  students?: any[];
  onSuccess?: () => void;
}

export function AssignGuidanceModal({
  isOpen,
  onClose,
  student,
  students,
  onSuccess,
}: AssignGuidanceModalProps) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>("");
  const [subjectCategory, setSubjectCategory] = useState<string>("Clinical Chemistry");
  const [reason, setReason] = useState<string>("");
  const [guidanceNotes, setGuidanceNotes] = useState<string>("");

  // Remediation Drill Parameters State
  const [drillQuota, setDrillQuota] = useState<number>(50);
  const [targetAccuracy, setTargetAccuracy] = useState<number>(75);
  const [deadlinePreset, setDeadlinePreset] = useState<"7D" | "14D" | "30D" | "CUSTOM" | "NONE">("7D");
  
  const computeDeadline = (preset: string) => {
    if (preset === "NONE") return "";
    const now = new Date();
    if (preset === "7D") now.setDate(now.getDate() + 7);
    else if (preset === "14D") now.setDate(now.getDate() + 14);
    else if (preset === "30D") now.setDate(now.getDate() + 30);
    return now.toISOString().split("T")[0];
  };

  const [deadlineDate, setDeadlineDate] = useState<string>(computeDeadline("7D"));

  const targetStudents = (students && students.length > 0) ? students : (student ? [student] : []);
  const isBulk = targetStudents.length > 1;

  useEffect(() => {
    if (isBulk) {
      const failingCount = targetStudents.filter((s: any) => s.isFailing).length;
      if (failingCount > 0) {
        setDrillQuota(50);
        setTargetAccuracy(75);
        setDeadlinePreset("7D");
        setDeadlineDate(computeDeadline("7D"));
        setReason(
          `Cohort academic intervention: ${failingCount} student${failingCount > 1 ? "s" : ""} falling below the 75% licensure passing benchmark. Requires prioritized remedial advising and targeted drills.`
        );
      } else {
        setDrillQuota(30);
        setTargetAccuracy(75);
        setDeadlinePreset("7D");
        setDeadlineDate(computeDeadline("7D"));
        setReason("Cohort referral for board licensure examination guidance and academic counseling.");
      }
    } else if (targetStudents.length === 1) {
      const single = targetStudents[0];
      if (single.isFailing || (single.avgAccuracy !== undefined && single.avgAccuracy < 75)) {
        const weakSub = single.failingSubjects && single.failingSubjects.length > 0
          ? single.failingSubjects[0]
          : (single.calendarPace?.activeSubject || "their weak subject areas");
        setDrillQuota(50);
        setTargetAccuracy(75);
        setDeadlinePreset("7D");
        setDeadlineDate(computeDeadline("7D"));
        setReason(
          `Academic Failure Alert: Student scored ${single.avgAccuracy ?? 0}% accuracy (below 75% licensure benchmark across ${single.totalExamsTaken || 1} exams), with critical weakness in ${weakSub}. Requires immediate remedial intervention.`
        );
        if (single.failingSubjects && single.failingSubjects.length > 0) {
          setSubjectCategory(single.failingSubjects[0]);
        }
      } else if (single.calendarPace?.status === "CRITICAL" || single.calendarPace?.status === "BEHIND") {
        setDrillQuota(35);
        setTargetAccuracy(75);
        setDeadlinePreset("7D");
        setDeadlineDate(computeDeadline("7D"));
        setReason(
          `Pacing Alert: Student is ${Math.abs(single.calendarPace.lagPercent)}% behind schedule for ${single.calendarPace.activeSubject || "their study milestones"}. Requires pacing intervention.`
        );
        if (single.calendarPace.activeSubject) {
          setSubjectCategory(single.calendarPace.activeSubject);
        }
      } else if (single.engagement?.status === "DORMANT") {
        setDrillQuota(30);
        setTargetAccuracy(75);
        setDeadlinePreset("7D");
        setDeadlineDate(computeDeadline("7D"));
        setReason(
          `Engagement Alert: Student has been dormant with no active drills for ${single.engagement.daysSinceLastActive} days. Requires re-engagement advising.`
        );
      } else {
        setDrillQuota(30);
        setTargetAccuracy(75);
        setDeadlinePreset("7D");
        setDeadlineDate(computeDeadline("7D"));
        setReason("Manual referral for board licensure examination guidance.");
      }
    }
  }, [students, student, isBulk]);

  const { data: advisors = [], isLoading: isLoadingAdvisors } = useQuery({
    queryKey: ["advisorsList"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/faculty", {
        params: {
          excludeExternal: true,
          limit: 100,
        },
      });
      const list = res.data?.data?.faculties || res.data?.data?.users || [];
      return list.filter((adv: any) => {
        const role = String(adv.role || "").toUpperCase().trim();
        return (
          role !== "REVIEWCENTER" &&
          role !== "EXTERNAL" &&
          !role.includes("REVIEW") &&
          !role.includes("EXTERNAL")
        );
      });
    },
  });

  const { data: categories = [] } = useSubjects();

  const assignMutation = useMutation({
    mutationFn: async () => {
      const formattedDeadline = deadlineDate ? new Date(`${deadlineDate}T23:59:59.999Z`).toISOString() : undefined;
      if (isBulk) {
        const res = await axiosPrivate.post("/guidance/bulk", {
          studentIds: targetStudents.map((s: any) => s.id),
          advisorId: selectedAdvisorId,
          subjectCategory,
          reason,
          guidanceNotes,
          drillQuota,
          targetAccuracy,
          deadline: formattedDeadline,
        });
        return res.data;
      } else {
        const res = await axiosPrivate.post("/guidance", {
          studentId: targetStudents[0]?.id,
          advisorId: selectedAdvisorId,
          subjectCategory,
          reason,
          guidanceNotes,
          drillQuota,
          targetAccuracy,
          deadline: formattedDeadline,
        });
        return res.data;
      }
    },
    onSuccess: () => {
      if (isBulk) {
        toast.success(`Assigned ${targetStudents.length} students to advisor for guidance!`);
      } else {
        toast.success(`Assigned ${targetStudents[0]?.name || "student"} to advisor for guidance!`);
      }
      queryClient.invalidateQueries({ queryKey: ["guidanceAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["failingStudents"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      onSuccess?.();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to assign student for guidance.");
    },
  });

  if (targetStudents.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-card border border-border p-6 shadow-xl">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <UserCheck size={20} />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              {isBulk
                ? `Bulk Assign Guidance (${targetStudents.length} Students)`
                : "Assign Advisor Guidance & Referral"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {isBulk ? (
              <>
                Assign <strong className="text-foreground">{targetStudents.length} selected students</strong> to an administrator or faculty member for academic counseling.
              </>
            ) : (
              <>
                Assign student <span className="font-bold text-foreground">{targetStudents[0]?.name}</span> ({targetStudents[0]?.email}) to an administrator or faculty member for academic counseling.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isBulk && (
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider">
              Selected Students ({targetStudents.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {targetStudents.map((st: any) => (
                <span
                  key={st.id}
                  className="px-2 py-0.5 rounded-md bg-card border border-border text-[10.5px] font-medium text-foreground flex items-center gap-1 shadow-2xs"
                >
                  <span className="font-bold">{st.name}</span>
                  <span className="text-[9.5px] text-muted-foreground">({st.email})</span>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 py-2 text-xs">
          {/* Advisor Selector */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Select Advisor / Administrator <span className="text-destructive">*</span>
            </Label>
            <select
              value={selectedAdvisorId}
              onChange={(e) => setSelectedAdvisorId(e.target.value)}
              className="w-full h-9 text-xs px-3 rounded-xl border border-border bg-card text-foreground focus:ring-1 focus:ring-primary font-bold"
            >
              <option value="">-- Select Advisor --</option>
              {advisors.map((adv: any) => (
                <option key={adv.id} value={adv.id}>
                  {adv.name} ({adv.role}) • {adv.email}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Domain Focus */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Target Subject Domain / Category</Label>
            <select
              value={subjectCategory}
              onChange={(e) => setSubjectCategory(e.target.value)}
              className="w-full h-9 text-xs px-3 rounded-xl border border-border bg-card text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="General Academic Support">General Academic Support</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Remediation Drill Parameters Card */}
          <div className="p-3.5 rounded-2xl border border-primary/25 bg-primary/5 space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-primary" />
                <span className="text-xs font-bold text-foreground">
                  Remediation Drill Parameters
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-[9.5px] font-bold bg-primary/10 text-primary border-primary/30 px-2 py-0.5 rounded-full"
              >
                Milestone Targets
              </Badge>
            </div>

            {/* Drill Quota (Question Volume) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  Target Drill Quota (Questions)
                </Label>
                <span className="text-[11px] font-bold text-primary">
                  {drillQuota} Questions
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[25, 50, 75, 100].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setDrillQuota(q)}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                      drillQuota === q
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/50"
                    }`}
                  >
                    {q} Qs {q === 50 && "⚡ (Rec)"}
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-[10px] text-muted-foreground">Custom:</span>
                  <Input
                    type="number"
                    min={5}
                    max={500}
                    value={drillQuota}
                    onChange={(e) => setDrillQuota(Math.max(5, Math.min(500, Number(e.target.value) || 25)))}
                    className="w-16 h-7 text-xs font-bold text-center bg-card border-border/80 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Target Passing Threshold (%) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  Target Passing Threshold
                </Label>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  ≥ {targetAccuracy}%
                  {targetAccuracy === 75 && " (PRC Board Benchmark)"}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <input
                  type="range"
                  min={60}
                  max={95}
                  step={5}
                  value={targetAccuracy}
                  onChange={(e) => setTargetAccuracy(Number(e.target.value))}
                  className="flex-1 accent-primary cursor-pointer h-1.5 bg-muted rounded-lg"
                />
                <span className="text-xs font-bold w-10 text-right text-foreground">
                  {targetAccuracy}%
                </span>
              </div>
              <div className="flex items-center justify-between text-[9.5px] text-muted-foreground px-0.5">
                <span>60% Min Standard</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">75% Licensure Pass</span>
                <span>95% Mastery</span>
              </div>
            </div>

            {/* Target Completion Deadline */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                  <Calendar size={12} className="text-muted-foreground" />
                  Target Completion Deadline
                </Label>
                {deadlineDate && (
                  <span className="text-[10.5px] font-medium text-muted-foreground">
                    Target: {new Date(deadlineDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: "7 Days", key: "7D" },
                  { label: "14 Days", key: "14D" },
                  { label: "30 Days", key: "30D" },
                  { label: "No Deadline", key: "NONE" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      setDeadlinePreset(item.key as any);
                      setDeadlineDate(computeDeadline(item.key));
                    }}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                      deadlinePreset === item.key
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                        : "bg-card text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted/50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <Input
                  type="date"
                  value={deadlineDate}
                  onChange={(e) => {
                    setDeadlineDate(e.target.value);
                    setDeadlinePreset("CUSTOM");
                  }}
                  className="w-32 h-7 text-xs bg-card border-border/80 rounded-lg ml-auto"
                />
              </div>
            </div>
          </div>

          {/* Reason / Referral Trigger */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Reason / Referral Trigger <span className="text-destructive">*</span>
            </Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Score below 75% passing threshold in Clinical Chemistry"
              className="text-xs h-9 bg-card border-border rounded-xl"
            />
          </div>

          {/* Initial Guidance Instructions */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Initial Guidance Instructions & Recommended Action</Label>
            <Textarea
              placeholder="Detail specific recommended remedial actions (e.g. mandatory review sessions, flashcard drill reassessment)..."
              value={guidanceNotes}
              onChange={(e) => setGuidanceNotes(e.target.value)}
              rows={3}
              className="text-xs bg-card border-border rounded-xl resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-9 text-xs">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => assignMutation.mutate()}
            disabled={!selectedAdvisorId || !reason.trim() || assignMutation.isPending}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl h-9 text-xs font-semibold flex items-center gap-1.5"
          >
            {assignMutation.isPending ? (
              <span className="inline-block animate-spin border-2 border-current border-t-transparent rounded-full w-3.5 h-3.5" />
            ) : (
              <>
                <Send size={14} />
                {isBulk
                  ? `Assign Guidance (${targetStudents.length} Students)`
                  : "Assign Guidance Advisor"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AssignGuidanceModal;
