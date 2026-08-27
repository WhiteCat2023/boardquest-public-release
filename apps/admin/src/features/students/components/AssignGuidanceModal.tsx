import { useState } from "react";
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
  student: any;
}

export function AssignGuidanceModal({
  isOpen,
  onClose,
  student,
}: AssignGuidanceModalProps) {
  const axiosPrivate = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>("");
  const [subjectCategory, setSubjectCategory] = useState<string>("Clinical Chemistry");
  const [reason, setReason] = useState<string>(
    student?.avgAccuracy && student.avgAccuracy < 75
      ? `Exam performance accuracy is ${student.avgAccuracy}% (below 75% passing benchmark). Requires academic intervention.`
      : "Manual referral for board licensure examination guidance."
  );
  const [guidanceNotes, setGuidanceNotes] = useState<string>("");

  const { data: advisors = [], isLoading: isLoadingAdvisors } = useQuery({
    queryKey: ["advisorsList"],
    queryFn: async () => {
      const res = await axiosPrivate.get("/faculty");
      return res.data?.data?.faculties || [];
    },
  });

  const { data: categories = [] } = useSubjects();

  const assignMutation = useMutation({
    mutationFn: async () => {
      const res = await axiosPrivate.post("/guidance", {
        studentId: student.id,
        advisorId: selectedAdvisorId,
        subjectCategory,
        reason,
        guidanceNotes,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(`Assigned ${student?.name || "student"} to advisor for guidance!`);
      queryClient.invalidateQueries({ queryKey: ["guidanceAssignments"] });
      queryClient.invalidateQueries({ queryKey: ["failingStudents"] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to assign student for guidance.");
    },
  });

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg rounded-2xl bg-card border border-border p-6 shadow-lg">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2.5 text-primary">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <UserCheck size={20} />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Assign Advisor Guidance & Referral
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Assign student <span className="font-bold text-foreground">{student.name}</span> ({student.email}) to an administrator or faculty member for academic counseling.
          </DialogDescription>
        </DialogHeader>

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
                Assign Guidance Advisor
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AssignGuidanceModal;
