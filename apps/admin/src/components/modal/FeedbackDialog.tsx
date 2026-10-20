import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
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
import type { FeedbackDialogOptions } from "@/store/modalStore";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps extends FeedbackDialogOptions {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  title,
  description,
  variant = "default",
  confirmText = "OK",
  action,
  cancel,
  onConfirm,
  onClose,
}) => {
  const getDefaultTitle = () => {
    if (title) return title;
    switch (variant) {
      case "success":
        return "Success";
      case "error":
        return "Action Failed";
      case "warning":
        return "Notice";
      case "info":
        return "Information";
      default:
        return "Notification";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return (
          <div className="size-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="size-5 stroke-[2.5]" />
          </div>
        );
      case "error":
        return (
          <div className="size-10 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive flex items-center justify-center shrink-0 shadow-xs">
            <AlertCircle className="size-5 stroke-[2.5]" />
          </div>
        );
      case "warning":
        return (
          <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
            <AlertTriangle className="size-5 stroke-[2.5]" />
          </div>
        );
      case "info":
        return (
          <div className="size-10 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
            <Info className="size-5 stroke-[2.5]" />
          </div>
        );
      default:
        return (
          <div className="size-10 rounded-xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center shrink-0 shadow-xs">
            <Bell className="size-5 stroke-[2.5]" />
          </div>
        );
    }
  };

  const getActionButtonVariant = () => {
    switch (variant) {
      case "error":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-card text-card-foreground rounded-2xl p-5 sm:p-6 border border-border shadow-2xl max-w-sm sm:max-w-md font-sans animate-in fade-in-0 zoom-in-95 duration-150">
        <AlertDialogHeader className="text-left space-y-2.5">
          <div className="flex items-center gap-3">
            {getIcon()}
            <AlertDialogTitle className="text-base font-bold text-foreground leading-snug">
              {getDefaultTitle()}
            </AlertDialogTitle>
          </div>

          {description && (
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pl-13">
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4 flex items-center justify-end gap-2 border-t border-border pt-3">
          {action && (
            <AlertDialogCancel
              onClick={(e) => {
                if (action.onClick) action.onClick(e);
                onClose();
              }}
              className="h-8.5 px-3.5 text-xs font-semibold rounded-xl bg-muted hover:bg-accent text-foreground border-border cursor-pointer transition-colors"
            >
              {action.label}
            </AlertDialogCancel>
          )}

          {cancel && (
            <AlertDialogCancel
              onClick={(e) => {
                if (cancel.onClick) cancel.onClick(e);
                onClose();
              }}
              className="h-8.5 px-3.5 text-xs font-semibold rounded-xl bg-muted hover:bg-accent text-foreground border-border cursor-pointer transition-colors"
            >
              {cancel.label}
            </AlertDialogCancel>
          )}

          <AlertDialogAction
            variant={getActionButtonVariant()}
            onClick={handleConfirm}
            className={cn(
              "h-8.5 px-4 text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors",
              variant === "error"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default FeedbackDialog;
