import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { IconPicker } from "@/features/question-bank/components/IconPicker";
import { Pencil } from "lucide-react";

interface EditSubjectModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  subjectName: string;
  onSubjectNameChange: (val: string) => void;
  subjectIcon: string;
  onSubjectIconChange: (val: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function EditSubjectModal({
  isOpen,
  onOpenChange,
  subjectName,
  onSubjectNameChange,
  subjectIcon,
  onSubjectIconChange,
  isSubmitting,
  onSubmit,
}: EditSubjectModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <form onSubmit={onSubmit}>
          <AlertDialogHeader className="text-left space-y-2">
            <div className="flex flex-row items-center gap-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shrink-0">
                <Pencil size={20} className="stroke-[2.5]" />
              </div>
              <AlertDialogTitle className="text-base font-bold text-foreground">
                Edit Subject Category
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              Update subject title or icon.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Subject Title</label>
              <Input
                type="text"
                required
                placeholder="Subject Title"
                value={subjectName}
                onChange={(e) => onSubjectNameChange(e.target.value)}
                className="h-10 bg-muted/40 border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-ring/20 text-xs text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <IconPicker
              selectedIcon={subjectIcon}
              onSelectIcon={onSubjectIconChange}
            />
          </div>

          <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !subjectName.trim()}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Updating..." : "Update Subject"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
