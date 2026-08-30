import { useState, useEffect } from "react";
import {
  UserPlus,
  User,
  Mail,
  GraduationCap,
  Calendar,
  Layers,
  Loader2,
  Tag,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Candidate } from "../api/useCandidates";
import { useEnrollCandidate, useUpdateCandidate } from "../api/useCandidates";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";

interface EnrollCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Candidate | null;
  defaultSchoolYear?: string;
  existingSchoolYears?: string[];
  existingBatches?: string[];
}

const DEFAULT_SCHOOL_YEARS = [
  "2026-2027",
  "2025-2026",
  "2024-2025",
  "2023-2024",
];

const DEFAULT_BATCHES = [
  "Batch 1 (August 2026)",
  "Batch 2 (October 2026)",
  "Batch 3 (March 2027)",
  "Batch Alpha",
  "Batch Bravo",
  "Intensive Pre-Board",
];

export default function EnrollCandidateModal({
  isOpen,
  onClose,
  initialData,
  defaultSchoolYear,
  existingSchoolYears = [],
  existingBatches = [],
}: EnrollCandidateModalProps) {
  const { user } = useReviewCenterAuth();
  const isEditing = !!initialData;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [schoolYear, setSchoolYear] = useState(
    defaultSchoolYear || "2026-2027"
  );
  const [customSchoolYear, setCustomSchoolYear] = useState("");
  const [isCustomSchoolYear, setIsCustomSchoolYear] = useState(false);

  const [batch, setBatch] = useState("Batch 1 (August 2026)");
  const [customBatch, setCustomBatch] = useState("");
  const [isCustomBatch, setIsCustomBatch] = useState(false);

  const [status, setStatus] = useState("ENROLLED");

  const enrollMutation = useEnrollCandidate();
  const updateMutation = useUpdateCandidate();

  const allSchoolYears = Array.from(
    new Set([
      ...(defaultSchoolYear ? [defaultSchoolYear] : []),
      ...DEFAULT_SCHOOL_YEARS,
      ...existingSchoolYears,
    ])
  );
  const allBatches = Array.from(
    new Set([...DEFAULT_BATCHES, ...existingBatches])
  );

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setEmail(initialData.email || "");
      setSchoolId(initialData.schoolId || "");
      setStatus(initialData.status || "ENROLLED");

      if (allSchoolYears.includes(initialData.schoolYear)) {
        setSchoolYear(initialData.schoolYear);
        setIsCustomSchoolYear(false);
      } else {
        setSchoolYear("CUSTOM");
        setCustomSchoolYear(initialData.schoolYear);
        setIsCustomSchoolYear(true);
      }

      if (allBatches.includes(initialData.batch)) {
        setBatch(initialData.batch);
        setIsCustomBatch(false);
      } else {
        setBatch("CUSTOM");
        setCustomBatch(initialData.batch);
        setIsCustomBatch(true);
      }
    } else {
      setName("");
      setEmail("");
      setSchoolId("");
      setSchoolYear(defaultSchoolYear || allSchoolYears[0] || "2026-2027");
      setIsCustomSchoolYear(false);
      setCustomSchoolYear("");
      setBatch(allBatches[0] || "Batch 1 (August 2026)");
      setIsCustomBatch(false);
      setCustomBatch("");
      setStatus("ENROLLED");
    }
  }, [initialData, isOpen, defaultSchoolYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Student name is required.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("A valid email address is required.");
      return;
    }

    const selectedSY = isCustomSchoolYear
      ? customSchoolYear.trim()
      : schoolYear.trim();
    if (!selectedSY) {
      toast.error("School Year is required.");
      return;
    }

    const selectedBatch = isCustomBatch ? customBatch.trim() : batch.trim();
    if (!selectedBatch) {
      toast.error("Batch is required.");
      return;
    }

    const payload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      schoolId: schoolId.trim() || undefined,
      schoolYear: selectedSY,
      batch: selectedBatch,
      status,
    };

    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Student updated successfully!");
            onClose();
          },
          onError: (err: any) => {
            toast.error(
              err.response?.data?.message || "Failed to update student."
            );
          },
        }
      );
    } else {
      enrollMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(`Enrolled ${name.trim()} into School Year ${selectedSY}!`);
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to enroll student."
          );
        },
      });
    }
  };

  const isPending = enrollMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[480px] p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl font-sans">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <UserPlus className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                {isEditing ? "Edit Student" : "Add Student"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Update student details or batch."
                  : `Add a student to ${user?.companyName || "your review center"}.`}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-3.5">
          {/* Candidate Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <User className="size-3.5 text-muted-foreground" />
              <span>Full Name</span>
              <span className="text-destructive">*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maria Clara Santos"
              className="h-9 text-xs rounded-xl bg-background border-border"
              disabled={isPending}
            />
          </div>

          {/* Email & School ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Mail className="size-3.5 text-muted-foreground" />
                <span>Email Address</span>
                <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@school.edu.ph"
                className="h-9 text-xs rounded-xl bg-background border-border"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-muted-foreground" />
                <span>Student ID (Optional)</span>
              </label>
              <Input
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                placeholder="e.g. 2023-01984"
                className="h-9 text-xs rounded-xl bg-background border-border"
                disabled={isPending}
              />
            </div>
          </div>

          {/* School Year Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>School Year</span>
              <span className="text-destructive">*</span>
            </label>
            <Select
              value={isCustomSchoolYear ? "CUSTOM" : schoolYear}
              onValueChange={(val) => {
                if (val === "CUSTOM") {
                  setIsCustomSchoolYear(true);
                } else {
                  setIsCustomSchoolYear(false);
                  setSchoolYear(val);
                }
              }}
              disabled={isPending}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border">
                <SelectValue placeholder="Select School Year" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {allSchoolYears.map((sy) => (
                  <SelectItem key={sy} value={sy} className="text-xs">
                    S.Y. {sy}
                  </SelectItem>
                ))}
                <SelectItem value="CUSTOM" className="text-xs font-semibold text-primary">
                  + Custom School Year...
                </SelectItem>
              </SelectContent>
            </Select>

            {isCustomSchoolYear && (
              <Input
                value={customSchoolYear}
                onChange={(e) => setCustomSchoolYear(e.target.value)}
                placeholder="Enter custom School Year (e.g. 2027-2028)"
                className="h-8.5 text-xs rounded-xl bg-background border-border mt-1.5"
                disabled={isPending}
              />
            )}
          </div>

          {/* Batch Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Layers className="size-3.5 text-muted-foreground" />
              <span>Batch</span>
              <span className="text-destructive">*</span>
            </label>
            <Select
              value={isCustomBatch ? "CUSTOM" : batch}
              onValueChange={(val) => {
                if (val === "CUSTOM") {
                  setIsCustomBatch(true);
                } else {
                  setIsCustomBatch(false);
                  setBatch(val);
                }
              }}
              disabled={isPending}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {allBatches.map((b) => (
                  <SelectItem key={b} value={b} className="text-xs">
                    {b}
                  </SelectItem>
                ))}
                <SelectItem value="CUSTOM" className="text-xs font-semibold text-primary">
                  + Custom Batch Name...
                </SelectItem>
              </SelectContent>
            </Select>

            {isCustomBatch && (
              <Input
                value={customBatch}
                onChange={(e) => setCustomBatch(e.target.value)}
                placeholder="Enter batch name (e.g. Batch 1 - August 2026)"
                className="h-8.5 text-xs rounded-xl bg-background border-border mt-1.5"
                disabled={isPending}
              />
            )}
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Tag className="size-3.5 text-muted-foreground" />
              <span>Status</span>
            </label>
            <Select value={status} onValueChange={setStatus} disabled={isPending}>
              <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="ENROLLED" className="text-xs">
                  Enrolled (Active)
                </SelectItem>
                <SelectItem value="COMPLETED" className="text-xs">
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-8.5 px-3.5 text-xs rounded-xl border-border"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-8.5 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
