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
import { UserCheck, Send } from "lucide-react";
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

  const targetStudents = (students && students.length > 0) ? students : (student ? [student] : []);
  const isBulk = targetStudents.length > 1;

  useEffect(() => {
    if (isBulk) {
      setReason("Cohort referral for board licensure examination guidance and academic counseling.");
    } else if (targetStudents.length === 1) {
      const single = targetStudents[0];
      if (single.calendarPace?.status === "CRITICAL" || single.calendarPace?.status === "BEHIND") {
        setReason(
          `Pacing Alert: Student is ${Math.abs(single.calendarPace.lagPercent)}% behind schedule for ${single.calendarPace.activeSubject || "their study milestones"}. Requires pacing intervention.`
        );
        if (single.calendarPace.activeSubject) {
          setSubjectCategory(single.calendarPace.activeSubject);
        }
      } else if (single.engagement?.status === "DORMANT") {
        setReason(
          `Engagement Alert: Student has been dormant with no active drills for ${single.engagement.daysSinceLastActive} days. Requires re-engagement advising.`
        );
      } else if (single.avgAccuracy && single.avgAccuracy < 75) {
        setReason(
          `Exam performance accuracy is ${single.avgAccuracy}% (below 75% passing benchmark). Requires academic intervention.`
        );
      } else {
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
      if (isBulk) {
        const res = await axiosPrivate.post("/guidance/bulk", {
          studentIds: targetStudents.map((s: any) => s.id),
          advisorId: selectedAdvisorId,
          subjectCategory,
          reason,
          guidanceNotes,
        });
        return res.data;
      } else {
        const res = await axiosPrivate.post("/guidance", {
          studentId: targetStudents[0]?.id,
          advisorId: selectedAdvisorId,
          subjectCategory,
          reason,
          guidanceNotes,
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
      <DialogContent className="sm:max-w-lg rounded-2xl bg-card border border-border p-6 shadow-lg">
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
