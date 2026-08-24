import React from "react";
import {
  AlertTriangle,
  Info,
  Trash2,
  HelpCircle,
  Loader2,
} from "lucide-react";
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
import type { ConfirmOptions } from "@/store/modalStore";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps extends ConfirmOptions {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "default",
  icon,
  isLoading = false,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const getDefaultIcon = () => {
    if (icon) return icon;
    switch (variant) {
      case "destructive":
        return <Trash2 className="size-5 text-destructive" />;
      case "warning":
        return <AlertTriangle className="size-5 text-amber-500" />;
      case "info":
        return <Info className="size-5 text-blue-500" />;
      default:
        return <HelpCircle className="size-5 text-primary" />;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case "destructive":
        return "destructive";
      default:
        return "default";
    }
  };

  const defaultConfirmText = variant === "destructive" ? "Delete" : "Confirm";

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      if (onCancel) {
        onCancel();
      } else {
        onClose();
      }
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-2xl max-w-md font-sans">
        <AlertDialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "p-2 rounded-xl shrink-0 flex items-center justify-center",
                variant === "destructive" && "bg-destructive/10 text-destructive",
                variant === "warning" && "bg-amber-500/10 text-amber-500",
                variant === "info" && "bg-blue-500/10 text-blue-500",
                variant === "default" && "bg-primary/10 text-primary"
              )}
            >
              {getDefaultIcon()}
            </div>
            <AlertDialogTitle className="text-base font-bold text-foreground leading-snug">
              {title}
            </AlertDialogTitle>
          </div>

          {description && (
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pl-11">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
          <AlertDialogCancel
            disabled={isLoading}
            onClick={onCancel || onClose}
            className="h-9 px-4 text-xs font-semibold rounded-xl bg-muted hover:bg-accent text-foreground border-border cursor-pointer transition-colors"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            variant={getConfirmButtonVariant()}
            onClick={(e) => {
              e.preventDefault();
              if (!isLoading && onConfirm) {
                onConfirm();
              }
            }}
            className={cn(
              "h-9 px-4 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-2 transition-colors",
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {isLoading && <Loader2 className="size-3.5 animate-spin" />}
            {confirmText || defaultConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
