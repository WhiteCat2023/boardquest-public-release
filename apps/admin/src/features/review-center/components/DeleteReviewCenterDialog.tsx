import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { ReviewCenterRepresentative } from "../types/types";

interface DeleteReviewCenterDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  item: ReviewCenterRepresentative | null;
  onConfirm: () => void;
}

export default function DeleteReviewCenterDialog({
  isOpen,
  onOpenChange,
  item,
  onConfirm,
}: DeleteReviewCenterDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-xl max-w-md text-foreground font-sans">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trash2 className="text-destructive" size={20} />
            Remove Review Center
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Are you sure you want to remove{" "}
            <strong className="text-foreground">{item?.companyName}</strong> (
            {item?.name}) from the directory?
            <br />
            This action will revoke representative credentials for this institution.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 flex items-center justify-end gap-3">
          <AlertDialogCancel className="rounded-xl bg-muted text-foreground border-border hover:bg-accent text-xs font-semibold px-4 py-2 cursor-pointer">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs font-semibold px-4 py-2 cursor-pointer"
          >
            Confirm Removal
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
