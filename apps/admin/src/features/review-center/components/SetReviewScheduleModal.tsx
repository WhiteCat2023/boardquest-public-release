import { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, 
  Gamepad2, 
  Tag, 
  AlignLeft, 
  Clock, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showFeedback } from "@/components/modal";
import type { ReviewSchedule } from "../types/types";
import { useCreateReviewSchedule, useUpdateReviewSchedule } from "../api/useCalendar";

interface SetReviewScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ReviewSchedule | null;
}

export default function SetReviewScheduleModal({
  isOpen,
  onClose,
  initialData,
}: SetReviewScheduleModalProps) {
  const isEditing = !!initialData;

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("Final Comprehensive Review");
  const [description, setDescription] = useState("");

  const createMutation = useCreateReviewSchedule();
  const updateMutation = useUpdateReviewSchedule();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setStartDate(initialData.startDate || "");
      setEndDate(initialData.endDate || "");
      setCategory(initialData.category || "Final Comprehensive Review");
      setDescription(initialData.description || "");
    } else {
      setTitle("");
      const today = new Date().toISOString().split("T")[0];
      const twoWeeksLater = new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(twoWeeksLater);
      setCategory("Final Comprehensive Review");
      setDescription("");
    }
  }, [initialData, isOpen]);

  // Calculate duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return null;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const durationDays = calculateDays();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showFeedback.error("Final review title is required.");
      return;
    }
    if (!startDate) {
      showFeedback.error("Start date is required.");
      return;
    }
    if (!endDate) {
      showFeedback.error("End date is required.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      showFeedback.error("End date cannot be earlier than start date.");
      return;
    }

    if (isEditing && initialData) {
      updateMutation.mutate(
        {
          id: initialData.id,
          data: {
            title,
            companyName: "Institutional (BoardQuest)",
            startDate,
            endDate,
            category,
            description,
          },
        },
        {
          onSuccess: () => {
            showFeedback.success("Game final review schedule updated successfully!");
            onClose();
          },
          onError: (err: any) => {
            showFeedback.error(err.response?.data?.message || "Failed to update review schedule.");
          },
        }
      );
    } else {
      createMutation.mutate(
        {
          title,
          companyName: "Institutional (BoardQuest)",
          startDate,
          endDate,
          category,
          description,
        },
        {
          onSuccess: () => {
            showFeedback.success("Game final review schedule created successfully!");
            onClose();
          },
          onError: (err: any) => {
            showFeedback.error(err.response?.data?.message || "Failed to create review schedule.");
          },
        }
      );
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-card rounded-3xl p-7 border border-border shadow-2xl sm:max-w-2xl md:max-w-3xl w-full overflow-hidden text-foreground">
        {/* Styled Top Banner Header */}
        <div className="relative -mx-8 -mt-8 p-7 px-8 bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-primary-foreground/15 border border-primary-foreground/30 text-primary-foreground flex items-center justify-center font-bold shadow-inner shrink-0 backdrop-blur-md">
            <Gamepad2 size={26} />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold text-primary-foreground tracking-tight flex items-center gap-2.5">
              {isEditing ? "Edit Game Final Review Period" : "Schedule Final Review for Game"}
              <Sparkles size={18} className="text-amber-300" />
            </DialogTitle>
            <DialogDescription className="text-xs text-primary-foreground/80 mt-1">
              Set the institutional final review and mock exam dates for the BoardQuest game.
            </DialogDescription>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          {/* Review Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Gamepad2 size={14} className="text-primary" />
              Final Review Period Title *
            </label>
            <Input
              type="text"
              placeholder="e.g. 2026 Comprehensive MTLE Final Review Mode"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 bg-muted/40 border border-border rounded-xl text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          {/* Category / Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Tag size={14} className="text-muted-foreground shrink-0" />
              Category / Mode
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10 w-full bg-muted/40 border border-border rounded-xl text-xs font-semibold text-foreground focus:ring-2 focus:ring-ring/20 focus:border-primary">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Final Comprehensive Review" className="text-xs font-medium">
                  Final Comprehensive Review
                </SelectItem>
                <SelectItem value="Mock Board Examination" className="text-xs font-medium">
                  Mock Board Examination
                </SelectItem>
                <SelectItem value="Pre-Board Diagnostic Drill" className="text-xs font-medium">
                  Pre-Board Diagnostic Drill
                </SelectItem>
                <SelectItem value="Subject Intensive Coaching" className="text-xs font-medium">
                  Subject Intensive Coaching
                </SelectItem>
                <SelectItem value="Speed & Mastery Challenge" className="text-xs font-medium">
                  Speed & Mastery Challenge
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* BEAUTIFIED START DATE & END DATE SECTION */}
          <div className="p-4 bg-muted/40 border border-border rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-primary" />
                Review Duration & Dates
              </span>

              {durationDays !== null && (
                <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full shadow-2xs">
                  {durationDays} {durationDays === 1 ? "Day" : "Days"} Final Review
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-1.5 min-w-0 bg-card p-3 rounded-xl border border-border shadow-2xs">
                <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-primary" />
                  Start Date *
                </label>
                <Input
                  type="date"
                  min={isEditing ? undefined : new Date().toISOString().split("T")[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 bg-muted/40 border border-border rounded-lg text-xs font-semibold text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary"
                  required
                />
              </div>

              {/* End Date */}
              <div className="space-y-1.5 min-w-0 bg-card p-3 rounded-xl border border-border shadow-2xs">
                <label className="text-[11px] font-bold text-muted-foreground flex items-center gap-1.5">
                  <CalendarIcon size={13} className="text-primary" />
                  End Date *
                </label>
                <Input
                  type="date"
                  min={startDate || new Date().toISOString().split("T")[0]}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 bg-muted/40 border border-border rounded-lg text-xs font-semibold text-foreground focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:border-primary"
                  required
                />
              </div>
            </div>

            {startDate && endDate && (
              <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground pt-1">
                <span>{new Date(startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                <ArrowRight size={12} className="text-primary" />
                <span>{new Date(endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            )}
          </div>

          {/* Notes / Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <AlignLeft size={14} className="text-muted-foreground" />
              Description & Guidelines for Students
            </label>
            <textarea
              placeholder="Enter guidelines, coverage, or instructions for this game final review..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 bg-muted/40 border border-border rounded-xl text-xs font-medium text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Styled Footer */}
          <div className="bg-muted/40 -mx-8 -mb-8 p-5 px-8 mt-7 rounded-b-3xl border-t border-border flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="h-10 text-xs font-semibold text-muted-foreground hover:bg-accent hover:text-foreground rounded-xl px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-10 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-5 cursor-pointer shadow-md flex items-center gap-2 transition-all"
            >
              {isSubmitting && <Spinner size="sm" variant="current" />}
              {isEditing ? "Save Date Changes" : "Set Final Review Period"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
