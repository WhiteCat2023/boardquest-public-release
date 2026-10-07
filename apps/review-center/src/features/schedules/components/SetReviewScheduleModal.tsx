import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Tag,
  AlignLeft,
  Loader2,
  Clock,
  BookOpen,
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
import type { ReviewSchedule } from "../api/useCalendar";
import {
  useCreateReviewSchedule,
  useUpdateReviewSchedule,
} from "../api/useCalendar";
import { useReviewCenterAuth } from "@/hooks/useReviewCenterAuth";

interface SetReviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ReviewSchedule | null;
  activeSchoolYear?: string;
}

const CATEGORY_OPTIONS = [
  "Board Review",
  "Comprehensive Review",
  "Diagnostic Drill",
  "Pre-Board Mock Exam",
  "Final Coaching & High-Yield",
  "Remedial & Refresher Session",
];

export default function SetReviewScheduleModal({
  isOpen,
  onClose,
  initialData,
  activeSchoolYear,
}: SetReviewScheduleModalProps) {
  const { user } = useReviewCenterAuth();
  const isEditing = !!initialData;

  const todayStr = new Date().toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("Board Review");
  const [description, setDescription] = useState("");

  const createMutation = useCreateReviewSchedule();
  const updateMutation = useUpdateReviewSchedule();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setCategory(initialData.category || "Board Review");
      setDescription(initialData.description || "");
    } else {
      setTitle("");
      let defaultStart = todayStr;
      let defaultEnd = new Date(Date.now() + 14 * 86400000)
        .toISOString()
        .split("T")[0];

      if (activeSchoolYear) {
        const match = activeSchoolYear.match(/^(\d{4})-\d{4}$/);
        if (match) {
          const syStartYear = parseInt(match[1], 10);
          const currentYear = new Date().getFullYear();
          if (currentYear !== syStartYear && currentYear !== syStartYear + 1) {
            defaultStart = `${syStartYear}-08-01`;
            defaultEnd = `${syStartYear}-08-15`;
          }
        }
      }

      setStartDate(defaultStart);
      setEndDate(defaultEnd);
      setCategory("Board Review");
      setDescription("");
    }
  }, [initialData, isOpen, todayStr, activeSchoolYear]);

  // Calculate duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return null;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const durationDays = calculateDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Review schedule title is required.");
      return;
    }

    if (!startDate || !endDate) {
      toast.error("Both start date and end date are required.");
      return;
    }

    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    const todayObj = new Date(todayStr);

    startObj.setHours(0, 0, 0, 0);
    endObj.setHours(0, 0, 0, 0);
    todayObj.setHours(0, 0, 0, 0);

    // Prevent setting dates in the past (unless editing an ongoing active schedule)
    if (!isEditing && startObj < todayObj) {
      toast.error("Review start date cannot be set in the past.");
      return;
    }

    if (endObj < startObj) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    const payload = {
      title: title.trim(),
      startDate,
      endDate,
      category,
      description: description.trim(),
      schoolYear: activeSchoolYear,
    };

    if (isEditing && initialData) {
      updateMutation.mutate(
        { id: initialData.id, data: payload },
        {
          onSuccess: () => {
            toast.success("Review schedule updated and synchronized!");
            onClose();
          },
          onError: (err: any) => {
            toast.error(
              err.response?.data?.message || "Failed to update review schedule."
            );
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success(
            "Review schedule published and reflected on the Admin Academic Calendar!"
          );
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to create review schedule."
          );
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[480px] p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl font-sans">
        {/* Modal Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
              <CalendarIcon className="size-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                {isEditing ? "Edit Review Schedule" : "Set Review Schedule"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Update timeline and objectives for this review period."
                  : "Configure review dates to reflect on the Admin Academic Calendar."}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Partner Center Notice Badge */}
        <div className="px-5 pt-3">
          <div className="px-3 py-2 rounded-xl bg-primary/5 border border-primary/15 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="size-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground truncate">
                {user?.companyName || "Review Center Partner"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {activeSchoolYear && (
                <span className="text-[10px] font-bold text-foreground bg-muted px-2 py-0.5 rounded-md border border-border/80">
                  S.Y. {activeSchoolYear}
                </span>
              )}
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                Partner Schedule
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Schedule Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>Review Period Title</span>
              <span className="text-destructive">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Diagnostic Drills & Comprehensive Mock Board"
              className="h-9 text-xs rounded-xl bg-background border-border"
              disabled={isPending}
            />
          </div>

          {/* Date Range Selection with Past Date Protection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                Start Date <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                min={isEditing ? undefined : todayStr}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
                className="h-9 text-xs rounded-xl bg-background border-border"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                End Date <span className="text-destructive">*</span>
              </label>
              <Input
                type="date"
                min={startDate || todayStr}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9 text-xs rounded-xl bg-background border-border"
                disabled={isPending}
              />
            </div>
          </div>

          {/* Duration Indicator */}
          {durationDays !== null && (
            <div className="p-2.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                <Clock className="size-3.5 text-primary" />
                <span>Computed Duration</span>
              </div>
              <span className="font-bold text-foreground">
                {durationDays} {durationDays === 1 ? "Day" : "Days"}
              </span>
            </div>
          )}

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Tag className="size-3.5 text-muted-foreground" />
              <span>Review Category</span>
            </label>
            <Select
              value={category}
              onValueChange={setCategory}
              disabled={isPending}
            >
              <SelectTrigger className="h-9 text-xs rounded-xl bg-background border-border">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {CATEGORY_OPTIONS.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-xs">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <AlignLeft className="size-3.5 text-muted-foreground" />
              <span>Description / Objectives (Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific licensure subject coverage, mock exam batches, or room arrangements..."
              rows={3}
              className="w-full text-xs p-2.5 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              disabled={isPending}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
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
                "Update Schedule"
              ) : (
                "Publish Schedule"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
