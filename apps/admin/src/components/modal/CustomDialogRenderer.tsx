import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CustomModalOptions } from "@/store/modalStore";
import { cn } from "@/lib/utils";

interface CustomDialogRendererProps extends CustomModalOptions {
  isOpen: boolean;
  onClose: () => void;
}

const sizeClasses: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  full: "sm:max-w-[95vw] sm:max-h-[92vh] max-h-[92vh]",
};

export const CustomDialogRenderer: React.FC<CustomDialogRendererProps> = ({
  isOpen,
  title,
  description,
  content,
  size = "md",
  className,
  showCloseButton = true,
  onClose,
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const renderedContent =
    typeof content === "function" ? content({ close: onClose }) : content;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        className={cn(
          "bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-2xl font-sans max-h-[90vh] overflow-y-auto",
          sizeClasses[size] || "sm:max-w-md",
          className
        )}
      >
        {(title || description) && (
          <DialogHeader className="mb-2">
            {title && (
              <DialogTitle className="text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-xs text-muted-foreground">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        {renderedContent}
      </DialogContent>
    </Dialog>
  );
};

export default CustomDialogRenderer;
