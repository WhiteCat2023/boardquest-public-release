import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2, Send, Info } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default";
  icon?: "danger" | "email" | "info";
  isLoading?: boolean;
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  icon = "info",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md p-6 font-sans">
        <AlertDialogHeader className="flex flex-col items-center text-center gap-3">
          <div
            className={`p-3.5 rounded-full ${
              variant === "destructive"
                ? "bg-destructive/10 text-destructive"
                : icon === "email"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            {variant === "destructive" ? (
              <Trash2 className="size-6" />
            ) : icon === "email" ? (
              <Send className="size-6" />
            ) : (
              <Info className="size-6" />
            )}
          </div>
          <AlertDialogTitle className="text-lg font-black text-foreground tracking-tight">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4 sm:justify-end">
          <AlertDialogCancel
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs font-bold cursor-pointer"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="text-xs font-bold gap-1.5 cursor-pointer"
          >
            {isLoading ? "Processing..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default ConfirmDialog;
