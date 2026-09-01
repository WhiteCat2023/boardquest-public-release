import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, Send, Info } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 font-sans">
        <DialogHeader className="flex flex-col items-center text-center gap-3">
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
          <DialogTitle className="text-lg font-black text-foreground tracking-tight">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed max-w-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="text-xs font-bold cursor-pointer"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={() => {
              onConfirm();
            }}
            disabled={isLoading}
            className="text-xs font-bold gap-1.5 cursor-pointer"
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
