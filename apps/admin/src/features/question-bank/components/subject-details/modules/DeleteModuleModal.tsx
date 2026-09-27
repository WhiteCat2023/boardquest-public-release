import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type LearningModule } from "@/features/question-bank";

interface DeleteModuleModalProps {
  deletingModule: LearningModule | null;
  onOpenChange: (open: boolean) => void;
  isPending: boolean;
  onConfirm: () => void;
}

export function DeleteModuleModal({
  deletingModule,
  onOpenChange,
  isPending,
  onConfirm,
}: DeleteModuleModalProps) {
  return (
    <AlertDialog open={!!deletingModule} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="flex flex-row items-center gap-3">
            <div className="p-2.5 bg-destructive/10 text-destructive rounded-2xl border border-destructive/15 shrink-0">
              <AlertTriangle size={20} className="stroke-[2.5]" />
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground">
              Delete Learning Module
            </AlertDialogTitle>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-foreground">
              {deletingModule?.title}
            </strong>
            ? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex items-center justify-end gap-2.5 border-t border-border pt-4 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-muted hover:bg-accent text-foreground border-border text-xs font-semibold px-4 h-9 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold px-5 h-9 cursor-pointer shadow-xs"
          >
            {isPending ? "Deleting..." : "Delete Module"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteModuleModal;
