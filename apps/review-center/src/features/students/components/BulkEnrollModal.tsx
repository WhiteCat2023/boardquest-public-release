import { useState } from "react";
import {
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useBulkEnrollCandidates } from "../api/useCandidates";

interface BulkEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolYear: string;
}

export default function BulkEnrollModal({
  isOpen,
  onClose,
  schoolYear,
}: BulkEnrollModalProps) {
  const [rawText, setRawText] = useState("");

  const bulkMutation = useBulkEnrollCandidates();

  // Parse lines: "Name, Email, Student ID" or "Name, Email"
  const parseRows = () => {
    const lines = rawText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const parsed: { name: string; email: string; schoolId?: string }[] = [];

    for (const line of lines) {
      // Split by comma or tab (for copy-pasting from Excel / Google Sheets)
      const parts = line.includes("\t")
        ? line.split("\t").map((p) => p.trim())
        : line.split(",").map((p) => p.trim());

      if (parts.length >= 2) {
        const name = parts[0];
        const email = parts[1];
        const schoolId = parts[2] || "";

        if (name && email && email.includes("@")) {
          parsed.push({ name, email, schoolId });
        }
      }
    }
    return parsed;
  };

  const parsedStudents = parseRows();

  const handleFillSample = () => {
    setRawText(
      "Maria Santos, maria.santos@school.edu.ph, 2023-0101\n" +
        "Juan Dela Cruz, juan.delacruz@school.edu.ph, 2023-0102\n" +
        "Angela Reyes, angela.reyes@school.edu.ph, 2023-0103\n" +
        "Christian Bautista, christian.b@school.edu.ph, 2023-0104"
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (parsedStudents.length === 0) {
      toast.error(
        "Please enter at least one valid student in format: Full Name, Email, Student ID"
      );
      return;
    }

    bulkMutation.mutate(
      {
        schoolYear,
        students: parsedStudents,
      },
      {
        onSuccess: (data: any) => {
          const count = data?.data?.enrolledCount ?? parsedStudents.length;
          const skipped = data?.data?.skippedCount ?? 0;

          if (skipped > 0) {
            toast.success(
              `Added ${count} student(s) to ${schoolYear}. (${skipped} duplicate(s) skipped)`
            );
          } else {
            toast.success(`Successfully added ${count} student(s) to ${schoolYear}!`);
          }
          setRawText("");
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            err.response?.data?.message || "Failed to bulk add students."
          );
        },
      }
    );
  };

  const isPending = bulkMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[560px] p-0 overflow-hidden bg-card border-border rounded-2xl shadow-2xl font-sans">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-border/80 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="size-4.5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                  Bulk Add Students
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Add multiple students to School Year {schoolYear} at once.
                </DialogDescription>
              </div>
            </div>

            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
              S.Y. {schoolYear}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Paste Instructions & Sample */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span>Paste Student List</span>
                <span className="text-destructive">*</span>
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-[11px] text-primary hover:underline font-semibold cursor-pointer"
              >
                Insert Sample
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Format per line: <span className="font-mono text-foreground font-semibold">Full Name, Email, Student ID</span> (you can also copy and paste directly from Excel or Google Sheets).
            </p>

            <textarea
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={"Maria Santos, maria.santos@school.edu.ph, 2023-0101\nJuan Dela Cruz, juan.delacruz@school.edu.ph, 2023-0102"}
              rows={5}
              className="w-full text-xs font-mono p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none leading-relaxed"
              disabled={isPending}
            />
          </div>

          {/* Live Parsing Preview Summary */}
          {parsedStudents.length > 0 && (
            <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 size={15} />
                <span>{parsedStudents.length} student(s) ready to add</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Will be enrolled in S.Y. {schoolYear}
              </span>
            </div>
          )}

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
              disabled={isPending || parsedStudents.length === 0}
              className="h-8.5 px-4 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                  Adding Students...
                </>
              ) : (
                `Add ${parsedStudents.length || ""} Student${parsedStudents.length === 1 ? "" : "s"}`
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
