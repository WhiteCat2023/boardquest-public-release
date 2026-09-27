import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { GameBadge } from "../../types/types";

interface DeleteBadgeDialogProps {
  deletingBadge: GameBadge | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  isPending?: boolean;
}

export default function DeleteBadgeDialog({
  deletingBadge,
  onClose,
  onConfirm,
  isPending = false,
}: DeleteBadgeDialogProps) {
  return (
    <Dialog
      open={Boolean(deletingBadge)}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="sm:max-w-md border-border/80 bg-card">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
            <Trash2 className="w-4 h-4" /> Delete Badge
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Are you sure you want to delete the badge{" "}
            <strong className="text-foreground">
              "{deletingBadge?.name || deletingBadge?.title}"
            </strong>
            ? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-end gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isPending}
            className="text-xs cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={isPending}
            onClick={() => {
              if (deletingBadge) {
                onConfirm(deletingBadge.id);
                onClose();
              }
            }}
            className="text-xs font-bold cursor-pointer"
          >
            {isPending ? "Deleting..." : "Confirm Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
