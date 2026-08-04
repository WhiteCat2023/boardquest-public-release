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

interface ClearLogsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmClear: () => void;
}

export default function ClearLogsDialog({
  isOpen,
  onOpenChange,
  onConfirmClear,
}: ClearLogsDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card rounded-3xl p-6 border border-border shadow-2xl max-w-md font-sans">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trash2 className="text-primary" size={20} />
            Clear Audit Log History?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground mt-1">
            This action will purge all current system audit logs (`INFO`, `WARN`, `ERROR`, `FATAL`). This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 flex items-center justify-end gap-2">
          <AlertDialogCancel className="h-9 text-xs font-semibold rounded-xl">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmClear}
            className="h-9 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 cursor-pointer"
          >
            Confirm Purge
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
